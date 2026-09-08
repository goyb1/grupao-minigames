# Grupão Minigames

## Versão 3.1.0

- Quiz de Clash Royale com 131 cartas/personagens e cinco dicas em formato de cartões.
- Dicas reveladas permanecem visíveis durante a rodada.
- O cronômetro reinicia com o tempo configurado sempre que uma nova dica aparece, tanto no quiz de futebol quanto no de Clash Royale.

Plataforma multiplayer do Grupão com contas, perfis, amigos, ranking, histórico, conquistas e quizzes cooperativos.

## Como funciona

1. Crie uma conta ou entre com nickname e senha.
2. Abra o Quiz de Futebol, escolha um avatar e crie/entre em uma sala.
3. O dono começa a partida quando houver pelo menos 2 jogadores.
4. A partida sorteia 200 respostas diferentes dentro de um banco de 500 desafios.
5. Todos respondem em até 60 segundos. Um acerto coletivo avança a rodada.
6. Se o tempo acabar, todas as dicas falharem ou todos desistirem, o grupo perde.
7. Ao acertar as 200 rodadas, o grupo vence e os recordes são atualizados.

## Recursos da versão 3

- Quiz de Futebol e Quiz de Clash Royale.
- Salas configuráveis: rodadas, tempo e dificuldade.
- Chat da sala, sons e animações.
- Perfil com avatar, nível, XP, conquistas e troca de senha.
- Ranking separado por categoria, amigos e histórico de partidas.
- Painel administrativo exclusivo da conta `goyb`, com redefinição de senha e suspensão de contas.
- Toda derrota revela a resposta correta.

## Rodar no computador

Você precisa do Node.js 18 ou superior.

```bash
npm install
npm start
```

Abra:

```text
http://localhost:3000
```

Para testar multiplayer no mesmo PC, abra em duas abas/janelas diferentes.

## Colocar em um domínio

Este projeto usa **Socket.IO**, então precisa de uma hospedagem que rode Node.js.
Hospedagens estáticas simples não bastam.

### Render / Railway / VPS

- Envie esta pasta para um repositório Git.
- Comando de instalação: `npm install`
- Comando de inicialização: `npm start`
- A porta é lida automaticamente pela variável `PORT`.
- Depois aponte seu domínio para a hospedagem.

## Observações

- Em produção, contas e recordes ficam no PostgreSQL indicado por `DATABASE_URL`.
- A tabela `users` é criada automaticamente na primeira inicialização.
- Sem `DATABASE_URL`, o projeto usa `data/users.json` apenas para desenvolvimento local.
- As salas ativas ficam na memória; jogadores podem se reconectar por até 2 minutos.
- Suporta até 10 jogadores por sala.
- Senhas são protegidas com `scrypt` e nunca são salvas em texto puro.
- O arquivo `questions.js` contém o banco de perguntas.

## Banco permanente no Render

Adicione no painel do Web Service a variável de ambiente `DATABASE_URL` com a Session Pooler connection string do Supabase. Nunca coloque essa URL no GitHub.

## Estrutura

```text
quiz_personagens_multiplayer/
├── package.json
├── server.js
└── public/
    ├── index.html
    ├── style.css
    └── app.js
```
