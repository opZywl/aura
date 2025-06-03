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

## 🛠️ Pré-requisitos

- Python 3.9+  
- Node.js 16+ e npm ou yarn  
- Git  

---

## 🚀 Instalação

1. **Clone o repositório**
   ```bash
   git clone https://github.com/unaspht/aura/
   cd aura
   ```

2. **Backend Python**
   ```bash
   # Crie e ative um ambiente virtual
   python -m venv .venv
   source .venv/bin/activate    # macOS/Linux
   .venv\Scripts\activate     # Windows PowerShell

   # Instale dependências
   pip install -r requirements.txt
   ```

3. **Frontend React (Next.js)**
   ```bash
   cd src/aura
   npm install                 # ou yarn install

   # (Opcional) configure proxy no package.json:
   # "proxy": "http://localhost:3001"
   ```

4. **Variáveis de Ambiente**
   ```bash
   cp .env.example .env.local
   # Edite .env.local com suas chaves/API keys:
   # GROQ_API_KEY=<sua_groq_api_key>
   # NEXT_PUBLIC_API_URL=http://localhost:3001
   # PORT=3001
   # FLASK_ENV=development
   # NGROK_AUTH_TOKEN=<se_tiver>
   ```

---

## ▶️ Como executar

1. **Inicie o backend** (na raiz do projeto)
   ```bash
   python -m src.aura.app
   ```
   - Backend rodando em `http://localhost:3001`

2. **Inicie o frontend** (dentro de `src/aura`)
   ```bash
   npm run dev
   ```
   - Frontend rodando em `http://localhost:3000`

3. **Exposição externa (ngrok, opcional)**
   ```bash
   ngrok http 3000
   # Gera URL pública para testes
   ```

---

## 📜 Licença

Este projeto está licenciado sob a [MIT License](LICENSE).
