# Checkup de Prioridades para a apresentação

## O que já está pronto para mostrar
- Painel e Flow Builder renderizam no frontend (Next.js) e permitem navegar pelas áreas principais e construir fluxos no canvas do Workflow Builder. 【F:app/panel/page.tsx†L1-L21】【F:src/aura/features/view/Flow.tsx†L1-L200】
- Backend Flask já responde por rotas do bot e integra contas do Telegram, mantendo histórico de conversas em disco. 【F:src/aura/app.py†L1-L200】

## Principais lacunas a endereçar
1. **Persistência real em PostgreSQL para estoque, vendas e OS**
   - Hoje o chatbot e o painel leem/escrevem diretamente em um arquivo JSON local (`workshopData.json`), e não em um banco relacional. Migrar para PostgreSQL é essencial para confiabilidade, multiusuário e métricas. 【F:src/aura/chatbot/chatbot.py†L138-L195】【F:src/data/workshopData.json†L1-L120】

2. **Sincronização em tempo real com o sistema interno (OS/agenda/estoque)**
   - As ordens de serviço exibidas são apenas registros estáticos no JSON, sem atualização ou leitura do sistema da oficina. Implementar conectores/rotas que consultem e atualizem OS/agenda de verdade é crítico para a demo. 【F:src/data/workshopData.json†L149-L226】

3. **Persistência das conversas e handoffs em banco**
   - O histórico de chat fica salvo em arquivos JSON por conversa; isso impede relatórios, buscas e escalabilidade. Centralizar as conversas (inclusive quando o atendimento vai para um agente humano) no banco permitirá métricas e arquivamento robusto. 【F:src/aura/app.py†L113-L200】

4. **Métricas de painel e financeiro baseadas em dados vivos**
   - As vendas e itens exibidos vêm do JSON e não se atualizam a partir de transações reais, limitando gráficos e indicadores financeiros. Conectar os módulos de vendas/pedidos ao banco e calcular agregados em tempo de execução dará confiabilidade às métricas do painel. 【F:src/data/workshopData.json†L1-L148】

## Sequência sugerida (curto prazo)
1) Substituir `workshopData.json` por tabelas PostgreSQL (estoque, vendas, pedidos, OS) e ajustar os loaders/escritores do bot para usar essas tabelas.
2) Criar endpoints de integração (ou conectores) para consultar e atualizar OS e agenda diretamente no sistema interno, alimentando painel e chatbot.
3) Persistir conversas e handoffs no banco para liberar filtros/relatórios e preparar métricas de satisfação/tempo de atendimento.
4) Reprocessar métricas do painel com base nos dados vivos (queries agregadas) em vez de valores estáticos do JSON.
