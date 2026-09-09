'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { createRequire } = require('node:module');
const { WHO_CHARACTERS, canonical } = require('../who_characters');

function fixture(count = 2, rounds = 1) {
  let now = 1000, nextId = 0;
  const timers = new Map();
  const setTimer = (action, delay) => { const id = ++nextId; timers.set(id, { at: now + delay, action }); return id; };
  const module = { exports: {} };
  const filename = path.join(__dirname, '../who_game.js');
  vm.runInNewContext(fs.readFileSync(filename, 'utf8'), {
    module, require: createRequire(filename), Date: { now: () => now },
    setTimeout: setTimer, clearTimeout: id => timers.delete(id),
  });
  const r = { code: 'TEST', category: 'who', config: { rounds }, players: new Map(), state: 'lobby' };
  for (let i = 0; i < count; i++) r.players.set(`p${i}`, { id: `p${i}`, nick: `Amigo${i}`, connected: true, score: 0 });
  const rooms = new Map([[r.code, r]]);
  let finishes = 0;
  const stopTimer = r => timers.delete(r.timer);
  const engine = module.exports.createWhoGame({ rooms, shuffle: items => [...items], broadcast: () => {}, stopTimer,
    finish: (r, reason) => { stopTimer(r); r.state = reason === 'victory' ? 'victory' : 'defeat'; r.endReason = reason; finishes++; },
  });
  const tick = ms => {
    const end = now + ms;
    while (true) {
      const entry = [...timers.entries()].filter(([, item]) => item.at <= end).sort((a, b) => a[1].at - b[1].at)[0];
      if (!entry) break;
      now = entry[1].at; timers.delete(entry[0]); entry[1].action();
    }
    now = end;
  };
  const idFor = nick => [...r.players.values()].find(p => p.nick === nick).id;
  const send = (action, id, data = {}) => engine[action](r, id, { turnId: r.who.turnId, ...data });
  engine.startMatch(r);
  return { r, engine, tick, send, idFor, rooms, finishes: () => finishes };
}

test('200 personagens distintos, nomes utilizáveis e Perry incluído', () => {
  assert.equal(WHO_CHARACTERS.length, 200);
  assert.equal(new Set(WHO_CHARACTERS.map(c => canonical(c.name))).size, 200);
  assert.equal(new Set(WHO_CHARACTERS.map(c => c.id)).size, 200);
  for (const c of WHO_CHARACTERS) {
    assert.ok(c.universe && c.name);
    assert.ok(c.aliases.includes(canonical(c.name)));
    assert.ok(c.aliases.every(Boolean));
  }
  const perry = WHO_CHARACTERS.find(c => c.name.includes('Perry'));
  assert.ok(perry.aliases.includes(canonical('Agente P')));
  assert.equal(perry.universe, 'Phineas e Ferb');
});

test('cada pessoa só recebe as identidades dos outros; nada do seu nome, obra ou id', () => {
  const f = fixture();
  assert.equal(f.engine.view(f.r, 'desconhecido'), null);
  for (const p of f.r.players.values()) {
    const view = f.engine.view(f.r, p.id);
    assert.equal(view.identities.find(i => i.nick === p.nick).character, null);
    assert.ok(view.identities.find(i => i.nick !== p.nick).character.name);
    const own = f.r.who.assignments[p.nick].character;
    assert.ok(!JSON.stringify(view).includes(own.id));
    assert.ok(!JSON.stringify(view).includes(own.name));
    assert.ok(!JSON.stringify(view).includes(own.universe));
    assert.ok(!JSON.stringify(view).includes('aliases'));
  }
  assert.notEqual(f.r.who.assignments.Amigo0.character.id, f.r.who.assignments.Amigo1.character.id);
});

test('pergunta e resposta só são aceitas da pessoa correta e no turno correto', () => {
  const f = fixture();
  assert.equal(f.send('ask', 'p1', { text: 'Sou um animal?' }).ok, false);
  assert.equal(f.send('ask', 'p0', { text: 'Sou um animal?', turnId: 'antigo' }).ok, false);
  assert.equal(f.send('ask', 'p0', { text: 'Sou um animal?' }).ok, true);
  assert.equal(f.send('ask', 'p0', { text: 'Outra pergunta?' }).ok, false);
  assert.equal(f.send('answer', 'p0', { answer: 'yes' }).ok, false);
  assert.equal(f.send('answer', 'p1', { answer: '__proto__' }).ok, false);
  assert.equal(f.send('answer', 'p1', { answer: 'yes' }).ok, true);
  assert.equal(f.send('answer', 'p1', { answer: 'yes' }).ok, false);
  f.tick(3000);
  assert.equal(f.r.who.actor, 'Amigo1');
  assert.equal(f.r.who.assignments.Amigo0.turns, 1);
});

test('um acerto soma exatamente 1 ponto, aceita aliases e revela apenas após acertar', () => {
  const f = fixture();
  f.r.who.assignments.Amigo0.character = WHO_CHARACTERS.find(c => c.name.includes('Perry'));
  assert.equal(f.send('guess', 'p0', { guess: ' AGENTE-P! ' }).correct, true);
  assert.equal(f.send('guess', 'p0', { guess: 'Perry' }).ok, false);
  assert.equal(f.r.players.get('p0').score, 1);
  assert.ok(f.engine.view(f.r, 'p0').identities[0].character.name.includes('Perry'));
  f.tick(3000);
  assert.equal(f.r.who.actor, 'Amigo1');
  assert.equal(f.send('ask', 'p1', { text: 'Sou de um jogo?' }).ok, true);
  assert.equal(f.r.who.responder, 'Amigo0');
  assert.equal(f.send('answer', 'p0', { answer: 'unknown' }).ok, true);
});

test('erro consome a vez, sem revelar a resposta correta', () => {
  const f = fixture();
  assert.equal(f.send('guess', 'p0', { guess: 'Nome errado' }).correct, false);
  assert.equal(f.r.players.get('p0').score, 0);
  assert.equal(f.engine.view(f.r, 'p0').identities[0].character, null);
  f.tick(3000);
  assert.equal(f.r.who.actor, 'Amigo1');
});

test('a rodada dá oportunidade aos dois jogadores e revela todos antes de encerrar', () => {
  const f = fixture();
  for (let i = 0; i < 2; i++) {
    const actor = f.r.who.actor;
    f.send('guess', f.idFor(actor), { guess: f.r.who.assignments[actor].character.name });
    f.tick(3000);
  }
  assert.equal(f.r.who.phase, 'result');
  assert.ok(f.engine.view(f.r, 'p0').identities.every(i => i.character));
  f.tick(7999); assert.equal(f.r.state, 'who');
  f.tick(1); assert.equal(f.r.state, 'victory');
  assert.equal(f.finishes(), 1);
});

test('não há repetição em uma partida de 10 rodadas com 10 pessoas', () => {
  const f = fixture(10, 10);
  const seen = new Set();
  for (let round = 0; round < 10; round++) {
    for (const item of Object.values(f.r.who.assignments)) {
      assert.ok(!seen.has(item.character.id)); seen.add(item.character.id);
    }
    for (let person = 0; person < 10; person++) {
      const actor = f.r.who.actor;
      assert.equal(f.send('guess', f.idFor(actor), { guess: f.r.who.assignments[actor].character.name }).correct, true);
      f.tick(3000);
    }
    assert.equal(f.r.who.phase, 'result');
    f.tick(8000);
  }
  assert.equal(seen.size, 100);
  assert.equal(f.r.state, 'victory');
  assert.ok([...f.r.players.values()].every(p => p.score === 10));
});

test('limite de turnos encerra uma rodada mesmo sem nenhum acerto', () => {
  const f = fixture();
  for (let i = 0; i < 20; i++) {
    assert.equal(f.send('pass', f.idFor(f.r.who.actor)).ok, true); f.tick(3000);
  }
  assert.equal(f.r.who.phase, 'result');
  assert.equal(f.r.who.assignments.Amigo0.turns, 10);
  assert.equal(f.r.who.assignments.Amigo1.turns, 10);
  f.tick(8000);
  assert.equal(f.r.state, 'victory');
});

test('cronômetros de pergunta e resposta avançam automaticamente', () => {
  const f = fixture();
  f.tick(60000); assert.equal(f.r.who.phase, 'feedback');
  f.tick(3000); assert.equal(f.r.who.actor, 'Amigo1');
  f.send('ask', 'p1', { text: 'Sou de um filme?' });
  f.tick(30000); assert.equal(f.r.who.phase, 'feedback');
  assert.equal(f.send('answer', 'p0', { answer: 'yes' }).ok, false);
  f.tick(3000); assert.equal(f.r.who.actor, 'Amigo0');
});

test('pausa congela a fase, reconexão muda o socket sem trocar o personagem', () => {
  const f = fixture();
  f.tick(10000);
  const p = f.r.players.get('p1');
  const character = f.r.who.assignments[p.nick].character;
  p.connected = false; f.engine.connectionChanged(f.r);
  assert.equal(f.r.who.phase, 'paused');
  assert.equal(f.send('guess', 'p0', { guess: 'Scorpion' }).ok, false);
  f.tick(90000);
  f.r.players.delete('p1'); p.id = 'novo'; p.connected = true; f.r.players.set(p.id, p);
  f.engine.connectionChanged(f.r);
  assert.equal(f.r.who.phase, 'turn');
  assert.equal(f.engine.view(f.r, 'novo').identities.find(i => i.nick === p.nick).character, null);
  assert.equal(f.r.who.assignments[p.nick].character, character);
  f.tick(49999); assert.equal(f.r.who.phase, 'turn');
  f.tick(1); assert.equal(f.r.who.phase, 'feedback');
});

test('com 3 jogadores, troca quem responde quando essa pessoa desconecta', () => {
  const f = fixture(3);
  f.send('ask', 'p0', { text: 'Sou de um desenho?' });
  const old = f.idFor(f.r.who.responder);
  f.r.players.get(old).connected = false;
  f.engine.connectionChanged(f.r);
  assert.equal(f.r.who.phase, 'answer');
  assert.notEqual(f.idFor(f.r.who.responder), old);
  assert.equal(f.send('answer', f.idFor(f.r.who.responder), { answer: 'no' }).ok, true);
});

test('desconexão prolongada encerra uma única vez e revela a identidade', () => {
  const f = fixture();
  f.r.players.get('p1').connected = false; f.engine.connectionChanged(f.r);
  f.tick(120000);
  assert.equal(f.r.state, 'defeat');
  assert.ok(f.engine.view(f.r, 'p0').identities.every(i => i.character));
  f.tick(180000); assert.equal(f.finishes(), 1);
});

test('timer de partida removida não altera uma sala posterior', () => {
  const f = fixture();
  f.rooms.delete(f.r.code);
  f.tick(120000);
  assert.equal(f.r.who.phase, 'turn');
  assert.equal(f.finishes(), 0);
});

test('eventos sem sala, payload ou jogador válido são rejeitados', () => {
  const f = fixture();
  for (const action of ['ask','answer','guess','pass']) {
    assert.equal(f.engine[action](undefined, 'x', null).ok, false);
    assert.equal(f.engine[action](f.r, 'x', null).ok, false);
  }
});
