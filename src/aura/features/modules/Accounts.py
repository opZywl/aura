import json
import logging
import os
import time
import uuid
from dataclasses import dataclass
from typing import List

logger = logging.getLogger(__name__)

LOG_INTERVAL_SECONDS_LIST_ACCOUNTS = 10
_last_log_time_list_accounts = 0

TELEGRAM_ACCOUNTS_FILE = os.path.join(
    os.path.dirname(__file__), "..", "..", "data", "telegram_accounts.json"
)


@dataclass
class TelegramAccount:
    id: str
    apiKey: str
    botName: str


_telegram_accounts: List[TelegramAccount] = []


def _ensure_data_directory() -> None:
    data_dir = os.path.dirname(TELEGRAM_ACCOUNTS_FILE)
    if not os.path.exists(data_dir):
        os.makedirs(data_dir)
        logger.info("Diretório de dados criado: %s", data_dir)


def _save_telegram_accounts() -> None:
    try:
        _ensure_data_directory()
        accounts_data = [
            {"id": acc.id, "apiKey": acc.apiKey, "botName": acc.botName}
            for acc in _telegram_accounts
        ]
        with open(TELEGRAM_ACCOUNTS_FILE, "w", encoding="utf-8") as handle:
            json.dump(accounts_data, handle, indent=2)
        logger.info("%s contas Telegram salvas em arquivo", len(accounts_data))
    except Exception as exc:  # pragma: no cover - apenas logamos a falha
        logger.error("Erro ao salvar contas Telegram: %s", exc)


def _load_telegram_accounts() -> None:
    global _telegram_accounts
    try:
        if not os.path.exists(TELEGRAM_ACCOUNTS_FILE):
            logger.info("Nenhum arquivo de contas encontrado - iniciando com lista vazia")
            _telegram_accounts = []
            return

        with open(TELEGRAM_ACCOUNTS_FILE, "r", encoding="utf-8") as handle:
            accounts_data = json.load(handle)

        _telegram_accounts = [
            TelegramAccount(id=item["id"], apiKey=item["apiKey"], botName=item["botName"])
            for item in accounts_data
        ]
        logger.info("%s contas Telegram carregadas do arquivo", len(_telegram_accounts))
    except Exception as exc:  # pragma: no cover - apenas logamos a falha
        logger.error("Erro ao carregar contas Telegram: %s", exc)
        _telegram_accounts = []


_load_telegram_accounts()


def connectTelegram(api_key: str, bot_name: str) -> TelegramAccount:
    logger.info("connectTelegram - Iniciando conexão para %s", bot_name)

    if not api_key or not bot_name:
        raise ValueError("API Key e Bot Name são obrigatórios")

    if ":" not in api_key:
        raise ValueError(
            "API Key inválida. Deve estar no formato: 123456789:ABCdefGHIjklMNOpqrsTUVwxyz"
        )

    for account in _telegram_accounts:
        if account.apiKey == api_key:
            raise ValueError("Conta com esta API Key já existe")

    if len(_telegram_accounts) >= 3:
        raise ValueError("Limite de 3 contas Telegram atingido")

    account_id = str(uuid.uuid4())
    new_account = TelegramAccount(id=account_id, apiKey=api_key.strip(), botName=bot_name.strip())
    _telegram_accounts.append(new_account)
    _save_telegram_accounts()

    logger.info("connectTelegram - Conta conectada com sucesso! ID: %s", new_account.id)
    return new_account


def removeTelegram(account_id: str) -> bool:
    logger.info("removeTelegram - Removendo conta: %s", account_id)
    for index, account in enumerate(list(_telegram_accounts)):
        if account.id == account_id:
            del _telegram_accounts[index]
            _save_telegram_accounts()
            logger.info("removeTelegram - Conta removida com sucesso: %s", account.botName)
            return True

    raise ValueError(f"Conta com ID {account_id} não encontrada")


def listTelegramAccounts() -> List[TelegramAccount]:
    global _last_log_time_list_accounts
    current_time = time.time()
    if current_time - _last_log_time_list_accounts >= LOG_INTERVAL_SECONDS_LIST_ACCOUNTS:
        logger.info(
            "listTelegramAccounts - Total de contas conectadas: %s", len(_telegram_accounts)
        )
        _last_log_time_list_accounts = current_time
    return _telegram_accounts.copy()
