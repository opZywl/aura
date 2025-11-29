# Checkup do Sistema Aura

Este checkup marca onde cada requisito do documento fornecido aparece (ou não aparece) no repositório atual.

## Visão geral e arquitetura
- ✅ Backend Flask/Python presente em `src/aura/app.py`, inicializando CORS e rotas de bot/Telegram. 【F:src/aura/app.py†L1-L64】
- ✅ Frontend Next.js/React com painel em `app/panel/page.tsx` carregando `Panel` e `Statistics`. 【F:app/panel/page.tsx†L1-L18】
- ✅ Flow Builder visual implementado em `src/aura/features/view/Flow.tsx`, usando `WorkflowBuilder` e UI de edição. 【F:src/aura/features/view/Flow.tsx†L5-L47】
- ⚠️ Integração com banco PostgreSQL não está configurada; os dados de oficina e vendas usam arquivos JSON (`src/data/workshopData.json`) em vez de consultas ao banco. 【F:src/data/workshopData.json†L1-L80】

## Requisitos funcionais principais
- ✅ Chatbot responde e mantém conversas via bot_components_api e Flask (`app.py`), incluindo suporte a Telegram. 【F:src/aura/app.py†L19-L64】
- ✅ Painel multicanal com seções (Panel, Statistics, Lobby, Flow, Chat) presentes em `src/aura/features/view`. 【F:src/aura/features/view/Panel.tsx†L1-L40】
- ✅ Flow Builder permite criar fluxos (componentes de mensagem, opções, etc.) através de `WorkflowBuilder`. 【F:src/aura/features/view/Flow.tsx†L5-L47】
- ✅ Login de usuários internos com validação local e alternância de tema em `Login.tsx`. 【F:src/aura/features/view/auth/Login.tsx†L1-L87】
- ⚠️ Agendamento de serviços, consulta de OS e agenda em tempo real não aparecem implementados; não há rotas ou módulos consumindo dados de OS/agenda.
- ⚠️ Integração em tempo real com estoque/OS/agenda no banco interno não está presente; estoque é lido de JSON estático (`workshopData.json`). 【F:src/data/workshopData.json†L1-L80】
- ⚠️ Encerramento/arquivamento de atendimentos é parcial; há estruturas de conversação em memória no Flask mas não há persistência em banco ou UI completa documentada.

## Requisitos de interface
- ✅ Tela de login com campos usuário/senha e mensagens de erro em `Login.tsx`. 【F:src/aura/features/view/auth/Login.tsx†L1-L87】
- ✅ Painel principal com seções (Ferramentas, Insights, Temas) em `Panel.tsx` e componentes relacionados. 【F:src/aura/features/view/Panel.tsx†L1-L40】
- ✅ Tela de Chat e lobby presentes nos componentes `Chat.tsx` e `lobby/*`. 【F:src/aura/features/view/Chat.tsx†L1-L60】
- ✅ Flow Builder com menu lateral de componentes e canvas em `Flow.tsx`. 【F:src/aura/features/view/Flow.tsx†L5-L47】

## Requisitos de dados
- ⚠️ Uso declarado de PostgreSQL não está configurado; dependência `psycopg2-binary` existe em `requirements.txt`, mas o app usa JSON local para estoque/vendas (`workshopData.json`). 【F:requirements.txt†L5-L6】【F:src/data/workshopData.json†L1-L80】
- ⚠️ Não há sincronização em tempo real com sistemas internos; dados são estáticos em arquivos.

## Requisitos não funcionais
- ⚠️ Arquitetura MVC não está explícita; o backend é um Flask monolítico e o frontend Next.js separado, sem camadas claras de modelo/controle persistente.
- ⚠️ Escalabilidade/disponibilidade 24/7 não está coberta por automação ou observabilidade; apenas execução manual descrita no README.
- ⚠️ Testes automatizados não identificados além de compilações pontuais; não há suíte de testes ou scripts CI.

## Backlog futuro citado
- ⚠️ Funcionalidades de futuro (atendimento proativo com ML, pagamentos integrados) não estão presentes no código atual.

## Conclusão
Grande parte da UI (painel, login, flow builder) e do chatbot básico está presente. Integrações críticas descritas (agenda/OS em tempo real, PostgreSQL efetivo, sincronização de estoque, métricas financeiras) ainda não aparecem implementadas no repositório e dependem de desenvolvimento adicional.
