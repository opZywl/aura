import os
import logging
import json
import uuid
import time
import hashlib
import requests
from datetime import datetime, timezone, timedelta
from dataclasses import dataclass, field
from typing import List, Dict, Optional, Any

# Configuração de logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Timezone Brasil
BRASIL_TZ = timezone(timedelta(hours=-3))

@dataclass
class InstagramMessage:
    id: str
    sender: str
    text: str
    timestamp: str
    media_url: Optional[str] = None
    media_type: Optional[str] = None
    is_read: bool = False

@dataclass
class InstagramConversation:
    id: str
    instagram_account_id: str
    user_id: str
    username: str
    full_name: Optional[str] = None
    profile_pic_url: Optional[str] = None
    last_message: Optional[str] = None
    last_activity: str = field(default_factory=lambda: datetime.now(BRASIL_TZ).isoformat())
    unread_count: int = 0
    is_archived: bool = False
    messages: List[InstagramMessage] = field(default_factory=list)

# Armazenamento em memória
_instagram_conversations: Dict[str, InstagramConversation] = {}
_instagram_messages: Dict[str, List[InstagramMessage]] = {}

def get_instagram_conversations(account_id: str) -> List[InstagramConversation]:
    """Retorna todas as conversas de uma conta Instagram"""
    logger.info(f"📸 Buscando conversas da conta Instagram: {account_id}")

    # Filtra conversas pela conta
    conversations = [
        conv for conv in _instagram_conversations.values()
        if conv.instagram_account_id == account_id
    ]

    logger.info(f"📸 Encontradas {len(conversations)} conversas para a conta {account_id}")
    return conversations

def get_instagram_conversation(conversation_id: str) -> Optional[InstagramConversation]:
    """Retorna uma conversa específica do Instagram"""
    logger.info(f"📸 Buscando conversa Instagram: {conversation_id}")

    conversation = _instagram_conversations.get(conversation_id)

    if conversation:
        logger.info(f"📸 Conversa encontrada: {conversation.username}")
    else:
        logger.warning(f"📸 Conversa não encontrada: {conversation_id}")

    return conversation

def get_instagram_messages(conversation_id: str, limit: Optional[int] = None, offset: int = 0) -> List[InstagramMessage]:
    """Retorna mensagens de uma conversa Instagram"""
    logger.info(f"📸 Buscando mensagens da conversa Instagram: {conversation_id}")

    conversation = _instagram_conversations.get(conversation_id)
    if not conversation:
        logger.warning(f"📸 Conversa não encontrada: {conversation_id}")
        return []

    messages = conversation.messages

    # Aplicar paginação
    if limit is not None:
        messages = messages[offset:offset + limit]
    else:
        messages = messages[offset:]

    logger.info(f"📸 Retornando {len(messages)} mensagens")
    return messages

def send_instagram_message(account_id: str, conversation_id: str, text: str) -> Optional[InstagramMessage]:
    """Envia uma mensagem para uma conversa Instagram"""
    logger.info(f"📸 Enviando mensagem Instagram para conversa: {conversation_id}")

    conversation = _instagram_conversations.get(conversation_id)
    if not conversation:
        logger.warning(f"📸 Conversa não encontrada: {conversation_id}")
        return None

    if conversation.instagram_account_id != account_id:
        logger.warning(f"📸 Conta {account_id} não é proprietária da conversa {conversation_id}")
        return None

    # Criar nova mensagem
    message = InstagramMessage(
        id=f"ig-{uuid.uuid4().hex}",
        sender="operator",
        text=text,
        timestamp=datetime.now(BRASIL_TZ).isoformat(),
        is_read=True
    )

    # Adicionar à conversa
    conversation.messages.append(message)
    conversation.last_message = text
    conversation.last_activity = message.timestamp

    logger.info(f"📸 Mensagem enviada: {message.id}")
    return message

def create_instagram_conversation(account_id: str, user_data: Dict[str, Any]) -> InstagramConversation:
    """Cria uma nova conversa Instagram"""
    logger.info(f"📸 Criando nova conversa Instagram para conta: {account_id}")

    # Validar dados mínimos
    if not user_data.get('user_id'):
        logger.error("📸 Dados de usuário inválidos")
        raise ValueError("user_id é obrigatório")

    # Criar ID único para a conversa
    conversation_id = f"ig-{uuid.uuid4().hex}"

    # Criar conversa
    conversation = InstagramConversation(
        id=conversation_id,
        instagram_account_id=account_id,
        user_id=user_data['user_id'],
        username=user_data.get('username', f"user_{user_data['user_id']}"),
        full_name=user_data.get('full_name'),
        profile_pic_url=user_data.get('profile_pic_url'),
        last_activity=datetime.now(BRASIL_TZ).isoformat()
    )

    # Adicionar ao armazenamento
    _instagram_conversations[conversation_id] = conversation

    logger.info(f"📸 Nova conversa criada: {conversation_id} - {conversation.username}")
    return conversation

def archive_instagram_conversation(conversation_id: str, is_archived: bool = True) -> bool:
    """Arquiva ou desarquiva uma conversa Instagram"""
    logger.info(f"📸 {'Arquivando' if is_archived else 'Desarquivando'} conversa Instagram: {conversation_id}")

    conversation = _instagram_conversations.get(conversation_id)
    if not conversation:
        logger.warning(f"📸 Conversa não encontrada: {conversation_id}")
        return False

    conversation.is_archived = is_archived
    logger.info(f"📸 Conversa {conversation_id} {'arquivada' if is_archived else 'desarquivada'}")
    return True

def delete_instagram_conversation(conversation_id: str) -> bool:
    """Deleta uma conversa Instagram"""
    logger.info(f"📸 Deletando conversa Instagram: {conversation_id}")

    if conversation_id not in _instagram_conversations:
        logger.warning(f"📸 Conversa não encontrada: {conversation_id}")
        return False

    del _instagram_conversations[conversation_id]
    logger.info(f"📸 Conversa {conversation_id} deletada")
    return True

def mark_instagram_messages_as_read(conversation_id: str) -> int:
    """Marca todas as mensagens de uma conversa como lidas"""
    logger.info(f"📸 Marcando mensagens como lidas: {conversation_id}")

    conversation = _instagram_conversations.get(conversation_id)
    if not conversation:
        logger.warning(f"📸 Conversa não encontrada: {conversation_id}")
        return 0

    count = 0
    for message in conversation.messages:
        if not message.is_read:
            message.is_read = True
            count += 1

    conversation.unread_count = 0

    logger.info(f"📸 {count} mensagens marcadas como lidas")
    return count

def simulate_instagram_message(account_id: str, conversation_id: Optional[str] = None, user_data: Optional[Dict] = None) -> Optional[InstagramMessage]:
    """Simula o recebimento de uma mensagem do Instagram (para testes)"""
    logger.info(f"📸 Simulando mensagem recebida para conta: {account_id}")

    # Se não tiver conversa, cria uma nova
    if not conversation_id:
        if not user_data:
            user_data = {
                'user_id': f"user_{uuid.uuid4().hex[:8]}",
                'username': f"instagram_user_{uuid.uuid4().hex[:5]}",
                'full_name': "Usuário Instagram"
            }

        conversation = create_instagram_conversation(account_id, user_data)
        conversation_id = conversation.id
    else:
        conversation = _instagram_conversations.get(conversation_id)
        if not conversation:
            logger.warning(f"📸 Conversa não encontrada: {conversation_id}")
            return None

    # Criar mensagem
    message = InstagramMessage(
        id=f"ig-{uuid.uuid4().hex}",
        sender="user",
        text=f"Olá! Esta é uma mensagem de teste do Instagram. [{datetime.now(BRASIL_TZ).strftime('%H:%M:%S')}]",
        timestamp=datetime.now(BRASIL_TZ).isoformat(),
        is_read=False
    )

    # Adicionar à conversa
    conversation.messages.append(message)
    conversation.last_message = message.text
    conversation.last_activity = message.timestamp
    conversation.unread_count += 1

    logger.info(f"📸 Mensagem simulada: {message.id} para conversa {conversation_id}")
    return message

# Função para converter conversas Instagram para o formato padrão da API
def convert_instagram_conversation_to_api_format(conversation: InstagramConversation) -> Dict:
    """Converte uma conversa Instagram para o formato padrão da API"""
    return {
        'id': conversation.id,
        'title': conversation.full_name or conversation.username,
        'createdAt': conversation.last_activity,  # Usamos last_activity como proxy para createdAt
        'lastMessage': conversation.last_message or "",
        'lastAt': conversation.last_activity,
        'isArchived': conversation.is_archived,
        'platform': 'instagram',  # Marca a plataforma como Instagram
        'unreadCount': conversation.unread_count
    }

# Função para converter mensagens Instagram para o formato padrão da API
def convert_instagram_message_to_api_format(message: InstagramMessage) -> Dict:
    """Converte uma mensagem Instagram para o formato padrão da API"""
    return {
        'id': message.id,
        'sender': message.sender,
        'text': message.text,
        'timestamp': message.timestamp,
        'read': message.is_read,
        'platform': 'instagram',  # Marca a plataforma como Instagram
        'media_url': message.media_url,
        'media_type': message.media_type
    }

# Inicializar algumas conversas de exemplo para testes
def initialize_sample_instagram_conversations(account_id: str, count: int = 3):
    """Inicializa algumas conversas de exemplo para testes"""
    logger.info(f"📸 Inicializando {count} conversas de exemplo para conta: {account_id}")

    for i in range(count):
        user_data = {
            'user_id': f"user_{i}_{uuid.uuid4().hex[:6]}",
            'username': f"instagram_user_{i}",
            'full_name': f"Usuário Instagram {i+1}"
        }

        conversation = create_instagram_conversation(account_id, user_data)

        # Adicionar algumas mensagens
        for j in range(3):
            if j % 2 == 0:
                # Mensagem do usuário
                message = InstagramMessage(
                    id=f"ig-{uuid.uuid4().hex}",
                    sender="user",
                    text=f"Olá! Esta é a mensagem {j+1} do usuário {i+1}.",
                    timestamp=(datetime.now(BRASIL_TZ) - timedelta(minutes=30-j*10)).isoformat(),
                    is_read=True
                )
            else:
                # Mensagem do operador
                message = InstagramMessage(
                    id=f"ig-{uuid.uuid4().hex}",
                    sender="operator",
                    text=f"Olá! Esta é a resposta {j+1} para o usuário {i+1}.",
                    timestamp=(datetime.now(BRASIL_TZ) - timedelta(minutes=25-j*10)).isoformat(),
                    is_read=True
                )

            conversation.messages.append(message)
            conversation.last_message = message.text
            conversation.last_activity = message.timestamp

    logger.info(f"📸 {count} conversas de exemplo inicializadas")
