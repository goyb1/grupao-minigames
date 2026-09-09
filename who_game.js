'use strict';

const { randomUUID } = require('crypto');
const { WHO_CHARACTERS, canonical } = require('./who_characters');
const MAX_TURNS = 10;
const ANSWERS = { yes: 'Sim', no: 'Não', unknown: 'Não sei' };

// As identidades ficam exclusivamente no servidor; o nick mantém o vínculo na reconexão.
function createWhoGame({ rooms, broadcast, finish, shuffle, stopTimer }) {
  const connected = r => [...r.players.values()].filter(p => p.connected);
  const player = (r, nick) => [...r.players.values()].find(p => p.nick === nick);
  const eligible = (r, nick) => {
    const item = r.who.assignments[nick];
    return player(r, nick)?.connected && item && !item.solved && item.turns < MAX_TURNS;
  };

  function arm(r, milliseconds, action) {
    stopTimer(r);
    const game = r.who;
    game.onTimeout = action;
    r.deadline = Date.now() + milliseconds;
    r.timer = setTimeout(() => {
      if (rooms.get(r.code) === r && r.state === 'who' && r.who === game) action();
    }, milliseconds);
  }

  function addLog(r, text) {
    r.who.log.push({ id: randomUUID(), text });
    if (r.who.log.length > 200) r.who.log.shift();
  }

  function endRound(r) {
    r.who.phase = 'result';
    r.who.feedback = 'Rodada encerrada! Veja quem era cada pessoa.';
    arm(r, 8000, () => {
      r.roundIndex++;
      if (r.roundIndex >= r.config.rounds) finish(r, 'victory');
      else startRound(r);
    });
    broadcast(r);
  }

  function nextTurn(r) {
    const game = r.who;
    for (let step = 1; step <= game.order.length; step++) {
      const index = (game.index + step) % game.order.length;
      if (!eligible(r, game.order[index])) continue;
      game.index = index;
      game.actor = game.order[index];
      game.responder = '';
      game.phase = 'turn';
      game.turnId = randomUUID();
      game.question = '';
      game.feedback = '';
      arm(r, 60000, () => endTurn(r, `${game.actor} ficou sem tempo.`));
      broadcast(r);
      return;
    }
    endRound(r);
  }

  function endTurn(r, text) {
    const game = r.who;
    game.assignments[game.actor].turns++;
    addLog(r, text);
    game.feedback = text;
    game.phase = 'feedback';
    arm(r, 3000, () => nextTurn(r));
    broadcast(r);
  }

  function startRound(r) {
    if (connected(r).length < 2) return finish(r, 'not-enough-players');
    const game = r.who;
    game.assignments = Object.create(null);
    game.order = shuffle(connected(r).map(p => p.nick));
    for (const nick of game.order) {
      game.assignments[nick] = { character: game.deck.pop(), solved: false, turns: 0 };
    }
    game.log = [];
    game.index = -1;
    r.answer = '';
    nextTurn(r);
  }

  function startMatch(r) {
    stopTimer(r);
    r.state = 'who';
    r.roundIndex = 0;
    r.endReason = '';
    r.players.forEach(p => { p.score = 0; });
    r.who = { deck: shuffle(WHO_CHARACTERS), assignments: Object.create(null) };
    startRound(r);
  }

  function view(r, viewerId) {
    if (r.category !== 'who' || !r.who || r.state === 'lobby') return null;
    const game = r.who;
    const me = r.players.get(viewerId);
    if (!me) return null;
    const reveal = game.phase === 'result' || ['victory', 'defeat'].includes(r.state);
    return {
      phase: game.phase, turnId: game.turnId,
      actor: game.actor, responder: game.responder,
      question: game.question, feedback: game.feedback,
      remainingMs: Math.max(0, r.deadline - Date.now()),
      maxTurns: MAX_TURNS, log: game.log,
      identities: game.order.map(nick => {
        const item = game.assignments[nick];
        const visible = nick !== me?.nick || item.solved || reveal;
        return {
          nick, solved: item.solved, turns: item.turns,
          // Não enviar id, obra ou aliases do personagem oculto.
          character: visible ? { name: item.character.name, universe: item.character.universe } : null,
        };
      }),
    };
  }

  function validate(r, socketId, data, phase, role) {
    const p = r?.players.get(socketId);
    if (!r || r.category !== 'who' || r.state !== 'who' || !p?.connected ||
        r.who.phase !== phase || data?.turnId !== r.who.turnId ||
        r.who[role] !== p.nick || Date.now() >= r.deadline) {
      return 'Esta ação não está disponível agora. Aguarde sua vez.';
    }
    return '';
  }

  function ask(r, id, data) {
    const error = validate(r, id, data, 'turn', 'actor');
    if (error) return { ok: false, error };
    const text = String(data.text || '').trim().slice(0, 160);
    if (text.length < 3) return { ok: false, error: 'Escreva uma pergunta de sim ou não.' };
    const game = r.who;
    const others = connected(r).filter(p => p.nick !== game.actor);
    if (!others.length) return { ok: false, error: 'Aguarde outro jogador reconectar.' };
    game.question = text;
    // Rodízio de quem responde, incluindo quem já descobriu seu personagem.
    game.responder = others[game.assignments[game.actor].turns % others.length].nick;
    game.phase = 'answer';
    arm(r, 30000, () => endTurn(r, `${game.actor}: “${text}” — sem resposta a tempo.`));
    broadcast(r);
    return { ok: true };
  }

  function answer(r, id, data) {
    const error = validate(r, id, data, 'answer', 'responder');
    if (error) return { ok: false, error };
    if (!Object.hasOwn(ANSWERS, data.answer)) return { ok: false, error: 'Escolha Sim, Não ou Não sei.' };
    endTurn(r, `${r.who.actor}: “${r.who.question}” — ${ANSWERS[data.answer]} (${r.who.responder}).`);
    return { ok: true };
  }

  function guess(r, id, data) {
    const error = validate(r, id, data, 'turn', 'actor');
    if (error) return { ok: false, error };
    const text = String(data.guess || '').trim().slice(0, 80);
    if (!canonical(text)) return { ok: false, error: 'Digite o nome do personagem.' };
    const item = r.who.assignments[r.who.actor];
    const correct = item.character.aliases.includes(canonical(text));
    if (correct) {
      item.solved = true;
      const p = r.players.get(id);
      p.score = (p.score || 0) + 1;
    }
    endTurn(r, correct ? `${r.who.actor} descobriu: ${item.character.name}! +1 ponto.`
      : `${r.who.actor} tentou “${text}”, mas não acertou.`);
    return { ok: true, correct };
  }

  function pass(r, id, data) {
    const error = validate(r, id, data, 'turn', 'actor');
    if (error) return { ok: false, error };
    endTurn(r, `${r.who.actor} passou a vez.`);
    return { ok: true };
  }

  function connectionChanged(r) {
    if (r.category !== 'who' || r.state !== 'who') return;
    const game = r.who;
    if (connected(r).length < 2) {
      if (game.phase === 'paused') return;
      game.resume = { phase: game.phase, remaining: Math.max(1, r.deadline - Date.now()), action: game.onTimeout };
      game.phase = 'paused';
      arm(r, 120000, () => finish(r, 'not-enough-players'));
      return;
    }
    if (game.phase === 'paused') {
      const resume = game.resume;
      game.phase = resume.phase;
      arm(r, resume.remaining, resume.action);
      delete game.resume;
    }
    if ((game.phase === 'turn' || game.phase === 'answer') && !player(r, game.actor)?.connected) {
      endTurn(r, `${game.actor} desconectou. A vez passou.`);
    } else if (game.phase === 'answer' && !player(r, game.responder)?.connected) {
      game.responder = connected(r).find(p => p.nick !== game.actor).nick;
      arm(r, 30000, () => endTurn(r, `${game.actor}: “${game.question}” — sem resposta a tempo.`));
    }
  }

  return { startMatch, view, ask, answer, guess, pass, connectionChanged };
}

module.exports = { createWhoGame };
