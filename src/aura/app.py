import os
import logging
import json
import queue
import threading
import time
import re
from pathlib import Path
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
    removeTelegram,
)

from . import bot_components_api

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
logger.info("Aplicação Flask iniciada e CORS configurado.")

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
        logger.info(f"ngrok iniciado automaticamente: {public_url}")
    except Exception as e:
        logger.warning(f"Falha ao iniciar ngrok automaticamente: {e}")
elif ngrok_url_env:
    logger.info(f"Usando NGROK_URL do .env: {ngrok_url_env}")

# --- Definições de dataclasses para conversas e mensagens ---
@dataclass
class Message:
    id: str
    sender: str
    text: str
    timestamp: str = field(default_factory=lambda: datetime.now(BRASIL_TZ).isoformat())
    read: bool = False
    platform: str = "telegram"

    def to_dict(self):
        return {
            'id': self.id,
            'sender': self.sender,
            'text': self.text,
            'timestamp': self.timestamp,
            'read': self.read,
            'platform': self.platform
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
    platform: str = "telegram"
    chat_type: str = "private"
    is_bot_conversation: bool = False

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'createdAt': self.createdAt,
            'participants': self.participants,
            'lastMessage': self.lastMessage,
            'lastAt': self.lastAt,
            'isArchived': self.isArchived,
            'platform': self.platform,
            'chat_type': self.chat_type,
            'is_bot_conversation': self.is_bot_conversation
        }

# Armazenamento otimizado em memória
_conversations: Dict[str, Conversation] = {}
_conversation_lock = threading.RLock()
chat_to_account: Dict[str, str] = {}
sse_subscribers: Dict[str, List[queue.Queue]] = {}

DATA_DIR = Path(__file__).resolve().parent / "data" / "telegram_history"
DATA_DIR.mkdir(parents=True, exist_ok=True)

_FILENAME_SANITIZER = re.compile(r"[^a-z0-9_-]+")

# Cache para otimização
_cache = {
    'conversations_last_update': 0,
    'conversations_cache': [],
    'cache_duration': 5
}


def _sanitize_filename(value: str) -> str:
    if not value:
        return "contato"

    normalized = value.strip().lower()
    sanitized = _FILENAME_SANITIZER.sub("_", normalized)
    sanitized = re.sub(r"_+", "_", sanitized).strip("_")
    return sanitized or "contato"


def _history_path(title: str, conversation_id: str) -> Path:
    safe_title = _sanitize_filename(title or conversation_id)
    return DATA_DIR / f"{safe_title}_{conversation_id}_telegram.json"


def _find_history_path(conversation_id: str) -> Optional[Path]:
    possible_files = list(DATA_DIR.glob(f"*_{conversation_id}_telegram.json"))
    return possible_files[0] if possible_files else None


def _conversation_to_full_dict(conv: Conversation) -> Dict:
    data = conv.to_dict()
    data["messages"] = [msg.to_dict() for msg in conv.messages]
    return data


def _load_conversation_from_disk(conversation_id: str, fallback_title: str = "") -> Optional[Conversation]:
    try:
        history_path = _find_history_path(conversation_id)
        if not history_path or not history_path.exists():
            return None

        with history_path.open("r", encoding="utf-8") as file:
            data = json.load(file)

        title = data.get("title") or fallback_title or conversation_id

        with _conversation_lock:
            conv = _conversations.get(conversation_id) or Conversation(
                id=conversation_id,
                title=title,
                createdAt=data.get("createdAt", get_brasil_time()),
                lastMessage=data.get("lastMessage", ""),
                lastAt=data.get("lastAt", get_brasil_time()),
                isArchived=data.get("isArchived", False),
                platform=data.get("platform", "telegram"),
                chat_type=data.get("chat_type", "private"),
                is_bot_conversation=data.get("is_bot_conversation", False)
            )

            conv.title = title
            conv.createdAt = data.get("createdAt", conv.createdAt)
            conv.lastMessage = data.get("lastMessage", conv.lastMessage)
            conv.lastAt = data.get("lastAt", conv.lastAt)
            conv.isArchived = data.get("isArchived", conv.isArchived)
            conv.platform = data.get("platform", conv.platform)
            conv.chat_type = data.get("chat_type", conv.chat_type)
            conv.is_bot_conversation = data.get("is_bot_conversation", conv.is_bot_conversation)

            conv.messages = []
            for msg_data in data.get("messages", []):
                conv.messages.append(
                    Message(
                        id=msg_data.get("id", uuid.uuid4().hex),
                        sender=msg_data.get("sender", "user"),
                        text=msg_data.get("text", ""),
                        timestamp=msg_data.get("timestamp", get_brasil_time()),
                        read=msg_data.get("read", False),
                        platform=msg_data.get("platform", conv.platform)
                    )
                )

            def _msg_datetime(message: Message) -> datetime:
                try:
                    return datetime.fromisoformat(message.timestamp)
                except ValueError:
                    return datetime.fromtimestamp(0, tz=BRASIL_TZ)

            conv.messages.sort(key=_msg_datetime)
            _conversations[conversation_id] = conv
            return conv
    except Exception as error:
        logger.error(f"Erro ao carregar histórico da conversa {conversation_id}: {error}")
        return None


def _load_all_conversations_from_disk():
    for file_path in DATA_DIR.glob("*_telegram.json"):
        try:
            with file_path.open("r", encoding="utf-8") as file:
                data = json.load(file)

            conversation_id = str(data.get("id") or data.get("conversation_id") or "").strip()
            if not conversation_id:
                continue

            _load_conversation_from_disk(conversation_id, data.get("title", ""))
        except Exception as error:
            logger.error(f"Erro ao carregar histórico em {file_path}: {error}")

def _save_conversation_history(conv: Conversation):
    try:
        DATA_DIR.mkdir(parents=True, exist_ok=True)
        new_path = _history_path(conv.title, conv.id)
        existing_path = _find_history_path(conv.id)

        if existing_path and existing_path != new_path and existing_path.exists():
            try:
                existing_path.unlink()
            except OSError as remove_error:
                logger.warning(f"Não foi possível remover histórico antigo {existing_path}: {remove_error}")

        with new_path.open("w", encoding="utf-8") as file:
            json.dump(_conversation_to_full_dict(conv), file, ensure_ascii=False, indent=2)

        _cache['conversations_last_update'] = 0
    except Exception as error:
        logger.error(f"Erro ao salvar histórico da conversa {conv.id}: {error}")

def _delete_conversation_history(conversation_id: str):
    try:
        history_path = _find_history_path(conversation_id)
        if history_path and history_path.exists():
            history_path.unlink()
    except Exception as error:
        logger.error(f"Erro ao remover histórico da conversa {conversation_id}: {error}")

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
            logger.info(f"Conversa inativa removida: {conv_id}")

def broadcast_to_subscribers(conv_id: str, message_data: dict):
    """Envia mensagem para todos os subscribers SSE"""
    if conv_id in sse_subscribers:
        dead_queues = []
        for q in sse_subscribers[conv_id]:
            try:
                q.put(message_data, timeout=1)
            except Exception:
                dead_queues.append(q)

        for q in dead_queues:
            sse_subscribers[conv_id].remove(q)

def send_telegram_message(chat_id: str, text: str, account_id: str, options: List[Dict] = None) -> bool:
    """Envia mensagem via Telegram API - SEM botões, apenas texto"""
    try:
        accounts = listTelegramAccounts()
        account = next((acc for acc in accounts if acc.id == account_id), None)

        bot_token = None
        if account:
            bot_token = account.apiKey
            logger.info(f"Conta Telegram encontrada: {account_id} - {account.botName}")
        else:
            # Fallback: usar token da variável de ambiente
            bot_token = os.environ.get('TELEGRAM_BOT_TOKEN')
            if bot_token:
                logger.warning(f"Conta {account_id} não encontrada em listTelegramAccounts, usando TELEGRAM_BOT_TOKEN da variável de ambiente")
            else:
                logger.error(f"Conta Telegram não encontrada: {account_id} e TELEGRAM_BOT_TOKEN não configurado")
                logger.error(f"Contas disponíveis: {[acc.id for acc in accounts]}")
                return False

        url = f"https://api.telegram.org/bot{bot_token}/sendMessage"

        payload = {
            'chat_id': chat_id,
            'text': text,
            'parse_mode': 'HTML'
        }

        # Don't add reply_markup - we want plain text messages only

        logger.info(f"Enviando mensagem Telegram para chat {chat_id}: {text[:50]}...")

        response = requests.post(url, json=payload, timeout=10)

        if response.status_code == 200:
            result = response.json()
            if result.get('ok'):
                logger.info(f"Mensagem Telegram enviada com sucesso para {chat_id}")
                return True
            else:
                logger.error(f"Erro na API Telegram: {result.get('description', 'Erro desconhecido')}")
                return False
        else:
            logger.error(f"Erro HTTP ao enviar mensagem Telegram: {response.status_code}")
            return False

    except Exception as e:
        logger.error(f"Erro ao enviar mensagem Telegram: {e}")
        return False

def create_test_conversation():
    """Cria uma conversa de teste para debug"""
    logger.info("Criando conversa de teste...")

    test_conv_id = "test-123"

    with _conversation_lock:
        if test_conv_id not in _conversations:
            test_conv = Conversation(
                id=test_conv_id,
                title="Conversa de Teste",
                platform='telegram',
                chat_type='private',
                is_bot_conversation=False
            )

            test_message = Message(
                id=uuid.uuid4().hex,
                sender='user',
                text='Esta é uma mensagem de teste para verificar se o chat está funcionando.',
                timestamp=get_brasil_time(),
                platform='telegram'
            )

            test_conv.messages.append(test_message)
            test_conv.lastMessage = test_message.text
            test_conv.lastAt = test_message.timestamp

            _conversations[test_conv_id] = test_conv
            _cache['conversations_last_update'] = 0

            logger.info(f"Conversa de teste criada: {test_conv_id}")
            return test_conv

    return None

# --- Tratamento de erros otimizado ---
@app.errorhandler(404)
def handle_404(e):
    return jsonify({"erro": "Endpoint não encontrado", "status": 404}), 404

@app.errorhandler(Exception)
def handle_exception(e):
    if isinstance(e, HTTPException):
        return jsonify({"erro": e.description, "status": e.code}), e.code

    logger.exception("Erro interno inesperado:")
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
        "workflows_count": len(bot_components_api.get_all_workflows()),
        "uptime": "OK"
    }), 200

# --- ENDPOINTS DO BOT DE WORKFLOWS ---

@app.route('/api/bot/workflows', methods=['POST'])
def save_workflow():
    """Salva um workflow REAL vindo do frontend"""
    try:
        if not request.is_json:
            return jsonify({"erro": "Content-Type deve ser application/json"}), 415

        workflow_data = request.get_json()
        if not workflow_data:
            return jsonify({"erro": "Dados do workflow são obrigatórios"}), 400

        workflow_id = workflow_data.get('_id', '')
        enabled = workflow_data.get('_enabled', True)

        logger.info("=" * 80)
        logger.info(f"RECEBENDO WORKFLOW PARA SALVAR")
        logger.info(f"   ID: {workflow_id}")
        logger.info(f"   Enabled: {enabled}")
        logger.info(f"   Tag: {workflow_data.get('_tag', 'Sem tag')}")
        logger.info("=" * 80)

        success = bot_components_api.register_workflow(workflow_data)

        if success:
            logger.info("=" * 80)
            logger.info(f"WORKFLOW SALVO COM SUCESSO!")
            logger.info(f"   ID: {workflow_id}")
            logger.info(f"   Status: {'ATIVADO' if enabled else 'DESATIVADO'}")
            logger.info(f"   Todas as conversas ativas foram resetadas")
            logger.info(f"   Próximas mensagens usarão o NOVO fluxo")
            logger.info("=" * 80)

            return jsonify({
                "success": True,
                "message": f"Workflow salvo com sucesso e {'ativado' if enabled else 'desativado'}. Todas as conversas foram resetadas.",
                "workflow_id": workflow_id,
                "enabled": enabled
            }), 201
        else:
            logger.error(f"Erro ao salvar workflow: {workflow_id}")
            return jsonify({"erro": "Erro ao salvar workflow"}), 500

    except Exception as e:
        logger.error(f"Erro ao salvar workflow: {e}")
        logger.exception("Stack trace:")
        return jsonify({"erro": str(e)}), 500

@app.route('/api/bot/workflow/save', methods=['POST'])
def save_workflow_alias():
    """Alias para salvar workflow (compatibilidade com frontend)"""
    return save_workflow()

@app.route('/api/bot/workflow/activate', methods=['POST'])
def activate_workflow():
    """Ativa ou desativa um workflow"""
    try:
        if not request.is_json:
            return jsonify({"erro": "Content-Type deve ser application/json"}), 415

        data = request.get_json()
        if not data:
            return jsonify({"erro": "Dados são obrigatórios"}), 400

        workflow_id = data.get('workflow_id')
        enabled = data.get('enabled', True)

        if not workflow_id:
            return jsonify({"erro": "workflow_id é obrigatório"}), 400

        logger.info(f"{'Ativando' if enabled else 'Desativando'} workflow: {workflow_id}")

        success = bot_components_api.set_workflow_status(workflow_id, enabled)

        if success:
            return jsonify({
                "success": True,
                "message": f"Workflow {'ativado' if enabled else 'desativado'} com sucesso",
                "workflow_id": workflow_id,
                "enabled": enabled
            }), 200
        else:
            return jsonify({"erro": "Workflow não encontrado"}), 404

    except Exception as e:
        logger.error(f"Erro ao ativar/desativar workflow: {e}")
        return jsonify({"erro": str(e)}), 500

@app.route('/api/bot/workflows', methods=['GET'])
def list_workflows():
    """Lista todos os workflows REAIS publicados"""
    try:
        workflows = bot_components_api.get_all_workflows()
        logger.info(f"Retornando {len(workflows)} workflows REAIS")
        return jsonify({"workflows": workflows}), 200
    except Exception as e:
        logger.error(f"Erro ao listar workflows: {e}")
        return jsonify({"erro": str(e)}), 500

@app.route('/api/bot/workflows/<workflow_id>', methods=['GET'])
def get_workflow(workflow_id):
    """Obtém um workflow específico"""
    try:
        workflow = bot_components_api.get_workflow_by_id(workflow_id)
        if workflow:
            return jsonify(workflow), 200
        return jsonify({"erro": "Workflow não encontrado"}), 404
    except Exception as e:
        logger.error(f"Erro ao obter workflow: {e}")
        return jsonify({"erro": str(e)}), 500

@app.route('/api/bot/conversations/<user_id>/reset', methods=['POST'])
def reset_user_conversation(user_id):
    """Reseta a conversa de um usuário com o bot"""
    try:
        data = request.get_json() or {}
        workflow_id = data.get('workflow_id', 'aura_flow_001')

        success = bot_components_api.reset_conversation(user_id, workflow_id)

        if success:
            return jsonify({
                "success": True,
                "message": "Conversa resetada com sucesso"
            }), 200
        else:
            return jsonify({
                "success": False,
                "message": "Nenhuma conversa ativa para resetar"
            }), 404
    except Exception as e:
        logger.error(f"Erro ao resetar conversa: {e}")
        return jsonify({"erro": str(e)}), 500

# --- Endpoint para criar conversa de teste ---
@app.route('/api/test/create-conversation', methods=['POST'])
def create_test_conversation_endpoint():
    """Endpoint para criar conversa de teste"""
    try:
        conv = create_test_conversation()
        if conv:
            return jsonify({
                "success": True,
                "message": "Conversa de teste criada",
                "conversation": conv.to_dict()
            }), 201
        else:
            return jsonify({
                "success": False,
                "message": "Conversa de teste já existe"
            }), 200
    except Exception as e:
        logger.error(f"Erro ao criar conversa de teste: {e}")
        return jsonify({"erro": str(e)}), 500

# --- Listar contas Telegram ---
@app.route('/api/accounts', methods=['GET'])
def obter_accounts():
    """Lista todas as contas Telegram conectadas"""
    try:
        contas = listTelegramAccounts()
        response_data = [acc.__dict__ for acc in contas]
        logger.info(f"Retornando {len(response_data)} contas Telegram")
        return jsonify(response_data), 200
    except Exception as e:
        logger.error(f"Erro ao listar contas Telegram: {e}")
        return jsonify({"erro": str(e)}), 400

# --- Criar conta Telegram ---
@app.route('/api/accounts', methods=['POST'])
def criar_account():
    """Conecta nova conta Telegram"""
    try:
        if not request.is_json:
            return jsonify({"erro": "Requisição deve ser JSON"}), 415

        data = request.get_json(silent=True) or {}
        api_key = data.get('apiKey')
        bot_name = data.get('botName')

        if not api_key or not bot_name:
            return jsonify({"erro": "apiKey e botName são obrigatórios"}), 400

        nova_acc = connectTelegram(api_key.strip(), bot_name.strip())
        logger.info(f"Conta Telegram conectada: {nova_acc.id} - {nova_acc.botName}")

        ngrok_url = os.environ.get('NGROK_URL')
        if ngrok_url:
            webhook_url = f"{ngrok_url}/api/telegram/webhook/{nova_acc.id}"
            try:
                requests.post(
                    f"https://api.telegram.org/bot{nova_acc.apiKey}/deleteWebhook",
                    timeout=10
                )

                resp = requests.post(
                    f"https://api.telegram.org/bot{nova_acc.apiKey}/setWebhook",
                    data={'url': webhook_url},
                    timeout=10
                )

                if resp.status_code == 200:
                    result = resp.json()
                    if result.get('ok'):
                        logger.info(f"Webhook configurado com sucesso: {webhook_url}")
                    else:
                        logger.error(f"Erro ao configurar webhook: {result.get('description')}")
                else:
                    logger.error(f"Erro HTTP ao configurar webhook: {resp.status_code}")

            except Exception as webhook_error:
                logger.error(f"Erro ao configurar webhook: {webhook_error}")
        else:
            logger.warning("NGROK_URL não configurado - webhook não será configurado")

        _cache['conversations_last_update'] = 0

        return jsonify(nova_acc.__dict__), 201

    except Exception as e:
        logger.error(f"Erro ao criar conta Telegram: {e}")
        return jsonify({"erro": str(e)}), 400

# --- Deletar conta Telegram ---
@app.route('/api/accounts/<account_id>', methods=['DELETE'])
def deletar_account(account_id):
    """Remove conta Telegram e limpa dados associados"""
    try:
        contas = listTelegramAccounts()
        bot = next((c for c in contas if c.id == account_id), None)

        if bot:
            try:
                resp = requests.post(
                    f"https://api.telegram.org/bot{bot.apiKey}/deleteWebhook",
                    timeout=10
                )
                logger.info(f"Webhook removido: {resp.status_code}")
            except Exception as e:
                logger.warning(f"Erro ao remover webhook: {e}")

        for chat_id, acc_id in list(chat_to_account.items()):
            if acc_id == account_id:
                del chat_to_account[chat_id]

        removeTelegram(account_id)

        with _conversation_lock:
            _conversations.pop(account_id, None)

        _cache['conversations_last_update'] = 0

        logger.info(f"Conta Telegram {account_id} removida completamente")
        return '', 204

    except Exception as e:
        logger.error(f"Erro ao remover conta Telegram: {e}")
        return jsonify({"erro": str(e)}), 400

# --- Listar conversas otimizado ---
@app.route('/api/conversations', methods=['GET'])
def listar_conversas():
    """Lista todas as conversas com cache otimizado - APENAS CONVERSAS DE USUÁRIOS REAIS"""
    try:
        current_time = time.time()

        if (current_time - _cache['conversations_last_update']) < _cache['cache_duration']:
            logger.info(f"Cache hit - Retornando {len(_cache['conversations_cache'])} conversas")
            return jsonify(_cache['conversations_cache']), 200

        _load_all_conversations_from_disk()

        telegram_conversations = []
        with _conversation_lock:
            logger.info(f"Verificando {len(_conversations)} conversas no armazenamento")
            for conv_id, conv in _conversations.items():
                logger.info(
                    f"   Conversa {conv_id}: {conv.title} - Arquivada: {conv.isArchived}, Bot: {conv.is_bot_conversation}"
                )
                if not conv.is_bot_conversation:
                    telegram_conversations.append(conv.to_dict())
                    logger.info("     Incluída na lista")
                else:
                    logger.info("     Filtrada (bot)")

        telegram_conversations.sort(key=lambda x: x.get('lastAt', ''), reverse=True)

        _cache['conversations_cache'] = telegram_conversations
        _cache['conversations_last_update'] = current_time

        logger.info(
            "Retornando %s conversas Telegram", len(telegram_conversations)
        )
        return jsonify(telegram_conversations), 200

    except Exception as e:
        logger.error(f"Erro ao listar conversas: {e}")
        return jsonify({"erro": str(e)}), 500

# --- Obter conversa específica ---
@app.route('/api/conversations/<conversation_id>', methods=['GET'])
def obter_conversa(conversation_id):
    """Obtém uma conversa específica do Telegram"""
    try:
        logger.info(f"Buscando conversa: {conversation_id}")

        with _conversation_lock:
            if conversation_id in _conversations:
                conv = _conversations[conversation_id]
                logger.info(f"Conversa Telegram encontrada: {conv.title}")
                return jsonify(conv.to_dict()), 200

        conv = _load_conversation_from_disk(conversation_id)
        if conv:
            logger.info(f"Conversa carregada do histórico: {conv.title}")
            return jsonify(conv.to_dict()), 200

        logger.warning(f"Conversa não encontrada: {conversation_id}")
        return jsonify({"erro": "Conversa não encontrada"}), 404

    except Exception as e:
        logger.error(f"Erro ao obter conversa: {e}")
        return jsonify({"erro": str(e)}), 500

# --- Obter mensagens de uma conversa ---
@app.route('/api/conversations/<conversation_id>/messages', methods=['GET'])
def obter_mensagens(conversation_id):
    """Obtém mensagens de uma conversa do Telegram"""
    try:
        limit = request.args.get('limit', type=int)
        offset = request.args.get('offset', type=int, default=0)

        logger.info(f"Buscando mensagens da conversa: {conversation_id}")

        with _conversation_lock:
            if conversation_id in _conversations:
                conv = _conversations[conversation_id]
                messages = conv.messages

                if limit is not None:
                    messages = messages[offset : offset + limit]
                else:
                    messages = messages[offset:]

                messages_data = [msg.to_dict() for msg in messages]
                logger.info("Retornando %s mensagens Telegram", len(messages_data))
                return jsonify(messages_data), 200

        conv = _load_conversation_from_disk(conversation_id)
        if conv:
            messages = conv.messages
            if limit is not None:
                messages = messages[offset : offset + limit]
            else:
                messages = messages[offset:]

            messages_data = [msg.to_dict() for msg in messages]
            logger.info("Retornando %s mensagens Telegram do histórico", len(messages_data))
            return jsonify(messages_data), 200

        logger.warning(f"Conversa não encontrada: {conversation_id}")
        return jsonify({"erro": "Conversa não encontrada"}), 404

    except Exception as e:
        logger.error(f"Erro ao obter mensagens: {e}")
        return jsonify({"erro": str(e)}), 500

# --- Enviar mensagem ---
@app.route('/api/conversations/<conversation_id>/messages', methods=['POST'])
def enviar_mensagem(conversation_id):
    """Envia mensagem para uma conversa do Telegram"""
    try:
        from src.aura.chatbot.agent_manager import agent_manager

        if not request.is_json:
            return jsonify({"erro": "Content-Type deve ser application/json"}), 415

        data = request.get_json()
        if not data:
            return jsonify({"erro": "Dados JSON são obrigatórios"}), 400

        text = data.get('text', '').strip()
        sender = data.get('sender', 'operator').strip()

        if not text:
            return jsonify({"erro": "Texto da mensagem é obrigatório"}), 400

        logger.info(f"Enviando mensagem para conversa: {conversation_id}")

        if agent_manager.is_agent_session_active(conversation_id):
            logger.info(f"Mensagem do operador detectada para sessão ativa: {conversation_id}")

            # Process operator message (handles /finalizar and formatting)
            result = agent_manager.process_operator_message(conversation_id, text)

            if not result.get("success"):
                return jsonify({"erro": result.get("error", "Erro ao processar mensagem do operador")}), 500

            # Check if session was ended with /finalizar
            if result.get("session_ended"):
                logger.info(f"Sessão encerrada pelo operador com /finalizar: {conversation_id}")

                # Send closure message to client
                closure_message = result.get("message", "Atendimento encerrado.")

                with _conversation_lock:
                    if conversation_id in _conversations:
                        conv = _conversations[conversation_id]
                        account_id = chat_to_account.get(conversation_id)

                        if account_id:
                            success = send_telegram_message(conversation_id, closure_message, account_id)

                            if success:
                                # Add closure message to conversation
                                closure_msg = Message(
                                    id=uuid.uuid4().hex,
                                    sender='bot',
                                    text=closure_message,
                                    timestamp=get_brasil_time(),
                                    read=True,
                                    platform='telegram'
                                )

                                conv.messages.append(closure_msg)
                                conv.lastMessage = closure_message
                                conv.lastAt = closure_msg.timestamp

                                broadcast_to_subscribers(conversation_id, closure_msg.to_dict())
                                _cache['conversations_last_update'] = 0
                                _save_conversation_history(conv)

                                # Reset the bot conversation so next message starts from beginning
                                workflows = bot_components_api.get_all_workflows()
                                active_workflows = [w for w in workflows if w.get('enabled', True)]
                                if active_workflows:
                                    active_workflows.sort(key=lambda w: w.get('updated_at', w.get('created_at', '')), reverse=True)
                                    workflow_id = active_workflows[0]['id']
                                    bot_components_api.reset_conversation(conversation_id, workflow_id)
                                    logger.info(f"Conversa do bot resetada para {conversation_id} após /finalizar")

                                return jsonify({
                                    "success": True,
                                    "message": "Atendimento encerrado com sucesso",
                                    "session_ended": True
                                }), 200

                return jsonify({"erro": "Falha ao enviar mensagem de encerramento"}), 500

            # Regular operator message - format with bold prefix
            formatted_message = result.get("message", text)

            with _conversation_lock:
                if conversation_id in _conversations:
                    conv = _conversations[conversation_id]
                    account_id = chat_to_account.get(conversation_id)

                    if account_id:
                        # Send formatted message to Telegram
                        success = send_telegram_message(conversation_id, formatted_message, account_id)

                        if success:
                            # Save operator message to conversation
                            nova_mensagem = Message(
                                id=uuid.uuid4().hex,
                                sender='operator',
                                text=formatted_message,
                                timestamp=get_brasil_time(),
                                read=True,
                                platform='telegram'
                            )

                            conv.messages.append(nova_mensagem)
                            conv.lastMessage = formatted_message
                            conv.lastAt = nova_mensagem.timestamp
                            conv.isArchived = False

                            broadcast_to_subscribers(conversation_id, nova_mensagem.to_dict())
                            _cache['conversations_last_update'] = 0
                            _save_conversation_history(conv)

                            logger.info(f"Mensagem do operador enviada e formatada: {nova_mensagem.id}")
                            return jsonify(nova_mensagem.to_dict()), 201
                        else:
                            return jsonify({"erro": "Falha ao enviar mensagem via Telegram"}), 500

            logger.warning(f"Conversa não encontrada: {conversation_id}")
            return jsonify({"erro": "Conversa não encontrada"}), 404

        with _conversation_lock:
            if conversation_id in _conversations:
                conv = _conversations[conversation_id]

                account_id = chat_to_account.get(conversation_id)

                if account_id:
                    success = send_telegram_message(conversation_id, text, account_id)

                    if success:
                        nova_mensagem = Message(
                            id=uuid.uuid4().hex,
                            sender=sender,
                            text=text,
                            timestamp=get_brasil_time(),
                            read=True,
                            platform='telegram'
                        )

                        conv.messages.append(nova_mensagem)
                        conv.lastMessage = text
                        conv.lastAt = nova_mensagem.timestamp
                        conv.isArchived = False

                        broadcast_to_subscribers(conversation_id, nova_mensagem.to_dict())

                        _cache['conversations_last_update'] = 0

                        _save_conversation_history(conv)

                        logger.info(f"Mensagem Telegram enviada: {nova_mensagem.id}")
                        return jsonify(nova_mensagem.to_dict()), 201
                    else:
                        return jsonify({"erro": "Falha ao enviar mensagem via Telegram"}), 500
                else:
                    return jsonify({"erro": "Conta Telegram não encontrada para esta conversa"}), 404

        logger.warning(f"Conversa não encontrada: {conversation_id}")
        return jsonify({"erro": "Conversa não encontrada"}), 404

    except Exception as e:
        logger.error(f"Erro ao enviar mensagem: {e}")
        return jsonify({"erro": str(e)}), 500

# --- Renomear conversa ---
@app.route('/api/conversations/<conversation_id>', methods=['PATCH'])
def renomear_conversa(conversation_id):
    """Renomeia uma conversa"""
    try:
        if not request.is_json:
            return jsonify({"erro": "Content-Type deve ser application/json"}), 415

        data = request.get_json()
        if not data or 'title' not in data:
            return jsonify({"erro": "Título é obrigatório"}), 400

        new_title = data['title'].strip()
        if not new_title:
            return jsonify({"erro": "Título não pode estar vazio"}), 400

        logger.info(f"Renomeando conversa {conversation_id} para: {new_title}")

        with _conversation_lock:
            if conversation_id in _conversations:
                conv = _conversations[conversation_id]
                old_title = conv.title
                conv.title = new_title

                _cache['conversations_last_update'] = 0
                _save_conversation_history(conv)

                logger.info(f"Conversa Telegram renomeada: '{old_title}' -> '{new_title}'")
                return jsonify(conv.to_dict()), 200

        logger.warning(f"Conversa não encontrada para renomeação: {conversation_id}")
        return jsonify({"erro": "Conversa não encontrada"}), 404

    except Exception as e:
        logger.error(f"Erro ao renomear conversa: {e}")
        return jsonify({"erro": str(e)}), 500

# --- Arquivar conversa ---
@app.route('/api/conversations/<conversation_id>/archive', methods=['PATCH'])
def arquivar_conversa(conversation_id):
    """Arquiva ou desarquiva uma conversa"""
    try:
        data = request.get_json() or {}
        is_archived = data.get('isArchived', data.get('is_archived', True))

        logger.info(f"{'Arquivando' if is_archived else 'Desarquivando'} conversa: {conversation_id}")

        with _conversation_lock:
            if conversation_id in _conversations:
                conv = _conversations[conversation_id]
                conv.isArchived = is_archived

                _cache['conversations_last_update'] = 0
                _save_conversation_history(conv)

                logger.info(
                    "Conversa Telegram %s: %s",
                    'arquivada' if is_archived else 'desarquivada',
                    conversation_id,
                )
                return jsonify({
                    "success": True,
                    "message": f"Conversa {'arquivada' if is_archived else 'desarquivada'} com sucesso",
                    "conversation": conv.to_dict(),
                }), 200

        logger.warning(f"Conversa não encontrada para arquivamento: {conversation_id}")
        return jsonify({"erro": "Conversa não encontrada"}), 404

    except Exception as e:
        logger.error(f"Erro ao arquivar conversa: {e}")
        return jsonify({"erro": str(e)}), 500

# --- Deletar conversa ---
@app.route('/api/conversations/<conversation_id>', methods=['DELETE'])
def deletar_conversa(conversation_id):
    """Remove uma conversa completamente"""
    try:
        logger.info(f"Deletando conversa: {conversation_id}")

        with _conversation_lock:
            if conversation_id in _conversations:
                del _conversations[conversation_id]

                if conversation_id in chat_to_account:
                    del chat_to_account[conversation_id]

                _cache['conversations_last_update'] = 0
                _delete_conversation_history(conversation_id)

                logger.info(f"Conversa Telegram deletada: {conversation_id}")
                return '', 204

        logger.warning(f"Conversa não encontrada para deleção: {conversation_id}")
        return jsonify({"erro": "Conversa não encontrada"}), 404

    except Exception as e:
        logger.error(f"Erro ao deletar conversa: {e}")
        return jsonify({"erro": str(e)}), 500

# --- Webhook Telegram - INTEGRADO COM BOT DE WORKFLOWS REAIS ---
@app.route('/api/telegram/webhook/<account_id>', methods=['POST'])
def webhook_telegram(account_id):
    """
    Webhook para receber mensagens do Telegram
    PROCESSA MENSAGENS USANDO O BOT DE WORKFLOWS REAIS - SEM MOCK!
    """
    try:
        logger.info(f"Webhook recebido para conta: {account_id}")

        data = request.get_json()
        logger.info(f"Dados do webhook: {json.dumps(data, indent=2)}")

        if not data:
            logger.warning("Webhook sem dados")
            return '', 200

        if 'message' not in data:
            logger.warning("Webhook sem campo 'message'")
            return '', 200

        message = data['message']
        chat_id = str(message['chat']['id'])
        text = message.get('text', '')
        user_info = message.get('from', {})
        user_name = user_info.get('first_name', 'Usuário')
        is_bot = user_info.get('is_bot', False)

        logger.info(f"Mensagem recebida:")
        logger.info(f"  - Chat ID: {chat_id}")
        logger.info(f"  - Usuário: {user_name}")
        logger.info(f"  - É bot: {is_bot}")
        logger.info(f"  - Texto: {text}")

        # FILTRO: Ignorar mensagens de bots
        if is_bot:
            logger.info(f"Ignorando mensagem de bot: {user_name}")
            return '', 200

        # Mapear chat para conta
        chat_to_account[chat_id] = account_id
        logger.info(f"Chat {chat_id} mapeado para conta {account_id}")

        # Buscar ou criar conversa
        with _conversation_lock:
            if chat_id not in _conversations:
                _load_conversation_from_disk(chat_id, user_name)

            if chat_id not in _conversations:
                logger.info(f"Criando nova conversa para chat {chat_id}")
                _conversations[chat_id] = Conversation(
                    id=chat_id,
                    title=user_name,
                    platform='telegram',
                    chat_type='private',
                    is_bot_conversation=False
                )
            else:
                logger.info(f"Conversa existente encontrada para chat {chat_id}")

            conv = _conversations[chat_id]

            # Criar mensagem do usuário
            nova_mensagem = Message(
                id=uuid.uuid4().hex,
                sender='user',
                text=text,
                timestamp=get_brasil_time(),
                platform='telegram'
            )

            conv.messages.append(nova_mensagem)
            conv.lastMessage = text
            conv.lastAt = nova_mensagem.timestamp
            conv.isArchived = False

            logger.info(f"Mensagem do usuário adicionada à conversa {chat_id}: {nova_mensagem.id}")

            # Broadcast para subscribers
            broadcast_to_subscribers(chat_id, nova_mensagem.to_dict())

            _cache['conversations_last_update'] = 0

        workflows = bot_components_api.get_all_workflows()
        active_workflows = [w for w in workflows if w.get('enabled', True)]

        logger.info(f"Total de workflows: {len(workflows)}")
        logger.info(f"Workflows ATIVOS: {len(active_workflows)}")

        if not active_workflows:
            logger.warning("INTERNO: Nenhum workflow ATIVO configurado - mensagem ignorada silenciosamente")
            return '', 200

        active_workflows.sort(key=lambda w: w.get('updated_at', w.get('created_at', '')), reverse=True)
        active_workflow = active_workflows[0]
        workflow_id = active_workflow['id']

        logger.info(f"Processando mensagem com workflow ATIVO MAIS RECENTE: {workflow_id}")
        logger.info(f"   Tag: {active_workflow.get('tag', 'Sem tag')}")
        logger.info(f"   Enabled: {active_workflow.get('enabled', False)}")
        logger.info(f"   Atualizado em: {active_workflow.get('updated_at', 'N/A')}")

        bot_response = bot_components_api.process_user_message(chat_id, workflow_id, text)

        logger.info(f"Resposta do bot: {json.dumps(bot_response, indent=2)}")

        if bot_response.get('success'):
            messages_to_send = bot_response.get('messages', [])

            logger.info(f"Total de mensagens para enviar: {len(messages_to_send)}")

            for idx, msg_data in enumerate(messages_to_send):
                response_text = msg_data.get('text', '')
                response_options = msg_data.get('options', [])

                if not response_text.strip():
                    logger.info(f"Pulando mensagem vazia #{idx + 1}")
                    continue

                logger.info(f"Enviando mensagem #{idx + 1}/{len(messages_to_send)}: {response_text[:50]}...")

                success = send_telegram_message(chat_id, response_text, account_id, response_options)

                if success:
                    # Adicionar resposta do bot à conversa
                    with _conversation_lock:
                        bot_message = Message(
                            id=uuid.uuid4().hex,
                            sender='bot',
                            text=response_text,
                            timestamp=get_brasil_time(),
                            platform='telegram',
                            read=True
                        )

                        conv.messages.append(bot_message)
                        conv.lastMessage = response_text
                        conv.lastAt = bot_message.timestamp

                        broadcast_to_subscribers(chat_id, bot_message.to_dict())

                    logger.info(f"Mensagem #{idx + 1} enviada e salva na conversa")

                    if idx < len(messages_to_send) - 1:
                        import time
                        time.sleep(0.5)
                else:
                    logger.error(f"Falha ao enviar mensagem #{idx + 1} via Telegram API")

            if bot_response.get('archive_conversation'):
                logger.info(f"Arquivando conversa {chat_id} após finalização do fluxo")
                with _conversation_lock:
                    if chat_id in _conversations:
                        _conversations[chat_id].isArchived = True
        else:
            error_message = bot_response.get('messages', [{}])[0].get('text', 'Erro ao processar mensagem')
            logger.error(f"INTERNO: Erro no processamento do bot: {error_message}")

        # Limpar cache
        _cache['conversations_last_update'] = 0
        logger.info("Cache limpo - conversas serão recarregadas")

        logger.info(f"Webhook processado com sucesso para {chat_id}")
        conv = _conversations.get(chat_id)
        if conv:
            _save_conversation_history(conv)

        return '', 200

    except Exception as e:
        logger.error(f"Erro no webhook Telegram: {e}")
        logger.exception("Stack trace completo:")
        return '', 200

# --- Debug Status ---
@app.route('/api/debug/status', methods=['GET'])
def debug_status():
    """Endpoint de debug com informações detalhadas"""
    try:
        telegram_accounts = listTelegramAccounts()

        conversations_info = []
        with _conversation_lock:
            for conv_id, conv in _conversations.items():
                conversations_info.append({
                    "id": conv_id,
                    "title": conv.title,
                    "platform": conv.platform,
                    "is_archived": conv.isArchived,
                    "is_bot_conversation": conv.is_bot_conversation,
                    "messages_count": len(conv.messages),
                    "last_message": conv.lastMessage,
                    "last_at": conv.lastAt
                })

        return jsonify({
            "timestamp": get_brasil_time(),
            "telegram": {
                "accounts_count": len(telegram_accounts),
                "accounts": [{"id": acc.id, "botName": acc.botName} for acc in telegram_accounts],
                "conversations_count": len(_conversations),
                "chat_mappings": len(chat_to_account),
                "chat_mappings_detail": chat_to_account,
            },
            "bot": {
                "workflows_count": len(bot_components_api.get_all_workflows()),
                "workflows": [{"id": w['id'], "tag": w['tag'], "enabled": w['enabled']} for w in bot_components_api.get_all_workflows()],
                "active_executions": len(bot_components_api._active_executions)
            },
            "conversations_detail": conversations_info,
            "cache": {
                "last_update": _cache['conversations_last_update'],
                "cached_conversations": len(_cache['conversations_cache']),
                "cache_duration": _cache['cache_duration']
            },
            "system": {
                "ngrok_url": os.environ.get('NGROK_URL'),
                "flask_env": os.environ.get('FLASK_ENV')
            }
        }), 200
    except Exception as e:
        logger.error(f"Erro no debug status: {e}")
        return jsonify({"erro": str(e)}), 500

# --- Teste de arquivamento ---
@app.route('/api/test/archive', methods=['POST'])
def test_archive():
    """Endpoint de teste para arquivamento"""
    try:
        data = request.get_json() or {}
        conversation_id = data.get('conversation_id', 'test-123')
        is_archived = data.get('is_archived', True)

        logger.info(f"Teste de arquivamento: {conversation_id} -> {is_archived}")

        return jsonify({
            "success": True,
            "message": "Teste de arquivamento funcionando",
            "received_data": {
                "conversation_id": conversation_id,
                "is_archived": is_archived
            },
            "timestamp": get_brasil_time()
        }), 200

    except Exception as e:
        logger.error(f"Erro no teste de arquivamento: {e}")
        return jsonify({"erro": str(e)}), 500

@app.route('/api/statistics/telegram', methods=['GET'])
def get_telegram_statistics():
    """Retorna estatísticas das conversas do Telegram"""
    try:
        from src.aura.chatbot.booking_manager import booking_manager

        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')

        logger.info(f"Buscando estatísticas - Start: {start_date}, End: {end_date}")

        # Carregar todas as conversas do disco
        _load_all_conversations_from_disk()

        statistics = {
            'total_conversations': 0,
            'total_messages': 0,
            'conversations_by_date': {},
            'messages_by_date': {},
            'conversations': [],
            'bookings': {
                'total_confirmed': 0,
                'total_cancelled': 0,
                'confirmed_by_date': {},
                'cancelled_by_date': {}
            }
        }

        booking_stats = booking_manager.get_statistics(start_date, end_date)
        statistics['bookings'] = booking_stats

        with _conversation_lock:
            for conv_id, conv in _conversations.items():
                # Filtrar apenas conversas reais (não de bot)
                if conv.is_bot_conversation:
                    continue

                # Parse da data de criação
                try:
                    created_at = datetime.fromisoformat(conv.createdAt)
                except:
                    continue

                # Aplicar filtros de data se fornecidos
                if start_date:
                    try:
                        start_dt = datetime.fromisoformat(start_date)
                        if created_at < start_dt:
                            continue
                    except:
                        pass

                if end_date:
                    try:
                        end_dt = datetime.fromisoformat(end_date)
                        if created_at > end_dt:
                            continue
                    except:
                        pass

                # Contar conversa
                statistics['total_conversations'] += 1

                # Agrupar por data
                date_key = created_at.strftime('%Y-%m-%d')
                statistics['conversations_by_date'][date_key] = statistics['conversations_by_date'].get(date_key, 0) + 1

                # Contar mensagens
                message_count = len(conv.messages)
                statistics['total_messages'] += message_count

                # Agrupar mensagens por data
                for msg in conv.messages:
                    try:
                        msg_date = datetime.fromisoformat(msg.timestamp)
                        msg_date_key = msg_date.strftime('%Y-%m-%d')
                        statistics['messages_by_date'][msg_date_key] = statistics['messages_by_date'].get(msg_date_key, 0) + 1
                    except:
                        continue

                # Adicionar conversa aos detalhes
                statistics['conversations'].append({
                    'id': conv.id,
                    'title': conv.title,
                    'createdAt': conv.createdAt,
                    'lastMessage': conv.lastMessage,
                    'lastAt': conv.lastAt,
                    'messageCount': message_count,
                    'isArchived': conv.isArchived,
                    'platform': conv.platform
                })

        # Ordenar conversas por data (mais recentes primeiro)
        statistics['conversations'].sort(key=lambda x: x['lastAt'], reverse=True)

        logger.info(f"Estatísticas calculadas: {statistics['total_conversations']} conversas, {statistics['total_messages']} mensagens")

        return jsonify(statistics), 200

    except Exception as e:
        logger.error(f"Erro ao buscar estatísticas: {e}")
        logger.exception("Stack trace:")
        return jsonify({"erro": str(e)}), 500

# --- Bookings Endpoints ---
@app.route('/api/bookings', methods=['GET'])
def get_all_bookings():
    """Get all bookings with optional filters"""
    try:
        from src.aura.chatbot.booking_manager import booking_manager

        status = request.args.get('status')  # 'active' or 'cancelled'
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')

        logger.info(f"Fetching bookings - Status: {status}, Start: {start_date}, End: {end_date}")

        bookings = booking_manager.get_all_bookings(status, start_date, end_date)

        logger.info(f"Returning {len(bookings)} bookings")

        return jsonify({
            "success": True,
            "bookings": bookings,
            "total": len(bookings)
        }), 200

    except Exception as e:
        logger.error(f"Error fetching bookings: {e}")
        return jsonify({"erro": str(e)}), 500

@app.route('/api/bookings/<code>', methods=['DELETE'])
def cancel_booking_admin(code):
    """Admin endpoint to cancel a booking"""
    try:
        from src.aura.chatbot.booking_manager import booking_manager

        logger.info(f"Admin cancelling booking: {code}")

        success = booking_manager.admin_cancel_booking(code)

        if success:
            return jsonify({
                "success": True,
                "message": "Agendamento cancelado com sucesso"
            }), 200
        else:
            return jsonify({
                "success": False,
                "message": "Agendamento não encontrado ou já cancelado"
            }), 404

    except Exception as e:
        logger.error(f"Error cancelling booking: {e}")
        return jsonify({"erro": str(e)}), 500

@app.route('/api/bookings/<code>', methods=['PATCH'])
def update_booking_admin(code):
    """Admin endpoint to update a booking"""
    try:
        from src.aura.chatbot.booking_manager import booking_manager

        if not request.is_json:
            return jsonify({"erro": "Content-Type deve ser application/json"}), 415

        data = request.get_json()
        new_time = data.get('time')
        new_date = data.get('date')
        user_id = data.get('user_id')

        if not user_id:
            return jsonify({"erro": "user_id é obrigatório"}), 400

        logger.info(f"Admin updating booking: {code}")

        success = booking_manager.update_booking(code, user_id, new_time, new_date)

        if success:
            return jsonify({
                "success": True,
                "message": "Agendamento atualizado com sucesso"
            }), 200
        else:
            return jsonify({
                "success": False,
                "message": "Agendamento não encontrado"
            }), 404

    except Exception as e:
        logger.error(f"Error updating booking: {e}")
        return jsonify({"erro": str(e)}), 500


# --- Inicialização ---
if __name__ == '__main__':
    port = int(os.environ.get('PORT', 3001))
    debug_mode = os.environ.get('FLASK_ENV') == 'development'

    logger.info(f"Iniciando servidor Flask na porta {port}")
    logger.info(f"Modo debug: {debug_mode}")

    # Criar conversa de teste na inicialização
    create_test_conversation()

    # Thread de limpeza
    def cleanup_thread():
        while True:
            time.sleep(3600)
            cleanup_old_conversations()

    cleanup_worker = threading.Thread(target=cleanup_thread, daemon=True)
    cleanup_worker.start()

    app.run(host='0.0.0.0', port=port, debug=debug_mode, threaded=True)
