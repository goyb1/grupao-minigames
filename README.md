# Grupão Minigames

## Versão 4.8.18 — Lixeira de fichas do RPG

Dentro do save, o mestre encontra **Lixeira de fichas** junto ao código da campanha. O antigo Excluir ficha agora é **Mover para a lixeira**. A lixeira guarda até **10 itens e 16 MB por save**, sem expiração ou limpeza automática. Ao atingir o limite, outra exclusão é recusada sem alterar a ficha; libere espaço usando Excluir definitivamente em um item escolhido.

Restaurar recupera ficha, foto, atributos, evolução, aprovação e dados iniciais para o participante ou NPC original. A conta do participante permanece no save. Não substitui ficha nova ou dados iniciais existentes, não restaura sobre uma identidade em uso na partida e respeita as 30 vagas de NPCs. Fichas escaladas na partida atual continuam protegidas contra exclusão. Times salvos que dependiam da ficha continuam sendo removidos ao excluí-la; restaurar a ficha não recria esses times. Fichas excluídas antes desta versão não são recuperáveis pela lixeira.

Lista e operações exclusivas do mestre. A listagem mostra apenas metadados, sem fotos/conteúdo das fichas. O conteúdo completo da lixeira não é incluído nas respostas normais da campanha, nem para o mestre; só permanece no armazenamento e no backup. Alterações usam as transações/fila de gravação existentes. Restauração concorrente ou repetida não duplica a ficha; lista desatualizada retorna conflito. Excluir definitivamente exige confirmação explícita.

Backups de campanha agora incluem a lixeira validada e mostram sua quantidade na prévia. Backups antigos continuam aceitos com lixeira vazia. Para preservar os itens em backups novos, restaure usando esta versão ou posterior. Nenhuma tabela nova, dependência adicional, consulta periódica ou mudança no motor da partida. Há armazenamento adicional limitado por save; o consumo total depende de quantas campanhas e fotos forem mantidas. Preserva os dados existentes, o bot e o webhook.

Validação: **113 testes passaram**, incluindo exclusão protegida, acesso, concorrência, limite de itens/bytes, restauração sem sobrescrever dados, capacidade de NPCs, gravação/reinício e backup. Edge local com servidor real e conta sintética: mover ficha para lixeira, listar, restaurar, reabrir ficha com dados preservados, excluir definitivamente, desktop e mobile de 390px; sem erros JavaScript ou transbordamento horizontal. Captura mobile revisada. PostgreSQL real, Supabase e alwaysdata não foram testados.

Atualize GitHub, execute git pull --ff-only e npm ci --omit=dev em /home/grupao/grupao, reinicie o site e use Ctrl+F5. Mantenha todas as variáveis existentes. Não é necessário recriar saves ou registrar os comandos do bot novamente.


## Versão 4.8.17 — Bot do Discord integrado ao site

A atualização anterior foi anunciada como 4.8.16; a numeração desta entrega segue com 4.8.17. Não é necessário alterar o histórico de anúncios.

Novos comandos: **/site**, **/novidades** (último anúncio confirmado) e **/ranking**, com top 10 de Futebol, Clash Royale ou Quiz gamer. Usa os recordes já existentes, com desempate por vitórias e exclusão de contas suspensas. Respostas ficam no canal; não inclui dados de fichas/campanhas/senhas. No site, **Administração → Bot do Discord** mostra configuração, endereço do endpoint, link de instalação, horários de atividade e botão para registrar/atualizar apenas os três comandos. Guia completo: **DISCORD_BOT.md**.

Recebe interações por HTTPS em /api/discord/interactions, antes do parser JSON, valida Ed25519 sobre os bytes originais e timestamp recente, confere aplicação/servidor e limita solicitações. PING assinado responde para validação do portal. Site responde imediatamente; novidades/ranking confirmam antes da consulta e editam a resposta original depois. Falhas de banco são genéricas, sem segredos; falhas de entrega aparecem no painel. Não usa Gateway ou processo adicional; bot pode aparecer offline no Discord. Comandos dependem da disponibilidade/tempo de inicialização da hospedagem.

Sem tabelas novas, dependências adicionais, histórico permanente de comandos ou consultas periódicas. Cache de 15 segundos para até quatro consultas, agrupamento de solicitações simultâneas, deduplicação temporária de interações e limites por usuário/servidor. O registro usa o token somente quando o administrador clica; atualiza os comandos por nome sem apagar outros. Token, chave e IDs são configurados no ambiente. O webhook anterior continua independente. Preserva dados existentes e a lógica do RPG/minigames. Consumo real da hospedagem não medido.

Validação: **108 testes automatizados passaram**. Inclui assinatura válida/inválida, corpo alterado, timestamp expirado, PING, restrição a aplicação/servidor, confirmação antes do banco, resposta posterior, deduplicação, cache, timeout, rankings, último anúncio além das últimas 30 falhas, permissões administrativas e registro dos comandos sem sobrescrever a lista inteira. Edge local com servidor real e contas sintéticas: painel, registro simulado, comandos assinados, webhook anterior, desktop e mobile 390px; sem erros JavaScript ou transbordamento horizontal. Captura mobile revisada. API externa simulada; instalação real no Discord, PostgreSQL/Supabase e alwaysdata ainda não testados.

Atualize os arquivos do GitHub, rode git pull --ff-only e npm ci --omit=dev, configure as quatro variáveis DISCORD_APPLICATION_ID, DISCORD_PUBLIC_KEY, DISCORD_GUILD_ID e DISCORD_BOT_TOKEN conforme o guia, preserve variáveis anteriores e reinicie. Use Ctrl+F5. Não é necessário recriar fichas, partidas ou saves.


## Versão 4.8.15 — Anúncios de atualizações no Discord

Em **Administração → Atualizações no Discord**, goyb pode preencher versão, título, novidades e correções, revisar uma prévia e publicar no canal configurado. Prévia não envia; editar o conteúdo invalida a prévia. A integração usa webhook, sem bot adicional ou consultas periódicas. Configuração e passo a passo: **DISCORD.md**.

A URL privada fica exclusivamente em DISCORD_UPDATES_WEBHOOK_URL no servidor, nunca no cliente, histórico ou resposta de erro. PUBLIC_SITE_URL define o link público (padrão https://grupao.alwaysdata.net). Destino do webhook restrito a HTTPS em discord.com, sem redirecionamentos. APIs protegidas pelas verificações de login e administrador existentes. Menções desativadas no payload.

Registros por versão ficam em uma nova tabela independente discord_updates no PostgreSQL, criada no primeiro acesso ao recurso; em modo local, data/discord-updates.json. Reserva persistida antes de enviar evita duas publicações concorrentes da mesma versão e repetições após reiniciar. Envios ambíguos não são repetidos automaticamente: após dois minutos, o administrador confere o canal e registra se chegou ou libera nova tentativa. Recusas explícitas permitem tentativa manual, respeitando o prazo recebido em respostas 429. Histórico mostra os últimos 30 registros, preservando versões antigas para deduplicação. Não altera contas, saves, fichas, partidas ou regras; não está incluído no backup de campanha.

Validação: **98 testes automatizados passaram**, incluindo permissões das quatro rotas, validação, menções, confirmação, prévia, concorrência, persistência, reinício, rate limit, timeout, registro corrompido e falha de gravação após envio. Edge local com o servidor real e usuários sintéticos: painel de administração, prévia sem envio, invalidar prévia editada, envio simulado, duplicata bloqueada, timeout, desktop e mobile (390px), sem erros JavaScript ou transbordamento horizontal. Captura mobile revisada. Saída para Discord simulada; nenhuma mensagem real enviada. PostgreSQL real, Supabase e alwaysdata não testados. Nenhuma dependência adicionada.

Atualize GitHub, rode git pull --ff-only e npm ci --omit=dev em /home/grupao/grupao, configure as variáveis conforme DISCORD.md, reinicie e use Ctrl+F5. Preserve DATABASE_URL e dados atuais.


## Versão 4.8.14 — Participantes online no save

Abra um save e toque em **Participantes**, no canto inferior direito. A lista continua disponível no campo e em tela cheia. Mostra contas participantes (não NPCs): **No save**, **No campo**, **Conexão perdida** e **Fora do save**. Campo aberto inclui a tela de preparação, mesmo sem uma partida iniciada. Abas em segundo plano continuam contando como conectadas; não é um indicador de atenção à tela.

Usa a conexão Socket.IO existente, com eventos pequenos de presença e sem consultas periódicas novas. Cada entrada ou mudança de contexto valida a sessão e a participação no servidor; no PostgreSQL a consulta retorna apenas um booleano, sem carregar fichas, fotos ou histórico. Não altera dados, partidas ou regras. Nenhuma dependência nova.

Várias abas da mesma conta aparecem uma única vez; se qualquer aba estiver no campo, prevalece No campo. Ao sair voluntariamente, deixa de contar naquela aba. Queda de conexão só é detectada após o transporte reconhecer a falha; a indicação Conexão perdida permanece por até dois minutos, se não houver outra aba conectada, e depois passa a Fora do save. Reconexão restaura a presença. Quando a conexão do próprio usuário falha, a lista informa que o estado dos demais está indisponível.

Presença existe apenas na memória do processo, sem gravações no banco, sem histórico permanente e sem crescimento dos backups. Reinícios limpam a lista; clientes reconectados entram novamente. Destinado à configuração atual de uma instância Node.js; múltiplos processos exigiriam um serviço compartilhado de presença. O tráfego de Socket.IO não é zero e o consumo real na hospedagem não foi medido.

Validação: **91 testes automatizados passaram**, incluindo abas simultâneas, permissões, payloads inválidos, saída durante autorização, desconexão, expiração, reconexão e limitação de eventos. Edge local com dois clientes e Socket.IO real: atualização entre usuários, campo, desconexão/reconexão, múltiplas abas, saída e largura de 390 pixels. Campo e presença também verificados em tela cheia nativa e alternativa, em 1366×768, 390×844 e 844×390, incluindo ficha rápida e dados no histórico. Cenários usam dados sintéticos; não testado com PostgreSQL real, Supabase, alwaysdata ou aparelho físico.

Publicação: atualize os arquivos no GitHub, rode `git pull --ff-only` e `npm ci --omit=dev` em `/home/grupao/grupao`, reinicie o site no painel e use Ctrl+F5 nos navegadores. Preserve DATABASE_URL e dados existentes. Não é necessário recriar saves.


## Versão 4.8.13 — Campo centralizado em tela cheia

Controles de ficha, dados, régua e navegação compactados no topo. A área restante da tela é reservada ao campo, centralizado horizontal e verticalmente, preservando a proporção 105:68 e margens para tokens. O cálculo usa o tamanho real da área disponível, substituindo descontos fixos de altura. Coordenadas de zoom/pinça ajustadas à nova origem centralizada. Em telas estreitas, controles se distribuem em mais linhas. Enquadrar campo restaura a visão inteira; zoom permite aproximar.

Arquivos JS e CSS atualizados têm identificadores de versão para evitar cache antigo. Sem mudanças no servidor, banco, posições salvas ou sincronização.

Validação: 87 testes automatizados passaram. Verificação adicional em Edge local com cenários 1366×768, 390×844 e 844×390, modo nativo e alternativa sem API de tela cheia: campo centralizado, proporção correta, tamanho máximo dentro das margens, painéis de ficha/dados, registro no histórico e saída. Captura visual revisada em desktop (campo de aproximadamente 940×609). Não testado em aparelho físico, Supabase ou alwaysdata.

Atualize o GitHub, rode `git pull --ff-only` e `npm ci --omit=dev` em /home/grupao/grupao, reinicie no painel e atualize a página com Ctrl+F5. Nenhuma mudança na DATABASE_URL.


## Versão 4.8.12 — Correção de inicialização e dados em HTTP

Corrigido o uso direto de crypto.randomUUID no navegador, que não está disponível em contextos HTTP não seguros. A falha interrompia a montagem da tela ao preparar os botões de times salvos, deixando tokens sem posição e a interface sem atualizações. Também impedia criar identificadores de rolagens. A nova função mantém randomUUID onde disponível e usa getRandomValues para gerar UUID v4 nos demais casos, sem recorrer a Math.random.

Aplicado também a NPCs, marcações, importação de fichas e restauração de campanhas. Scripts do RPG têm identificador de versão na URL para evitar mistura com arquivos antigos no cache. Não altera banco, saves, regras, servidor nem frequência de sincronização. Não é necessário recriar partidas. Recomenda-se acessar o site por HTTPS para proteger login e conexão; esta correção não cifra HTTP.

Validação: 87 testes automatizados passaram. Reprodução em navegador Edge local: antes, retirar randomUUID causava TypeError em saveCurrentTeams, reproduzindo os sintomas do vídeo; depois, conferidos 14 tokens posicionados, início da partida, dados independentes pela lateral/painel/tela cheia, atualização do histórico, painel em largura de 390 pixels e reabertura. Teste com estado sintético e motor real da partida, sem contas ou dados de produção. PostgreSQL real, Supabase e alwaysdata não foram testados.

Atualize GitHub, rode `git pull --ff-only` e `npm ci --omit=dev` em /home/grupao/grupao, reinicie pelo painel e recarregue com Ctrl+F5. Preserve DATABASE_URL existente.


## Versão 4.8.11 — Ficha rápida e dados dentro do campo

Em **BlueLocker → abrir save → Abrir partida**, use **Ficha rápida** ou **Dados no campo**, acima do campo. Os dois controles continuam visíveis em tela cheia.

- Selecione um token e abra Ficha rápida para consultar posição, estilo e modificadores usados na partida. Talentos, arma, Ego, nível e observações da ficha carregada ficam em uma seção expansível; alterações posteriores nas fichas não atualizam os modificadores copiados na partida.
- Toque em um atributo de um personagem que você controla para preparar 1d20 com seu modificador. Isso apenas preenche o formulário: confira e clique em Rolar/registrar dados para enviar. Ajustes e dados externos anteriores são limpos ao preparar por atributo, evitando reaproveitá-los por engano.
- Jogadores consultam os demais personagens, mas rolam apenas pelos próprios; mestre controla todos. Dados externos continuam exclusivos do mestre e permissões são validadas no servidor existente.
- O formulário de dados existente é movido temporariamente para o painel, não duplicado. Fechar devolve o formulário à lateral com os valores preservados. O painel mostra as cinco últimas rolagens já disponíveis no histórico. Resultados não resolvem ações nem alteram posse, placar ou movimento.
- Nenhuma consulta periódica, dependência ou armazenamento adicional para a ficha rápida. Usa dados já carregados e preserva sincronização econômica da 4.8.10. Rolagens continuam usando os comandos e o histórico limitado existentes. Abrir e fechar o painel não grava no banco.

Validação: **85 testes automatizados passaram**, incluindo modificadores da partida independentes da ficha, consulta sem controle e escape de conteúdo; testes existentes de dados, permissões e sincronização continuam passando. Sintaxe verificada. Interface, tela cheia e gestos não foram validados no navegador/aparelho físico; PostgreSQL real, Supabase e alwaysdata não foram testados. Impacto de CPU/rede em produção não medido.

Para publicar: atualize os arquivos do GitHub; no SSH da hospedagem execute `cd /home/grupao/grupao`, `git pull --ff-only` e `npm ci --omit=dev`. Reinicie pelo painel e recarregue a página nos dispositivos. Preserve DATABASE_URL e banco atuais.


## Versão 4.8.10 — Sincronização econômica do campo

- A consulta envia um identificador do estado recebido. Se nada mudou, a resposta contém apenas confirmação e identificador, sem reenviar jogadores, marcações e histórico. Clientes antigos continuam recebendo respostas completas.
- Com PostgreSQL, consultas sem alterações leem apenas metadados do jogo; alterações exigem uma segunda leitura da partida. Sem cache global que possa ficar desatualizado entre processos. Permissões são verificadas antes de qualquer resposta.
- Após três consultas sem mudanças, o intervalo passa de 1,2 para 2,5 segundos; após oito, para 5 segundos. Alterações detectadas e comandos locais retomam a frequência rápida. Uma alteração de outro jogador após inatividade pode demorar cerca de 5 segundos, além da rede.
- Abas ocultas não iniciam novas consultas; ao voltar, buscam uma atualização completa. Uma consulta já em andamento pode terminar. Não há redesenho do campo/histórico em respostas sem mudanças. Relógio continua calculado localmente quando visível. Fim de tempo e reinício do servidor também invalidam o identificador, mesmo sem novo comando.
- Falhas de rede usam espera crescente até 30 segundos. Nenhuma alteração em regras, fichas, banco, comandos, marcações ou permissões.

Validação: 82 testes passaram. Novo teste de API mede resposta sem alterações com menos de 1% do JSON completo em uma partida sintética com 200 registros; isso não é medição do consumo real da hospedagem. Sintaxe verificada. Não testado no navegador, PostgreSQL real, Supabase ou alwaysdata. Não garante ausência de limites do provedor; monitorar consumo após publicar.

Atualização no alwaysdata: publique os arquivos no GitHub; no SSH, dentro de /home/grupao/grupao, rode `git pull --ff-only` e `npm ci --omit=dev`. Se houver conflito, não descarte alterações locais. Reinicie o site pelo painel. Mantenha DATABASE_URL e banco Supabase existentes. Não inclua arquivos de dados ou credenciais no GitHub. Usuários devem atualizar a página para receber o cliente novo.


## Versão 4.8.9 — Exclusão de fichas e tela cheia

- O mestre pode abrir uma ficha e clicar em **Excluir ficha**. A confirmação informa os times salvos dependentes que também serão excluídos. Para participantes, a conta e a participação no save permanecem; a ficha fica vazia. Para NPCs, o personagem extra é removido e libera uma vaga.
- Fichas escaladas na partida atual, inclusive encerrada, ficam protegidas: prepare outra partida sem a ficha antes de excluí-la. Partida, histórico e demais fichas são preservados. O servidor exige mestre, confirmação e que a ficha não tenha mudado desde a prévia.
- Em **Abrir partida**, clique em **Tela cheia**, junto aos controles de zoom. Campo, zoom, régua e marcações continuam disponíveis. Use **Sair da tela cheia** ou Escape para voltar. Quando a API de tela cheia não está disponível, o campo ocupa a janela do navegador. O enquadramento considera largura e altura disponíveis.

Validação: **79 testes automatizados passaram**, incluindo permissões, confirmação, conflito de edição, proteção de fichas escaladas, remoção de times dependentes e gravação local. Sintaxe JavaScript verificada. Tela cheia e gestos não foram validados no navegador/aparelho físico; PostgreSQL real e Render não foram testados.


## Versão 4.8.8 — Zoom e navegação pelo campo

Em **BlueLocker → save → Abrir partida**, use os controles acima do campo:

- **+ / −**: aproximação de 100% a 300%. O campo começa totalmente enquadrado, inclusive em telas pequenas.
- **Navegar**: arraste a visão com mouse ou um dedo. Nesse modo, a roda do mouse aproxima no ponto indicado pelo cursor; pinça com dois dedos aproxima e desloca a visão. Desative Navegar para voltar a mover tokens, usar a régua ou segurar por 2 segundos para adicionar/remover marcações.
- **Enquadrar campo**: restaura o campo inteiro e centralizado.
- Teclado: com foco na visão do campo e Navegar ativo, setas deslocam, +/− aproximam/afastam, Home enquadra e Escape sai do modo Navegar.

A visão é individual, não altera dados da partida nem a visão dos outros participantes. O zoom permanece durante as atualizações periódicas e volta ao enquadramento inicial ao reabrir a tela. Redimensionar a janela mantém o enquadramento proporcional. Régua, marcações e destinos continuam referenciados aos 105 × 68 metros do campo.

Validação: **77 testes automatizados passaram**, incluindo limites do zoom, deslocamento, ponto sob o cursor, redimensionamento e coordenadas da régua/destinos após zoom. Sintaxe JavaScript verificada. A ferramenta de navegador falhou ao iniciar; o fluxo visual e os gestos em aparelho físico não foram validados. PostgreSQL real e Render não foram testados. Servidor e persistência não foram alterados.


## Versão 4.8.7 — Backup e restauração de campanhas

O mestre pode baixar um backup JSON em **BlueLocker → abrir save → Backup da campanha → Baixar backup do save**. Para restaurar, entre em **BlueLocker → Meus saves → Restaurar campanha**, selecione o arquivo, confira a prévia, escolha o nome e confirme.

- Inclui participantes, fichas e aprovações, fotos, NPCs, times salvos, diário, partida atual (posições, posse, placar, tempo, marcações, dados no histórico e lance pendente) e resumos das partidas anteriores.
- Restaura uma nova campanha com outro código, sem sobrescrever o save original. Partidas em andamento retornam pausadas; o mestre pode retomar. Os atributos copiados na partida continuam independentes de edições posteriores nas fichas.
- Use a mesma conta do mestre original. Os participantes são vinculados pelos nicknames existentes. O arquivo não contém contas, senhas, configurações do servidor ou dados dos outros minigames; não substitui o backup do banco PostgreSQL completo.
- A prévia não grava dados. A confirmação valida o conteúdo e a integridade novamente. Repetir o mesmo envio não cria outra cópia. Abrir o arquivo novamente inicia uma nova restauração.
- Limite de 90 MB por arquivo. Backup manual: guarde o JSON baixado. O checksum detecta alteração acidental, não comprova autoria. Metadados temporários de importação de fichas e de restaurações anteriores não são transportados.
- Mantido o armazenamento PostgreSQL quando configurado, ou o arquivo local existente; nenhuma migração é necessária.

Validação: **73 testes automatizados passaram**, incluindo integridade, permissões, preservação do original, fotos, times, lance automático pendente, desfazer, restauração concorrente sem duplicação, arquivos acima do limite de uma ficha e persistência local após reinício. Sintaxe JavaScript verificada. A interface não foi validada no navegador; PostgreSQL real e Render não foram testados.


## Versão 4.8.6 — Marcações compartilhadas no campo

Em **BlueLocker → save → Abrir partida**, segure o botão esquerdo do mouse ou o dedo por **2 segundos** em um espaço do campo para colocar um marcador vermelho de localização. Um círculo indica que o gesto está em andamento. Para remover, segure por **2 segundos sobre o marcador**.

- Mestre e participantes podem colocar e remover marcações. Todos na partida veem os mesmos marcadores pela sincronização existente (consulta a cada 1,2 segundo). Cada marcador identifica quem o colocou ao passar o mouse.
- Soltar antes de 2 segundos, arrastar mais de 8 pixels, cancelar o toque, sair do campo com o mouse ou perder o foco cancela a espera. Não há repetição automática ao continuar segurando.
- Pressionar tokens/bola mantém os gestos de movimentação anteriores; não cria uma marcação. Com a régua ativa, os gestos continuam exclusivos da medição. Clique curto em marcador não o remove nem escolhe um destino de movimento.
- As marcações ficam no mesmo estado persistido da partida, usando PostgreSQL quando configurado ou o armazenamento local existente. Permanecem ao atualizar a página e após reinício, até serem removidas. Uma nova partida começa sem marcações. Limite de 50 marcações por partida.
- Adicionar ou remover uma marcação não altera posições, posse, dados, placar ou cronômetro. Desfazer um lance não desfaz marcações. As operações usam identificadores próprios para impedir duplicação por repetição de envio; até 200 identificadores removidos são lembrados para evitar reaparecimento por uma repetição antiga.

Preservados importação/exportação de fichas, régua, times salvos, mesa livre, contas, minigames e persistência.

Validação: **66 testes automatizados passaram**, incluindo seis novos testes de tempo exato de 2 segundos, cancelamento de gesto, permissões, limites, repetição, concorrência, independência do jogo e persistência/sincronização via API. Sintaxe JavaScript verificada. O novo gesto não foi validado em navegador ou aparelho físico; PostgreSQL real e Render não foram testados.


## Versão 4.8.5 — Exportar e importar fichas

### Mestre: criar e entregar uma ficha

1. No save, use **Personagens controlados pelo mestre → Criar ficha extra** (ou uma ficha existente).
2. Preencha os dados do personagem, foto, atributos, nível e evolução; clique em **Salvar ficha**.
3. Abra a ficha e clique em **Exportar ficha salva**. O site baixa um arquivo `.json`.
4. Envie esse arquivo ao participante pelo meio que preferir. O site não envia mensagens automaticamente.

A exportação usa a última versão salva, não alterações ainda no formulário. O arquivo contém somente nome, idade, nacionalidade, altura, posição, estilo, Ego, iniciais, evolução, nível, talentos, arma, observações, cor e foto do personagem. Não contém contas, senhas, código do save, diário, outras fichas ou dados de partida. A ficha extra original é mantida.

### Participante: importar para a própria conta

1. Entre na sua conta e abra o save do qual participa.
2. Em **Importar minha ficha**, selecione o JSON recebido.
3. Confira a prévia com foto/cartão, atributos, modificadores e textos. Nada é salvo só por abrir o arquivo.
4. Se já existir uma ficha não aprovada, marque a confirmação para substituí-la. Clique em **Importar para minha conta**. Cancelar mantém a ficha atual.
5. A ficha importada aguarda aprovação do mestre, inclusive quanto a nível e evolução. Aprovações e modificadores vindos do arquivo não são aceitos como autoridade: os modificadores são recalculados.

Fichas aprovadas precisam ser liberadas pelo mestre antes de outra importação. O arquivo pode ser usado em outro save, desde que o usuário participe dele. As regras continuam: idade 15–20, iniciais 1–12, total até 30 e até dois pontos de evolução por nível após o primeiro. PNG até 1 MB e 2048 × 2048; arquivo de importação até 1450 KiB na interface. Arquivos podem ser editados externamente, por isso toda importação exige revisão do mestre para uso nas partidas.

O servidor valida tanto a prévia quanto a gravação. A ficha só pode ser importada para a própria conta, sem criar usuários ou NPCs. Uma prévia desatualizada é rejeitada; repetir a última requisição de importação não reaplica a substituição. Saves, fotos e fichas usam a persistência existente (PostgreSQL quando configurado, arquivo local no desenvolvimento). Times salvos continuam referenciando a ficha da conta; partidas já iniciadas mantêm os modificadores copiados anteriormente.

Validação: 60 testes automatizados passaram (55 anteriores e cinco novos de transferência), cobrindo permissões, arquivo inválido, foto, limites, prévia sem gravação, confirmação, aprovação, repetição, concorrência e persistência após reinício. Sintaxe JavaScript verificada. A nova interface não foi validada em navegador; PostgreSQL real e Render não foram testados.


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
