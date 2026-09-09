# Grupão Minigames

## Versão 4.7.4 — Faixa etária da campanha

Personagens devem ter entre 15 e 20 anos (inclusive). Limites aplicados no formulário e no servidor, tanto para participantes quanto para fichas extras. Fichas existentes não são apagadas; idades fora dessa faixa precisam ser corrigidas ao salvar novas alterações.


## Versão 4.7.3 — Idade dos personagens

Idade mínima de 15 anos no formulário e na validação do servidor, incluindo fichas extras do mestre.


## Versão 4.7.2 — Atributos manuais e evolução

Não há mais rolagens nem escolha de conjuntos no site. Preencha cada atributo inicial com um inteiro de 1 a 12, conforme os dados rolados fora do site. Na coluna Evolução (+), o mestre adiciona os pontos ganhos. O total de cada atributo, incluindo bônus de estilo, não pode ultrapassar 30; o servidor rejeita valores acima do limite. Mantida a regra de dois pontos de evolução por nível após o primeiro. Funciona para participantes e fichas extras. Fichas anteriores preservam seus atributos, fotos e evolução; dados de rolagens antigos são ignorados.


## Versão 4.7.1 — Fichas extras do mestre

Dentro do save, o mestre pode usar **Criar ficha extra** para cadastrar os personagens adicionais dos dois times. Cada personagem tem foto PNG e ficha completa. Apenas o mestre cria e edita essas fichas; participantes podem consultar fichas já preenchidas. As fichas extras não ocupam vagas de participantes e ficam salvas junto com a campanha. Até 30 personagens extras por save. Saves anteriores continuam funcionando sem conversão manual. A simulação das partidas ainda não faz parte desta versão.


## Versão 4.7.0 — Fichas e saves de RPG

Abra **BlueLocker → Abrir saves** no menu de minigames.

1. O mestre cria um save e compartilha seu código de 16 caracteres.
2. Os participantes entram com suas próprias contas e criam uma ficha por campanha.
3. Preencha os 11 atributos iniciais manualmente, de 1 a 12.
4. Escolha posição, estilo e Ego. Os 11 atributos mudam conforme a posição; os bônus dos 23 estilos e os modificadores são calculados automaticamente.
5. Envie um PNG de até 1 MB, com no máximo 2048 × 2048 pixels. Transparência preservada.
6. Registre talentos, habilidade do estilo, Arma Secreta e história nos campos de texto. São registros para o mestre, ainda sem execução automática dos efeitos.
7. O mestre revisa e aprova a ficha. A aprovação bloqueia edições pelo participante. Para liberar novamente, o mestre desmarca a aprovação e salva.
8. Apenas o mestre altera nível e pontos de evolução (até dois pontos por nível após o primeiro). A distribuição deve ser revisada pelo mestre conforme as regras da mesa.
9. O diário do save é compartilhado; apenas o mestre pode editá-lo. Use Atualizar para carregar mudanças dos outros participantes.

**Persistência:** com DATABASE_URL configurada, saves, participantes, fichas, conjuntos de dados e fotos ficam na nova tabela rpg_campaigns do PostgreSQL. A tabela é criada automaticamente, sem modificar contas ou recordes existentes. Sem PostgreSQL, os dados ficam em data/rpg-campaigns.json (ou DATA_DIR); disco efêmero não garante persistência em produção.

O mestre é quem cria cada campanha, independentemente de ser administrador do site. Cada save aceita até 30 participantes, incluindo o mestre, e o usuário pode participar de vários saves. O mestre também pode criar sua própria ficha, opcionalmente. Fichas são visíveis apenas a participantes do mesmo save.

Nesta etapa não há simulação de partidas: o módulo é destinado às fichas e à organização da campanha. O nível do RPG é independente do nível do perfil nos minigames. Valores finais de atributos são limitados a 1–30 para manter a tabela de modificadores definida; a aplicação desse limite é uma convenção desta ficha digital.

Validação local: `npm test`. Os testes do RPG cobrem permissões, aprovação, rolagens persistidas, fotos e retomada com armazenamento local. A conexão PostgreSQL real deve ser verificada no ambiente de hospedagem.


## Versão 4.6.0 — Quem Sou Eu?

- Sexto minijogo, para 2 a 10 jogadores, com 200 personagens famosos da ficção.
- Curadoria com preferência por coadjuvantes e escolhas menos óbvias, incluindo Perry, o Ornitorrinco.
- Cada jogador recebe uma identidade diferente. Nenhum personagem se repete na mesma partida.
- Você vê os personagens dos amigos; o seu nome, obra e aliases não são enviados a você antes do acerto ou da revelação.
- De 1 a 10 rodadas (padrão: 3). Cada pessoa tem até 10 turnos em cada rodada.
- Na sua vez, faça uma pergunta de sim/não OU tente adivinhar o nome. Perguntar, errar ou passar consome um turno.
- O amigo indicado responde com Sim, Não ou Não sei. Não há respostas automáticas por IA.
- 60 segundos para perguntar/adivinhar, 30 para responder, 3 de intervalo entre turnos e 8 de revelação ao fim da rodada.
- Cada personagem descoberto vale 1 ponto. Quem já acertou continua ajudando a responder.
- A rodada acaba quando todos os jogadores conectados acertam ou usam seus 10 turnos.
- Os timers e a validação dos palpites são controlados pelo servidor. Acentos, espaços e pontuação são ignorados nos nomes; aliases comuns são aceitos.
- Com menos de 2 conectados, a partida pausa por até 2 minutos. A reconexão mantém a identidade e o progresso.
- Placar final, empates, Jogar de Novo, XP e histórico no PostgreSQL. Apenas os líderes com ao menos 1 ponto recebem a vitória.
- O histórico passa a identificar corretamente todos os minijogos pelo nome.
- Sem alteração de esquema do banco, credenciais ou recordes existentes. O ZIP não inclui contas locais, dependências instaladas nem segredos.

Arquivos novos: `who_characters.js` (banco privado), `who_game.js` (regras), `public/who.js` e `public/who.css` (interface).

Para verificar as regras do novo modo, execute `npm test` (14 testes, sem acesso ao banco de produção).
Em atualizações, preserve o arquivo `data/users.json` se você usa armazenamento local. Em produção, mantenha a mesma `DATABASE_URL`.


## Versão 4.5.0 — Última chance com alternativas no Futebol

- A última dica do Quiz de Futebol agora vira uma questão com quatro alternativas A, B, C e D.
- Cada jogador escolhe somente uma alternativa; a rodada é avaliada quando todos confirmam.
- As opções são embaralhadas e sempre contêm uma resposta correta e três jogadores diferentes.
- As dicas de futebol ganharam textos mais variados, combinando época, seleção, posição, clubes e iniciais.
- O campo de texto e o autocomplete continuam funcionando normalmente nas dicas anteriores.

## Versão 4.4.1 — Correção de navegação e cronômetros

- Enviar palpites no Quiz Gamer não faz mais a página voltar para o topo.
- A contagem entre rodadas usa o tempo restante enviado pelo servidor, eliminando diferenças entre os relógios do servidor e do navegador.
- O círculo do cronômetro também mostra 10 segundos após acertos no Quiz Gamer e 5 segundos em Futebol e Clash Royale.
- A tela de acerto permanece visível até a contagem terminar por completo.

## Versão 4.4.0 — Etapa 3: Batalha de Perguntas

- Novo minigame competitivo para 2 a 10 jogadores e partidas de 5 a 30 perguntas.
- Banco inicial com 60 perguntas de jogos, ciências, geografia, matemática, história, português, esportes e conhecimentos gerais.
- Quatro alternativas embaralhadas e 20 segundos para responder.
- Respostas simultâneas e secretas até o fim da rodada.
- Pontuação por acerto, bônus pela rapidez e bônus por sequência de acertos.
- Placar ao vivo com pontuação e sequência atual de cada jogador.
- Resultado mostra a alternativa correta por 6 segundos antes da próxima pergunta.
- Tela final anuncia o vencedor ou empate e mantém a opção Jogar de Novo.

## Versão 4.3.0 — Palpites ao vivo no Quiz Gamer

- O botão Pronto foi substituído por um chat de palpites exclusivo no Quiz Gamer.
- Todos podem enviar respostas ilimitadas enquanto o cronômetro estiver rodando.
- Os palpites aparecem em tempo real para todos os jogadores da sala.
- A primeira pessoa que acertar recebe 1 ponto e encerra a rodada imediatamente.
- O histórico de palpites é limpo quando começa uma nova pergunta.
- Futebol e Clash Royale continuam usando o sistema de confirmar com Pronto.
- Depois de um acerto, a resposta permanece na tela por 10 segundos no Quiz Gamer e por 5 segundos nos quizzes de Futebol e Clash Royale.
- Uma mensagem com contagem regressiva avisa quando a próxima rodada começará.

## Versão 4.2.0 — Quiz Gamer ampliado

- O Quiz Gamer agora possui 550 perguntas únicas: as 50 anteriores e 500 novas.
- Os novos desafios abrangem 100 jogos e cinco categorias factuais por título.
- Há perguntas sobre o jogo, ano de lançamento, desenvolvedora, protagonista e cenário.
- Todas as perguntas continuam com resposta, explicação e cinco dicas opcionais.
- Uma mesma pergunta não se repete dentro da partida.

## Versão 4.1.0 — Etapa 2

- Novo minigame multiplayer **O Impostor**, para salas de 3 a 10 jogadores.
- Banco com 60 palavras divididas entre jogos, futebol, comidas, animais, objetos e lugares.
- Cada rodada escolhe um impostor secreto; os demais recebem a mesma palavra.
- Fases automáticas de dicas individuais, votação, tentativa final do impostor e revelação do resultado.
- Placar próprio: quem votar corretamente ganha 1 ponto; o impostor ganha 2 ao escapar ou descobrir a palavra.
- Cronômetros separados para dar a dica, votar e responder, além de reconexão durante a sala.
- A palavra e o nome do impostor só são revelados ao fim da rodada.

## Versão 4.0.0 — Etapa 1

- Novo Quiz Gamer multiplayer com 50 perguntas sobre personagens, lançamentos, empresas, consoles e mecânicas.
- Cada pergunta possui cinco dicas opcionais acionadas pelo botão DICA.
- Palpites errados permitem uma nova tentativa enquanto ainda houver tempo; quem acerta recebe 1 ponto.
- Explicação da resposta, placar da partida, recorde próprio, ranking e histórico do Quiz Gamer.
- Migração automática do PostgreSQL para guardar o novo recorde sem apagar contas existentes.

- Autocompletar de nomes nos quizzes de Futebol e Clash Royale após digitar duas letras.
- Busca sem diferença entre letras com ou sem acento e também pelo início do sobrenome.
- Seleção por clique, setas do teclado ou tecla Enter.

- Placar individual em tempo real nos quizzes de Futebol e Clash Royale.
- Cada jogador que acerta a rodada recebe 1 ponto, inclusive quando várias pessoas acertam juntas.
- Classificação final exibida nas telas de vitória e derrota; o placar é zerado ao jogar novamente.

- Quiz de Clash Royale com 125 cartas jogáveis, nomes em português e quatro dicas factuais em formato de cartões.
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
