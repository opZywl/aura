import os
import logging
import json
import queue
from dotenv import load_dotenv
from flask import Flask, request, jsonify, Response, stream_with_context
from flask_cors import CORS
from werkzeug.exceptions import HTTPException
from dataclasses import dataclass, field
from typing import List, Dict
from datetime import datetime
import uuid
import requests

from .features.modules.Accounts import (
    TelegramAccount,
    listTelegramAccounts,
    connectTelegram,
    removeTelegram
)

logging.getLogger('werkzeug').setLevel(logging.WARNING)
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
    createdAt: str = field(default_factory=lambda: datetime.utcnow().isoformat())
    participants: List[Dict] = field(default_factory=list)
    messages: List[Message] = field(default_factory=list)

_conversations: Dict[str, Conversation] = {}
chat_to_account: Dict[str, str] = {}
sse_subscribers: Dict[str, List[queue.Queue]] = {}

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

# Accounts
@app.route('/api/accounts', methods=['GET'])
def obter_accounts():
    logger.info("GET /api/accounts - listando contas Telegram.")
    contas = listTelegramAccounts()
    return jsonify([acc.__dict__ for acc in contas]), 200

@app.route('/api/accounts', methods=['POST'])
def criar_account():
    logger.info("POST /api/accounts - criando conta Telegram.")
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
    logger.info(f"Conta conectada: {nova_acc.id} - {nova_acc.botName}")

    conv = Conversation(id=nova_acc.id, title=nova_acc.botName)
    conv.participants = [{"id": nova_acc.id, "botName": nova_acc.botName}]
    init_msg = Message(id=uuid.uuid4().hex, sender='system',
                       text=f"Conta '{nova_acc.botName}' conectada.")
    conv.messages.append(init_msg)
    _conversations[conv.id] = conv

    ngrok_url = os.environ.get('NGROK_URL')
    if ngrok_url:
        webhook_url = f"{ngrok_url}/api/telegram/webhook/{nova_acc.id}"
        resp = requests.post(
            f"https://api.telegram.org/bot{nova_acc.apiKey}/setWebhook",
            data={'url': webhook_url}
        )
        logger.info(f"setWebhook status={resp.status_code}, body={resp.text}")

    return jsonify(nova_acc.__dict__), 201

@app.route('/api/accounts/<account_id>', methods=['DELETE'])
def deletar_account(account_id):
    logger.info(f"DELETE /api/accounts/{account_id}")

    # Remove webhook do Telegram
    contas = listTelegramAccounts()
    bot = next((c for c in contas if c.id == account_id), None)
    if bot:
        try:
            resp = requests.post(f"https://api.telegram.org/bot{bot.apiKey}/deleteWebhook")
            logger.info(f"deleteWebhook status={resp.status_code}, body={resp.text}")
        except Exception as e:
            logger.warning(f"Erro ao remover webhook no Telegram: {e}")

    # Limpa mapeamentos locais
    for chat_id, acc_id in list(chat_to_account.items()):
        if acc_id == account_id:
            del chat_to_account[chat_id]

    removeTelegram(account_id)
    _conversations.pop(account_id, None)

    return '', 204

# Telegram Webhook
@app.route('/api/telegram/webhook/<account_id>', methods=['POST'])
def telegram_webhook(account_id):
    contas = listTelegramAccounts()
    if not any(acc.id == account_id for acc in contas):
        logger.warning(f"Webhook para account_id não conectado: {account_id}. Ignorando.")
        return jsonify({'status': 'ignored'}), 200

    update = request.get_json(silent=True) or {}
    msg = update.get('message')
    if not msg:
        return jsonify({'status': 'ignored'}), 200

    chat = msg.get('chat', {})
    conv_id = str(chat.get('id'))
    title = chat.get('title') or chat.get('username') or conv_id

    if conv_id not in _conversations:
        conv = Conversation(id=conv_id, title=title)
        _conversations[conv_id] = conv
        logger.info(f"Nova conversa via webhook: {conv_id} - {title}")

    conv = _conversations[conv_id]
    sender = (msg.get('from') or {}).get('username') or 'desconhecido'
    text = msg.get('text', '')
    new_msg = Message(id=uuid.uuid4().hex, sender=sender, text=text)
    conv.messages.append(new_msg)
    logger.info(f"Mensagem recebida de '{sender}' em conv {conv_id}: {text}")

    for q in sse_subscribers.get(conv_id, []):
        q.put(new_msg.__dict__)

    return jsonify({'status': 'ok'}), 200

# Conversas
@app.route('/api/conversations', methods=['GET'])
def listar_conversas():
    contas = listTelegramAccounts()
    if not contas:
        logger.info("Nenhuma conta Telegram conectada; retornando lista vazia.")
        return jsonify([]), 200

    account_ids = {acc.id for acc in contas}
    resumo = []
    for conv in _conversations.values():
        if conv.id in account_ids:
            continue
        resumo.append({
            'id': conv.id,
            'title': conv.title,
            'createdAt': conv.createdAt,
            'lastMessage': conv.messages[-1].text if conv.messages else None,
            'lastAt': conv.messages[-1].timestamp if conv.messages else None
        })
    return jsonify(resumo), 200

@app.route('/api/conversations', methods=['POST'])
def criar_conversa():
    data = request.get_json(silent=True) or {}
    title = data.get('title')
    if not title:
        return jsonify({'erro': 'Título obrigatório'}), 400
    conv_id = data.get('id') or os.urandom(8).hex()
    if conv_id in _conversations:
        return jsonify({'erro': 'Conversa já existe'}), 400
    conv = Conversation(id=conv_id, title=title)
    _conversations[conv_id] = conv
    logger.info(f"Conversa criada: {conv_id} - {title}")
    return jsonify({'id': conv.id, 'title': conv.title}), 201

@app.route('/api/conversations/<conv_id>', methods=['GET'])
def obter_conversa(conv_id):
    conv = _conversations.get(conv_id)
    if not conv:
        return jsonify({'erro': 'Conversa não encontrada'}), 404
    logger.info(f"GET /api/conversations/{conv_id}")
    return jsonify({
        'id': conv.id,
        'title': conv.title,
        'createdAt': conv.createdAt,
        'participants': conv.participants
    }), 200

@app.route('/api/conversations/<conv_id>', methods=['PATCH'])
def renomear_conversa(conv_id):
    conv = _conversations.get(conv_id)
    if not conv:
        return jsonify({'erro': 'Conversa não encontrada'}), 404
    data = request.get_json(silent=True) or {}
    new_title = data.get('title')
    if not new_title:
        return jsonify({'erro': 'Novo título obrigatório'}), 400
    conv.title = new_title
    logger.info(f"Conversa {conv_id} renomeada para '{new_title}'")
    return jsonify({'id': conv.id, 'title': conv.title}), 200

@app.route('/api/conversations/<conv_id>', methods=['DELETE'])
def deletar_conversa(conv_id):
    conv = _conversations.pop(conv_id, None)
    if not conv:
        return jsonify({'erro': 'Conversa não encontrada'}), 404
    logger.info(f"Conversa encerrada: {conv_id} - {conv.title}")
    sse_subscribers.pop(conv_id, None)
    return '', 204

@app.route('/api/conversations/<conv_id>/messages', methods=['GET'])
def listar_mensagens(conv_id):
    conv = _conversations.get(conv_id)
    if not conv:
        return jsonify({'erro': 'Conversa não encontrada'}), 404
    limit = request.args.get('limit', type=int)
    offset = request.args.get('offset', type=int, default=0)
    msgs = conv.messages
    sliced = msgs[offset: offset + limit] if limit is not None else msgs
    logger.info(f"GET mensagens conv {conv_id} limit={limit} offset={offset}")
    return jsonify([m.__dict__ for m in sliced]), 200

@app.route('/api/conversations/<conv_id>/messages', methods=['POST'])
def enviar_mensagem(conv_id):
    data = request.get_json(silent=True) or {}
    if not data.get('sender') or not data.get('text'):
        return jsonify({'erro': 'Campos sender e text obrigatórios'}), 400

    conv = _conversations.get(conv_id)
    if not conv:
        return jsonify({'erro': 'Conversa não encontrada'}), 404

    # 1) Cria e armazena a mensagem normal
    out_msg = Message(
        id=uuid.uuid4().hex,
        sender=data['sender'],
        text=data['text']
    )
    conv.messages.append(out_msg)
    logger.info(f"Mensagem adicionada via API: {data['text']}")

    # 2) Fallback para envio ao Telegram
    contas = listTelegramAccounts()
    account_id = chat_to_account.get(conv_id)
    bot = None
    if account_id:
        bot = next((c for c in contas if c.id == account_id), None)
        logger.info(f"Usando mapping chat_to_account: conv_id={conv_id} -> account_id={account_id}")
    elif len(contas) == 1:
        bot = contas[0]
        logger.info(f"Nenhum mapping encontrado; usando única conta Telegram: {bot.id}")
    else:
        logger.warning(f"chat_id {conv_id} sem bot mapeado e múltiplas contas; não enviou no Telegram")

    if bot:
        try:
            resp = requests.post(
                f"https://api.telegram.org/bot{bot.apiKey}/sendMessage",
                json={"chat_id": conv_id, "text": data['text']}
            )
            logger.info(f"sendMessage status={resp.status_code}, body={resp.text}")
        except Exception as e:
            logger.warning(f"Erro ao enviar para Telegram: {e}")

    # 3) Adiciona mensagem de sistema
    account_name = bot.botName if bot else 'Conta desconhecida'
    contact_name = conv.title
    sys_text = f"Mensagem enviada ({account_name}) para contato ({contact_name}): {out_msg.text}"
    sys_msg = Message(
        id=uuid.uuid4().hex,
        sender='system',
        text=sys_text
    )
    conv.messages.append(sys_msg)
    logger.info(f"Mensagem de sistema adicionada: {sys_text}")

    # 4) Retorna somente a mensagem normal
    return jsonify(out_msg.__dict__), 201

@app.route('/api/conversations/<conv_id>/messages/<msg_id>', methods=['DELETE'])
def deletar_mensagem(conv_id, msg_id):
    conv = _conversations.get(conv_id)
    if not conv:
        return jsonify({'erro': 'Conversa não encontrada'}), 404
    before = len(conv.messages)
    conv.messages = [m for m in conv.messages if m.id != msg_id]
    if len(conv.messages) == before:
        return jsonify({'erro': 'Mensagem não encontrada'}), 404
    logger.info(f"Mensagem {msg_id} removida de {conv_id}")
    return '', 204

@app.route('/api/conversations/<conv_id>/messages/<msg_id>', methods=['PATCH'])
def editar_mensagem(conv_id, msg_id):
    conv = _conversations.get(conv_id)
    if not conv:
        return jsonify({'erro': 'Conversa não encontrada'}), 404
    data = request.get_json(silent=True) or {}
    new_text = data.get('text')
    if not new_text:
        return jsonify({'erro': 'Texto obrigatório'}), 400
    for m in conv.messages:
        if m.id == msg_id:
            m.text = new_text
            logger.info(f"Mensagem {msg_id} em {conv_id} editada: {new_text}")
            return jsonify(m.__dict__), 200
    return jsonify({'erro': 'Mensagem não encontrada'}), 404

@app.route('/api/conversations/<conv_id>/mark-read', methods=['POST'])
def marcar_lidas(conv_id):
    conv = _conversations.get(conv_id)
    if not conv:
        return jsonify({'erro': 'Conversa não encontrada'}), 404
    logger.info(f"Todas as mensagens em {conv_id} marcadas como lidas")
    return '', 204

@app.route('/api/conversations/<conv_id>/stream')
def stream_conv(conv_id):
    def event_stream(q):
        try:
            while True:
                data = q.get()
                yield f"data: {json.dumps(data)}\n\n"
        except GeneratorExit:
            logger.info(f"SSE client desconectado de {conv_id}")

    q = queue.Queue()
    sse_subscribers.setdefault(conv_id, []).append(q)
    logger.info(f"Novo cliente SSE conectado em {conv_id}")
    return Response(stream_with_context(event_stream(q)), mimetype="text/event-stream")

@app.route('/api/contacts/<contact_id>/nickname', methods=['PATCH'])
def update_contact_nickname(contact_id):
    data = request.get_json(silent=True) or {}
    new_nickname = data.get('nickname')

    if new_nickname:
        logger.info(f"Apelido do contato {contact_id} alterado para '{new_nickname}'")
    else:
        logger.info(f"Apelido do contato {contact_id} removido (reset para nome original)")

    return '', 204

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 3001))
    logger.info(f"Iniciando Flask em http://0.0.0.0:{port}")
    if os.environ.get('FLASK_ENV') == 'development':
        ngrok_url = os.environ.get('NGROK_URL')
        logger.info(f"URL pública (ngrok): {ngrok_url}")
        logger.info("Dashboard ngrok: http://127.0.0.1:4040")
    logger.info(f"API disponível em: http://localhost:{port}/api")
    app.run(host='0.0.0.0', port=port, debug=True)
