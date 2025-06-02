import uuid
import logging
from typing import List
from dataclasses import dataclass
import time

logger = logging.getLogger(__name__)

LOG_INTERVAL_SECONDS_LIST_ACCOUNTS = 10  # Reduzido para debug
_last_log_time_list_accounts = 0

@dataclass
class TelegramAccount:
    id: str
    apiKey: str
    botName: str

_accounts: List[TelegramAccount] = []

def listTelegramAccounts() -> List[TelegramAccount]:
    global _last_log_time_list_accounts

    current_time = time.time()

    if (current_time - _last_log_time_list_accounts) >= LOG_INTERVAL_SECONDS_LIST_ACCOUNTS:
        logger.info(f"📋 listTelegramAccounts - Total de contas conectadas: {len(_accounts)}")
        if _accounts:
            for acc in _accounts:
                logger.info(f"  ├─ Conta: {acc.botName} (ID: {acc.id[:8]}...)")
        else:
            logger.info("  └─ Nenhuma conta conectada")
        _last_log_time_list_accounts = current_time
    return _accounts.copy()

def connectTelegram(apiKey: str, botName: str) -> TelegramAccount:
    logger.info(f"🔗 connectTelegram - Iniciando conexão...")
    logger.info(f"  ├─ Bot Name: {botName}")
    logger.info(f"  ├─ Token Length: {len(apiKey) if apiKey else 0} chars")
    logger.info(f"  └─ Token Preview: {apiKey[:10]}...{apiKey[-10:] if len(apiKey) > 20 else apiKey}")
    
    # Validação de entrada
    if not apiKey or not botName:
        logger.error("❌ connectTelegram - apiKey e botName são obrigatórios")
        raise ValueError("apiKey e botName são obrigatórios")
    
    # Validação do formato do token
    if ':' not in apiKey:
        logger.error("❌ connectTelegram - Token inválido: deve conter ':'")
        raise ValueError("Token do bot inválido. Deve estar no formato: 123456789:ABCdefGHIjklMNOpqrsTUVwxyz")
    
    # Validação do limite de contas
    if len(_accounts) >= 3:
        logger.warning(f"⚠️ connectTelegram - Limite de contas atingido: {len(_accounts)}/3")
        raise ValueError("Limite de 3 contas Telegram atingido")
    
    # Verificar se o bot já está conectado
    for acc in _accounts:
        if acc.apiKey == apiKey.strip():
            logger.warning(f"⚠️ connectTelegram - Bot já conectado: {acc.botName}")
            raise ValueError(f"Bot '{acc.botName}' já está conectado")
        if acc.botName == botName.strip():
            logger.warning(f"⚠️ connectTelegram - Nome já em uso: {botName}")
            raise ValueError(f"Nome '{botName}' já está sendo usado")
    
    # Criar nova conta
    acc = TelegramAccount(
        id=str(uuid.uuid4()), 
        apiKey=apiKey.strip(), 
        botName=botName.strip()
    )
    _accounts.append(acc)
    
    logger.info(f"✅ connectTelegram - Conta conectada com sucesso!")
    logger.info(f"  ├─ ID: {acc.id}")
    logger.info(f"  ├─ Bot Name: {acc.botName}")
    logger.info(f"  └─ Total de contas: {len(_accounts)}")
    
    return acc

def removeTelegram(account_id: str) -> None:
    logger.info(f"🗑️ removeTelegram - Removendo conta: {account_id}")
    global _accounts
    
    # Encontrar a conta
    conta_removida = None
    for acc in _accounts:
        if acc.id == account_id:
            conta_removida = acc
            break
    
    if not conta_removida:
        logger.error(f"❌ removeTelegram - Conta não encontrada: {account_id}")
        raise ValueError(f"Nenhuma conta encontrada com id {account_id}")
    
    # Remover a conta
    _accounts = [a for a in _accounts if a.id != account_id]
    
    logger.info(f"✅ removeTelegram - Conta removida com sucesso!")
    logger.info(f"  ├─ Conta removida: {conta_removida.botName}")
    logger.info(f"  └─ Total restante: {len(_accounts)}")

# Função de debug para verificar estado
def debugAccounts() -> dict:
    return {
        "total_accounts": len(_accounts),
        "accounts": [
            {
                "id": acc.id,
                "botName": acc.botName,
                "tokenLength": len(acc.apiKey)
            }
            for acc in _accounts
        ]
    }
