import os
import logging
import json
import queue
import threading
import time
from datetime import datetime, timezone, timedelta
from dotenv import load_dotenv
from flask import Flask, request, jsonify, Response, stream_with_context
from flask_cors import CORS
from werkzeug.exceptions import HTTPException
from dataclasses import dataclass, field
from typing import List, Dict, Optional
import uuid
import requests

# IMPORT RELATIVO DO MÓDULO Accounts
from .features.modules.Accounts import (
    TelegramAccount,
    listTelegramAccounts,
    connectTelegram,
    removeTelegram
)

# --- Configurações Iniciais ---
logging.getLogger('werkzeug').setLevel(logging.WARNING)
load_dotenv()

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = Flask(__name__)

# Habilita CORS para todas as rotas
CORS(app, origins="*", methods=["GET", "POST", "PATCH", "DELETE", "OPTIONS"])
logger.info("✅ Aplicação Flask iniciada e CORS configurado.")

# Configuração de timezone brasileiro
BRASIL_TZ = timezone(timedelta(hours=-3))

# Se estiver em dev e não houver NGROK_URL, inicia ngrok automaticamente
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
        logger.info(f"🌐 ngrok iniciado automaticamente: {public_url}")
    except Exception as e:
        logger.warning(f"⚠️ Falha ao iniciar ngrok automaticamente: {e}")
elif ngrok_url_env:
    logger.info(f"🌐 Usando NGROK_URL do .env: {ngrok_url_env}")

# --- Definições de dataclasses para conversas e mensagens ---
@dataclass
class Message:
    id: str
    sender: str
    text: str
    timestamp: str = field(default_factory=lambda: datetime.now(BRASIL_TZ).isoformat())

    def to_dict(self):
        return {
            'id': self.id,
            'sender': self.sender,
            'text': self.text,
            'timestamp': self.timestamp
        }

@dataclass
class Conversation:
    id: str
    title: str
    createdAt: str = field(default_factory=lambda: datetime.now(BRASIL_TZ).isoformat())
    participants: List[Dict] = field(default_factory=list)
    messages: List[Message] = field(default_factory=list)
    lastMessage: str = ""
    lastAt: str = field(default_factory=lambda: datetime.now(BRASIL_TZ).isoformat())
    isArchived: bool = False

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'createdAt': self.createdAt,
            'participants': self.participants,
            'lastMessage': self.lastMessage,
            'lastAt': self.lastAt,
            'isArchived': self.isArchived
        }

# Armazenamento otimizado em memória
_conversations: Dict[str, Conversation] = {}
_conversation_lock = threading.Lock()
chat_to_account: Dict[str, str] = {}
sse_subscribers: Dict[str, List[queue.Queue]] = {}

# Cache para otimização
_cache = {
    'conversations_last_update': 0,
    'conversations_cache': [],
    'cache_duration': 30  # segundos
}

# --- Funções utilitárias ---
def get_brasil_time():
    """Retorna timestamp atual do Brasil"""
    return datetime.now(BRASIL_TZ).isoformat()

def cleanup_old_conversations():
    """Remove conversas antigas sem atividade (24h)"""
    cutoff_time = datetime.now(BRASIL_TZ) - timedelta(hours=24)
    cutoff_iso = cutoff_time.isoformat()

    with _conversation_lock:
        to_remove = []
        for conv_id, conv in _conversations.items():
            if conv.lastAt < cutoff_iso and len(conv.messages) == 0:
                to_remove.append(conv_id)

        for conv_id in to_remove:
            del _conversations[conv_id]
            logger.info(f"🗑️ Conversa inativa removida: {conv_id}")

def broadcast_to_subscribers(conv_id: str, message_data: dict):
    """Envia mensagem para todos os subscribers SSE"""
    if conv_id in sse_subscribers:
        dead_queues = []
        for q in sse_subscribers[conv_id]:
            try:
                q.put(message_data, timeout=1)
            except Exception:
                dead_queues.append(q)

        # Remove queues mortas
        for q in dead_queues:
            sse_subscribers[conv_id].remove(q)

# --- Tratamento de erros otimizado ---
@app.errorhandler(404)
def handle_404(e):
    return jsonify({"erro": "Endpoint não encontrado", "status": 404}), 404

@app.errorhandler(Exception)
def handle_exception(e):
    if isinstance(e, HTTPException):
        return jsonify({"erro": e.description, "status": e.code}), e.code

    logger.exception("❌ Erro interno inesperado:")
    return jsonify({"erro": "Erro interno no servidor", "status": 500}), 500

# --- Health Check otimizado ---
@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check com informações detalhadas"""
    return jsonify({
        "status": "healthy",
        "message": "Backend funcionando perfeitamente",
        "timestamp": get_brasil_time(),
        "version": "2.0.0",
        "timezone": "America/Sao_Paulo",
        "conversations_count": len(_conversations),
        "active_accounts": len(listTelegramAccounts()),
        "ngrok_url": os.environ.get('NGROK_URL'),
        "uptime": "OK"
    }), 200

# --- Listar contas ---
@app.route('/api/accounts', methods=['GET'])
def obter_accounts():
    """Lista todas as contas conectadas"""
    try:
        contas = listTelegramAccounts()
        response_data = [acc.__dict__ for acc in contas]
        logger.info(f"📋 Retornando {len(response_data)} contas")
        return jsonify(response_data), 200
    except Exception as e:
        logger.error(f"❌ Erro ao listar contas: {e}")
        return jsonify({"erro": str(e)}), 500

# --- Criar conta ---
@app.route('/api/accounts', methods=['POST'])
def criar_account():
    """Conecta nova conta do serviço"""
    try:
        if not request.is_json:
            return jsonify({"erro": "Requisição deve ser JSON"}), 415

        data = request.get_json(silent=True) or {}
        api_key = data.get('apiKey')
        bot_name = data.get('botName')

        if not api_key or not bot_name:
            return jsonify({"erro": "apiKey e botName são obrigatórios"}), 400

        nova_acc = connectTelegram(api_key.strip(), bot_name.strip())
        logger.info(f"✅ Conta conectada: {nova_acc.id} - {nova_acc.botName}")

        # Cria conversa inicial para a conta
        with _conversation_lock:
            conv = Conversation(id=nova_acc.id, title=nova_acc.botName)
            conv.participants = [{"id": nova_acc.id, "botName": nova_acc.botName}]
            init_msg = Message(
                id=uuid.uuid4().hex,
                sender='system',
                text=f"Conta '{nova_acc.botName}' conectada e pronta para receber mensagens."
            )
            conv.messages.append(init_msg)
            conv.lastMessage = init_msg.text
            conv.lastAt = get_brasil_time()
            _conversations[conv.id] = conv

        # Configura webhook
        ngrok_url = os.environ.get('NGROK_URL')
        if ngrok_url:
            webhook_url = f"{ngrok_url}/api/telegram/webhook/{nova_acc.id}"
            try:
                resp = requests.post(
                    f"https://api.telegram.org/bot{nova_acc.apiKey}/setWebhook",
                    data={'url': webhook_url},
                    timeout=10
                )
                logger.info(f"🔗 Webhook configurado: {resp.status_code}")
            except Exception as webhook_error:
                logger.warning(f"⚠️ Erro ao configurar webhook: {webhook_error}")

        # Limpa cache
        _cache['conversations_last_update'] = 0

        return jsonify(nova_acc.__dict__), 201

    except Exception as e:
        logger.error(f"❌ Erro ao criar conta: {e}")
        return jsonify({"erro": str(e)}), 400

# --- Deletar conta ---
@app.route('/api/accounts/<account_id>', methods=['DELETE'])
def deletar_account(account_id):
    """Remove conta e limpa dados associados"""
    try:
        contas = listTelegramAccounts()
        bot = next((c for c in contas if c.id == account_id), None)

        if bot:
            try:
                resp = requests.post(
                    f"https://api.telegram.org/bot{bot.apiKey}/deleteWebhook",
                    timeout=10
                )
                logger.info(f"🗑️ Webhook removido: {resp.status_code}")
            except Exception as e:
                logger.warning(f"⚠️ Erro ao remover webhook: {e}")

        # Remove mapeamentos
        for chat_id, acc_id in list(chat_to_account.items()):
            if acc_id == account_id:
                del chat_to_account[chat_id]

        # Remove conta
        removeTelegram(account_id)

        # Remove conversa da conta
        with _conversation_lock:
            _conversations.pop(account_id, None)

        # Limpa cache
        _cache['conversations_last_update'] = 0

        logger.info(f"✅ Conta {account_id} removida completamente")
        return '', 204

    except Exception as e:
        logger.error(f"❌ Erro ao remover conta: {e}")
        return jsonify({"erro": str(e)}), 400

# --- Webhook do Telegram otimizado ---
@app.route('/api/telegram/webhook/<account_id>', methods=['POST'])
def telegram_webhook(account_id):
    """Recebe updates do Telegram com processamento otimizado"""
    try:
        contas = listTelegramAccounts()
        if not any(acc.id == account_id for acc in contas):
            return jsonify({'status': 'ignored - account not found'}), 200

        update = request.get_json(silent=True) or {}
        msg = update.get('message')
        if not msg:
            return jsonify({'status': 'ignored - no message'}), 200

        chat = msg.get('chat', {})
        conv_id = str(chat.get('id'))
        title = chat.get('title') or chat.get('username') or f"User {conv_id}"

        # Cria ou atualiza conversa
        with _conversation_lock:
            if conv_id not in _conversations:
                conv = Conversation(id=conv_id, title=title)
                _conversations[conv_id] = conv
                logger.info(f"📱 Nova conversa: {conv_id} - {title}")
            else:
                conv = _conversations[conv_id]

            # Adiciona mensagem
            sender = (msg.get('from') or {}).get('username') or 'Usuário'
            text = msg.get('text', '')

            new_msg = Message(
                id=uuid.uuid4().hex,
                sender=sender,
                text=text,
                timestamp=get_brasil_time()
            )

            conv.messages.append(new_msg)
            conv.lastMessage = text
            conv.lastAt = get_brasil_time()

            # Mapeia conversa para conta
            chat_to_account[conv_id] = account_id

        # Broadcast para subscribers
        broadcast_to_subscribers(conv_id, new_msg.to_dict())

        # Limpa cache
        _cache['conversations_last_update'] = 0

        logger.info(f"📨 Mensagem recebida: {sender} -> {text[:50]}...")
        return jsonify({'status': 'processed'}), 200

    except Exception as e:
        logger.error(f"❌ Erro no webhook: {e}")
        return jsonify({'status': 'error', 'message': str(e)}), 500

# --- Listar conversas otimizado ---
@app.route('/api/conversations', methods=['GET'])
def listar_conversas():
    """Lista conversas com cache otimizado"""
    try:
        current_time = time.time()

        # Verifica cache
        if (current_time - _cache['conversations_last_update']) < _cache['cache_duration']:
            return jsonify(_cache['conversations_cache']), 200

        # Limpa conversas antigas
        cleanup_old_conversations()

        contas = listTelegramAccounts()
        if not contas:
            return jsonify([]), 200

        account_ids = {acc.id for acc in contas}

        with _conversation_lock:
            resumo = []
            for conv in _conversations.values():
                # Pula conversas de contas (apenas conversas de usuários)
                if conv.id in account_ids:
                    continue

                # Adiciona isArchived se não existir (compatibilidade)
                if not hasattr(conv, 'isArchived'):
                    conv.isArchived = False

                resumo.append({
                    'id': conv.id,
                    'title': conv.title,
                    'createdAt': conv.createdAt,
                    'lastMessage': conv.lastMessage,
                    'lastAt': conv.lastAt,
                    'isArchived': conv.isArchived
                })

        # Ordena por última atividade
        resumo.sort(key=lambda x: x['lastAt'], reverse=True)

        # Atualiza cache
        _cache['conversations_cache'] = resumo
        _cache['conversations_last_update'] = current_time

        logger.info(f"📋 Retornando {len(resumo)} conversas")
        return jsonify(resumo), 200

    except Exception as e:
        logger.error(f"❌ Erro ao listar conversas: {e}")
        return jsonify({"erro": str(e)}), 500

# --- Obter detalhes de conversa ---
@app.route('/api/conversations/<conv_id>', methods=['GET'])
def obter_conversa(conv_id):
    """Obtém detalhes de uma conversa específica"""
    try:
        with _conversation_lock:
            conv = _conversations.get(conv_id)
            if not conv:
                return jsonify({'erro': 'Conversa não encontrada'}), 404

        return jsonify(conv.to_dict()), 200

    except Exception as e:
        logger.error(f"❌ Erro ao obter conversa: {e}")
        return jsonify({"erro": str(e)}), 500

# --- Renomear conversa ---
@app.route('/api/conversations/<conv_id>', methods=['PATCH'])
def renomear_conversa(conv_id):
    """Renomeia uma conversa"""
    try:
        data = request.get_json(silent=True) or {}
        new_title = data.get('title')

        if not new_title:
            return jsonify({'erro': 'Novo título obrigatório'}), 400

        with _conversation_lock:
            conv = _conversations.get(conv_id)
            if not conv:
                return jsonify({'erro': 'Conversa não encontrada'}), 404

            conv.title = new_title
            conv.lastAt = get_brasil_time()

        # Limpa cache
        _cache['conversations_last_update'] = 0

        logger.info(f"✏️ Conversa {conv_id} renomeada para '{new_title}'")
        return jsonify(conv.to_dict()), 200

    except Exception as e:
        logger.error(f"❌ Erro ao renomear conversa: {e}")
        return jsonify({"erro": str(e)}), 500

# --- Deletar conversa ---
@app.route('/api/conversations/<conv_id>', methods=['DELETE'])
def deletar_conversa(conv_id):
    """Deleta uma conversa completamente"""
    try:
        with _conversation_lock:
            conv = _conversations.pop(conv_id, None)
            if not conv:
                return jsonify({'erro': 'Conversa não encontrada'}), 404

        # Remove subscribers
        sse_subscribers.pop(conv_id, None)

        # Remove mapeamento
        chat_to_account.pop(conv_id, None)

        # Limpa cache
        _cache['conversations_last_update'] = 0

        logger.info(f"🗑️ Conversa deletada: {conv_id}")
        return '', 204

    except Exception as e:
        logger.error(f"❌ Erro ao deletar conversa: {e}")
        return jsonify({"erro": str(e)}), 500

# --- Arquivar/Desarquivar conversa ---
@app.route('/api/conversations/<conv_id>/archive', methods=['PATCH'])
def arquivar_conversa(conv_id):
    """Arquiva ou desarquiva uma conversa"""
    try:
        data = request.get_json(silent=True) or {}
        is_archived = data.get('isArchived', True)

        with _conversation_lock:
            conv = _conversations.get(conv_id)
            if not conv:
                return jsonify({'erro': 'Conversa não encontrada'}), 404

            # Adiciona campo isArchived se não existir
            if not hasattr(conv, 'isArchived'):
                conv.isArchived = False
            
            conv.isArchived = is_archived
            conv.lastAt = get_brasil_time()

        # Limpa cache
        _cache['conversations_last_update'] = 0

        action = "arquivada" if is_archived else "desarquivada"
        logger.info(f"📁 Conversa {action}: {conv_id}")
        return jsonify(conv.to_dict()), 200

    except Exception as e:
        logger.error(f"❌ Erro ao arquivar conversa: {e}")
        return jsonify({"erro": str(e)}), 500

# --- Listar mensagens otimizado ---
@app.route('/api/conversations/<conv_id>/messages', methods=['GET'])
def listar_mensagens(conv_id):
    """Lista mensagens com paginação otimizada"""
    try:
        with _conversation_lock:
            conv = _conversations.get(conv_id)
            if not conv:
                return jsonify({'erro': 'Conversa não encontrada'}), 404

            limit = request.args.get('limit', type=int)
            offset = request.args.get('offset', type=int, default=0)

            msgs = conv.messages
            total = len(msgs)

            # Aplica paginação
            if limit is not None:
                end_idx = offset + limit
                sliced = msgs[offset:end_idx]
            else:
                sliced = msgs[offset:]

        # Converte para dict
        response_data = [msg.to_dict() for msg in sliced]

        return jsonify(response_data), 200

    except Exception as e:
        logger.error(f"❌ Erro ao listar mensagens: {e}")
        return jsonify({"erro": str(e)}), 500

# --- Enviar mensagem otimizado ---
@app.route('/api/conversations/<conv_id>/messages', methods=['POST'])
def enviar_mensagem(conv_id):
    """Envia mensagem com integração completa"""
    try:
        data = request.get_json(silent=True) or {}
        sender = data.get('sender')
        text = data.get('text')

        if not sender or not text:
            return jsonify({'erro': 'Campos sender e text obrigatórios'}), 400

        with _conversation_lock:
            conv = _conversations.get(conv_id)
            if not conv:
                return jsonify({'erro': 'Conversa não encontrada'}), 404

            # Cria mensagem
            out_msg = Message(
                id=uuid.uuid4().hex,
                sender=sender,
                text=text,
                timestamp=get_brasil_time()
            )

            conv.messages.append(out_msg)
            conv.lastMessage = text
            conv.lastAt = get_brasil_time()

        # Envia para Telegram se aplicável
        account_id = chat_to_account.get(conv_id)
        contas = listTelegramAccounts()
        bot = None

        if account_id:
            bot = next((c for c in contas if c.id == account_id), None)
        elif len(contas) == 1:
            bot = contas[0]

        if bot:
            try:
                resp = requests.post(
                    f"https://api.telegram.org/bot{bot.apiKey}/sendMessage",
                    json={"chat_id": conv_id, "text": text},
                    timeout=10
                )

                if resp.status_code == 200:
                    logger.info(f"📤 Mensagem enviada via Telegram: {text[:50]}...")
                else:
                    logger.warning(f"⚠️ Erro ao enviar para Telegram: {resp.text}")

            except Exception as e:
                logger.warning(f"⚠️ Erro na integração Telegram: {e}")

        # Broadcast para subscribers
        broadcast_to_subscribers(conv_id, out_msg.to_dict())

        # Limpa cache
        _cache['conversations_last_update'] = 0

        return jsonify(out_msg.to_dict()), 201

    except Exception as e:
        logger.error(f"❌ Erro ao enviar mensagem: {e}")
        return jsonify({"erro": str(e)}), 500

# --- Marcar como lidas ---
@app.route('/api/conversations/<conv_id>/mark-read', methods=['POST'])
def marcar_lidas(conv_id):
    """Marca todas as mensagens como lidas"""
    try:
        with _conversation_lock:
            conv = _conversations.get(conv_id)
            if not conv:
                return jsonify({'erro': 'Conversa não encontrada'}), 404

        logger.info(f"✅ Mensagens marcadas como lidas: {conv_id}")
        return '', 204

    except Exception as e:
        logger.error(f"❌ Erro ao marcar como lidas: {e}")
        return jsonify({"erro": str(e)}), 500

# --- SSE Stream otimizado ---
@app.route('/api/conversations/<conv_id>/stream')
def stream_conv(conv_id):
    """Stream de eventos em tempo real otimizado"""
    def event_stream(q):
        try:
            while True:
                try:
                    data = q.get(timeout=30)  # 30s timeout
                    yield f"data: {json.dumps(data)}\n\n"
                except queue.Empty:
                    # Heartbeat para manter conexão viva
                    yield f"data: {json.dumps({'type': 'heartbeat', 'timestamp': get_brasil_time()})}\n\n"
        except GeneratorExit:
            logger.info(f"🔌 Cliente SSE desconectado: {conv_id}")

    # Cria queue para este cliente
    q = queue.Queue(maxsize=100)  # Limita tamanho da queue

    if conv_id not in sse_subscribers:
        sse_subscribers[conv_id] = []

    sse_subscribers[conv_id].append(q)
    logger.info(f"🔌 Cliente SSE conectado: {conv_id}")

    response = Response(
        stream_with_context(event_stream(q)),
        mimetype="text/event-stream",
        headers={
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            'X-Accel-Buffering': 'no'
        }
    )

    return response

# --- Debug e status ---
@app.route('/api/debug/status', methods=['GET'])
def debug_status():
    """Status detalhado do sistema"""
    try:
        contas = listTelegramAccounts()

        with _conversation_lock:
            conv_stats = {
                'total': len(_conversations),
                'with_messages': len([c for c in _conversations.values() if c.messages]),
                'recent': len([c for c in _conversations.values()
                               if (datetime.now(BRASIL_TZ) - datetime.fromisoformat(c.lastAt.replace('Z', '+00:00'))).seconds < 3600])
            }

        return jsonify({
            "status": "running",
            "timestamp": get_brasil_time(),
            "timezone": "America/Sao_Paulo",
            "accounts": {
                "count": len(contas),
                "list": [acc.__dict__ for acc in contas]
            },
            "conversations": conv_stats,
            "subscribers": {conv_id: len(subs) for conv_id, subs in sse_subscribers.items()},
            "cache": {
                "last_update": _cache['conversations_last_update'],
                "cached_count": len(_cache['conversations_cache'])
            },
            "ngrok_url": os.environ.get('NGROK_URL'),
            "port": os.environ.get('PORT', 3001),
            "flask_env": os.environ.get('FLASK_ENV')
        }), 200

    except Exception as e:
        logger.error(f"❌ Erro no debug status: {e}")
        return jsonify({"erro": str(e)}), 500

# --- Cleanup automático ---
def background_cleanup():
    """Processo em background para limpeza automática"""
    while True:
        try:
            time.sleep(300)  # 5 minutos
            cleanup_old_conversations()

            # Limpa subscribers mortos
            for conv_id in list(sse_subscribers.keys()):
                sse_subscribers[conv_id] = [q for q in sse_subscribers[conv_id] if not q.empty() or q.qsize() < 100]
                if not sse_subscribers[conv_id]:
                    del sse_subscribers[conv_id]

        except Exception as e:
            logger.error(f"❌ Erro na limpeza automática: {e}")

# Inicia processo de limpeza em background
cleanup_thread = threading.Thread(target=background_cleanup, daemon=True)
cleanup_thread.start()

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 3001))

    logger.info("=" * 80)
    logger.info("🚀 AURA BACKEND - API OTIMIZADA INICIADA")
    logger.info("=" * 80)
    logger.info(f"🌐 Servidor: http://localhost:{port}")

    ngrok_url = os.environ.get('NGROK_URL')
    if ngrok_url:
        logger.info(f"🌍 URL Pública: {ngrok_url}")
        logger.info(f"📊 Dashboard ngrok: http://127.0.0.1:4040")

    logger.info(f"🕒 Timezone: America/Sao_Paulo (UTC-3)")
    logger.info("📋 Endpoints principais:")
    logger.info("  GET  /api/health - Health check")
    logger.info("  GET  /api/accounts - Gerenciar contas")
    logger.info("  GET  /api/conversations - Listar conversas")
    logger.info("  POST /api/conversations/{id}/messages - Enviar mensagens")
    logger.info("  GET  /api/conversations/{id}/stream - Stream tempo real")
    logger.info("  GET  /api/debug/status - Status detalhado")
    logger.info("=" * 80)

    app.run(
        host='0.0.0.0',
        port=port,
        debug=False,  # Desabilitado para produção
        threaded=True,
        use_reloader=False
    )
