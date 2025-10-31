<div align="center">
  <p>
    <img width="250" src="https://via.placeholder.com/250?text=Aura+Chat+Bot" alt="Aura Chat Bot Logo">
  </p>

[Site](#) | [GitHub](#) | [Documentação](#)

Um chatbot com CRM integrado para otimizar o atendimento ao cliente.
</div>

# Aura Chat Bot

**TCC - Aura Chat Bot** é um projeto desenvolvido para aprimorar a **Gestão do Atendimento ao Cliente** em pequenas empresas de serviços. Com o crescimento das consultas online e por telefone, o sistema oferece respostas automáticas e personalizadas, centraliza informações e identifica oportunidades de vendas.

---

## Pré-requisitos

- Python 3.9+
- Node.js 18+ com npm ou pnpm
- Git

---

## Instalação

1. **Clone o repositório**
   ```bash
   git clone https://github.com/unaspht/aura
   cd aura
   ```

2. **Configure o backend (Python)**
   ```bash
   # Crie e ative um ambiente virtual
   python -m venv .venv
   source .venv/bin/activate     # macOS/Linux
   .venv\Scripts\activate      # Windows

   # Instale as dependências
   pip install -r requirements.txt
   ```

3. **Configure o frontend (Next.js)**
   ```bash
   npm install --legacy-peer-deps   # ou pnpm install
   ```

4. **Defina as variáveis de ambiente**
   ```bash
   cp .env.example .env.local
   # edite .env.local conforme necessário
   ```

---

## Como executar

1. **Inicie o backend**
   ```bash
   python -m src.aura.app
   ```
   O backend ficará acessível em `http://localhost:3001`.

2. **Inicie o frontend**
   ```bash
   npm run dev
   ```
   A aplicação estará disponível em `http://localhost:3000`.

3. **Build de produção (opcional)**
   ```bash
   npm run build && npm start
   ```

4. **Exposição externa (ngrok opcional)**
   ```bash
   ngrok http 3000
   ```

---

## Licença

Este projeto está licenciado sob a [MIT License](LICENSE).
