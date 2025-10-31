#!/bin/bash

# Script para iniciar todos os serviços do Aura Dev
# Backend (Python/Flask), Frontend (Next.js) e Ngrok

# Cores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Função para limpar processos ao sair
cleanup() {
    echo -e "\n${YELLOW}Encerrando todos os serviços...${NC}"
    kill $(jobs -p) 2>/dev/null
    exit 0
}

# Capturar Ctrl+C
trap cleanup SIGINT SIGTERM

echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     Iniciando Aura Dev Services        ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}\n"

# Verificar se as dependências estão instaladas
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}❌ Python3 não encontrado. Instale o Python3 primeiro.${NC}"
    exit 1
fi

if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js não encontrado. Instale o Node.js primeiro.${NC}"
    exit 1
fi

# Iniciar Backend Python/Flask
if [ -f "backend/app.py" ] || [ -f "server.py" ] || [ -f "api/app.py" ]; then
    echo -e "${GREEN}🐍 Iniciando Backend Python/Flask...${NC}"

    # Tentar encontrar o arquivo principal
    if [ -f "backend/app.py" ]; then
        cd backend && python3 app.py &
        BACKEND_PID=$!
        cd ..
    elif [ -f "server.py" ]; then
        python3 server.py &
        BACKEND_PID=$!
    elif [ -f "api/app.py" ]; then
        cd api && python3 app.py &
        BACKEND_PID=$!
        cd ..
    fi

    echo -e "${GREEN}✓ Backend iniciado (PID: $BACKEND_PID)${NC}\n"
    sleep 2
else
    echo -e "${YELLOW}⚠ Nenhum arquivo Python encontrado. Pulando backend...${NC}\n"
fi

# Iniciar Frontend Next.js
echo -e "${GREEN}⚛️  Iniciando Frontend Next.js...${NC}"
npm run dev &
FRONTEND_PID=$!
echo -e "${GREEN}✓ Frontend iniciado (PID: $FRONTEND_PID)${NC}\n"
sleep 3

# Iniciar Ngrok
if command -v ngrok &> /dev/null; then
    echo -e "${GREEN}🌐 Iniciando Ngrok...${NC}"

    # Porta padrão do Next.js
    NEXT_PORT=3000

    # Porta padrão do Flask (se existir)
    FLASK_PORT=5000

    # Iniciar ngrok para o frontend
    ngrok http $NEXT_PORT --log=stdout > ngrok.log &
    NGROK_PID=$!
    echo -e "${GREEN}✓ Ngrok iniciado para porta $NEXT_PORT (PID: $NGROK_PID)${NC}\n"

    sleep 2

    # Tentar obter a URL pública do ngrok
    if command -v curl &> /dev/null; then
        NGROK_URL=$(curl -s http://localhost:4040/api/tunnels | grep -o '"public_url":"[^"]*' | grep -o 'https://[^"]*' | head -1)
        if [ ! -z "$NGROK_URL" ]; then
            echo -e "${BLUE}🔗 URL Pública Ngrok: ${NGROK_URL}${NC}\n"
        fi
    fi
else
    echo -e "${YELLOW}⚠ Ngrok não encontrado. Instale com: npm install -g ngrok${NC}\n"
fi

# Exibir informações dos serviços
echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║         Serviços em Execução           ║${NC}"
echo -e "${BLUE}╠════════════════════════════════════════╣${NC}"
echo -e "${BLUE}║${NC} Frontend: ${GREEN}http://localhost:3000${NC}      ${BLUE}║${NC}"
if [ ! -z "$BACKEND_PID" ]; then
    echo -e "${BLUE}║${NC} Backend:  ${GREEN}http://localhost:5000${NC}      ${BLUE}║${NC}"
fi
if [ ! -z "$NGROK_URL" ]; then
    echo -e "${BLUE}║${NC} Ngrok:    ${GREEN}$NGROK_URL${NC}"
fi
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}\n"

echo -e "${YELLOW}Pressione Ctrl+C para encerrar todos os serviços${NC}\n"

# Manter o script rodando
wait
</merged_code
