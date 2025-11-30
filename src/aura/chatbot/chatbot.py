"""Workflow-driven chatbot orchestration for Telegram conversations."""

from __future__ import annotations

import json
import logging
import os
import threading
from dataclasses import dataclass, field
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional
from uuid import uuid4


logger = logging.getLogger(__name__)


def _default_workflow() -> Dict[str, Any]:
    """Return an empty workflow structure."""

    return {"nodes": [], "edges": [], "nodeCounters": {}, "updated_at": None}


def _default_workshop_data() -> Dict[str, Any]:
    """Default structure for workshop sales/inventory data."""

    return {
        "inventory": [],
        "sales": [],
        "serviceOrders": [],
        "maintenanceTasks": [],
        "financialRecords": [],
        "saleRequests": [],
    }


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
                    logger.info("Workflow file not found. Creating default workflow store at %s", self._file_path)
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
                logger.error("Erro ao carregar workflow: %s", exc)
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


def _candidate_roots() -> List[Path]:
    """Return roots to search for shared workshop data files."""

    roots = [Path.cwd()]
    module_root = Path(__file__).resolve().parents[3]

    if module_root not in roots:
        roots.append(module_root)

    return roots


def _default_workshop_data_path() -> Path:
    """Prefer the same default path used by the Next.js backend."""

    candidates = [(root / "src" / "data" / "workshopData.json") for root in _candidate_roots()]

    for path in candidates:
        if path.exists():
            return path

    return candidates[0]


def _legacy_workshop_data_paths() -> List[Path]:
    """Include legacy storage locations across possible roots."""

    legacy: List[Path] = []

    for root in _candidate_roots():
        legacy.extend(
            [
                root / "src" / "aura" / "data" / "workshopData.json",
                root / "data" / "workshopData.json",
                ]
        )

    # Preserve historical module-relative defaults even if cwd changes
    legacy.append(Path(__file__).resolve().parents[2] / "data" / "workshopData.json")

    # Remove duplicates while preserving order
    seen: set[Path] = set()
    unique: List[Path] = []

    for path in legacy:
        if path in seen:
            continue
        unique.append(path)
        seen.add(path)

    return unique


WORKSHOP_DATA_PATH = (
    Path(os.environ.get("AURA_WORKSHOP_DATA_FILE", "")).expanduser()
    if os.environ.get("AURA_WORKSHOP_DATA_FILE")
    else _default_workshop_data_path()
)


def _sync_legacy_workshop_data() -> None:
    """Copy data from legacy locations when they are newer than the target file."""

    latest_path: Path | None = None
    latest_mtime = 0.0

    for legacy_path in _legacy_workshop_data_paths():
        if not legacy_path.exists():
            continue

        try:
            mtime = legacy_path.stat().st_mtime
        except OSError:
            continue

        if latest_path is None or mtime > latest_mtime:
            latest_path = legacy_path
            latest_mtime = mtime

    if latest_path is None:
        return

    try:
        target_exists = WORKSHOP_DATA_PATH.exists()
        target_mtime = WORKSHOP_DATA_PATH.stat().st_mtime if target_exists else 0

        if not target_exists or latest_mtime > target_mtime:
            content = latest_path.read_text(encoding="utf-8")
            WORKSHOP_DATA_PATH.parent.mkdir(parents=True, exist_ok=True)
            WORKSHOP_DATA_PATH.write_text(content, encoding="utf-8")
            logger.info(
                "Arquivo de dados sincronizado do caminho legado %s para %s",
                latest_path,
                WORKSHOP_DATA_PATH,
            )
    except Exception:
        logger.exception("Falha ao migrar workshopData.json do caminho legado")


def _load_workshop_data() -> Dict[str, Any]:
    """Load shared workshop data used by the vendas node."""

    WORKSHOP_DATA_PATH.parent.mkdir(parents=True, exist_ok=True)

    use_env_path = bool(os.environ.get("AURA_WORKSHOP_DATA_FILE"))

    if not use_env_path:
        _sync_legacy_workshop_data()

    if not WORKSHOP_DATA_PATH.exists():
        WORKSHOP_DATA_PATH.write_text(
            json.dumps(_default_workshop_data(), ensure_ascii=False, indent=2),
            encoding="utf-8",
        )

    try:
        with WORKSHOP_DATA_PATH.open("r", encoding="utf-8") as handle:
            data = json.load(handle)
    except Exception:
        logger.exception("Erro ao carregar workshopData.json - usando estrutura padrão")
        data = _default_workshop_data()

    default = _default_workshop_data()
    merged: Dict[str, Any] = {**default, **data}

    for key in default.keys():
        if not isinstance(merged.get(key), list):
            merged[key] = default[key]

    return merged


def _write_workshop_data(data: Dict[str, Any]) -> None:
    WORKSHOP_DATA_PATH.parent.mkdir(parents=True, exist_ok=True)
    WORKSHOP_DATA_PATH.write_text(
        json.dumps(data, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )


def _format_currency(value: Any) -> str:
    try:
        number = float(value)
    except Exception:
        number = 0.0

    formatted = f"R$ {number:,.2f}"
    return formatted.replace(",", "@").replace(".", ",").replace("@", ".")


def _format_date_iso(date_str: str) -> str:
    try:
        parsed = datetime.fromisoformat(date_str)
        return parsed.strftime("%d/%m/%Y")
    except Exception:
        return date_str


def _register_sale_request(payload: Dict[str, Any]) -> Dict[str, Any]:
    data = _load_workshop_data()
    sale_requests = list(data.get("saleRequests") or [])

    sale_type = payload.get("type")
    if sale_type not in {"estoque", "solicitacao"}:
        raise ValueError("Tipo de pedido inválido")

    status = payload.get("status") or "pendente"
    if status not in {"pendente", "confirmada", "cancelada"}:
        status = "pendente"

    price_value = payload.get("price")
    try:
        price = float(price_value) if price_value is not None else None
    except Exception:
        price = None

    item_name = payload.get("itemName") or payload.get("requestedName") or ""
    now = datetime.now(timezone.utc)

    new_request: Dict[str, Any] = {
        "id": f"pedido-{uuid4()}",
        "type": sale_type,
        "itemId": payload.get("itemId") or None,
        "itemName": item_name,
        "requestedName": payload.get("requestedName") or None,
        "price": price,
        "status": status,
        "createdAt": now.isoformat(),
        "source": payload.get("source") or "workflow",
        "notes": payload.get("notes") or None,
    }

    if sale_type == "estoque":
        deadline = now + timedelta(days=3)
        new_request["pickupDeadline"] = deadline.isoformat()
    else:
        contact_by = now + timedelta(days=7)
        new_request["contactBy"] = contact_by.isoformat()

    sale_requests.append(new_request)
    data["saleRequests"] = sale_requests

    _write_workshop_data(data)
    return new_request


def _fetch_available_inventory() -> List[Dict[str, Any]]:
    data = _load_workshop_data()
    inventory = data.get("inventory") or []
    cleaned: List[Dict[str, Any]] = []

    for item in inventory:
        normalized = dict(item)

        # Nome e ID sempre como string para evitar mensagens vazias
        normalized["id"] = str(item.get("id") or uuid4())
        normalized["name"] = str(item.get("name") or "Item")

        try:
            normalized["stockQuantity"] = int(item.get("stockQuantity", 0))
        except Exception:
            normalized["stockQuantity"] = 0

        try:
            normalized["unitPrice"] = float(item.get("unitPrice", 0))
        except Exception:
            normalized["unitPrice"] = 0.0

        cleaned.append(normalized)

    logger.info(
        "Inventário carregado de %s - %s itens listados",
        WORKSHOP_DATA_PATH,
        len(cleaned),
    )

    return cleaned


def _register_sale_transaction(
        *,
        item: Dict[str, Any],
        customer_contact: Optional[str] = None,
) -> Dict[str, Any]:
    """Register a sale in the shared JSON and reflect it in finances/stock."""

    data = _load_workshop_data()
    inventory = list(data.get("inventory") or [])
    sales = list(data.get("sales") or [])
    financial = list(data.get("financialRecords") or [])

    now = datetime.now(timezone.utc)
    sale_id = f"sale-{uuid4()}"

    try:
        unit_price = float(item.get("unitPrice", 0))
    except Exception:
        unit_price = 0.0

    sale_record = {
        "id": sale_id,
        "itemId": item.get("id"),
        "quantity": 1,
        "unitPrice": unit_price,
        "total": unit_price,
        "date": now.isoformat(),
        "customer": customer_contact,
        "notes": item.get("description") or None,
    }

    sales.append(sale_record)

    financial.append(
        {
            "id": f"finance-{uuid4()}",
            "type": "receita",
            "category": "Venda",
            "description": item.get("name") or "Venda",
            "amount": unit_price,
            "date": now.isoformat(),
            "relatedSaleId": sale_id,
        }
    )

    for inv_item in inventory:
        if inv_item.get("id") == item.get("id"):
            try:
                current_stock = int(inv_item.get("stockQuantity", 0))
            except Exception:
                current_stock = 0

            inv_item["stockQuantity"] = max(current_stock - 1, 0)
            break

    data["inventory"] = inventory
    data["sales"] = sales
    data["financialRecords"] = financial

    _write_workshop_data(data)
    return sale_record


@dataclass
class ChatState:
    """Runtime state for a single chat conversation."""

    current_node: Optional[str] = None
    waiting_options: Dict[str, str] = None
    waiting_scheduling: bool = False
    scheduling_node_id: Optional[str] = None
    scheduling_slots: List[Dict[str, Any]] = field(default_factory=list)
    waiting_cancellation_code: bool = False
    waiting_cancellation_reason: bool = False
    cancellation_code: Optional[str] = None
    waiting_sale: bool = False
    sale_node_id: Optional[str] = None
    sale_stage: Optional[str] = None
    sale_items: List[Dict[str, Any]] = None
    sale_selected: Optional[Dict[str, Any]] = None

    def reset(self) -> None:
        self.current_node = None
        self.waiting_options = {}
        self.waiting_scheduling = False
        self.scheduling_node_id = None
        self.scheduling_slots = []
        self.waiting_cancellation_code = False
        self.waiting_cancellation_reason = False
        self.cancellation_code = None
        self.waiting_sale = False
        self.sale_node_id = None
        self.sale_stage = None
        self.sale_items = []
        self.sale_selected = None


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
        logger.info("Workflow atualizado - estados de chat resetados")
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
            return [{"text": "Erro ao carregar fluxo de atendimento. Tente novamente mais tarde."}]

        if not workflow["nodes"] or len(workflow["nodes"]) <= 1:
            return [{"text": "Nenhum fluxo configurado. Configure o fluxo no construtor para iniciar o atendimento."}]

        nodes_by_id = {node.get("id"): node for node in workflow["nodes"] if isinstance(node, dict)}
        edges = [edge for edge in workflow["edges"] if isinstance(edge, dict)]

        start_node = next((node for node in workflow["nodes"] if node.get("type") == "start"), None)
        if not start_node:
            return [{"text": "Fluxo sem nó INÍCIO configurado."}]

        with self._lock:
            state = self._chat_states.setdefault(chat_id, ChatState())
            if state.waiting_options is None:
                state.waiting_options = {}

        if state.current_node:
            current_node = nodes_by_id.get(state.current_node)
            if current_node and current_node.get("type") == "agent":
                return self._handle_agent_response(state, current_node, user_text, nodes_by_id, edges)

        if (
            state.scheduling_node_id
            and (
                state.waiting_scheduling
                or state.waiting_cancellation_code
                or state.waiting_cancellation_reason
            )
        ):
            scheduling_node = nodes_by_id.get(state.scheduling_node_id)
            if scheduling_node:
                return self._handle_scheduling_response(state, scheduling_node, user_text, nodes_by_id, edges)

        if state.waiting_sale and state.sale_node_id:
            sale_node = nodes_by_id.get(state.sale_node_id)
            if sale_node:
                return self._handle_sale_response(state, sale_node, user_text, nodes_by_id, edges)
            else:
                state.waiting_sale = False
                state.sale_node_id = None

        if state.waiting_options:
            selection = self._match_option(state.waiting_options, user_text)
            if not selection:
                options_preview = " / ".join(state.waiting_options.keys())
                return [
                    {
                        "text": f"Opção inválida. Escolha uma das opções disponíveis: {options_preview}.",
                        "reply_markup": self._build_keyboard(state.waiting_options.keys()),
                    }
                ]

            state.waiting_options = {}
            next_node = nodes_by_id.get(selection)
            if not next_node:
                return [{"text": "O fluxo está incompleto para esta opção."}]
            return self._process_from_node(state, next_node, nodes_by_id, edges)

        # Start a new traversal from the node connected to the start
        first_node = self._next_node(start_node.get("id"), nodes_by_id, edges)
        if not first_node:
            return [{"text": "Fluxo sem conexões a partir do nó INÍCIO."}]

        state.reset()
        return self._process_from_node(state, first_node, nodes_by_id, edges)

    def _handle_agent_response(
            self,
            state: ChatState,
            agent_node: Dict[str, Any],
            user_text: str,
            nodes_by_id: Dict[str, Dict[str, Any]],
            edges: List[Dict[str, Any]],
    ) -> List[Dict[str, Any]]:
        """Handle user response in agent node."""

        from .agent_manager import agent_manager

        node_data = agent_node.get("data", {}) or {}
        agent_id = node_data.get("agentId")

        if not agent_id:
            logger.error("Agent node without agentId")
            return [{"text": "Erro: Agente não configurado."}]

        # Process message with agent
        response = agent_manager.process_message(agent_id, user_text)

        if not response.get("success"):
            error_msg = response.get("error", "Erro ao processar mensagem com agente")
            return [{"text": f"❌ {error_msg}"}]

        # Check if agent conversation is complete
        if response.get("is_complete"):
            # Move to next node
            state.current_node = None
            next_node = self._next_node(agent_node.get("id"), nodes_by_id, edges)

            if next_node:
                return [{"text": response.get("message", "")}] + self._process_from_node(state, next_node, nodes_by_id, edges)
            else:
                state.reset()
                return [{"text": response.get("message", ""), "reply_markup": {"remove_keyboard": True}}]

        # Continue agent conversation
        return [{"text": response.get("message", "")}]

    def _handle_scheduling_response(
            self,
            state: ChatState,
            scheduling_node: Dict[str, Any],
            user_text: str,
            nodes_by_id: Dict[str, Dict[str, Any]],
            edges: List[Dict[str, Any]],
    ) -> List[Dict[str, Any]]:
        """Handle user response to scheduling prompt."""

        from .booking_manager import booking_manager

        node_data = scheduling_node.get("data", {}) or {}
        user_input = user_text.strip().lower()

        def _build_slots_message(slots: List[Dict[str, Any]]) -> str:
            slots_text = "\n\n━━━━━━━━━━━━━━━━━━━━\n📋 *Horários Disponíveis:*\n━━━━━━━━━━━━━━━━━━━\n\n"

            for idx, slot in enumerate(slots, start=1):
                time = slot.get("time", "")
                date = slot.get("date", "")

                # Format date nicely
                try:
                    from datetime import datetime
                    date_obj = datetime.strptime(date, "%Y-%m-%d")
                    date_formatted = date_obj.strftime("%d/%m/%Y")
                except Exception:
                    date_formatted = date

                slots_text += f"⏰ *{idx}.* {time} - 📅 {date_formatted}\n"

            slots_text += "\n━━━━━━━━━━━━━━━━━━━━\n\n💡 Digite o *número* do horário desejado\n❌ Digite *'cancelar'* para cancelar um agendamento"
            base_message = node_data.get("message") or "📅 Deseja agendar um horário?"
            return base_message + slots_text

        if state.waiting_cancellation_code:
            code = user_text.strip().upper()

            # Get user_id from chat_id (assuming chat_id is the user_id)
            # In a real implementation, you'd extract this from the context
            user_id = "user_placeholder"  # This should be passed from handle_message

            booking = booking_manager.get_booking_by_code(code, user_id)

            if booking:
                state.cancellation_code = code
                state.waiting_cancellation_code = False
                state.waiting_cancellation_reason = True

                return [{
                    "text": f"✅ Código validado com sucesso!\n\n📋 Agendamento encontrado:\n⏰ Horário: {booking['time']}\n📅 Data: {booking['date']}\n\nPor favor, descreva com detalhes o motivo do cancelamento:"
                }]
            else:
                return [{
                    "text": "❌ Código inválido ou agendamento não encontrado.\n\nPor favor, verifique o código e tente novamente, ou digite 'voltar' para retornar ao menu:"
                }]

        if state.waiting_cancellation_reason:
            if user_input == "voltar":
                state.reset()
                # Restart flow
                start_node = next((node for node in nodes_by_id.values() if node.get("type") == "start"), None)
                if start_node:
                    next_node = self._next_node(start_node.get("id"), nodes_by_id, edges)
                    if next_node:
                        return self._process_from_node(state, next_node, nodes_by_id, edges)
                return [{"text": "Atendimento finalizado.", "reply_markup": {"remove_keyboard": True}}]

            reason = user_text.strip()

            if len(reason) < 10:
                return [{
                    "text": "Por favor, forneça uma descrição mais detalhada do motivo do cancelamento (mínimo 10 caracteres):"
                }]

            # Cancel the booking
            user_id = "user_placeholder"  # This should be passed from handle_message
            success = booking_manager.cancel_booking(state.cancellation_code, user_id, reason)

            if success:
                state.waiting_scheduling = False
                state.scheduling_node_id = None
                state.scheduling_slots = []
                state.waiting_cancellation_reason = False
                state.cancellation_code = None

                cancellation_msg = "✅ Cancelamento concluído com sucesso!\n\nSeu agendamento foi cancelado e o horário está novamente disponível."

                # Move to next node
                next_node = self._next_node(scheduling_node.get("id"), nodes_by_id, edges)
                if next_node:
                    return [{"text": cancellation_msg}] + self._process_from_node(state, next_node, nodes_by_id, edges)
                else:
                    state.reset()
                    return [{"text": cancellation_msg, "reply_markup": {"remove_keyboard": True}}]
            else:
                return [{
                    "text": "❌ Erro ao processar o cancelamento. Por favor, tente novamente mais tarde."
                }]

        if user_input in ["cancelar", "cancel", "não", "nao", "no", "n"]:
            state.waiting_cancellation_code = True
            return [{
                "text": "🔐 Para cancelar seu agendamento, por favor informe o código de confirmação que você recebeu:"
            }]

        # Check if user selected a time slot
        available_slots = node_data.get("availableSlots", []) or []

        workflow_id = "default_workflow"  # This should be passed from context

        filtered_slots = state.scheduling_slots or []
        if not filtered_slots:
            for slot in available_slots:
                if slot.get("available", False):
                    time = slot.get("time", "")
                    date = slot.get("date", "")
                    if not booking_manager.is_slot_booked(time, date, workflow_id):
                        filtered_slots.append(slot)

        if not filtered_slots:
            state.waiting_scheduling = False
            state.scheduling_node_id = None
            state.scheduling_slots = []

            no_slots_msg = node_data.get("noSlotsMessage") or "😔 Não há horários disponíveis no momento.\n\nPor favor, tente novamente mais tarde."
            # Move to next node
            next_node = self._next_node(scheduling_node.get("id"), nodes_by_id, edges)
            if next_node:
                return [{"text": no_slots_msg}] + self._process_from_node(state, next_node, nodes_by_id, edges)

            state.reset()
            return [{"text": no_slots_msg, "reply_markup": {"remove_keyboard": True}}]

        # Try to match by slot number (allowing inputs like "1.", "1️⃣", etc.)
        import re
        slot_match = re.search(r"(\d+)", user_input)
        if slot_match:
            slot_index = int(slot_match.group(1)) - 1
            if 0 <= slot_index < len(filtered_slots):
                slot = filtered_slots[slot_index]

                # Generate confirmation code
                import random
                import string
                code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))

                user_id = "user_placeholder"  # This should be passed from handle_message
                booking_manager.create_booking(
                    user_id=user_id,
                    code=code,
                    time=slot.get("time", ""),
                    date=slot.get("date", ""),
                    workflow_id=workflow_id
                )

                confirmation_msg = node_data.get("confirmationMessage") or "✅ Agendamento confirmado!\n\n🎫 Seu código é: {code}\n⏰ Horário: {time}\n📅 Data: {date}\n\n⚠️ Guarde este código para cancelamentos futuros!"
                confirmation_msg = confirmation_msg.replace("{code}", code)
                confirmation_msg = confirmation_msg.replace("{time}", slot.get("time", ""))
                confirmation_msg = confirmation_msg.replace("{date}", slot.get("date", ""))

                state.waiting_scheduling = False
                state.scheduling_node_id = None
                state.scheduling_slots = []

                # Move to next node
                next_node = self._next_node(scheduling_node.get("id"), nodes_by_id, edges)
                if next_node:
                    return [{"text": confirmation_msg}] + self._process_from_node(state, next_node, nodes_by_id, edges)
                else:
                    state.reset()
                    return [{"text": confirmation_msg, "reply_markup": {"remove_keyboard": True}}]

            # Out of range option
            retry_message = _build_slots_message(filtered_slots)
            return [{
                "text": f"❌ Opção inválida. Escolha um número entre 1 e {len(filtered_slots)}.\n" + retry_message,
                "reply_markup": {"remove_keyboard": True},
            }]

        # Invalid input
        retry_message = _build_slots_message(filtered_slots)
        return [{
            "text": "❌ Opção inválida.\n\nPor favor, digite o número do horário desejado ou 'cancelar' para cancelar.\n" + retry_message,
            "reply_markup": {"remove_keyboard": True},
        }]

    def _handle_sale_response(
            self,
            state: ChatState,
            sale_node: Dict[str, Any],
            user_text: str,
            nodes_by_id: Dict[str, Dict[str, Any]],
            edges: List[Dict[str, Any]],
    ) -> List[Dict[str, Any]]:
        """Handle user input for the vendas node."""

        node_data = sale_node.get("data", {}) or {}
        user_input = user_text.strip()

        if state.sale_stage == "selection":
            if not user_input.isdigit():
                return [{
                    "text": "Digite apenas o número do item desejado ou 0 para solicitar um item ausente.",
                    "reply_markup": {"remove_keyboard": True},
                }]

            option = int(user_input)

            if option == 0:
                state.sale_stage = "customName"
                return [{
                    "text": "Você deseja algum item que não está disponível? Informe o nome para registrarmos a solicitação.",
                    "reply_markup": {"remove_keyboard": True},
                }]

            items = state.sale_items or []
            if 1 <= option <= len(items):
                selected = items[option - 1]

                try:
                    stock = int(selected.get("stockQuantity", 0))
                except Exception:
                    stock = 0

                if stock <= 0:
                    return [{
                        "text": "Este item está sem estoque no momento. Escolha outro número ou digite 0 para solicitar o item.",
                        "reply_markup": {"remove_keyboard": True},
                    }]

                state.sale_stage = "phone"
                state.sale_selected = selected

                summary = (
                    f"Você escolheu {selected.get('name', 'item')} - {_format_currency(selected.get('unitPrice'))}."
                )

                prompt = (
                    "Envie seu telefone para confirmarmos a reserva do item. "
                    "O pagamento e a retirada devem ser feitos na loja em até 3 dias."
                )

                return [
                    {"text": summary, "reply_markup": {"remove_keyboard": True}},
                    {"text": prompt, "reply_markup": {"remove_keyboard": True}},
                ]

            return [{
                "text": "Opção inválida. Digite um número listado acima ou 0 para solicitar um item não disponível.",
                "reply_markup": {"remove_keyboard": True},
            }]

        if state.sale_stage == "customName":
            if not user_input:
                return [{"text": "Informe o nome do item desejado para registrar a solicitação."}]

            try:
                request = _register_sale_request({
                    "type": "solicitacao",
                    "requestedName": user_input,
                    "itemName": user_input,
                    "source": "workflow",
                })
            except Exception:
                logger.exception("Falha ao registrar solicitação de item")
                return [{"text": "Não foi possível registrar a solicitação agora. Tente novamente em instantes."}]

            contact_by = request.get("contactBy", "")
            message = "Adicionado o item desejado como solicitação. Entraremos em contato em até 7 dias referente o item."

            if contact_by:
                message = (
                    f"Solicitação registrada para {user_input}. Entraremos em contato até {_format_date_iso(contact_by)} "
                    "sobre o item."
                )

            state.waiting_sale = False
            state.sale_stage = None
            state.sale_items = []
            state.sale_node_id = None
            state.current_node = None

            state.sale_selected = None

            next_node = self._next_node(sale_node.get("id"), nodes_by_id, edges)
            if next_node:
                return [{"text": message}] + self._process_from_node(state, next_node, nodes_by_id, edges)

            state.reset()
            return [{"text": message, "reply_markup": {"remove_keyboard": True}}]

        if state.sale_stage == "phone":
            selected = state.sale_selected or {}
            contact = user_input

            try:
                request = _register_sale_request({
                    "type": "estoque",
                    "itemId": selected.get("id"),
                    "itemName": selected.get("name"),
                    "price": selected.get("unitPrice"),
                    "source": "workflow",
                    "status": "confirmada",
                    "notes": f"Telefone: {contact}",
                })
                _register_sale_transaction(item=selected, customer_contact=contact)
            except Exception:
                logger.exception("Falha ao registrar pedido de estoque")
                return [{"text": "Não foi possível registrar o pedido agora. Tente novamente em instantes."}]

            deadline = request.get("pickupDeadline", "")
            confirmation = (
                f"Pedido registrado para {selected.get('name', 'item')} no valor de "
                f"{_format_currency(selected.get('unitPrice'))}. Compareça à loja em até 3 dias"
            )

            if deadline:
                confirmation += f" (até {_format_date_iso(deadline)})"

            confirmation += " ou cancelaremos o pedido. Estaremos aguardando a retirada!"

            state.waiting_sale = False
            state.sale_stage = None
            state.sale_items = []
            state.sale_node_id = None
            state.current_node = None
            state.sale_selected = None

            next_node = self._next_node(sale_node.get("id"), nodes_by_id, edges)
            if next_node:
                return [{"text": confirmation}] + self._process_from_node(state, next_node, nodes_by_id, edges)

            state.reset()
            return [{"text": confirmation, "reply_markup": {"remove_keyboard": True}}]

        # If stage is missing, reset and continue the flow
        state.waiting_sale = False
        state.sale_stage = None
        state.sale_items = []
        state.sale_node_id = None
        state.current_node = None

        next_node = self._next_node(sale_node.get("id"), nodes_by_id, edges)
        if next_node:
            return self._process_from_node(state, next_node, nodes_by_id, edges)

        state.reset()
        return [{"text": node_data.get("fallbackMessage") or "Continuando atendimento.", "reply_markup": {"remove_keyboard": True}}]

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

            logger.info("Executando nó %s (%s)", current.get("id"), node_type)

            if node_type == "sendMessage":
                message = node_data.get("message") or ""
                if message:
                    responses.append({"text": message})
                current = self._next_node(current.get("id"), nodes_by_id, edges)
                continue

            if node_type == "agent":
                from .agent_manager import agent_manager

                agent_id = node_data.get("agentId")
                initial_message = node_data.get("initialMessage") or "Olá! Como posso ajudar você?"

                if not agent_id:
                    responses.append({"text": "Erro: Agente não configurado."})
                    return responses

                # Initialize agent conversation
                init_response = agent_manager.initialize_conversation(agent_id)

                if not init_response.get("success"):
                    error_msg = init_response.get("error", "Erro ao inicializar agente")
                    responses.append({"text": f"❌ {error_msg}"})
                    return responses

                responses.append({"text": initial_message, "reply_markup": {"remove_keyboard": True}})

                state.current_node = current.get("id")
                return responses

            if node_type == "options":
                options = node_data.get("options", []) or []
                if not options:
                    responses.append({"text": "Nó de opções sem opções configuradas."})
                    return responses

                options_map = self._map_options(current.get("id"), options, edges, nodes_by_id)
                if not options_map:
                    responses.append({"text": "Nenhuma conexão encontrada para as opções deste passo."})
                    return responses

                keyboard = self._build_keyboard(options_map.keys())
                message = node_data.get("message") or "Escolha uma opção:".strip()
                message_with_list = self._decorate_options_message(message, options)
                responses.append({"text": message_with_list, "reply_markup": keyboard})

                state.current_node = current.get("id")
                state.waiting_options = options_map
                return responses

            if node_type == "agendamento":
                from .booking_manager import booking_manager

                message = node_data.get("message") or "📅 Deseja agendar um horário?"
                available_slots = node_data.get("availableSlots", []) or []

                workflow_id = "default_workflow"  # This should be passed from context
                filtered_slots = []
                for slot in available_slots:
                    if slot.get("available", False):
                        time = slot.get("time", "")
                        date = slot.get("date", "")
                        if not booking_manager.is_slot_booked(time, date, workflow_id):
                            filtered_slots.append(slot)

                state.scheduling_slots = filtered_slots

                if not filtered_slots:
                    no_slots_msg = node_data.get("noSlotsMessage") or "😔 Não há horários disponíveis no momento.\n\nPor favor, tente novamente mais tarde."
                    responses.append({"text": no_slots_msg})
                    # Move to next node
                    current = self._next_node(current.get("id"), nodes_by_id, edges)
                    continue

                slots_text = "\n\n━━━━━━━━━━━━━━━━━━━━\n📋 *Horários Disponíveis:*\n━━━━━━━━━━━━━━━━━━━━\n\n"

                for idx, slot in enumerate(filtered_slots, start=1):
                    time = slot.get("time", "")
                    date = slot.get("date", "")

                    # Format date nicely
                    try:
                        from datetime import datetime
                        date_obj = datetime.strptime(date, "%Y-%m-%d")
                        date_formatted = date_obj.strftime("%d/%m/%Y")
                    except:
                        date_formatted = date

                    slots_text += f"⏰ *{idx}.* {time} - 📅 {date_formatted}\n"

                slots_text += "\n━━━━━━━━━━━━━━━━━━━━\n\n💡 Digite o *número* do horário desejado\n❌ Digite *'cancelar'* para cancelar um agendamento"

                full_message = message + slots_text

                responses.append({"text": full_message, "reply_markup": {"remove_keyboard": True}})

                state.waiting_scheduling = True
                state.scheduling_node_id = current.get("id")
                state.current_node = current.get("id")

                logger.info(f"Aguardando resposta de agendamento no nó: {current.get('id')}")
                return responses

            if node_type == "venda":
                intro = node_data.get("message") or "Confira os itens disponíveis para venda:"

                try:
                    available_items = _fetch_available_inventory()
                except Exception:
                    logger.exception("Falha ao carregar inventário para o nó de vendas")
                    available_items = []

                logger.info(
                    "Nó de vendas carregado (%s): %s itens elegíveis",
                    current.get("id"),
                    len(available_items),
                )

                message_lines = [intro, ""]

                if available_items:
                    for idx, item in enumerate(available_items, start=1):
                        price = _format_currency(item.get("unitPrice"))
                        stock = item.get("stockQuantity", 0)
                        message_lines.append(f"{idx}. {item.get('name', 'Item')} - {price} (estoque: {stock})")

                    message_lines.append("")
                    message_lines.append("0. Solicitar item que não está disponível")
                    message_lines.append("Digite o número do item desejado.")

                    options_keyboard = [str(i) for i in range(1, len(available_items) + 1)] + ["0"]
                    response_payload = {
                        "text": "\n".join(message_lines),
                        "reply_markup": self._build_keyboard(options_keyboard),
                        "options": options_keyboard,
                    }

                    responses.append(response_payload)

                    state.current_node = current.get("id")
                    state.waiting_sale = True
                    state.sale_node_id = current.get("id")
                    state.sale_stage = "selection"
                    state.sale_items = available_items
                    return responses

                message_lines.append(
                    "No momento não há itens em estoque. Informe o nome do item que deseja e registraremos a solicitação."
                )
                # Ainda oferecemos a opção 0 para manter o teclado ativo no fluxo de vendas
                responses.append(
                    {
                        "text": "\n".join(message_lines),
                        "reply_markup": self._build_keyboard(["0"]),
                        "options": ["0"],
                    }
                )

                state.current_node = current.get("id")
                state.waiting_sale = True
                state.sale_node_id = current.get("id")
                state.sale_stage = "customName"
                state.sale_items = []
                return responses

            if node_type == "finalizar":
                message = node_data.get("message") or "Atendimento finalizado."
                responses.append({"text": message, "reply_markup": {"remove_keyboard": True}})
                state.reset()
                return responses

            responses.append({"text": f"Tipo de nó não suportado: {node_type}."})
            state.reset()
            return responses

        # If loop exits without returning, ensure keyboard is cleared
        responses.append({"text": "Fluxo terminou sem mensagem final."})
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