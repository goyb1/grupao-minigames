# Bot do Grupão — v4.8.17

Comandos entregues:
- `/site`: link do site.
- `/novidades`: último anúncio com envio confirmado no histórico do site. Não lê mensagens antigas do Discord.
- `/ranking`: top 10 de futebol por padrão. A opção `jogo` permite Futebol, Clash Royale ou Quiz gamer. Usa os mesmos recordes e desempate por vitórias do site, excluindo contas suspensas.

As respostas aparecem no canal onde o comando foi usado. Não há vínculo entre conta Discord e conta do site nesta versão. Não são expostos senha, ficha, campanha, save ou e-mail. Nicknames e recordes do ranking serão visíveis aos membros do servidor que usam os comandos.

## 1. Criar a aplicação no Discord

Acesse https://discord.com/developers/applications e use **New Application**. Nome sugerido: Grupão Minigames.

Em **General Information**, copie **Application ID** e **Public Key**. Em **Bot**, gere o token em **Reset Token** e guarde-o em lugar privado. Configure também a foto do bot; a foto do webhook é independente. Não ative os Privileged Gateway Intents: estes comandos não precisam deles.

Em **Installation**, habilite **Guild Install**. O painel do site fornecerá um link para instalar com `bot` e `applications.commands`, pedindo somente visualizar canais, enviar mensagens e inserir links. Não é necessário conceder Administrador.

Referência oficial: https://docs.discord.com/developers/quick-start/getting-started

## 2. Obter o ID do servidor

No Discord: Configurações do usuário → Avançado → Modo desenvolvedor. Depois, clique com o botão direito no ícone do servidor do Grupão e escolha **Copiar ID do servidor**. É o ID do servidor, não do canal de atualizações.

## 3. Atualizar o site e configurar variáveis

Atualize os arquivos do GitHub com este ZIP. No SSH:

```bash
cd /home/grupao/grupao
git pull --ff-only
npm ci --omit=dev
```

No alwaysdata → Web → Sites → configuração → Environment, acrescente estas variáveis, substituindo os exemplos pelos valores reais:

```
DISCORD_APPLICATION_ID=ID_DA_APLICACAO
DISCORD_PUBLIC_KEY=CHAVE_PUBLICA
DISCORD_GUILD_ID=ID_DO_SERVIDOR
DISCORD_BOT_TOKEN=TOKEN_DO_BOT
```

Mantenha `PUBLIC_SITE_URL=https://grupao.alwaysdata.net` e todas as variáveis existentes, especialmente DATABASE_URL e DISCORD_UPDATES_WEBHOOK_URL. Uma variável por linha, sem aspas, sem espaços ao redor do sinal de igual. O token do bot é diferente da URL do webhook. Não envie o token em mensagens, capturas ou no GitHub. Não execute comandos para imprimir todas as variáveis no terminal.

Clique **Submit**, reinicie o site pelo painel e use Ctrl+F5 no navegador. Não é necessário iniciar outro processo Node ou instalar biblioteca nova.

## 4. Instalar no servidor

Entre no site como goyb → Administração → **Bot do Discord**. Confira se as configurações estão marcadas como disponíveis. Clique **Adicionar bot ao servidor** e autorize no servidor do Grupão usando uma conta com permissão para gerenciá-lo.

## 5. Salvar o endereço de comandos

No portal do Discord, em **General Information → Interactions Endpoint URL**, cole:

```
https://grupao.alwaysdata.net/api/discord/interactions
```

Clique **Save Changes**. O Discord verifica o endpoint; o site precisa estar atualizado, reiniciado e acessível por HTTPS. Este é o campo Interactions Endpoint URL, não o campo Webhook Events. A URL também está disponível para copiar no painel do bot.

Referência oficial sobre validação: https://docs.discord.com/developers/interactions/overview

## 6. Registrar e testar

Volte ao painel do site e clique **Registrar / atualizar comandos**. Esse botão cria ou atualiza somente `/site`, `/novidades` e `/ranking` nesta aplicação e neste servidor. Não apaga outros comandos. Não há registro automático ao abrir o painel ou reiniciar. Se parte do registro falhar, o mesmo botão pode ser usado novamente após a espera indicada.

No canal do Discord, digite `/site`. Em seguida experimente `/novidades` e `/ranking`, escolhendo o jogo no seletor. Aguarde dois segundos entre comandos. Confirme os resultados com o painel do site.

O token é usado para registrar comandos. Após concluir, é possível removê-lo do ambiente e reiniciar: os comandos já registrados continuam funcionando com Application ID, Public Key e Guild ID. Para atualizá-los no futuro, reconfigure o token.

Referência sobre registro: https://docs.discord.com/developers/interactions/application-commands

## Se algo não funcionar

- **Bot aparece offline:** esperado neste modo. Não há conexão Gateway para anunciar presença. Os comandos funcionam pelo endpoint HTTPS.
- **Portal não aceita o endpoint:** confira Public Key e Application ID da mesma aplicação, variáveis salvas, reinício, HTTPS e URL exata. Abra o site primeiro e tente salvar novamente se a hospedagem estava parada. Não desative a validação de assinatura.
- **Não aparecem comandos:** confirme Guild ID, instalação no servidor e registro pelo painel. No Discord, confira permissões de uso de comandos e restrições do canal/integração. Atualize o cliente Discord.
- **Bot não respondeu:** se o processo estava parado ou a hospedagem demorou a responder, abra o site e tente de novo. Discord exige uma confirmação inicial em três segundos; o site confirma antes da consulta ao banco, mas não controla o tempo de inicialização da hospedagem.
- **Ranking ou novidades desatualizados:** aguarde até 15 segundos. Novidades só mostra anúncios confirmados no histórico do site; resolve manualmente um envio incerto depois de conferir o canal.
- **Erro ao entregar resposta:** o painel mostra uma mensagem genérica. Verifique disponibilidade do site e permissões do canal e tente novamente. Não há envio automático de mensagens fora de um comando.
- **Configuração local pronta** significa que os campos têm formato válido. A confirmação final é salvar o endpoint no Discord, registrar os comandos e testá-los. Os horários do painel são temporários e recomeçam ao reiniciar.

## Como mantém o consumo baixo

Nenhum bot separado, Gateway ou tarefa periódica. `/site` não consulta o banco. Os demais comandos têm cache de até 15 segundos, consultas agrupadas enquanto estão em andamento e limites por usuário/servidor. Estado temporário limitado em memória; não salva histórico de comandos nem cria tabelas adicionais para o bot. O envio de anúncios pelo webhook permanece independente.

Os testes locais usam assinaturas Ed25519 reais geradas para teste e respostas simuladas da API Discord. Não substituem testar a instalação real no seu servidor, Supabase e alwaysdata.
