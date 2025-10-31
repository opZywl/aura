import uuid
import hashlib
import logging
from typing import List, Optional
from dataclasses import dataclass
import time
import requests
import json
import os

logger = logging.getLogger(__name__)

LOG_INTERVAL_SECONDS_LIST_ACCOUNTS = 10
_last_log_time_list_accounts = 0

TELEGRAM_ACCOUNTS_FILE = os.path.join(os.path.dirname(__file__), '..', '..', 'data', 'telegram_accounts.json')

# --- TELEGRAM ACCOUNTS ---

@dataclass
class TelegramAccount:
    id: str
    apiKey: str
    botName: str

# Armazenamento em memória para contas Telegram
_telegram_accounts: List[TelegramAccount] = []

def _ensure_data_directory():
    """Garante que o diretório de dados existe"""
    data_dir = os.path.dirname(TELEGRAM_ACCOUNTS_FILE)
    if not os.path.exists(data_dir):
        os.makedirs(data_dir)
        logger.info(f"Diretório de dados criado: {data_dir}")

def _save_telegram_accounts():
    """Salva contas Telegram em arquivo JSON"""
    try:
        _ensure_data_directory()
        accounts_data = [
            {
                "id": acc.id,
                "apiKey": acc.apiKey,
                "botName": acc.botName
            }
            for acc in _telegram_accounts
        ]
        with open(TELEGRAM_ACCOUNTS_FILE, 'w') as f:
            json.dump(accounts_data, f, indent=2)
        logger.info(f" {len(accounts_data)} contas Telegram salvas em arquivo")
    except Exception as e:
        logger.error(f"Erro ao salvar contas Telegram: {e}")

def _load_telegram_accounts():
    """Carrega contas Telegram do arquivo JSON"""
    global _telegram_accounts
    try:
        if os.path.exists(TELEGRAM_ACCOUNTS_FILE):
            with open(TELEGRAM_ACCOUNTS_FILE, 'r') as f:
                accounts_data = json.load(f)
            _telegram_accounts = [
                TelegramAccount(
                    id=acc["id"],
                    apiKey=acc["apiKey"],
                    botName=acc["botName"]
                )
                for acc in accounts_data
            ]
            logger.info(f" {len(_telegram_accounts)} contas Telegram carregadas do arquivo")
        else:
            logger.info("Nenhum arquivo de contas encontrado - iniciando com lista vazia")
    except Exception as e:
        logger.error(f"Erro ao carregar contas Telegram: {e}")
        _telegram_accounts = []

def connectTelegram(api_key: str, bot_name: str) -> TelegramAccount:
    """Conecta uma nova conta Telegram"""
    logger.info(f"connectTelegram - Iniciando conexão...")
    logger.info(f"  -- Bot Name: {bot_name}")
    logger.info(f"  -- Token Length: {len(api_key) if api_key else 0} chars")
    logger.info(f"  -- Token Preview: {api_key[:10]}...{api_key[-10:] if len(api_key) > 20 else api_key}")

    if not api_key or not bot_name:
        logger.error("connectTelegram - apiKey e botName são obrigatórios")
        raise ValueError("API Key e Bot Name são obrigatórios")

    if not ":"in api_key:
        logger.error("connectTelegram - Token inválido: deve conter ':'")
        raise ValueError("API Key inválida. Deve estar no formato: 123456789:ABCdefGHIjklMNOpqrsTUVwxyz")

    # Verifica se já existe uma conta com esta API Key
    for acc in _telegram_accounts:
        if acc.apiKey == api_key:
            logger.warning(f"connectTelegram - Bot já conectado: {acc.botName}")
            raise ValueError("Conta com esta API Key já existe")

    # Limite de contas
    if len(_telegram_accounts) >= 3:
        logger.warning(f"connectTelegram - Limite de contas atingido: {len(_telegram_accounts)}/3")
        raise ValueError("Limite de 3 contas Telegram atingido")

    # Criar nova conta
    account_id = str(uuid.uuid4())
    new_account = TelegramAccount(
        id=account_id,
        apiKey=api_key.strip(),
        botName=bot_name.strip()
    )

    _telegram_accounts.append(new_account)

    _save_telegram_accounts()

    logger.info(f"connectTelegram - Conta conectada com sucesso!")
    logger.info(f"  -- ID: {new_account.id}")
    logger.info(f"  -- Bot Name: {new_account.botName}")
    logger.info(f"  -- Total de contas: {len(_telegram_accounts)}")

    return new_account

def removeTelegram(account_id: str) -> bool:
    """Remove uma conta Telegram"""
    logger.info(f"removeTelegram - Removendo conta: {account_id}")
    global _telegram_accounts

    for i, acc in enumerate(_telegram_accounts):
        if acc.id == account_id:
            removed_account = _telegram_accounts.pop(i)

            _save_telegram_accounts()

            logger.info(f"removeTelegram - Conta removida com sucesso!")
            logger.info(f"  -- Conta removida: {removed_account.botName}")
            logger.info(f"  -- Total restante: {len(_telegram_accounts)}")
            return True

    logger.error(f"removeTelegram - Conta não encontrada: {account_id}")
    raise ValueError(f"Conta com ID {account_id} não encontrada")

def listTelegramAccounts() -> List[TelegramAccount]:
    """Lista todas as contas Telegram conectadas"""
    global _last_log_time_list_accounts

    current_time = time.time()

    if (current_time - _last_log_time_list_accounts) >= LOG_INTERVAL_SECONDS_LIST_ACCOUNTS:
        logger.info(f"listTelegramAccounts - Total de contas conectadas: {len(_telegram_accounts)}")
        if _telegram_accounts:
            for acc in _telegram_accounts:
                logger.info(f"  -- Conta: {acc.botName} (ID: {acc.id[:8]}...)")
        else:
            logger.info("  -- Nenhuma conta conectada")
        _last_log_time_list_accounts = current_time
    return _telegram_accounts.copy()

# --- INSTAGRAM ACCOUNTS ---

@dataclass
class InstagramAccount:
    id: str
    login: str
    password: str  # Em produção, deve ser criptografado
    displayName: str
    description: str
    isActive: bool = True
    sessionId: Optional[str] = None
    createdAt: str = ""

# Armazenamento em memória para contas Instagram
_instagram_accounts: List[InstagramAccount] = []

def connectInstagram(login: str, password: str, display_name: str = "", description: str = "") -> InstagramAccount:
    """Conecta uma nova conta Instagram com logs detalhados"""
    logger.info("=" * 80)
    logger.info("CONECTANDO CONTA INSTAGRAM - INÍCIO")
    logger.info("=" * 80)
    logger.info(f"DADOS RECEBIDOS:")
    logger.info(f"  -- Login: '{login}'")
    logger.info(f"  -- Password Length: {len(password) if password else 0} chars")
    logger.info(f"  -- Display Name: '{display_name}'")
    logger.info(f"  -- Description: '{description}'")
    logger.info(f"  -- Timestamp: {time.strftime('%Y-%m-%d %H:%M:%S')}")

    logger.info("VALIDAÇÕES INICIAIS:")

    # Validação 1: Campos obrigatórios
    logger.info("  -- Verificando campos obrigatórios...")
    if not login:
        logger.error("  |   Login está vazio!")
        raise ValueError("Login é obrigatório")
    if not password:
        logger.error("  |   Password está vazio!")
        raise ValueError("Senha é obrigatória")
    logger.info("  |   Campos obrigatórios OK")

    # Validação 2: Formato do login
    logger.info("  -- Validando formato do login...")
    login_clean = login.strip()
    if len(login_clean) < 3:
        logger.error(f"  |   Login muito curto: {len(login_clean)} chars")
        raise ValueError("Login deve ter pelo menos 3 caracteres")
    logger.info(f"  |   Login válido: '{login_clean}' ({len(login_clean)} chars)")

    # Validação 3: Formato da senha
    logger.info("  -- Validando formato da senha...")
    if len(password) < 6:
        logger.error(f"  |   Senha muito curta: {len(password)} chars")
        raise ValueError("Senha deve ter pelo menos 6 caracteres")
    logger.info(f"  |   Senha válida ({len(password)} chars)")

    # Validação 4: Conta duplicada
    logger.info("  -- Verificando contas duplicadas...")
    logger.info(f"  |  -- Total de contas existentes: {len(_instagram_accounts)}")
    for i, acc in enumerate(_instagram_accounts):
        logger.info(f"  |  -- Conta {i+1}: '{acc.login}' (ID: {acc.id[:8]}...)")
        if acc.login.lower() == login_clean.lower():
            logger.error(f"  |   Conta duplicada encontrada: '{acc.login}'")
            raise ValueError(f"Conta com login '{login_clean}' já existe")
    logger.info("  |   Nenhuma conta duplicada encontrada")

    # Validação 5: Limite de contas
    logger.info("  -- Verificando limite de contas...")
    logger.info(f"  |  -- Contas atuais: {len(_instagram_accounts)}")
    logger.info(f"  |  -- Limite máximo: 2")
    if len(_instagram_accounts) >= 2:
        logger.error(f"  |   Limite atingido: {len(_instagram_accounts)}/2")
        raise ValueError("Limite máximo de 2 contas Instagram atingido")
    logger.info(f"  |   Limite OK: {len(_instagram_accounts)}/2")

    logger.info("TODAS AS VALIDAÇÕES PASSARAM!")

    # Processo de autenticação
    logger.info("INICIANDO PROCESSO DE AUTENTICAÇÃO:")
    logger.info(f"  -- Login: '{login_clean}'")
    logger.info(f"  -- Iniciando em: {time.strftime('%H:%M:%S')}")

    try:
        auth_result = _simulate_instagram_auth(login_clean, password)
        if not auth_result:
            logger.error("   AUTENTICAÇÃO FALHOU!")
            raise ValueError("Credenciais inválidas ou erro na autenticação")
        logger.info("   AUTENTICAÇÃO BEM-SUCEDIDA!")
    except Exception as e:
        logger.error(f"   ERRO NA AUTENTICAÇÃO: {str(e)}")
        raise ValueError(f"Erro na autenticação: {str(e)}")

    # Criação da conta
    logger.info("CRIANDO NOVA CONTA:")
    account_id = str(uuid.uuid4())
    logger.info(f"  -- ID gerado: {account_id}")

    session_id = _generate_session_id(login_clean)
    logger.info(f"  -- Session ID: {session_id[:20]}...")

    password_hash = _hash_password(password)
    logger.info(f"  -- Password hash: {password_hash[:20]}...")

    display_name_final = display_name.strip() or login_clean
    logger.info(f"  -- Display Name final: '{display_name_final}'")

    description_final = description.strip()
    logger.info(f"  -- Description final: '{description_final}'")

    created_at = str(int(time.time()))
    logger.info(f"  -- Created At: {created_at}")

    new_account = InstagramAccount(
        id=account_id,
        login=login_clean,
        password=password_hash,
        displayName=display_name_final,
        description=description_final,
        isActive=True,
        sessionId=session_id,
        createdAt=created_at
    )

    logger.info("DADOS DA NOVA CONTA:")
    logger.info(f"  -- ID: {new_account.id}")
    logger.info(f"  -- Login: {new_account.login}")
    logger.info(f"  -- Display Name: {new_account.displayName}")
    logger.info(f"  -- Description: {new_account.description}")
    logger.info(f"  -- Is Active: {new_account.isActive}")
    logger.info(f"  -- Session ID: {new_account.sessionId[:20]}...")
    logger.info(f"  -- Created At: {new_account.createdAt}")

    # Adicionando à lista
    logger.info("SALVANDO CONTA:")
    logger.info(f"  -- Contas antes: {len(_instagram_accounts)}")
    _instagram_accounts.append(new_account)
    logger.info(f"  -- Contas depois: {len(_instagram_accounts)}")
    logger.info(f"  -- Conta adicionada na posição: {len(_instagram_accounts) - 1}")

    # Verificação final
    logger.info("VERIFICAÇÃO FINAL:")
    logger.info(f"  -- Total de contas Instagram: {len(_instagram_accounts)}")
    for i, acc in enumerate(_instagram_accounts):
    status = "NOVA" if acc.id == account_id else "EXISTENTE"
        logger.info(f"  -- Conta {i+1}: {status} - '{acc.displayName}' ({acc.login})")

    logger.info("=" * 80)
    logger.info("CONTA INSTAGRAM CONECTADA COM SUCESSO!")
    logger.info("=" * 80)
    logger.info(f"RESUMO DA CONEXÃO:")
    logger.info(f"  -- Login: {new_account.login}")
    logger.info(f"  -- Display Name: {new_account.displayName}")
    logger.info(f"  -- ID: {new_account.id}")
    logger.info(f"  -- Status: Ativa")
    logger.info(f"  -- Total de contas: {len(_instagram_accounts)}")
    logger.info("=" * 80)

    return new_account

def removeInstagram(account_id: str) -> bool:
    """Remove uma conta Instagram"""
    logger.info(f"removeInstagram - Removendo conta: {account_id}")
    global _instagram_accounts

    for i, acc in enumerate(_instagram_accounts):
        if acc.id == account_id:
            removed_account = _instagram_accounts.pop(i)

            # Logout da sessão se existir
            if removed_account.sessionId:
                try:
                    _logout_instagram(removed_account.sessionId)
                except Exception as e:
                    logger.warning(f"removeInstagram - Erro no logout: {str(e)}")

            logger.info(f"removeInstagram - Conta removida com sucesso!")
            logger.info(f"  -- Conta removida: {removed_account.login}")
            logger.info(f"  -- Total restante: {len(_instagram_accounts)}")
            return True

    logger.error(f"removeInstagram - Conta não encontrada: {account_id}")
    raise ValueError(f"Conta Instagram com ID {account_id} não encontrada")

def listInstagramAccounts() -> List[InstagramAccount]:
    """Lista todas as contas Instagram conectadas"""
    global _last_log_time_list_accounts

    current_time = time.time()

    if (current_time - _last_log_time_list_accounts) >= LOG_INTERVAL_SECONDS_LIST_ACCOUNTS:
        logger.info(f"listInstagramAccounts - Total de contas conectadas: {len(_instagram_accounts)}")
        if _instagram_accounts:
            for acc in _instagram_accounts:
                logger.info(f"  -- Conta: {acc.displayName or acc.login} (ID: {acc.id[:8]}...)")
        else:
            logger.info("  -- Nenhuma conta Instagram conectada")
        _last_log_time_list_accounts = current_time

    return _instagram_accounts.copy()

def getInstagramAccount(account_id: str) -> Optional[InstagramAccount]:
    """Obtém uma conta Instagram específica"""
    for acc in _instagram_accounts:
        if acc.id == account_id:
            return acc
    return None

# --- FUNÇÕES AUXILIARES ---

def _simulate_instagram_auth(login: str, password: str) -> bool:
    """Simula autenticação do Instagram com logs detalhados"""
    logger.info("     _simulate_instagram_auth - INICIANDO AUTENTICAÇÃO")
    logger.info(f"    -- Login: '{login}'")
    logger.info(f"    -- Password Length: {len(password)} chars")
    logger.info(f"    -- Timestamp: {time.strftime('%H:%M:%S.%f')[:-3]}")

    # Validação 1: Comprimento da senha
    logger.info("    -- Validando comprimento da senha...")
    if len(password) < 6:
        logger.error(f"    |   Senha muito curta: {len(password)} chars (mínimo: 6)")
        return False
    logger.info(f"    |   Comprimento OK: {len(password)} chars")

    # Validação 2: Formato do login
    logger.info("    -- Validando formato do login...")
    if "@"in login:
        logger.info("    |  -- Detectado formato de email")
        if "."not in login:
            logger.error("    |   Email inválido: falta domínio")
            return False
        logger.info("    |   Email válido")
    else:
        logger.info("    |  -- Detectado formato de username")
        if len(login) < 3:
            logger.error(f"    |   Username muito curto: {len(login)} chars")
            return False
        logger.info("    |   Username válido")

    # Validação 3: Caracteres especiais
    logger.info("    -- Verificando caracteres especiais...")
    special_chars = "!@#$%^&*()+=[]{}|;:,.<>?"
    has_special = any(c in password for c in special_chars)
    logger.info(f"    |  -- Tem caracteres especiais: {has_special}")

    # Simulação de delay de rede
    logger.info("    -- Simulando requisição para Instagram...")
    logger.info("    |  -- Conectando ao servidor...")
    time.sleep(0.5)
    logger.info("    |  -- Enviando credenciais...")
    time.sleep(0.5)
    logger.info("    |  -- Aguardando resposta...")
    time.sleep(1)

    # Simulação de casos de erro para teste
    logger.info("    -- Verificando casos especiais de teste...")
    test_failures = ["test_fail", "invalid_user", "blocked_account", "wrong_password"]
    if login.lower() in test_failures:
        logger.error(f"    |   Conta de teste com falha: '{login}'")
        logger.error("    |  -- Motivo: Credenciais de teste inválidas")
        return False
    logger.info("    |   Não é conta de teste com falha")

    # Simulação de rate limiting
    logger.info("    -- Verificando rate limiting...")
    current_time = time.time()
    logger.info(f"    |  -- Timestamp atual: {current_time}")
    logger.info("    |   Rate limit OK")

    # Sucesso na autenticação
    logger.info("    --  AUTENTICAÇÃO SIMULADA BEM-SUCEDIDA!")
    logger.info("    -- Gerando dados de sessão...")
    logger.info("    --  Pronto para criar conta!")

    return True

def _generate_session_id(login: str) -> str:
    """Gera um ID de sessão único com logs detalhados"""
    logger.info("     _generate_session_id - GERANDO SESSION ID")
    logger.info(f"    -- Login: '{login}'")

    timestamp = str(int(time.time()))
    logger.info(f"    -- Timestamp: {timestamp}")

    uuid_part = uuid.uuid4().hex[:8]
    logger.info(f"    -- UUID part: {uuid_part}")

    data = f"{login}_{timestamp}_{uuid_part}"
    logger.info(f"    -- Data string: '{data}'")

    session_id = hashlib.md5(data.encode()).hexdigest()
    logger.info(f"    -- Session ID completo: {session_id}")
    logger.info(f"    -- Session ID (preview): {session_id[:20]}...")

    return session_id

def _hash_password(password: str) -> str:
    """Cria hash da senha com logs detalhados"""
    logger.info("     _hash_password - CRIANDO HASH DA SENHA")
    logger.info(f"    -- Password length: {len(password)} chars")
    logger.info(f"    -- Algoritmo: SHA-256")

    # Em produção, usar bcrypt ou similar
    hashed_password = hashlib.sha256(password.encode()).hexdigest()

    logger.info(f"    -- Hash completo: {hashed_password}")
    logger.info(f"    -- Hash (preview): {hashed_password[:20]}...")

    return hashed_password

def _verify_password(password: str, hashed: str) -> bool:
    """Verifica se a senha corresponde ao hash"""
    return _hash_password(password) == hashed

def _logout_instagram(session_id: str) -> None:
    """Simula logout do Instagram"""
    logger.info(f" _logout_instagram - Fazendo logout da sessão: {session_id[:20]}...")

    # SIMULAÇÃO - Em produção, fazer logout real
    time.sleep(1)

    logger.info(f" _logout_instagram - Logout realizado com sucesso")

# --- FUNÇÕES DE UTILIDADE ---

def getTotalAccountsCount() -> dict:
    """Retorna contagem total de contas por plataforma"""
    return {
        "telegram": len(_telegram_accounts),
        "instagram": len(_instagram_accounts),
        "total": len(_telegram_accounts) + len(_instagram_accounts)
    }

def getAccountByPlatform(platform: str) -> List:
    """Retorna contas de uma plataforma específica"""
    if platform.lower() == "telegram":
        return listTelegramAccounts()
    elif platform.lower() == "instagram":
        return listInstagramAccounts()
    else:
        return []

# --- INICIALIZAÇÃO ---

def initializeAccounts():
    """Inicializa o sistema de contas"""
    global _telegram_accounts, _instagram_accounts

    _load_telegram_accounts()
    _instagram_accounts = []

    logger.info(f"Sistema de contas inicializado - {len(_telegram_accounts)} contas Telegram carregadas")

# Inicializa automaticamente
if not _telegram_accounts and not _instagram_accounts:
    initializeAccounts()

# Função de debug atualizada
def debugAccounts() -> dict:
    return {
        "total_telegram_accounts": len(_telegram_accounts),
        "total_instagram_accounts": len(_instagram_accounts),
        "telegram_accounts": [
            {
                "id": acc.id,
                "botName": acc.botName,
                "tokenLength": len(acc.apiKey)
            }
            for acc in _telegram_accounts
        ],
        "instagram_accounts": [
            {
                "id": acc.id,
                "login": acc.login,
                "displayName": acc.displayName,
                "isActive": acc.isActive
            }
            for acc in _instagram_accounts
        ]
    }
