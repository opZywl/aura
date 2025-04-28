import os
import sys
import logging
from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.exceptions import HTTPException
from dataclasses import dataclass, field
from typing import List, Dict
from datetime import datetime
import uuid

logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})
logger.info("Aplicação Flask iniciada e CORS configurado.")

try:
    from .features.modules.Accounts import (
        TelegramAccount,
        listTelegramAccounts,
        connectTelegram,
        removeTelegram
    )
    logger.info("Módulo 'Accounts' importado com sucesso.")
except ImportError as e:
    logger.error(f"Falha ao importar o módulo 'Accounts': {e}")

@dataclass
class Message:
    id: str
    sender: str
    text: str
    timestamp: str = field(default_factory=lambda: datetime.utcnow().isoformat())

@dataclass
class Conversation:
    id: str
    title: str
    messages: List[Message] = field(default_factory=list)

_conversations: Dict[str, Conversation] = {}

@app.errorhandler(404)
def rota_nao_encontrada(e):
    logger.warning(f"Recurso não encontrado: {request.path}")
    return jsonify({"erro": "Recurso não encontrado"}), 404

@app.errorhandler(Exception)
def erro_interno(e):
    if isinstance(e, HTTPException):
        logger.warning(f"HTTPException: {e.code} - {e.description}")
        return jsonify({"erro": e.description}), e.code
    logger.exception("Erro interno inesperado:")
    return jsonify({"erro": "Erro interno no servidor"}), 500

@app.route("/", methods=["GET"])
def raiz():
    logger.info("GET / - Endpoint raiz acessado.")
    return jsonify({"mensagem": "API Flask no ar! Use /api/..."}), 200

@app.route("/api/accounts", methods=["GET"])
def obter_accounts():
    logger.info("GET /api/accounts - Requisição recebida.")
    try:
        contas = listTelegramAccounts()
        lista = [acc.__dict__ for acc in contas]
        logger.debug(f"Retornando {len(lista)} contas.")
        return jsonify(lista), 200
    except NameError:
        logger.error("Módulo 'Accounts' não importado corretamente em GET /api/accounts.")
        return jsonify({"erro": "Erro de configuração do servidor"}), 500
    except Exception:
        logger.exception("Erro ao buscar contas:")
        return jsonify({"erro": "Falha ao recuperar contas"}), 500

@app.route("/api/accounts", methods=["POST"])
def criar_account():
    logger.info("POST /api/accounts - Requisição recebida.")
    if not request.is_json:
        logger.warning("Conteúdo não é JSON.")
        return jsonify({"erro": "Requisição deve ser JSON"}), 415

    data = request.get_json(silent=True)
    logger.debug(f"Payload crear conta recebido: {data}")
    if not data:
        logger.warning("Sem dados no corpo da requisição.")
        return jsonify({"erro": "Nenhum dado fornecido"}), 400

    api_key = data.get("apiKey")
    bot_name = data.get("botName")
    if not api_key or not bot_name:
        logger.warning("Faltando 'apiKey' ou 'botName'.")
        return jsonify({"erro": "apiKey e botName são obrigatórios"}), 400

    try:
        logger.info(f"Tentando conectar conta Telegram: {bot_name}")
        nova_acc: TelegramAccount = connectTelegram(api_key.strip(), bot_name.strip())
        logger.info(f"Conta conectada com sucesso: {nova_acc.id} - {nova_acc.botName}")

        conv = Conversation(id=nova_acc.id, title=nova_acc.botName)
        msg = Message(id=uuid.uuid4().hex, sender="system", text=f"Conta '{nova_acc.botName}' conectada.")
        conv.messages.append(msg)
        _conversations[conv.id] = conv
        logger.info(f"Conversa criada automaticamente: {conv.id} - {conv.title}")

        return jsonify(nova_acc.__dict__), 201

    except NameError:
        logger.error("Módulo 'Accounts' não importado corretamente em POST /api/accounts.")
        return jsonify({"erro": "Erro de configuração do servidor"}), 500
    except ValueError as e:
        logger.warning(f"Falha ao conectar conta ({bot_name}): {e}")
        return jsonify({"erro": str(e)}), 400
    except Exception:
        logger.exception(f"Erro inesperado ao conectar conta ({bot_name}):")
        return jsonify({"erro": "Erro interno ao conectar conta"}), 500

@app.route("/api/accounts/<account_id>", methods=["DELETE"])
def deletar_account(account_id):
    logger.info(f"DELETE /api/accounts/{account_id} - Requisição recebida.")
    try:
        removeTelegram(account_id)
        logger.info(f"Conta excluída com sucesso: {account_id}")
        if account_id in _conversations:
            del _conversations[account_id]
            logger.info(f"Conversa associada excluída: {account_id}")
        return '', 204

    except NameError:
        logger.error("Módulo 'Accounts' não importado corretamente em DELETE /api/accounts.")
        return jsonify({"erro": "Erro de configuração do servidor"}), 500
    except ValueError as e:
        logger.warning(f"Falha ao excluir conta ({account_id}): {e}")
        return jsonify({"erro": str(e)}), 404
    except Exception:
        logger.exception(f"Erro inesperado ao excluir conta ({account_id}):")
        return jsonify({"erro": "Erro interno ao excluir conta"}), 500

@app.route('/api/telegram/webhook/<account_id>', methods=['POST'])
def telegram_webhook(account_id):
    update = request.get_json(silent=True)
    logger.debug(f"Payload webhook Telegram recebido para conta {account_id}: {update}")
    logger.info(f"Webhook chamado para conta {account_id}")
    if not update or 'message' not in update:
        logger.warning("Webhook Telegram sem payload de mensagem.")
        return jsonify({"status": "ignored"}), 200

    msg_data = update['message']
    chat = msg_data.get('chat', {})
    conv_id = str(chat.get('id'))
    title = chat.get('title') or chat.get('username') or conv_id

    if conv_id not in _conversations:
        _conversations[conv_id] = Conversation(id=conv_id, title=title)
        logger.info(f"Nova conversa iniciada via webhook: {conv_id} - {title}")

    conv = _conversations[conv_id]
    sender_info = msg_data.get('from', {})
    sender = sender_info.get('username') or sender_info.get('first_name', 'desconhecido')
    text = msg_data.get('text', '')

    msg = Message(id=uuid.uuid4().hex, sender=sender, text=text)
    conv.messages.append(msg)
    logger.info(f"Mensagem recebida de '{sender}' na conversa '{conv_id}': {text}")

    return jsonify({"status": "ok"}), 200

@app.route('/api/conversations', methods=['GET'])
def listar_conversas():
    logger.info('GET /api/conversations - listando conversas')
    resumo = []
    for conv in _conversations.values():
        resumo.append({
            'id': conv.id,
            'title': conv.title,
            'lastMessage': conv.messages[-1].text if conv.messages else None,
            'lastAt': conv.messages[-1].timestamp if conv.messages else None
        })
    return jsonify(resumo), 200

@app.route('/api/conversations/<conv_id>/messages', methods=['POST'])
def enviar_mensagem(conv_id):
    data = request.get_json(silent=True)
    logger.debug(f"POST /api/conversations/{conv_id}/messages - Payload recebido: {data}")
    if not data or 'sender' not in data or 'text' not in data:
        logger.warning('Campos sender e text são obrigatórios')
        return jsonify({ 'erro': 'Campos sender e text são obrigatórios' }), 400

    conv = _conversations.get(conv_id)
    if not conv:
        logger.warning(f'Conversa não encontrada: {conv_id}')
        return jsonify({ 'erro': 'Conversa não encontrada' }), 404

    msg = Message(id=uuid.uuid4().hex, sender=data['sender'].strip(), text=data['text'].strip())
    conv.messages.append(msg)
    logger.info(f"Mensagem adicionada via API de '{data['sender']}': {data['text']}")
    return jsonify(msg.__dict__), 201

if __name__ == '__main__':
    porta = int(os.environ.get('PORT', 3001))
    logger.info(f'Iniciando servidor Flask em 0.0.0.0:{porta}')
    app.run(host='0.0.0.0', port=porta, debug=True, use_reloader=True)