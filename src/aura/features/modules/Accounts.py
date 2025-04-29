import uuid
import logging
from typing import List
from dataclasses import dataclass

logger = logging.getLogger(__name__)

@dataclass
class TelegramAccount:
    id: str
    apiKey: str
    botName: str

_accounts: List[TelegramAccount] = []

def listTelegramAccounts() -> List[TelegramAccount]:

    logger.debug(f"listTelegramAccounts chamado - total atual: {len(_accounts)} contas")
    return _accounts.copy()

def connectTelegram(apiKey: str, botName: str) -> TelegramAccount:
    logger.info(f"connectTelegram - tentando conectar conta: botName={botName}")
    if not apiKey or not botName:
        logger.warning("connectTelegram - apiKey e botName são obrigatórios")
        raise ValueError("apiKey e botName são obrigatórios")
    if len(_accounts) >= 3:
        logger.warning("connectTelegram - limite de 3 contas Telegram atingido")
        raise ValueError("Limite de 3 contas Telegram atingido")
    acc = TelegramAccount(id=str(uuid.uuid4()), apiKey=apiKey.strip(), botName=botName.strip())
    _accounts.append(acc)
    logger.info(f"connectTelegram - conta conectada com sucesso: id={acc.id}, botName={acc.botName}")
    return acc

def removeTelegram(account_id: str) -> None:
    logger.info(f"removeTelegram - removendo conta com id={account_id}")
    global _accounts
    filtradas = [a for a in _accounts if a.id != account_id]
    if len(filtradas) == len(_accounts):
        logger.warning(f"removeTelegram - nenhuma conta encontrada com id {account_id}")
        raise ValueError(f"Nenhuma conta encontrada com id {account_id}")
    _accounts = filtradas
    logger.info(f"removeTelegram - conta removida com sucesso: id={account_id}")
