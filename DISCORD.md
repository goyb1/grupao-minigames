# Conectar as atualizações do Grupão ao Discord

Esta integração publica anúncios manuais. O bot com comandos será uma etapa separada.

## 1. Criar o webhook

No Discord, abra as configurações do servidor → Integrações → Webhooks → Novo webhook. É preciso ter permissão para gerenciar webhooks. Escolha um canal de texto, por exemplo #atualizações, e use o nome Grupão Minigames. Você pode escolher uma imagem no próprio Discord. Copie a URL do webhook. Esta implementação usa canal de texto comum, não fórum ou tópico.

## 2. Configurar no alwaysdata

Abra Web → Sites → configuração do site. No campo Environment, preserve todas as variáveis existentes, especialmente DATABASE_URL. Acrescente estas duas variáveis, uma por linha:

```
DISCORD_UPDATES_WEBHOOK_URL=COLE_A_URL_DO_WEBHOOK_AQUI
PUBLIC_SITE_URL=https://grupao.alwaysdata.net
```

Substitua o valor da primeira linha pela URL copiada. Não use o texto de exemplo como valor. Se o endereço público do site mudar, ajuste a segunda linha. Salve no botão Submit e reinicie o site em Web → Sites. Não coloque a URL privada no GitHub, nos campos do anúncio ou em capturas de tela; ela permite publicar no canal.

## 3. Instalar a atualização

Suba os arquivos do ZIP para o repositório, preservando a estrutura atual. Não remova configurações ou arquivos de dados. No SSH:

```bash
cd /home/grupao/grupao
git pull --ff-only
npm ci --omit=dev
```

Reinicie pelo painel e atualize o navegador com Ctrl+F5. O servidor cria automaticamente a tabela independente discord_updates quando o painel é acessado, se estiver usando PostgreSQL. A conta do banco precisa de permissão de criação de tabela, assim como nas funcionalidades existentes. Contas, campanhas e partidas não são alteradas.

## 4. Publicar

Entre como goyb → Administração → Atualizações no Discord. Preencha versão, título, novidades e/ou correções. Clique em Ver prévia. O botão Publicar no Discord envia a mensagem para o canal configurado. Abrir o painel, gerar a prévia, atualizar o site ou reiniciar o servidor não publica nada.

O formato da versão é 4.8.15 ou 4.8.15-beta.1; v inicial é opcional. Cada versão só pode ter uma publicação confirmada. As últimas 30 tentativas aparecem no histórico; o registro de versões antigas continua armazenado para bloquear duplicatas. O texto pode receber formatação Markdown no Discord; a prévia mostra o conteúdo. Menções não notificam usuários, cargos ou everyone.

## Se falhar

- Webhook não configurado: confira a variável no ambiente do site e reinicie. A URL completa nunca aparece na interface.
- Não enviado: confira o webhook/canal e carregue o anúncio no formulário para revisar e tentar outra vez. Se houver limite de envios, aguarde o tempo informado pelo Discord; não há repetição automática.
- Conferir no Discord ou envio em andamento: pode ter ocorrido uma queda depois de o Discord receber a mensagem. Aguarde dois minutos e confira o canal. Use Confirmei: chegou ao canal para registrar sucesso, ou Confirmei: não chegou para liberar nova tentativa. Esse segundo botão não envia; será necessário gerar a prévia e publicar novamente. Não libere uma tentativa sem conferir.

O histórico é separado dos backups de campanha. No PostgreSQL, fica em discord_updates; sem banco, fica em data/discord-updates.json, que deve ser preservado. Falha no registro impede reenvio automático. Não é possível garantir entrega exatamente uma vez entre serviços durante falhas de rede; a conferência manual evita reenviar às cegas.

Não existem consultas periódicas nem processo adicional de bot. O envio usa uma requisição HTTPS quando o administrador publica. Cada anúncio mantém apenas texto e metadados; sem fotos, fichas ou anexos. O consumo real no alwaysdata não foi medido.

Referências oficiais: https://support.discord.com/hc/pt-br/articles/228383668-Usando-Webhooks e https://docs.discord.com/developers/resources/webhook#execute-webhook
