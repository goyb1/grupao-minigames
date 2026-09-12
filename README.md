# Grupão Minigames

## Versão 4.8.4 — Régua do campo

Abra **BlueLocker → save → Abrir partida** e use **📏 Régua**, acima do campo.

- Ative a ferramenta e arraste do início ao fim com mouse ou dedo. A seta rosa mostra a distância em metros enquanto você mede; o resultado permanece ao soltar.
- Também é possível tocar/clicar em dois pontos: o primeiro fixa a origem e o segundo fixa o destino. Uma nova medição substitui a anterior.
- **Limpar medida** apaga a linha. **Régua ativa — sair** ou **Esc** encerra a medição e libera os controles normais do campo.
- No teclado: após ativar a régua, use setas para posicionar o cursor (1 m por passo, ou 5 m com Shift) e Enter para marcar origem e destino.
- O cálculo usa distância reta na escala já existente de **105 × 68 metros**, com uma casa decimal. Redimensionar a tela não muda a escala. Não há conversão em quadrados nem nova regra do manual.
- Disponível para participantes e mestre, inclusive em partidas antigas. A régua é uma ferramenta local de consulta: sua medida não aparece nas outras telas, não é salva no histórico e não altera tokens, posse, dados, placar ou relógio. Ao desativar ou sair da partida, a medida é removida.

Mantidos times salvos, mesa livre, dados independentes, fichas, NPCs, contas e persistência. Nenhuma alteração nos módulos de servidor ou banco nesta versão.

Validação: **55 testes automatizados passaram**, incluindo seis novos testes de distância, escala da tela, limites, arraste, dois pontos e limpeza. Verificada a sintaxe do JavaScript. Em uma página local de teste com a régua real, foram conferidos no navegador o desenho e a medida por arraste, dois cliques, limpeza/saída e o bloqueio dos cliques no token durante a medição. O site completo, toque em aparelho físico, PostgreSQL real e Render não foram testados nesta atualização.


## Versão 4.8.3 — Times salvos

O mestre pode guardar até 30 times completos por save, com nome, cor, formação e as sete fichas (jogadores e/ou NPCs). As fichas não são copiadas: o time guarda referências aos personagens existentes.

### Como usar

1. Abra **BlueLocker → save → Abrir partida**.
2. Na preparação, escolha uma vez as sete fichas de um dos lados e use **Salvar como novo time**. Não é necessário preencher a equipe adversária para salvar esse time.
3. Nas próximas partidas, escolha o time em **Carregar time completo**, em qualquer lado. Nome, cor, formação e escalação são preenchidos de uma vez.
4. Ajustes na escalação carregada valem só para a partida. Para guardar alterações para as próximas, clique em **Atualizar time salvo**. **Salvar como novo time** cria uma alternativa separada.
5. Em uma partida já aberta ou encerrada, o mestre encontra **Salvar times para próximas partidas** no painel de controle. Cada botão guarda um dos times sem alterar a partida atual.
6. **Excluir time salvo** remove apenas a escalação da lista. Não apaga personagens, contas, saves ou partidas. **Atualizar lista** busca alterações feitas em outra aba.

Cada time exige sete fichas aprovadas diferentes, com exatamente um goleiro. É permitido usar uma ficha em vários times salvos, mas a mesma ficha não pode jogar nos dois lados de uma partida. Se uma ficha deixar de estar aprovada ou mudar de posição, ao carregar o time a vaga incompatível fica em branco e a tela avisa; corrija ou aprove a ficha antes de preparar o campo.

Os times ficam em `savedTeams` no mesmo registro da campanha: PostgreSQL quando `DATABASE_URL` está configurada, ou o arquivo local já existente. Saves antigos começam com uma lista vazia, sem conversão manual. Atualizações usam a fila/transação existente e uma revisão por time para impedir sobrescritas de outra aba. Repetir o envio com o mesmo identificador e conteúdo não cria outro time.

Cada nova partida continua copiando os modificadores atuais das fichas. Atualizar um time salvo não modifica uma partida iniciada. Mantidos a mesa livre, os dados independentes, as fichas e os minigames.

Validação: 49 testes automatizados passaram, incluindo 4 novos testes de API para times salvos, permissões, validação, concorrência, persistência após reinício e uso na partida. Sintaxe dos arquivos JavaScript verificada. Interface não validada visualmente em navegador; PostgreSQL real e Render não foram testados.


## Versão 4.8.2 — Mesa livre e dados independentes

Abra **BlueLocker → save → Abrir partida**. Novas partidas usam a mesa livre. Em uma partida de versão anterior, o mestre clica em **Ativar mesa livre**: a escalação, posições, posse, placar, fichas e histórico são preservados; o lance automático pendente é cancelado e a partida fica pausada. Essa ativação não tem botão de retorno ao modo antigo. O motor anterior continua disponível para partidas antigas que ainda não foram convertidas.

- Cada jogador pode arrastar seu próprio token com mouse ou toque, sem limite de distância ou necessidade de rolagem. O mestre move todos os personagens, inclusive NPCs. Funciona na preparação, com relógio em andamento, nas pausas e no intervalo; partidas encerradas não permitem movimento.
- Também é possível selecionar a peça, tocar no destino ou preencher X/Y e clicar em **Mover peça para o destino**.
- Apenas o mestre move a bola: arraste-a, escolha **Bola** no seletor ou selecione um personagem e clique em **Dar bola ao personagem selecionado**. Arrastar a bola remove sua posse; mover quem está com ela leva a bola junto. Não há troca automática de posse por proximidade.
- O painel **Dados independentes** permite de 1 a 10 dados d4, d6, d8, d10, d12, d20 ou d100, usando soma, maior ou menor resultado. Escolha opcionalmente um personagem e atributo; o modificador copiado para a partida já inclui o estilo. Um ajuste adicional de −100 a +100 e uma descrição são opcionais. O mestre pode registrar dados externos no mesmo formulário.
- As rolagens são feitas no servidor e ficam no histórico compartilhado. Elas não resolvem jogadas, alteram posições, posse, placar ou cronômetro. Os jogadores e o mestre interpretam os resultados. Uma nova tentativa de envio da mesma rolagem não a duplica (mantidos os últimos 200 identificadores).
- O relógio e os controles de arbitragem existentes continuam disponíveis. Para ajustar placar, cartões e tempo, o mestre pausa a partida. Gols e defesas não são calculados a partir dos dados na mesa livre. A preparação do segundo tempo ainda reposiciona as equipes e troca os lados.
- Posições e rolagens são persistidas no mesmo save, em PostgreSQL quando configurado ou no arquivo local existente. Revisões por peça permitem movimentos simultâneos de personagens diferentes e rejeitam movimentos desatualizados da mesma peça. Desfazer movimento mantém as rolagens no histórico.

Esta mesa livre é uma adaptação digital, não uma nova regra atribuída ao manual. Não altera as regras de criação e evolução das fichas, contas, minigames ou gerador de NPCs.

Validação desta versão: 45 testes automatizados passaram (36 anteriores e 9 novos), incluindo lógica, API, persistência local e retomada após reinício. Todos os 16 arquivos JavaScript do servidor e da interface passaram na verificação de sintaxe. Não foi realizada validação visual em navegador nem conexão com PostgreSQL real/Render.


## Versão 4.8.1 — Gerador de NPCs

No save, o mestre abre **Personagens controlados pelo mestre → Gerador de NPCs**. Pode gerar sete fichas por formação, completar uma equipe selecionando os personagens existentes, criar de 1 a 14 por posição ou duplicar uma ficha. A duplicação copia os dados e usa cartão sem foto; altere o nome na prévia.

Escolha nível e perfil. A distribuição é uma sugestão para NPCs: iniciais até 12, dois pontos de evolução por nível após o primeiro, atributo final até 30, estilo aplicado ao modificador. Cada prévia permite editar nome, idade (15–20), nacionalidade, altura, estilo, Ego, nível, atributos, talentos, arma, notas e cor. É possível refazer ou remover só um NPC. Marque se deseja salvar aprovados.

O lote só é criado ao clicar em Salvar NPCs; todos os itens são validados antes de persistir. Limite de 30 extras por save. As fichas existentes não são modificadas. Após salvar, selecione os novos NPCs na escalação da partida.

Validação: 36 testes de lógica e API passaram, incluindo geração por posição/nível, preenchimento de vagas, autorização do mestre, atomicidade, limite e repetição de requisições. Interface não validada em navegador nesta atualização.


## Versão 4.8.0 — Mesa de partidas BlueLocker

Abra uma campanha em **BlueLocker → Abrir saves → Abrir partida**. O mestre escala 14 fichas aprovadas, sete em cada time, com exatamente um goleiro por equipe. Fichas extras são NPCs controlados pelo mestre. Quem controla o mestre pode também conduzir um personagem de jogador se ele estiver ausente.

### Preparação e fluxo

- Escolha nomes, cores e formações 2-3-1, 3-2-1 ou 2-2-2. As fichas aprovadas fornecem os modificadores, incluindo o estilo. Estes valores são copiados para a partida; editar a ficha depois não altera uma partida já iniciada.
- Posicione as peças arrastando-as ou selecionando a peça, o destino e Posicionar peça. Na partida em andamento, reposicionamento manual exige pausa e justificativa.
- Inicie pelo painel do mestre. O relógio usa dois tempos de 15 minutos e corre durante as decisões. Nas rolagens fica parado.
- Selecione personagem, ação, alvo e destino quando necessário, e declare. O defensor pode reagir. Após cinco segundos, o autor pode avançar; o mestre pode avançar a qualquer momento. Sem reação escolhida, desarme/drible usam o adversário indicado e chute usa a defesa padrão do goleiro. Passe e movimento seguem sem oposição.
- Cada controlador rola seus dados. O mestre pode lançar pelos NPCs ou registrar resultados de d20 externos. O histórico identifica rolagens manuais.
- Gols atualizam o placar, autor e assistência quando aplicável, reposicionam os times e pausam para o mestre retomar a saída. Defesa por margem positiva de até três gera rebote.
- No intervalo, o mestre prepara o segundo tempo e os times trocam de lado. Ao terminar, aparecem estatísticas de gols, assistências e defesas. Outra partida pode ser preparada, guardando até vinte resumos anteriores no save.

### Ações e arbitragem

Ações: andar, correr, passe para companheiro ou espaço, passe alto, domínio, drible, desarme/carrinho, buscar bola e finalização normal/de primeira/cabeceio/acrobática. Reações: acompanhar, bloquear, interceptar, disputar, proteger a posse e sair do gol. O sistema confere controle do personagem, distância e estado do lance no servidor.

Convenções desta adaptação digital: campo 105 × 68 m; caminhada até 5 m; desarme a até 3 m; interceptação a até 5 m da trajetória; acompanhamento com distância inicial de até 8 m; testes não disputados têm dificuldade 10. Uma reação principal por lance, com defesa do goleiro em seguida quando um bloqueio é superado. Passe recebido em outro terço ou sob marcação pede domínio ou ação de primeira. A força da corrida usa o modificador de Ritmo em dobro, inclusive na perseguição. Movimento é realizado por ações, sem física contínua. A janela de reação de cinco segundos não é uma regra do manual.

No painel do mestre é possível pausar, retomar, encerrar, desfazer o último lance, alterar posse, reposicionar, corrigir relógio e placar, registrar falta/reposição, cartões e anotações. Dois amarelos expulsam; expulsos não podem agir. Correções ficam registradas. Desfazer restaura o estado anterior ao lance e pausa a mesa.

Antes das rolagens, o mestre pode aplicar bônus/penalidades e vantagem/desvantagem, com justificativa. Talentos, pressão e habilidades escritas nas fichas continuam sendo interpretados pelo mestre por esse painel, sem automatização completa. A automação específica de faltas, escanteios, pênaltis, Arma Secreta, Fluxo, Ego, Metavisão e Olho do Predador permanece para uma etapa posterior. Os bônus de estilo nos modificadores são automáticos; a Muralha também remove o +3 do cara a cara.

### Salvamento e sincronização

O estado da partida é salvo no mesmo registro da campanha, após cada comando válido, utilizando PostgreSQL quando DATABASE_URL está configurada. Não cria nem apaga usuários ou fichas. O modo local utiliza o arquivo de campanhas existente. A tela consulta o estado a cada 1,2 segundo; respostas de consulta antigas são descartadas. Revisão da partida e identificador de lance impedem comandos atrasados ou duplicados. Transações com bloqueio da campanha no PostgreSQL e uma fila no modo local protegem alterações simultâneas.

Ao reiniciar o serviço, partidas em andamento voltam pausadas, no último estado persistido. O tempo de inatividade do servidor não é somado. Durante a falta de conexão, a tela avisa e tenta sincronizar novamente; o mestre deve pausar antes de uma interrupção planejada.

Validação: testes de motor de jogo e API com dois clientes cobrem posse, gol/rebote, desfazer, controle de personagens, concorrência, dados manuais e recuperação após reinício. A validação executada usa armazenamento local; PostgreSQL real e aparência no navegador não foram testados neste ambiente.


## Versão 4.7.6 — Cartões de personagens sem foto

Personagens sem PNG recebem um cartão com iniciais, nome, posição e cor personalizável, na ficha e na lista do save. Funciona também para NPCs do mestre. Escolha a cor na ficha e clique em Salvar ficha; a prévia acompanha alterações no nome e posição. Um PNG substitui o cartão; remover a foto restaura o cartão e sua cor. Fichas anteriores recebem a cor azul padrão automaticamente.


## Versão 4.7.5 — Estilos no modificador

Bônus e penalidades do estilo agora são somados ao modificador, não ao atributo. Atributo total = inicial + evolução (máximo 30). Modificador final = modificador da tabela + estilo. Exemplo: Finalização 12 possui modificador +2; com Matador (+2), permanece 12 e o modificador final fica +4. Fichas antigas são recalculadas ao abrir, sem redistribuir atributos.


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
