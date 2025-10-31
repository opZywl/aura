"""Workflow-driven chatbot orchestration for Telegram conversations."""

from __future__ import annotations

import json
import logging
import os
import threading
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Dict, List, Optional


logger = logging.getLogger(__name__)


def _default_workflow() -> Dict[str, Any]:
    """Return an empty workflow structure."""

    return {"nodes": [], "edges": [], "nodeCounters": {}, "updated_at": None}


class WorkflowStorage:
    """Manage workflow persistence on disk with in-memory caching."""

    def __init__(self, file_path: Optional[Path] = None) -> None:
        base_path = (
            Path(os.environ.get("AURA_WORKFLOW_FILE", "")).expanduser()
            if os.environ.get("AURA_WORKFLOW_FILE")
            else Path(__file__).resolve().parent.parent / "data" / "workflow.json"
        )

        self._file_path = file_path or base_path
        self._file_path.parent.mkdir(parents=True, exist_ok=True)

        self._lock = threading.Lock()
        self._cache: Dict[str, Any] | None = None
        self._last_mtime: float | None = None

    @property
    def path(self) -> Path:
        return self._file_path

    def load(self) -> Dict[str, Any]:
        """Load workflow data from disk."""

        with self._lock:
            try:
                if not self._file_path.exists():
                    logger.info("📄 Workflow file not found. Creating default workflow store at %s", self._file_path)
                    self._write_file(_default_workflow())

                mtime = self._file_path.stat().st_mtime
                if self._cache is not None and self._last_mtime == mtime:
                    return self._cache

                with self._file_path.open("r", encoding="utf-8") as handle:
                    data = json.load(handle)

                if not isinstance(data, dict):
                    raise ValueError("Conteúdo do workflow inválido - esperado objeto JSON")

                validated = self._ensure_structure(data)
                self._cache = validated
                self._last_mtime = mtime
                return validated
            except Exception as exc:  # pragma: no cover - logged and bubbled up
                logger.error("❌ Erro ao carregar workflow: %s", exc)
                raise

    def save(self, workflow: Dict[str, Any]) -> Dict[str, Any]:
        """Persist workflow data to disk and update cache."""

        validated = self._ensure_structure(workflow, include_timestamp=True)

        with self._lock:
            self._write_file(validated)
            self._cache = validated
            self._last_mtime = self._file_path.stat().st_mtime

        return validated

    def _write_file(self, data: Dict[str, Any]) -> None:
        tmp_path = self._file_path.with_suffix(".tmp")
        with tmp_path.open("w", encoding="utf-8") as handle:
            json.dump(data, handle, ensure_ascii=False, indent=2)
        tmp_path.replace(self._file_path)

    def _ensure_structure(self, data: Dict[str, Any], *, include_timestamp: bool = False) -> Dict[str, Any]:
        """Validate workflow payload structure."""

        nodes = data.get("nodes") if isinstance(data, dict) else None
        edges = data.get("edges") if isinstance(data, dict) else None

        if nodes is None or edges is None:
            raise ValueError("Workflow deve conter 'nodes' e 'edges'")

        if not isinstance(nodes, list) or not isinstance(edges, list):
            raise ValueError("'nodes' e 'edges' devem ser listas")

        node_counters = data.get("nodeCounters", {})
        if node_counters is None:
            node_counters = {}

        if not isinstance(node_counters, dict):
            raise ValueError("'nodeCounters' deve ser um objeto")

        payload = {
            "nodes": nodes,
            "edges": edges,
            "nodeCounters": node_counters,
            "updated_at": data.get("updated_at"),
        }

        if include_timestamp:
            from datetime import datetime, timezone

            payload["updated_at"] = datetime.now(timezone.utc).isoformat()

        return payload


@dataclass
class ChatState:
    """Runtime state for a single chat conversation."""

    current_node: Optional[str] = None
    waiting_options: Dict[str, str] = None

    def reset(self) -> None:
        self.current_node = None
        self.waiting_options = {}


class WorkflowManager:
    """Execute workflow nodes sequentially for Telegram conversations."""

    def __init__(self, storage: Optional[WorkflowStorage] = None) -> None:
        self._storage = storage or WorkflowStorage()
        self._chat_states: Dict[str, ChatState] = {}
        self._lock = threading.Lock()

    # ------------------------------------------------------------------
    # Persistence helpers
    # ------------------------------------------------------------------
    def get_workflow(self) -> Dict[str, Any]:
        return self._storage.load()

    def save_workflow(self, workflow: Dict[str, Any]) -> Dict[str, Any]:
        saved = self._storage.save(workflow)
        with self._lock:
            self._chat_states.clear()
        logger.info("🔄 Workflow atualizado - estados de chat resetados")
        return saved

    # ------------------------------------------------------------------
    # Runtime execution
    # ------------------------------------------------------------------
    def handle_message(self, chat_id: str, user_text: str) -> List[Dict[str, Any]]:
        """Process a user message and return bot responses."""

        try:
            workflow = self.get_workflow()
        except Exception:
            logger.exception("Falha ao carregar workflow durante processamento de mensagem")
            return [{"text": "⚠️ Erro ao carregar fluxo de atendimento. Tente novamente mais tarde."}]

        if not workflow["nodes"] or len(workflow["nodes"]) <= 1:
            return [{"text": "⚠️ Nenhum fluxo configurado. Configure o fluxo no construtor para iniciar o atendimento."}]

        nodes_by_id = {node.get("id"): node for node in workflow["nodes"] if isinstance(node, dict)}
        edges = [edge for edge in workflow["edges"] if isinstance(edge, dict)]

        start_node = next((node for node in workflow["nodes"] if node.get("type") == "start"), None)
        if not start_node:
            return [{"text": "⚠️ Fluxo sem nó INÍCIO configurado."}]

        with self._lock:
            state = self._chat_states.setdefault(chat_id, ChatState())
            if state.waiting_options is None:
                state.waiting_options = {}

        if state.waiting_options:
            selection = self._match_option(state.waiting_options, user_text)
            if not selection:
                options_preview = " / ".join(state.waiting_options.keys())
                return [
                    {
                        "text": f"❌ Opção inválida. Escolha uma das opções disponíveis: {options_preview}.",
                        "reply_markup": self._build_keyboard(state.waiting_options.keys()),
                    }
                ]

            state.waiting_options = {}
            next_node = nodes_by_id.get(selection)
            if not next_node:
                return [{"text": "⚠️ O fluxo está incompleto para esta opção."}]
            return self._process_from_node(state, next_node, nodes_by_id, edges)

        # Start a new traversal from the node connected to the start
        first_node = self._next_node(start_node.get("id"), nodes_by_id, edges)
        if not first_node:
            return [{"text": "⚠️ Fluxo sem conexões a partir do nó INÍCIO."}]

        state.reset()
        return self._process_from_node(state, first_node, nodes_by_id, edges)

    # ------------------------------------------------------------------
    # Internal helpers
    # ------------------------------------------------------------------
    def _process_from_node(
            self,
            state: ChatState,
            node: Dict[str, Any],
            nodes_by_id: Dict[str, Dict[str, Any]],
            edges: List[Dict[str, Any]],
    ) -> List[Dict[str, Any]]:
        responses: List[Dict[str, Any]] = []
        current = node

        while current:
            node_type = current.get("type")
            node_data = current.get("data", {}) or {}

            logger.info("🤖 Executando nó %s (%s)", current.get("id"), node_type)

            if node_type == "sendMessage":
                message = node_data.get("message") or ""
                if message:
                    responses.append({"text": message})
                current = self._next_node(current.get("id"), nodes_by_id, edges)
                continue

            if node_type == "options":
                options = node_data.get("options", []) or []
                if not options:
                    responses.append({"text": "⚠️ Nó de opções sem opções configuradas."})
                    return responses

                options_map = self._map_options(current.get("id"), options, edges, nodes_by_id)
                if not options_map:
                    responses.append({"text": "⚠️ Nenhuma conexão encontrada para as opções deste passo."})
                    return responses

                keyboard = self._build_keyboard(options_map.keys())
                message = node_data.get("message") or "Escolha uma opção:".strip()
                message_with_list = self._decorate_options_message(message, options)
                responses.append({"text": message_with_list, "reply_markup": keyboard})

                state.current_node = current.get("id")
                state.waiting_options = options_map
                return responses

            if node_type == "finalizar":
                message = node_data.get("message") or "Atendimento finalizado."
                responses.append({"text": message, "reply_markup": {"remove_keyboard": True}})
                state.reset()
                return responses

            responses.append({"text": f"⚠️ Tipo de nó não suportado: {node_type}."})
            state.reset()
            return responses

        # If loop exits without returning, ensure keyboard is cleared
        responses.append({"text": "⚠️ Fluxo terminou sem mensagem final."})
        state.reset()
        return responses

    def _next_node(
            self,
            node_id: Optional[str],
            nodes_by_id: Dict[str, Dict[str, Any]],
            edges: List[Dict[str, Any]],
    ) -> Optional[Dict[str, Any]]:
        if not node_id:
            return None

        candidates = [edge for edge in edges if edge.get("source") == node_id]
        if not candidates:
            return None

        # Prioritise edges ordered by handle index when available
        def edge_sort_key(edge: Dict[str, Any]) -> int:
            handle = edge.get("sourceHandle") or ""
            if isinstance(handle, str) and handle.startswith("output-"):
                try:
                    return int(handle.split("-")[-1])
                except ValueError:
                    return 0
            return 0

        candidates.sort(key=edge_sort_key)
        target_id = candidates[0].get("target")
        if not target_id:
            return None
        return nodes_by_id.get(target_id)

    def _map_options(
            self,
            node_id: Optional[str],
            options: List[Dict[str, Any]],
            edges: List[Dict[str, Any]],
            nodes_by_id: Dict[str, Dict[str, Any]],
    ) -> Dict[str, str]:
        if not node_id:
            return {}

        outgoing = [edge for edge in edges if edge.get("source") == node_id]

        mapping: Dict[str, str] = {}
        for index, option in enumerate(options):
            text = (option.get("text") or "").strip()
            if not text:
                continue

            handle = option.get("id")
            target_edge = None

            if handle:
                target_edge = next((edge for edge in outgoing if edge.get("sourceHandle") == handle), None)

            if target_edge is None:
                expected_handle = f"output-{index}"
                target_edge = next((edge for edge in outgoing if edge.get("sourceHandle") == expected_handle), None)

            if target_edge is None and outgoing:
                # Fallback to positional mapping when handles are missing
                target_edge = outgoing[index] if index < len(outgoing) else None

            target_id = target_edge.get("target") if target_edge else None
            if target_id and target_id in nodes_by_id:
                mapping[text] = target_id

        return mapping

    def _build_keyboard(self, options: Any) -> Dict[str, Any]:
        buttons = [[{"text": option}] for option in options]
        return {"keyboard": buttons, "resize_keyboard": True, "one_time_keyboard": True}

    def _match_option(self, options_map: Dict[str, str], user_text: str) -> Optional[str]:
        if not user_text:
            return None

        normalized = user_text.strip().casefold()
        for label, target in options_map.items():
            if normalized == label.strip().casefold():
                return target

        # Accept numeric input referencing option position
        if normalized.isdigit():
            index = int(normalized) - 1
            labels = list(options_map.keys())
            if 0 <= index < len(labels):
                return options_map[labels[index]]

        return None

    def _decorate_options_message(self, base_message: str, options: List[Dict[str, Any]]) -> str:
        lines = [base_message.strip()]
        for idx, option in enumerate(options, start=1):
            text = option.get("text") or ""
            if text:
                lines.append(f"{idx}. {text}")
        return "\n".join(lines)


workflow_manager = WorkflowManager()