"""
Gerenciador de Pesquisas de Satisfação
"""

import json
import logging
from datetime import datetime, timezone, timedelta
from typing import Dict, List, Optional, Any
from pathlib import Path

logger = logging.getLogger(__name__)

# Timezone Brasil
BRASIL_TZ = timezone(timedelta(hours=-3))

# Caminho do arquivo de respostas
SURVEY_RESPONSES_FILE = Path(__file__).parent.parent / "data" / "survey_responses.json"

class SurveyManager:
    """Gerencia pesquisas de satisfação"""

    def __init__(self):
        """Inicializa o gerenciador"""
        self._ensure_file_exists()

    def _ensure_file_exists(self):
        """Garante que o arquivo de respostas existe"""
        try:
            SURVEY_RESPONSES_FILE.parent.mkdir(parents=True, exist_ok=True)
            if not SURVEY_RESPONSES_FILE.exists():
                with open(SURVEY_RESPONSES_FILE, 'w', encoding='utf-8') as f:
                    json.dump([], f, ensure_ascii=False, indent=2)
                logger.info(f"Arquivo de respostas criado: {SURVEY_RESPONSES_FILE}")
        except Exception as e:
            logger.error(f"Erro ao criar arquivo de respostas: {e}")

    def _load_responses(self) -> List[Dict[str, Any]]:
        """Carrega todas as respostas do arquivo"""
        try:
            with open(SURVEY_RESPONSES_FILE, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception as e:
            logger.error(f"Erro ao carregar respostas: {e}")
            return []

    def _save_responses(self, responses: List[Dict[str, Any]]):
        """Salva respostas no arquivo"""
        try:
            with open(SURVEY_RESPONSES_FILE, 'w', encoding='utf-8') as f:
                json.dump(responses, f, ensure_ascii=False, indent=2)
        except Exception as e:
            logger.error(f"Erro ao salvar respostas: {e}")

    def save_response(self, user_id: str, workflow_id: str, rating: int, question: str) -> bool:
        """
        Salva uma resposta de pesquisa

        Args:
            user_id: ID do usuário
            workflow_id: ID do workflow
            rating: Nota dada (0-5)
            question: Pergunta da pesquisa

        Returns:
            True se salvou com sucesso
        """
        try:
            responses = self._load_responses()

            response = {
                "user_id": user_id,
                "workflow_id": workflow_id,
                "rating": rating,
                "question": question,
                "created_at": datetime.now(BRASIL_TZ).isoformat()
            }

            responses.append(response)
            self._save_responses(responses)

            logger.info(f"[SurveyManager] Resposta salva: {user_id} - Nota {rating}")
            return True

        except Exception as e:
            logger.error(f"Erro ao salvar resposta: {e}")
            return False

    def get_statistics(self, workflow_id: Optional[str] = None, start_date: Optional[str] = None) -> Dict[str, Any]:
        """
        Retorna estatísticas das pesquisas

        Args:
            workflow_id: Filtrar por workflow (opcional)
            start_date: Data inicial para filtrar (ISO format, opcional)

        Returns:
            Dicionário com estatísticas
        """
        try:
            responses = self._load_responses()

            # Filtrar por workflow se especificado
            if workflow_id:
                responses = [r for r in responses if r.get("workflow_id") == workflow_id]

            # Filtrar por data se especificado
            if start_date:
                start_dt = datetime.fromisoformat(start_date.replace('Z', '+00:00'))
                responses = [
                    r for r in responses
                    if datetime.fromisoformat(r.get("created_at", "").replace('Z', '+00:00')) >= start_dt
                ]

            if not responses:
                return {
                    "total_responses": 0,
                    "average_rating": 0,
                    "rating_distribution": {str(i): 0 for i in range(6)},
                    "satisfaction_percentage": 0
                }

            # Calcular estatísticas
            total = len(responses)
            ratings = [r.get("rating", 0) for r in responses]
            average = sum(ratings) / total if total > 0 else 0

            # Distribuição de notas
            distribution = {str(i): 0 for i in range(6)}
            for rating in ratings:
                distribution[str(rating)] = distribution.get(str(rating), 0) + 1

            # Porcentagem de satisfação (notas 4 e 5)
            satisfied = sum(1 for r in ratings if r >= 4)
            satisfaction_percentage = (satisfied / total * 100) if total > 0 else 0

            return {
                "total_responses": total,
                "average_rating": round(average, 2),
                "rating_distribution": distribution,
                "satisfaction_percentage": round(satisfaction_percentage, 1)
            }

        except Exception as e:
            logger.error(f"Erro ao calcular estatísticas: {e}")
            return {
                "total_responses": 0,
                "average_rating": 0,
                "rating_distribution": {str(i): 0 for i in range(6)},
                "satisfaction_percentage": 0
            }

# Instância global
survey_manager = SurveyManager()
