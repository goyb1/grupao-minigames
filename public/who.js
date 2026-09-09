'use strict';

let whoFormTurn = '';
let whoLogKey = '';
function whoSend(action, data, input) {
  if (!socket?.connected || !room?.who) return;
  $('whoError').textContent = '';
  const turnId = room.who.turnId;
  socket.emit(`who:${action}`, { ...data, turnId }, result => {
    if (!result?.ok) $('whoError').textContent = result?.error || 'Não foi possível enviar.';
    else if (input) input.value = '';
  });
}
$('whoAskForm').onsubmit = event => {
  event.preventDefault();
  whoSend('ask', { text: $('whoAskInput').value.trim() }, $('whoAskInput'));
};
$('whoGuessForm').onsubmit = event => {
  event.preventDefault();
  whoSend('guess', { guess: $('whoGuessInput').value.trim() }, $('whoGuessInput'));
};
$('whoPassBtn').onclick = () => whoSend('pass', {});
$('whoAnswerButtons').onclick = event => {
  const button = event.target.closest('[data-who-answer]');
  if (button && !button.disabled) whoSend('answer', { answer: button.dataset.whoAnswer });
};
$('leaveWhoBtn').onclick = () => confirm('Sair da partida? Você pode voltar pelo código da sala.') && leave();

function renderWho() {
  const game = room.who;
  if (!game) return;
  show('who');
  const me = game.identities.find(item => item.nick === user.nick);
  const reveal = game.phase === 'result';
  const myTurn = game.phase === 'turn' && game.actor === user.nick;
  const myAnswer = game.phase === 'answer' && game.responder === user.nick;
  const players = new Map(room.players.map(p => [p.nick, p]));
  $('whoRound').textContent = room.roundNumber;
  $('whoTotal').textContent = room.totalRounds;
  $('whoProgress').style.width = `${room.roundNumber / room.totalRounds * 100}%`;
  $('whoTurnCount').textContent = `${me?.turns || 0}/${game.maxTurns} turnos usados`;
  $('whoMyName').textContent = me?.character?.name || 'Personagem secreto';
  $('whoMyUniverse').textContent = me?.character?.universe || 'Seus amigos sabem. Você precisa descobrir.';
  $('whoSecretIcon').textContent = me?.character ? (me.solved ? '✓' : '☆') : '?';
  const statuses = {
    turn: myTurn ? 'Sua vez! Faça uma pergunta ou tente adivinhar o personagem.' : `${game.actor} está pensando. Aguarde sua vez.`,
    answer: myAnswer ? `${game.actor} perguntou. Responda abaixo sem revelar o nome!` : `Aguardando ${game.responder} responder à pergunta de ${game.actor}.`,
    feedback: 'Turno encerrado. A próxima pessoa joga em instantes.',
    result: 'Identidades reveladas! A próxima rodada ou o resultado final vem a seguir.',
    paused: 'Partida pausada: precisamos de 2 pessoas conectadas. Aguardando reconexão por até 2 minutos.',
  };
  $('whoStatus').textContent = statuses[game.phase] || 'Aguarde...';
  $('whoStatus').classList.toggle('my-turn', myTurn || myAnswer);
  $('whoQuestionBox').classList.toggle('hidden', game.phase !== 'answer');
  $('whoQuestionBy').textContent = `PERGUNTA DE ${game.actor}`;
  $('whoQuestion').textContent = game.question || '';
  const target = game.identities.find(item => item.nick === game.actor);
  $('whoResponderHelp').textContent = myAnswer && target?.character
    ? `Lembrete: ${game.actor} é ${target.character.name}, de ${target.character.universe}.` : '';
  $('whoTurnActions').classList.toggle('hidden', !myTurn);
  $('whoAnswerButtons').classList.toggle('hidden', !myAnswer);
  document.querySelectorAll('#whoTurnActions input,#whoTurnActions button').forEach(el => { el.disabled = !myTurn; });
  document.querySelectorAll('#whoAnswerButtons button').forEach(el => { el.disabled = !myAnswer; });
  document.querySelectorAll('#whoView .chatForm input,#whoView .chatForm button').forEach(el => { el.disabled = !socket?.connected; });
  if (whoFormTurn !== game.turnId) {
    $('whoAskInput').value = '';
    $('whoGuessInput').value = '';
    $('whoError').textContent = '';
    whoFormTurn = game.turnId;
  }
  $('whoFeedback').classList.toggle('hidden', !['feedback','result'].includes(game.phase));
  $('whoFeedback').textContent = game.feedback || '';
  $('whoIdentitiesTitle').textContent = reveal ? 'Quem era cada pessoa' : 'Os personagens dos seus amigos';
  $('whoIdentities').innerHTML = game.identities.filter(item => reveal || item.nick !== user.nick).map(item => {
    const p = players.get(item.nick);
    const status = item.solved ? '✓ DESCOBRIU' : !p?.connected ? 'RECONECTANDO' : item.turns >= game.maxTurns ? 'TURNOS ESGOTADOS' : `${item.turns}/${game.maxTurns} turnos usados`;
    return `<article class="who-identity ${item.solved ? 'solved' : ''} ${game.actor === item.nick && !reveal ? 'current' : ''}"><small class="who-person">${esc(p?.avatar || '🕵️')} ${esc(item.nick)}${item.nick === user.nick ? ' (você)' : ''}</small><strong>${esc(item.character?.name || 'Personagem secreto')}</strong><small>${esc(item.character?.universe || '')}</small><small class="who-tag">${status}</small></article>`;
  }).join('');
  const logKey = `${room.roundNumber}:${game.log.length}:${game.log.at(-1)?.id || ''}`;
  if (whoLogKey !== logKey) {
    $('whoLog').innerHTML = game.log.map(entry => `<div class="who-log-entry">${esc(entry.text)}</div>`).join('') || '<p class="empty">As perguntas e tentativas aparecerão aqui.</p>';
    $('whoLog').scrollTop = $('whoLog').scrollHeight;
    whoLogKey = logKey;
  }
  $('whoScoreboard').innerHTML = scoreboardHtml();
  $('whoChat').innerHTML = chatHtml();
  clearInterval(tick);
  const end = performance.now() + game.remainingMs;
  const draw = () => {
    const seconds = Math.max(0, Math.ceil((end - performance.now()) / 1000));
    $('whoTimer').textContent = seconds;
    $('whoTimer').classList.toggle('danger', seconds <= 10 && game.phase !== 'result');
  };
  draw();
  tick = setInterval(draw, 200);
}

function renderWhoEnd() {
  const sorted = [...room.players].sort((a, b) => (b.score || 0) - (a.score || 0));
  const best = sorted[0]?.score || 0;
  const winners = sorted.filter(p => p.score === best).map(p => p.nick);
  const completed = room.state === 'victory';
  $('endIcon').textContent = completed && best ? '🏆' : '🕵️';
  $('endLabel').textContent = 'QUEM SOU EU? • RESULTADO';
  $('endTitle').textContent = !completed ? 'PARTIDA ENCERRADA' : !best ? 'MISTÉRIO ENCERRADO' : winners.length > 1 ? 'EMPATE!' : `${winners[0]} VENCEU!`;
  $('endText').textContent = room.state === 'defeat' ? 'A partida terminou por falta de jogadores conectados.'
    : best ? `${winners.join(' e ')}: ${best} ${best === 1 ? 'personagem descoberto' : 'personagens descobertos'}.` : 'Ninguém descobriu um personagem desta vez. Tentem novamente!';
  const own = room.who?.identities.find(item => item.nick === user.nick)?.character;
  $('missedAnswer').classList.toggle('hidden', !own);
  $('missedAnswer').textContent = own ? `Seu último personagem: ${own.name} (${own.universe}).` : '';
}
