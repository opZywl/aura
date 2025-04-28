import os
import logging
from flask import Flask, request, jsonify
from flask_cors import CORS
from typing import List, Dict
from dataclasses import dataclass, field
from datetime import datetime

logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app, resources={r"/api/*": {"origins": "*"}})

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

@app.route('/api/conversations', methods=['GET'])
def listar_conversas():
    logger.info('GET /api/conversations - listando conversas')
    resumo = [
        { 'id': conv.id, 'title': conv.title, 'lastMessage': conv.messages[-1].text if conv.messages else None, 'lastAt': conv.messages[-1].timestamp if conv.messages else None }
        for conv in _conversations.values()
    ]
    return jsonify(resumo), 200

@app.route('/api/conversations', methods=['POST'])
def criar_conversa():
    data = request.get_json(silent=True)
    if not data or 'title' not in data:
        logger.warning('POST /api/conversations - title ausente')
        return jsonify({ 'error': 'Título da conversa é obrigatório' }), 400

    conv_id = data.get('id') or os.urandom(8).hex()
    title = data['title'].strip()
    if conv_id in _conversations:
        logger.warning(f'POST /api/conversations - conversa {conv_id} já existe')
        return jsonify({ 'error': 'Conversa já existe' }), 400

    conv = Conversation(id=conv_id, title=title)
    _conversations[conv_id] = conv
    logger.info(f'Conversa criada: {conv_id} - {title}')
    return jsonify({ 'id': conv.id, 'title': conv.title }), 201

@app.route('/api/conversations/<conv_id>/messages', methods=['GET'])
def listar_mensagens(conv_id):
    conv = _conversations.get(conv_id)
    if not conv:
        logger.warning(f'GET /api/conversations/{conv_id}/messages - não encontrada')
        return jsonify({ 'error': 'Conversa não encontrada' }), 404

    msgs = [m.__dict__ for m in conv.messages]
    logger.info(f'Listando {len(msgs)} mensagens da conversa {conv_id}')
    return jsonify(msgs), 200

@app.route('/api/conversations/<conv_id>/messages', methods=['POST'])
def enviar_mensagem(conv_id):
    conv = _conversations.get(conv_id)
    if not conv:
        logger.warning(f'POST /api/conversations/{conv_id}/messages - conversa não encontrada')
        return jsonify({ 'error': 'Conversa não encontrada' }), 404

    data = request.get_json(silent=True)
    if not data or 'sender' not in data or 'text' not in data:
        logger.warning(f'POST /api/conversations/{conv_id}/messages - dados inválidos')
        return jsonify({ 'error': 'Campos sender e text são obrigatórios' }), 400

    msg_id = os.urandom(8).hex()
    msg = Message(id=msg_id, sender=data['sender'].strip(), text=data['text'].strip())
    conv.messages.append(msg)
    logger.info(f'Mensagem adicionada em {conv_id}: {msg.id}')
    return jsonify(msg.__dict__), 201

@app.route('/api/conversations/<conv_id>', methods=['DELETE'])
def deletar_conversa(conv_id):
    if conv_id not in _conversations:
        logger.warning(f'DELETE /api/conversations/{conv_id} - não encontrada')
        return jsonify({ 'error': 'Conversa não encontrada' }), 404

    del _conversations[conv_id]
    logger.info(f'Conversa removida: {conv_id}')
    return '', 204

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 3002))
    logger.info(f'Iniciando backend de chat em 0.0.0.0:{port}')
    app.run(host='0.0.0.0', port=port, debug=True)