#!/bin/bash

# Script para garantir que nunca use a porta 3001
PORT=3000

# Verifica se a porta 3000 está ocupada
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null ; then
    echo "Porta 3000 ocupada, tentando porta 3002..."
    PORT=3002
fi

# Verifica se a porta 3002 está ocupada
if [ $PORT -eq 3002 ] && lsof -Pi :3002 -sTCP:LISTEN -t >/dev/null ; then
    echo "Porta 3002 ocupada, tentando porta 3003..."
    PORT=3003
fi

# Nunca usar porta 3001
if [ $PORT -eq 3001 ]; then
    PORT=3004
fi

echo "Iniciando Aura na porta $PORT..."
npm run dev -- -p $PORT
