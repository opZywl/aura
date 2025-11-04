import json
import os
from datetime import datetime
from typing import Dict, Optional

class AgentManager:
    """Gerencia sessões de atendimento com operadores humanos"""

    def __init__(self, sessions_file: str = "src/aura/data/agent_sessions.json"):
        self.sessions_file = sessions_file
        self._ensure_file_exists()

    def _ensure_file_exists(self):
        """Garante que o arquivo de sessões existe"""
        os.makedirs(os.path.dirname(self.sessions_file), exist_ok=True)
        if not os.path.exists(self.sessions_file):
            with open(self.sessions_file, 'w', encoding='utf-8') as f:
                json.dump({}, f)

    def _load_sessions(self) -> Dict:
        """Carrega todas as sessões ativas"""
        try:
            with open(self.sessions_file, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception as e:
            print(f"Erro ao carregar sessões: {e}")
            return {}

    def _save_sessions(self, sessions: Dict):
        """Salva todas as sessões"""
        try:
            with open(self.sessions_file, 'w', encoding='utf-8') as f:
                json.dump(sessions, f, indent=2, ensure_ascii=False)
        except Exception as e:
            print(f"Erro ao salvar sessões: {e}")

    def start_agent_session(self, user_phone: str, node_id: str) -> bool:
        """Inicia uma sessão de atendimento com operador"""
        sessions = self._load_sessions()

        sessions[user_phone] = {
            "node_id": node_id,
            "started_at": datetime.now().isoformat(),
            "status": "active",
            "operator": None
        }

        self._save_sessions(sessions)
        print(f"[AgentManager] Sessão iniciada para {user_phone} no nó {node_id}")
        return True

    def is_agent_session_active(self, user_phone: str) -> bool:
        """Verifica se há uma sessão ativa com operador"""
        sessions = self._load_sessions()
        session = sessions.get(user_phone)

        if session and session.get("status") == "active":
            return True
        return False

    def end_agent_session(self, user_phone: str) -> bool:
        """Encerra uma sessão de atendimento"""
        sessions = self._load_sessions()

        if user_phone in sessions:
            del sessions[user_phone]
            self._save_sessions(sessions)
            print(f"[AgentManager] Sessão encerrada para {user_phone}")
            return True

        return False

    def get_session_info(self, user_phone: str) -> Optional[Dict]:
        """Retorna informações da sessão ativa"""
        sessions = self._load_sessions()
        return sessions.get(user_phone)

    def assign_operator(self, user_phone: str, operator_name: str):
        """Atribui um operador à sessão"""
        sessions = self._load_sessions()

        if user_phone in sessions:
            sessions[user_phone]["operator"] = operator_name
            sessions[user_phone]["operator_assigned_at"] = datetime.now().isoformat()
            self._save_sessions(sessions)
            print(f"[AgentManager] Operador {operator_name} atribuído para {user_phone}")

    def process_operator_message(self, user_phone: str, message: str) -> Dict:
        """
        Processa mensagem do operador
        Retorna dict com success, message e session_ended
        """
        if message.strip().lower() == "/finalizar":
            success = self.end_agent_session(user_phone)
            if success:
                return {
                    "success": True,
                    "message": "✅ Atendimento encerrado.\n\nObrigado pelo contato! Se precisar de ajuda novamente, é só enviar uma mensagem.",
                    "session_ended": True
                }
            else:
                return {
                    "success": False,
                    "error": "Sessão não encontrada",
                    "session_ended": False
                }

        formatted_message = f"**Operador:** {message}"

        return {
            "success": True,
            "message": formatted_message,
            "session_ended": False
        }

agent_manager = AgentManager()
