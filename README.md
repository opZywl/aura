<div align="center">
  <p>
    <img width="250" src="https://via.placeholder.com/250?text=Aura+Chat+Bot" alt="Aura Chat Bot Logo">
  </p>

[Site](#) | [GitHub](#) | [Documentação](#)

Um chatbot com CRM integrado para otimizar o atendimento ao cliente.
</div>

# Aura Chat Bot

**TCC - Aura Chat Bot** é um projeto desenvolvido para aprimorar a **Gestão do Atendimento ao Cliente** em pequenas empresas de serviços. Com o aumento das consultas online e por telefone, o sistema visa oferecer respostas automáticas e personalizadas, centralizando informações e identificando oportunidades de vendas.

---

## 🛠️ Pré-requisitos

- Python 3.9+ instalado
- Node.js 16+ e npm ou yarn
- Git

---

## 🚀 Instalação

1. **Clone o repositório**
   ```bash
   git clone https://github.com/unaspht/aura/
   cd no local do repositório
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

3. **Frontend React**
   ```bash
   cd src/aura
   npm install                 # ou yarn install

   # configure proxy no package.json:
   # "proxy": "http://localhost:3001"
   ```
---

## ▶️ Como executar

1. **Inicie o backend** (na raiz do projeto)
   ```bash
   python -m src.aura.app
   ```

2. **Inicie o frontend** (dentro de `src/aura`)
   ```bash
   npm run dev
   ```

3. **Abra** no navegador:
    - Frontend: `http://localhost:3000`
    - Backend (opcional): `http://localhost:3001`

---

## 📁 Estrutura de Pastas

```
src/
├── aura/                       # Backend Flask + Frontend React específicos
│   ├── __init__.py
│   ├── app.py                  # Servidor Flask
│   ├── App.tsx                 # Entrypoint React
│   ├── styles/                 # Estilos CSS
│   │   ├── App.css
│   │   └── index.css
│   ├── features/               # Lógica e views do domínio
│   │   ├── modules/            # Módulos Python
│   │   │   ├── __init__.py
│   │   │   ├── Accounts.py
│   │   │   └── Chat.py
│   │   └── view/               # Componentes de página React/TSX
│   │       ├── chat/
│   │       │   ├── types.ts
│   │       │   ├── IconWrapper.tsx
│   │       │   ├── ChatHeader.tsx
│   │       │   ├── ChatSidebar.tsx
│   │       │   ├── ChatMessages.tsx
│   │       │   ├── ChatInput.tsx
│   │       │   ├── ChatInfo.tsx
│   │       │   └── ChatNotificationDropdown.tsx
│   │       │   └── ChatTemplate.tsx
│   │       ├── Chat.tsx
│   │       ├── Contas.tsx
│   │       ├── Conversations.tsx
│   │       ├── Home.tsx
│   │       └── Teste.tsx
│   ├── components/             # Componentes UI reutilizáveis
│   │   ├── Companies.tsx
│   │   ├── Footer.tsx
│   │   ├── Header.tsx
│   │   └── Hero.tsx
│   └── pages/                  # Páginas de rota React
│       ├── Artigo.tsx
│       ├── Changelog.tsx
│       ├── CRM.tsx
│       ├── Feedback.tsx
│       ├── Login.tsx
│       ├── Orientadores.tsx
│       ├── Privacidade.tsx
│       ├── Prompts.tsx
│       ├── Tecnologias.tsx
│       └── Terms.tsx
├── resources/                  # Assets estáticos
│   ├── carrosel/               # Ícones do carrossel
│   └── social/                 # Ícones de redes sociais
├── custom.d.ts                 # Tipagens globais TS
├── index.tsx                   # Ponto de entrada do React
├── main.tsx                    # Alternativa de boot no React
├── App.tsx                     # App wrapper genérico (raiz)
├── .gitgnore                   # git
├── tailwind.config.ts          # Config TailwindCSS
├── tsconfig.json               # Config TypeScript
├── package.json                # Dependências e scripts frontend
├── package-lock.json           # Lockfile npm
├── README.md                   # Documentação do projeto
├── LICENSE                     # Licença MIT
└── requirements.txt
```

---

## 📜 Licença

Este projeto está licenciado sob a [MIT License](LICENSE).
