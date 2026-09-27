## v4.8.21 — Correção de desempenho sobre a v4.8.18

Este pacote é uma manutenção da versão anterior aos campeonatos. NÃO inclui carreira ou a reformulação visual das versões 4.8.19/20. Use somente se ainda está na versão anterior ao campeonato. A numeração 4.8.21 identifica esta entrega, mas não indica inclusão daqueles recursos.

No PostgreSQL, ações de partidas existentes passam a consultar apenas proprietário, nicknames dos participantes e partida sob bloqueio da linha. A gravação envia somente partida e data de atualização, preservando fichas, fotos, diário, lixeira e demais campos no banco. A criação da partida continua usando o caminho completo, pois precisa das fichas e do histórico. Ações do mesmo save aguardam antes de adquirir conexão com o banco; saves diferentes têm filas independentes. Mantém transações, revisões e confirmação após COMMIT. O banco ainda precisa atualizar o documento JSONB; esta mudança reduz transferência/processamento no aplicativo, não elimina o custo interno de gravação no PostgreSQL. O armazenamento local mantém o mecanismo anterior.

No navegador, o histórico só é reconstruído quando seus registros mudam, evitando reconstruções em seleções/atualizações repetidas. A frequência de sincronização permanece igual.

Validação: 116 testes aprovados, incluindo 12 ações concorrentes com substituto de banco, preservação de dados não relacionados, rollback, liberação de conexões e filas independentes. Teste Edge local do campo com 14 jogadores, iniciar partida, dados na lateral/painel/tela cheia e histórico. Não foi realizado teste de carga na alwaysdata nem execução das consultas em Supabase/PostgreSQL real; não há estimativa de ganho de latência em produção. Uma medição com três usuários na hospedagem ainda é necessária.

Antes de atualizar: exporte os backups das campanhas importantes e guarde o ZIP da versão atual. Substitua os arquivos no GitHub, execute os comandos abaixo na hospedagem e reinicie o site. Preserve todas as variáveis de ambiente.

```sh
cd /home/grupao/grupao
git pull --ff-only
npm ci --omit=dev
```

Após reiniciar, todos devem usar Ctrl+F5. Teste o mesmo save primeiro sozinho e depois com três pessoas: mover peças, rolar dados e abrir outra página. Se continuar lento, observe CPU/RAM da hospedagem durante a sessão. Não envie DATABASE_URL, senhas ou tokens em capturas. O pacote não altera dados de produção automaticamente e não requer tabelas novas. Para voltar o código, use o ZIP anterior e reinicie; restaurar dados exige backup separado.

