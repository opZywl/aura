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
    removeTelegram,
    InstagramAccount,
    listInstagramAccounts,
    connectInstagram,
    removeInstagram
)

# Import do módulo Instagram API
from .instagram_api import (
    get_instagram_conversations,
    get_instagram_conversation,
    get_instagram_messages,
    send_instagram_message,
    create_instagram_conversation,
    archive_instagram_conversation,
    delete_instagram_conversation,
    mark_instagram_messages_as_read,
    simulate_instagram_message,
    convert_instagram_conversation_to_api_format,
    convert_instagram_message_to_api_format,
    initialize_sample_instagram_conversations
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
_conversation_lock = threading.Lock()
chat_to_account: Dict[str, str] = {}
sse_subscribers: Dict[str, List[queue.Queue]] = {}

# Cache para otimização
_cache = {
    'conversations_last_update': 0,
    'conversations_cache': [],
    'cache_duration': 5
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
            logger.info(f"✅ Conta Telegram encontrada: {account_id} - {account.botName}")
        else:
            # Fallback: usar token da variável de ambiente
            bot_token = os.environ.get('TELEGRAM_BOT_TOKEN')
            if bot_token:
                logger.warning(f"⚠️ Conta {account_id} não encontrada em listTelegramAccounts, usando TELEGRAM_BOT_TOKEN da variável de ambiente")
            else:
                logger.error(f"❌ Conta Telegram não encontrada: {account_id} e TELEGRAM_BOT_TOKEN não configurado")
                logger.error(f"📋 Contas disponíveis: {[acc.id for acc in accounts]}")
                return False

        url = f"https://api.telegram.org/bot{bot_token}/sendMessage"

        payload = {
            'chat_id': chat_id,
            'text': text,
            'parse_mode': 'HTML'
        }

        # Don't add reply_markup - we want plain text messages only

        logger.info(f"📤 Enviando mensagem Telegram para chat {chat_id}: {text[:50]}...")

        response = requests.post(url, json=payload, timeout=10)

        if response.status_code == 200:
            result = response.json()
            if result.get('ok'):
                logger.info(f"✅ Mensagem Telegram enviada com sucesso para {chat_id}")
                return True
            else:
                logger.error(f"❌ Erro na API Telegram: {result.get('description', 'Erro desconhecido')}")
                return False
        else:
            logger.error(f"❌ Erro HTTP ao enviar mensagem Telegram: {response.status_code}")
            return False

    except Exception as e:
        logger.error(f"❌ Erro ao enviar mensagem Telegram: {e}")
        return False

def create_test_conversation():
    """Cria uma conversa de teste para debug"""
    logger.info("🧪 Criando conversa de teste...")

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

            logger.info(f"✅ Conversa de teste criada: {test_conv_id}")
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
        "instagram_accounts": len(listInstagramAccounts()),
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
        logger.info(f"📥 RECEBENDO WORKFLOW PARA SALVAR")
        logger.info(f"   ID: {workflow_id}")
        logger.info(f"   Enabled: {enabled}")
        logger.info(f"   Tag: {workflow_data.get('_tag', 'Sem tag')}")
        logger.info("=" * 80)

        success = bot_components_api.register_workflow(workflow_data)

        if success:
            logger.info("=" * 80)
            logger.info(f"✅ WORKFLOW SALVO COM SUCESSO!")
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
            logger.error(f"❌ Erro ao salvar workflow: {workflow_id}")
            return jsonify({"erro": "Erro ao salvar workflow"}), 500

    except Exception as e:
        logger.error(f"❌ Erro ao salvar workflow: {e}")
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

        logger.info(f"🔄 {'Ativando' if enabled else 'Desativando'} workflow: {workflow_id}")

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
        logger.error(f"❌ Erro ao ativar/desativar workflow: {e}")
        return jsonify({"erro": str(e)}), 500

@app.route('/api/bot/workflows', methods=['GET'])
def list_workflows():
    """Lista todos os workflows REAIS publicados"""
    try:
        workflows = bot_components_api.get_all_workflows()
        logger.info(f"📋 Retornando {len(workflows)} workflows REAIS")
        return jsonify({"workflows": workflows}), 200
    except Exception as e:
        logger.error(f"❌ Erro ao listar workflows: {e}")
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
        logger.error(f"❌ Erro ao obter workflow: {e}")
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
        logger.error(f"❌ Erro ao resetar conversa: {e}")
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
        logger.error(f"❌ Erro ao criar conversa de teste: {e}")
        return jsonify({"erro": str(e)}), 500

# --- Listar contas Telegram ---
@app.route('/api/accounts', methods=['GET'])
def obter_accounts():
    """Lista todas as contas Telegram conectadas"""
    try:
        contas = listTelegramAccounts()
        response_data = [acc.__dict__ for acc in contas]
        logger.info(f"📋 Retornando {len(response_data)} contas Telegram")
        return jsonify(response_data), 200
    except Exception as e:
        logger.error(f"❌ Erro ao listar contas Telegram: {e}")
        return jsonify({"erro": str(e)}), 500

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
        logger.info(f"✅ Conta Telegram conectada: {nova_acc.id} - {nova_acc.botName}")

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
                        logger.info(f"🔗 Webhook configurado com sucesso: {webhook_url}")
                    else:
                        logger.error(f"❌ Erro ao configurar webhook: {result.get('description')}")
                else:
                    logger.error(f"❌ Erro HTTP ao configurar webhook: {resp.status_code}")

            except Exception as webhook_error:
                logger.error(f"❌ Erro ao configurar webhook: {webhook_error}")
        else:
            logger.warning("⚠️ NGROK_URL não configurado - webhook não será configurado")

        _cache['conversations_last_update'] = 0

        return jsonify(nova_acc.__dict__), 201

    except Exception as e:
        logger.error(f"❌ Erro ao criar conta Telegram: {e}")
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
                logger.info(f"🗑️ Webhook removido: {resp.status_code}")
            except Exception as e:
                logger.warning(f"⚠️ Erro ao remover webhook: {e}")

        for chat_id, acc_id in list(chat_to_account.items()):
            if acc_id == account_id:
                del chat_to_account[chat_id]

        removeTelegram(account_id)

        with _conversation_lock:
            _conversations.pop(account_id, None)

        _cache['conversations_last_update'] = 0

        logger.info(f"✅ Conta Telegram {account_id} removida completamente")
        return '', 204

    except Exception as e:
        logger.error(f"❌ Erro ao remover conta Telegram: {e}")
        return jsonify({"erro": str(e)}), 400

# --- ROTAS INSTAGRAM ---

@app.route('/api/instagram/accounts', methods=['GET'])
def get_instagram_accounts():
    """Lista todas as contas Instagram conectadas"""
    try:
        logger.info("📸 GET /api/instagram/accounts - Listando contas Instagram")

        accounts = listInstagramAccounts()

        accounts_data = []
        for acc in accounts:
            accounts_data.append({
                "id": acc.id,
                "login": acc.login,
                "displayName": acc.displayName,
                "description": acc.description,
                "isActive": acc.isActive,
                "platform": "instagram"
            })

        logger.info(f"✅ GET /api/instagram/accounts - Retornando {len(accounts_data)} contas")

        return jsonify(accounts_data), 200

    except Exception as e:
        logger.error(f"❌ GET /api/instagram/accounts - Erro: {str(e)}")
        return jsonify({"erro": f"Erro ao listar contas Instagram: {str(e)}"}), 500

@app.route('/api/instagram/accounts', methods=['POST'])
def create_instagram_account():
    """Conecta uma nova conta Instagram"""
    logger.info("=" * 80)
    logger.info("📸 POST /api/instagram/accounts - REQUISIÇÃO RECEBIDA")
    logger.info("=" * 80)

    try:
        logger.info("📥 Processando dados da requisição...")

        if not request.is_json:
            logger.error("❌ Requisição não é JSON")
            return jsonify({"erro": "Content-Type deve ser application/json"}), 415

        data = request.get_json()
        logger.info(f"📦 Dados recebidos: {data}")

        if not data:
            logger.error("❌ Dados JSON estão vazios")
            return jsonify({"erro": "Dados JSON são obrigatórios"}), 400

        login = data.get('login', '').strip()
        password = data.get('password', '').strip()
        display_name = data.get('displayName', '').strip()
        description = data.get('description', '').strip()

        logger.info(f"📸 Dados extraídos:")
        logger.info(f"  ├─ Login: '{login}'")
        logger.info(f"  ├─ Password: {'*' * len(password)} ({len(password)} chars)")
        logger.info(f"  ├─ Display Name: '{display_name}'")
        logger.info(f"  └─ Description: '{description}'")

        if not login or not password:
            logger.error("❌ Login ou senha estão vazios")
            return jsonify({"erro": "Login e senha são obrigatórios"}), 400

        logger.info("🚀 Chamando connectInstagram...")

        account = connectInstagram(login, password, display_name, description)

        logger.info("✅ connectInstagram retornou com sucesso!")

        initialize_sample_instagram_conversations(account.id, 3)
        logger.info(f"✅ Conversas de exemplo inicializadas para a conta {account.id}")

        account_data = {
            "id": account.id,
            "login": account.login,
            "displayName": account.displayName,
            "description": account.description,
            "isActive": account.isActive,
            "platform": "instagram"
        }

        logger.info(f"📤 Retornando dados da conta:")
        logger.info(f"  ├─ ID: {account_data['id']}")
        logger.info(f"  ├─ Login: {account_data['login']}")
        logger.info(f"  ├─ Display Name: {account_data['displayName']}")
        logger.info(f"  └─ Is Active: {account_data['isActive']}")

        logger.info("=" * 80)
        logger.info("✅ POST /api/instagram/accounts - SUCESSO!")
        logger.info("=" * 80)

        return jsonify(account_data), 201

    except ValueError as e:
        logger.error("=" * 80)
        logger.error(f"⚠️ POST /api/instagram/accounts - ERRO DE VALIDAÇÃO")
        logger.error(f"Erro: {str(e)}")
        logger.error("=" * 80)
        return jsonify({"erro": str(e)}), 400
    except Exception as e:
        logger.error("=" * 80)
        logger.error(f"❌ POST /api/instagram/accounts - ERRO INTERNO")
        logger.error(f"Erro: {str(e)}")
        logger.error("=" * 80)
        return jsonify({"erro": f"Erro interno: {str(e)}"}), 500

@app.route('/api/instagram/accounts/<account_id>', methods=['DELETE'])
def delete_instagram_account(account_id):
    """Remove uma conta Instagram"""
    try:
        logger.info(f"📸 DELETE /api/instagram/accounts/{account_id} - Removendo conta")

        if not account_id:
            return jsonify({"erro": "ID da conta é obrigatório"}), 400

        removeInstagram(account_id)

        logger.info(f"✅ DELETE /api/instagram/accounts/{account_id} - Conta removida")

        return jsonify({"mensagem": "Conta Instagram removida com sucesso"}), 200

    except ValueError as e:
        logger.warning(f"⚠️ DELETE /api/instagram/accounts/{account_id} - Erro: {str(e)}")
        return jsonify({"erro": str(e)}), 404
    except Exception as e:
        logger.error(f"❌ DELETE /api/instagram/accounts/{account_id} - Erro: {str(e)}")
        return jsonify({"erro": f"Erro interno: {str(e)}"}), 500

@app.route('/api/instagram/accounts/<account_id>/status', methods=['GET'])
def get_instagram_account_status(account_id):
    """Verifica o status de uma conta Instagram"""
    try:
        logger.info(f"📸 GET /api/instagram/accounts/{account_id}/status - Verificando status")

        accounts = listInstagramAccounts()
        account = next((acc for acc in accounts if acc.id == account_id), None)

        if not account:
            return jsonify({"erro": "Conta não encontrada"}), 404

        status_data = {
            "id": account.id,
            "login": account.login,
            "isActive": account.isActive,
            "hasSession": account.sessionId is not None,
            "platform": "instagram"
        }

        logger.info(f"✅ GET /api/instagram/accounts/{account_id}/status - Status retornado")

        return jsonify(status_data), 200

    except Exception as e:
        logger.error(f"❌ GET /api/instagram/accounts/{account_id}/status - Erro: {str(e)}")
        return jsonify({"erro": f"Erro interno: {str(e)}"}), 500

# --- ROTAS DE CHAT INSTAGRAM ---

@app.route('/api/instagram/conversations', methods=['GET'])
def list_instagram_conversations():
    """Lista todas as conversas Instagram de uma conta"""
    try:
        account_id = request.args.get('account_id')
        if not account_id:
            return jsonify({"erro": "account_id é obrigatório"}), 400

        logger.info(f"📸 GET /api/instagram/conversations - Listando conversas da conta {account_id}")

        accounts = listInstagramAccounts()
        account = next((acc for acc in accounts if acc.id == account_id), None)

        if not account:
            return jsonify({"erro": "Conta Instagram não encontrada"}), 404

        conversations = get_instagram_conversations(account_id)

        api_conversations = [convert_instagram_conversation_to_api_format(conv) for conv in conversations]

        logger.info(f"📸 GET /api/instagram/conversations - Retornando {len(api_conversations)} conversas")

        return jsonify(api_conversations), 200

    except Exception as e:
        logger.error(f"❌ GET /api/instagram/conversations - Erro: {str(e)}")
        return jsonify({"erro": f"Erro ao listar conversas Instagram: {str(e)}"}), 500

@app.route('/api/instagram/conversations/<conversation_id>/messages', methods=['GET'])
def get_instagram_conversation_messages(conversation_id):
    """Obtém mensagens de uma conversa Instagram"""
    try:
        limit = request.args.get('limit', type=int)
        offset = request.args.get('offset', type=int, default=0)

        logger.info(f"📸 GET /api/instagram/conversations/{conversation_id}/messages - Buscando mensagens")

        messages = get_instagram_messages(conversation_id, limit, offset)

        api_messages = [convert_instagram_message_to_api_format(msg) for msg in messages]

        logger.info(f"📸 GET /api/instagram/conversations/{conversation_id}/messages - Retornando {len(api_messages)} mensagens")

        return jsonify(api_messages), 200

    except Exception as e:
        logger.error(f"❌ GET /api/instagram/conversations/{conversation_id}/messages - Erro: {str(e)}")
        return jsonify({"erro": f"Erro ao buscar mensagens: {str(e)}"}), 500

@app.route('/api/instagram/conversations/<conversation_id>/messages', methods=['POST'])
def send_instagram_conversation_message(conversation_id):
    """Envia uma mensagem para uma conversa Instagram"""
    try:
        if not request.is_json:
            return jsonify({"erro": "Content-Type deve ser application/json"}), 415

        data = request.get_json()
        if not data:
            return jsonify({"erro": "Dados JSON são obrigatórios"}), 400

        account_id = data.get('account_id')
        text = data.get('text')

        if not account_id or not text:
            return jsonify({"erro": "account_id e text são obrigatórios"}), 400

        logger.info(f"📸 POST /api/instagram/conversations/{conversation_id}/messages - Enviando mensagem")

        message = send_instagram_message(account_id, conversation_id, text)

        if not message:
            return jsonify({"erro": "Falha ao enviar mensagem"}), 400

        api_message = convert_instagram_message_to_api_format(message)

        logger.info(f"📸 POST /api/instagram/conversations/{conversation_id}/messages - Mensagem enviada: {message.id}")

        return jsonify(api_message), 201

    except Exception as e:
        logger.error(f"❌ POST /api/instagram/conversations/{conversation_id}/messages - Erro: {str(e)}")
        return jsonify({"erro": f"Erro ao enviar mensagem: {str(e)}"}), 500

@app.route('/api/instagram/conversations/<conversation_id>/mark-read', methods=['POST'])
def mark_instagram_conversation_read(conversation_id):
    """Marca todas as mensagens de uma conversa Instagram como lidas"""
    try:
        logger.info(f"📸 POST /api/instagram/conversations/{conversation_id}/mark-read - Marcando como lidas")

        count = mark_instagram_messages_as_read(conversation_id)

        logger.info(f"📸 POST /api/instagram/conversations/{conversation_id}/mark-read - {count} mensagens marcadas como lidas")

        return jsonify({"mensagens_marcadas": count}), 200

    except Exception as e:
        logger.error(f"❌ POST /api/instagram/conversations/{conversation_id}/mark-read - Erro: {str(e)}")
        return jsonify({"erro": f"Erro ao marcar mensagens como lidas: {str(e)}"}), 500

@app.route('/api/instagram/conversations/<conversation_id>/archive', methods=['POST'])
def archive_instagram_conversation_route(conversation_id):
    """Arquiva ou desarquiva uma conversa Instagram"""
    try:
        data = request.get_json() or {}
        is_archived = data.get('is_archived', True)

        logger.info(f"📸 POST /api/instagram/conversations/{conversation_id}/archive - {'Arquivando' if is_archived else 'Desarquivando'}")

        success = archive_instagram_conversation(conversation_id, is_archived)

        if not success:
            return jsonify({"erro": "Conversa não encontrada"}), 404

        logger.info(f"📸 POST /api/instagram/conversations/{conversation_id}/archive - {'Arquivada' if is_archived else 'Desarquivada'}")

        return jsonify({"mensagem": f"Conversa {'arquivada' if is_archived else 'desarquivada'} com sucesso"}), 200

    except Exception as e:
        logger.error(f"❌ POST /api/instagram/conversations/{conversation_id}/archive - Erro: {str(e)}")
        return jsonify({"erro": f"Erro ao arquivar conversa: {str(e)}"}), 500

@app.route('/api/instagram/simulate-message', methods=['POST'])
def simulate_instagram_message_route():
    """Simula o recebimento de uma mensagem Instagram (para testes)"""
    try:
        data = request.get_json() or {}
        account_id = data.get('account_id')
        conversation_id = data.get('conversation_id')
        user_data = data.get('user_data')

        if not account_id:
            return jsonify({"erro": "account_id é obrigatório"}), 400

        logger.info(f"📸 POST /api/instagram/simulate-message - Simulando mensagem para conta {account_id}")

        message = simulate_instagram_message(account_id, conversation_id, user_data)

        if not message:
            return jsonify({"erro": "Falha ao simular mensagem"}), 400

        api_message = convert_instagram_message_to_api_format(message)

        logger.info(f"📸 POST /api/instagram/simulate-message - Mensagem simulada: {message.id}")

        return jsonify(api_message), 201

    except Exception as e:
        logger.error(f"❌ POST /api/instagram/simulate-message - Erro: {str(e)}")
        return jsonify({"erro": f"Erro ao simular mensagem: {str(e)}"}), 500

# --- Listar conversas otimizado ---
@app.route('/api/conversations', methods=['GET'])
def listar_conversas():
    """Lista todas as conversas com cache otimizado - APENAS CONVERSAS DE USUÁRIOS REAIS"""
    try:
        current_time = time.time()

        if (current_time - _cache['conversations_last_update']) < _cache['cache_duration']:
            logger.info(f"📋 Cache hit - Retornando {len(_cache['conversations_cache'])} conversas")
            return jsonify(_cache['conversations_cache']), 200

        telegram_conversations = []
        with _conversation_lock:
            logger.info(f"🔍 Verificando {len(_conversations)} conversas no armazenamento")
            for conv_id, conv in _conversations.items():
                logger.info(f"  📋 Conversa {conv_id}: {conv.title} - Arquivada: {conv.isArchived}, Bot: {conv.is_bot_conversation}")
                if not conv.isArchived and not conv.is_bot_conversation:
                    telegram_conversations.append(conv.to_dict())
                    logger.info(f"    ✅ Incluída na lista")
                else:
                    logger.info(f"    ❌ Filtrada (arquivada ou bot)")

        instagram_conversations = []
        instagram_accounts = listInstagramAccounts()
        for account in instagram_accounts:
            account_conversations = get_instagram_conversations(account.id)
            for conv in account_conversations:
                if not conv.is_archived:
                    instagram_conversations.append(convert_instagram_conversation_to_api_format(conv))

        all_conversations = telegram_conversations + instagram_conversations

        all_conversations.sort(key=lambda x: x.get('lastAt', ''), reverse=True)

        _cache['conversations_cache'] = all_conversations
        _cache['conversations_last_update'] = current_time

        logger.info(f"📋 Retornando {len(all_conversations)} conversas ({len(telegram_conversations)} Telegram + {len(instagram_conversations)} Instagram)")
        return jsonify(all_conversations), 200

    except Exception as e:
        logger.error(f"❌ Erro ao listar conversas: {e}")
        return jsonify({"erro": str(e)}), 500

# --- Obter conversa específica ---
@app.route('/api/conversations/<conversation_id>', methods=['GET'])
def obter_conversa(conversation_id):
    """Obtém uma conversa específica (Telegram ou Instagram)"""
    try:
        logger.info(f"📋 Buscando conversa: {conversation_id}")

        with _conversation_lock:
            if conversation_id in _conversations:
                conv = _conversations[conversation_id]
                logger.info(f"📋 Conversa Telegram encontrada: {conv.title}")
                return jsonify(conv.to_dict()), 200

        instagram_conv = get_instagram_conversation(conversation_id)
        if instagram_conv:
            logger.info(f"📸 Conversa Instagram encontrada: {instagram_conv.username}")
            return jsonify(convert_instagram_conversation_to_api_format(instagram_conv)), 200

        logger.warning(f"⚠️ Conversa não encontrada: {conversation_id}")
        return jsonify({"erro": "Conversa não encontrada"}), 404

    except Exception as e:
        logger.error(f"❌ Erro ao obter conversa: {e}")
        return jsonify({"erro": str(e)}), 500

# --- Obter mensagens de uma conversa ---
@app.route('/api/conversations/<conversation_id>/messages', methods=['GET'])
def obter_mensagens(conversation_id):
    """Obtém mensagens de uma conversa (Telegram ou Instagram)"""
    try:
        limit = request.args.get('limit', type=int)
        offset = request.args.get('offset', type=int, default=0)

        logger.info(f"📋 Buscando mensagens da conversa: {conversation_id}")

        with _conversation_lock:
            if conversation_id in _conversations:
                conv = _conversations[conversation_id]
                messages = conv.messages

                if limit is not None:
                    messages = messages[offset:offset + limit]
                else:
                    messages = messages[offset:]

                messages_data = [msg.to_dict() for msg in messages]
                logger.info(f"📋 Retornando {len(messages_data)} mensagens Telegram")
                return jsonify(messages_data), 200

        instagram_messages = get_instagram_messages(conversation_id, limit, offset)
        if instagram_messages:
            messages_data = [convert_instagram_message_to_api_format(msg) for msg in instagram_messages]
            logger.info(f"📸 Retornando {len(messages_data)} mensagens Instagram")
            return jsonify(messages_data), 200

        logger.warning(f"⚠️ Conversa não encontrada: {conversation_id}")
        return jsonify({"erro": "Conversa não encontrada"}), 404

    except Exception as e:
        logger.error(f"❌ Erro ao obter mensagens: {e}")
        return jsonify({"erro": str(e)}), 500

# --- Enviar mensagem ---
@app.route('/api/conversations/<conversation_id>/messages', methods=['POST'])
def enviar_mensagem(conversation_id):
    """Envia mensagem para uma conversa (Telegram ou Instagram)"""
    try:
        if not request.is_json:
            return jsonify({"erro": "Content-Type deve ser application/json"}), 415

        data = request.get_json()
        if not data:
            return jsonify({"erro": "Dados JSON são obrigatórios"}), 400

        text = data.get('text', '').strip()
        sender = data.get('sender', 'operator').strip()

        if not text:
            return jsonify({"erro": "Texto da mensagem é obrigatório"}), 400

        logger.info(f"📤 Enviando mensagem para conversa: {conversation_id}")

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

                        broadcast_to_subscribers(conversation_id, nova_mensagem.to_dict())

                        _cache['conversations_last_update'] = 0

                        logger.info(f"✅ Mensagem Telegram enviada: {nova_mensagem.id}")
                        return jsonify(nova_mensagem.to_dict()), 201
                    else:
                        return jsonify({"erro": "Falha ao enviar mensagem via Telegram"}), 500
                else:
                    return jsonify({"erro": "Conta Telegram não encontrada para esta conversa"}), 404

        account_id = data.get('account_id')
        if account_id:
            instagram_message = send_instagram_message(account_id, conversation_id, text)
            if instagram_message:
                message_data = convert_instagram_message_to_api_format(instagram_message)
                logger.info(f"✅ Mensagem Instagram enviada: {instagram_message.id}")
                return jsonify(message_data), 201

        logger.warning(f"⚠️ Conversa não encontrada: {conversation_id}")
        return jsonify({"erro": "Conversa não encontrada"}), 404

    except Exception as e:
        logger.error(f"❌ Erro ao enviar mensagem: {e}")
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

        logger.info(f"📝 Renomeando conversa {conversation_id} para: {new_title}")

        with _conversation_lock:
            if conversation_id in _conversations:
                conv = _conversations[conversation_id]
                old_title = conv.title
                conv.title = new_title

                _cache['conversations_last_update'] = 0

                logger.info(f"✅ Conversa Telegram renomeada: '{old_title}' -> '{new_title}'")
                return jsonify(conv.to_dict()), 200

        logger.warning(f"⚠️ Conversa não encontrada para renomeação: {conversation_id}")
        return jsonify({"erro": "Conversa não encontrada"}), 404

    except Exception as e:
        logger.error(f"❌ Erro ao renomear conversa: {e}")
        return jsonify({"erro": str(e)}), 500

# --- Arquivar conversa ---
@app.route('/api/conversations/<conversation_id>/archive', methods=['PATCH'])
def arquivar_conversa(conversation_id):
    """Arquiva ou desarquiva uma conversa"""
    try:
        data = request.get_json() or {}
        is_archived = data.get('isArchived', data.get('is_archived', True))

        logger.info(f"📁 {'Arquivando' if is_archived else 'Desarquivando'} conversa: {conversation_id}")

        with _conversation_lock:
            if conversation_id in _conversations:
                conv = _conversations[conversation_id]
                conv.isArchived = is_archived

                _cache['conversations_last_update'] = 0

                logger.info(f"✅ Conversa Telegram {'arquivada' if is_archived else 'desarquivada'}: {conversation_id}")
                return jsonify({
                    "success": True,
                    "message": f"Conversa {'arquivada' if is_archived else 'desarquivada'} com sucesso",
                    "conversation": conv.to_dict()
                }), 200

        success = archive_instagram_conversation(conversation_id, is_archived)
        if success:
            logger.info(f"✅ Conversa Instagram {'arquivada' if is_archived else 'desarquivada'}: {conversation_id}")
            return jsonify({
                "success": True,
                "message": f"Conversa {'arquivada' if is_archived else 'desarquivada'} com sucesso"
            }), 200

        logger.warning(f"⚠️ Conversa não encontrada para arquivamento: {conversation_id}")
        return jsonify({"erro": "Conversa não encontrada"}), 404

    except Exception as e:
        logger.error(f"❌ Erro ao arquivar conversa: {e}")
        return jsonify({"erro": str(e)}), 500

# --- Deletar conversa ---
@app.route('/api/conversations/<conversation_id>', methods=['DELETE'])
def deletar_conversa(conversation_id):
    """Remove uma conversa completamente"""
    try:
        logger.info(f"🗑️ Deletando conversa: {conversation_id}")

        with _conversation_lock:
            if conversation_id in _conversations:
                del _conversations[conversation_id]

                if conversation_id in chat_to_account:
                    del chat_to_account[conversation_id]

                _cache['conversations_last_update'] = 0

                logger.info(f"✅ Conversa Telegram deletada: {conversation_id}")
                return '', 204

        success = delete_instagram_conversation(conversation_id)
        if success:
            logger.info(f"✅ Conversa Instagram deletada: {conversation_id}")
            return '', 204

        logger.warning(f"⚠️ Conversa não encontrada para deleção: {conversation_id}")
        return jsonify({"erro": "Conversa não encontrada"}), 404

    except Exception as e:
        logger.error(f"❌ Erro ao deletar conversa: {e}")
        return jsonify({"erro": str(e)}), 500

# --- Webhook Telegram - INTEGRADO COM BOT DE WORKFLOWS REAIS ---
@app.route('/api/telegram/webhook/<account_id>', methods=['POST'])
def webhook_telegram(account_id):
    """
    Webhook para receber mensagens do Telegram
    PROCESSA MENSAGENS USANDO O BOT DE WORKFLOWS REAIS - SEM MOCK!
    """
    try:
        logger.info(f"📨 Webhook recebido para conta: {account_id}")

        data = request.get_json()
        logger.info(f"📦 Dados do webhook: {json.dumps(data, indent=2)}")

        if not data:
            logger.warning("⚠️ Webhook sem dados")
            return '', 200

        if 'message' not in data:
            logger.warning("⚠️ Webhook sem campo 'message'")
            return '', 200

        message = data['message']
        chat_id = str(message['chat']['id'])
        text = message.get('text', '')
        user_info = message.get('from', {})
        user_name = user_info.get('first_name', 'Usuário')
        is_bot = user_info.get('is_bot', False)

        logger.info(f"📨 Mensagem recebida:")
        logger.info(f"  ├─ Chat ID: {chat_id}")
        logger.info(f"  ├─ Usuário: {user_name}")
        logger.info(f"  ├─ É bot: {is_bot}")
        logger.info(f"  └─ Texto: {text}")

        # FILTRO: Ignorar mensagens de bots
        if is_bot:
            logger.info(f"🤖 Ignorando mensagem de bot: {user_name}")
            return '', 200

        # Mapear chat para conta
        chat_to_account[chat_id] = account_id
        logger.info(f"🔗 Chat {chat_id} mapeado para conta {account_id}")

        # Buscar ou criar conversa
        with _conversation_lock:
            if chat_id not in _conversations:
                logger.info(f"🆕 Criando nova conversa para chat {chat_id}")
                _conversations[chat_id] = Conversation(
                    id=chat_id,
                    title=user_name,
                    platform='telegram',
                    chat_type='private',
                    is_bot_conversation=False
                )
            else:
                logger.info(f"📋 Conversa existente encontrada para chat {chat_id}")

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

            logger.info(f"✅ Mensagem do usuário adicionada à conversa {chat_id}: {nova_mensagem.id}")

            # Broadcast para subscribers
            broadcast_to_subscribers(chat_id, nova_mensagem.to_dict())

        workflows = bot_components_api.get_all_workflows()
        active_workflows = [w for w in workflows if w.get('enabled', True)]

        logger.info(f"📋 Total de workflows: {len(workflows)}")
        logger.info(f"✅ Workflows ATIVOS: {len(active_workflows)}")

        if not active_workflows:
            logger.warning("⚠️ INTERNO: Nenhum workflow ATIVO configurado - mensagem ignorada silenciosamente")
            return '', 200

        active_workflows.sort(key=lambda w: w.get('updated_at', w.get('created_at', '')), reverse=True)
        active_workflow = active_workflows[0]
        workflow_id = active_workflow['id']

        logger.info(f"🤖 Processando mensagem com workflow ATIVO MAIS RECENTE: {workflow_id}")
        logger.info(f"   Tag: {active_workflow.get('tag', 'Sem tag')}")
        logger.info(f"   Enabled: {active_workflow.get('enabled', False)}")
        logger.info(f"   Atualizado em: {active_workflow.get('updated_at', 'N/A')}")

        bot_response = bot_components_api.process_user_message(chat_id, workflow_id, text)

        logger.info(f"🤖 Resposta do bot: {json.dumps(bot_response, indent=2)}")

        if bot_response.get('success'):
            messages_to_send = bot_response.get('messages', [])

            logger.info(f"📨 Total de mensagens para enviar: {len(messages_to_send)}")

            for idx, msg_data in enumerate(messages_to_send):
                response_text = msg_data.get('text', '')
                response_options = msg_data.get('options', [])

                if not response_text.strip():
                    logger.info(f"⏭️ Pulando mensagem vazia #{idx + 1}")
                    continue

                logger.info(f"📤 Enviando mensagem #{idx + 1}/{len(messages_to_send)}: {response_text[:50]}...")

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

                    logger.info(f"✅ Mensagem #{idx + 1} enviada e salva na conversa")

                    if idx < len(messages_to_send) - 1:
                        import time
                        time.sleep(0.5)
                else:
                    logger.error(f"❌ Falha ao enviar mensagem #{idx + 1} via Telegram API")

            if bot_response.get('archive_conversation'):
                logger.info(f"📁 Arquivando conversa {chat_id} após finalização do fluxo")
                with _conversation_lock:
                    if chat_id in _conversations:
                        _conversations[chat_id].isArchived = True
        else:
            error_message = bot_response.get('messages', [{}])[0].get('text', 'Erro ao processar mensagem')
            logger.error(f"❌ INTERNO: Erro no processamento do bot: {error_message}")

        # Limpar cache
        _cache['conversations_last_update'] = 0
        logger.info("🔄 Cache limpo - conversas serão recarregadas")

        logger.info(f"✅ Webhook processado com sucesso para {chat_id}")
        return '', 200

    except Exception as e:
        logger.error(f"❌ Erro no webhook Telegram: {e}")
        logger.exception("Stack trace completo:")
        return '', 200

# --- Debug Status ---
@app.route('/api/debug/status', methods=['GET'])
def debug_status():
    """Endpoint de debug com informações detalhadas"""
    try:
        telegram_accounts = listTelegramAccounts()
        instagram_accounts = listInstagramAccounts()

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
                "chat_mappings_detail": chat_to_account
            },
            "instagram": {
                "accounts_count": len(instagram_accounts),
                "accounts": [{"id": acc.id, "login": acc.login, "displayName": acc.displayName} for acc in instagram_accounts],
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
        logger.error(f"❌ Erro no debug status: {e}")
        return jsonify({"erro": str(e)}), 500

# --- Teste de arquivamento ---
@app.route('/api/test/archive', methods=['POST'])
def test_archive():
    """Endpoint de teste para arquivamento"""
    try:
        data = request.get_json() or {}
        conversation_id = data.get('conversation_id', 'test-123')
        is_archived = data.get('is_archived', True)

        logger.info(f"🧪 Teste de arquivamento: {conversation_id} -> {is_archived}")

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
        logger.error(f"❌ Erro no teste de arquivamento: {e}")
        return jsonify({"erro": str(e)}), 500

# --- Inicialização ---
if __name__ == '__main__':
    port = int(os.environ.get('PORT', 3001))
    debug_mode = os.environ.get('FLASK_ENV') == 'development'

    logger.info(f"🚀 Iniciando servidor Flask na porta {port}")
    logger.info(f"🔧 Modo debug: {debug_mode}")

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
