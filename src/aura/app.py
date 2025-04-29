import os
import logging
from dotenv import load_dotenv
from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.exceptions import HTTPException
from dataclasses import dataclass, field
from typing import List, Dict
from datetime import datetime
import uuid
import requests

load_dotenv()

logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})
logger.info("Aplicação Flask iniciada e CORS configurado.")

ngrok_url_env = os.environ.get('NGROK_URL')
if os.environ.get('FLASK_ENV') == 'development' and not ngrok_url_env:
    try:
        from pyngrok import ngrok, conf
        auth_token = os.environ.get('NGROK_AUTH_TOKEN')
        if auth_token:
            conf.get_default().auth_token = auth_token
        tunnel = ngrok.connect(int(os.environ.get('PORT', 3001)), "http")
        public_url = tunnel.public_url
        os.environ['NGROK_URL'] = public_url
        logger.info(f"ngrok iniciado automaticamente: {public_url}")
    except Exception as e:
        logger.warning(f"Falha ao iniciar ngrok automaticamente: {e}")
elif ngrok_url_env:
    logger.info(f"Usando NGROK_URL do .env: {ngrok_url_env}")

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
def handle_404(e):
    logger.warning(f"Recurso não encontrado: {request.path}")
    return jsonify({"erro": "Recurso não encontrado"}), 404

@app.errorhandler(Exception)
def handle_exception(e):
    if isinstance(e, HTTPException):
        logger.warning(f"HTTPException: {e.code} - {e.description}")
        return jsonify({"erro": e.description}), e.code
    logger.exception("Erro interno inesperado:")
    return jsonify({"erro": "Erro interno no servidor"}), 500

@app.route('/', methods=['GET'])
def raiz():
    logger.info("GET / - Endpoint raiz acessado.")
    return jsonify({"mensagem": "API Flask no ar! Use /api/..."}), 200

@app.route('/api/accounts', methods=['GET'])
def obter_accounts():
    logger.info("GET /api/accounts - Requisição recebida.")
    contas = listTelegramAccounts()
    lista = [acc.__dict__ for acc in contas]
    logger.debug(f"Retornando {len(lista)} contas.")
    return jsonify(lista), 200

@app.route('/api/accounts', methods=['POST'])
def criar_account():
    logger.info("POST /api/accounts - Requisição recebida.")
    if not request.is_json:
        logger.warning("Conteúdo não é JSON.")
        return jsonify({"erro": "Requisição deve ser JSON"}), 415
    data = request.get_json(silent=True) or {}
    api_key = data.get('apiKey')
    bot_name = data.get('botName')
    if not api_key or not bot_name:
        logger.warning("apiKey e botName são obrigatórios.")
        return jsonify({"erro": "apiKey e botName são obrigatórios"}), 400
    nova_acc = connectTelegram(api_key.strip(), bot_name.strip())
    logger.info(f"Conta conectada com sucesso: {nova_acc.id} - {nova_acc.botName}")

    conv = Conversation(id=nova_acc.id, title=nova_acc.botName)
    init_msg = Message(id=uuid.uuid4().hex, sender='system', text=f"Conta '{nova_acc.botName}' conectada.")
    conv.messages.append(init_msg)
    _conversations[conv.id] = conv
    logger.info(f"Conversa criada automaticamente: {conv.id} - {conv.title}")

    ngrok_url = os.environ.get('NGROK_URL')
    if ngrok_url:
        webhook_url = f"{ngrok_url}/api/telegram/webhook/{nova_acc.id}"
        logger.info(f"Registrando webhook no Telegram: {webhook_url}")
        resp = requests.post(
            f"https://api.telegram.org/bot{nova_acc.apiKey}/setWebhook",
            data={'url': webhook_url}
        )
        logger.info(f"setWebhook status={resp.status_code}, body={resp.text}")
    else:
        logger.warning("NGROK_URL não configurado; webhook não registrado.")
    return jsonify(nova_acc.__dict__), 201

@app.route('/api/accounts/<account_id>', methods=['DELETE'])
def deletar_account(account_id):
    logger.info(f"DELETE /api/accounts/{account_id} - Requisição recebida.")
    removeTelegram(account_id)
    _conversations.pop(account_id, None)
    logger.info(f"Conta e conversa associada excluída: {account_id}")
    return '', 204

# Webhook do Telegram
@app.route('/api/telegram/webhook/<account_id>', methods=['POST'])
def telegram_webhook(account_id):
    update = request.get_json(silent=True) or {}
    msg = update.get('message')
    if not msg:
        logger.warning("Webhook sem mensagem válida.")
        return jsonify({'status':'ignored'}), 200
    chat = msg.get('chat', {})
    conv_id = str(chat.get('id'))
    title = chat.get('title') or chat.get('username') or conv_id
    if conv_id not in _conversations:
        _conversations[conv_id] = Conversation(id=conv_id, title=title)
        logger.info(f"Nova conversa iniciada via webhook: {conv_id} - {title}")
    sender = (msg.get('from') or {}).get('username') or 'desconhecido'
    text = msg.get('text','')
    new_msg = Message(id=uuid.uuid4().hex, sender=sender, text=text)
    _conversations[conv_id].messages.append(new_msg)
    logger.info(f"Mensagem recebida de '{sender}' na conversa '{conv_id}': {text}")
    return jsonify({'status':'ok'}), 200

@app.route('/api/conversations', methods=['GET'])
def listar_conversas():
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
    data = request.get_json(silent=True) or {}
    if not data.get('sender') or not data.get('text'):
        logger.warning('Campos sender e text obrigatórios')
        return jsonify({'erro':'Campos sender e text obrigatórios'}), 400
    conv = _conversations.get(conv_id)
    if not conv:
        logger.warning(f"Conversa não encontrada: {conv_id}")
        return jsonify({'erro':'Conversa não encontrada'}), 404
    out_msg = Message(id=uuid.uuid4().hex, sender=data['sender'], text=data['text'])
    conv.messages.append(out_msg)
    logger.info(f"Mensagem adicionada via API: {data['text']}")
    return jsonify(out_msg.__dict__), 201

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 3001))
    logger.info(f"Iniciando Flask em http://0.0.0.0:{port}")
    if os.environ.get('FLASK_ENV') == 'development':
        ngrok_url = os.environ.get('NGROK_URL')
        logger.info(f"URL pública (ngrok): {ngrok_url}")
        logger.info("Dashboard ngrok: http://127.0.0.1:4040")
    logger.info(f"API disponível em: http://localhost:{port}/api")
    app.run(host='0.0.0.0', port=port, debug=True)
