"""
API do Bot de Componentes - Aura Dev
Executa fluxos sequencialmente seguindo os nós e conexões configuradas
LÊ 100% DO JSON REAL - SEM MOCK!
"""

import logging
import json
from typing import Dict, List, Optional, Any, Tuple
from dataclasses import dataclass, field
from datetime import datetime, timezone, timedelta
import random
import string

from src.aura.chatbot.agent_manager import agent_manager
# The following imports are not directly used in this file but might be needed by other modules.
# from src.aura.chatbot.chatbot import Chatbot
# from src.aura.chatbot.booking_manager import BookingManager

logger = logging.getLogger(__name__)

# Timezone Brasil
BRASIL_TZ = timezone(timedelta(hours=-3))

@dataclass
class NodeData:
    """Dados de um nó do fluxo"""
    label: str
    description: str = ""
    message: Optional[str] = None
    finalMessage: Optional[str] = None
    options: List[Dict[str, Any]] = field(default_factory=list)
    code: Optional[str] = None
    customId: Optional[str] = None
    availableSlots: List[Dict[str, Any]] = field(default_factory=list)
    confirmationMessage: Optional[str] = None
    cancellationMessage: Optional[str] = None
    noSlotsMessage: Optional[str] = None
    agentId: Optional[str] = None
    initialMessage: Optional[str] = None

@dataclass
class FlowNode:
    """Nó do fluxo"""
    id: str
    type: str
    data: NodeData
    position: Dict[str, float] = field(default_factory=dict)

@dataclass
class FlowEdge:
    """Conexão entre nós"""
    id: str
    source: str
    target: str
    sourceHandle: Optional[str] = None
    targetHandle: Optional[str] = None

@dataclass
class WorkflowExecution:
    """Estado de execução de um workflow"""
    workflow_id: str
    user_id: str
    current_node_id: Optional[str]
    conversation_history: List[Dict[str, Any]]
    waiting_for_input: bool
    created_at: str
    cancellation_state: Optional[Dict[str, Any]] = field(default_factory=dict) # Add cancellation_state

    def to_dict(self) -> Dict:
        return {
            "workflow_id": self.workflow_id,
            "user_id": self.user_id,
            "current_node_id": self.current_node_id,
            "conversation_history": self.conversation_history,
            "waiting_for_input": self.waiting_for_input,
            "created_at": self.created_at,
            "cancellation_state": self.cancellation_state # Include cancellation_state
        }

# Armazenamento em memória (dados REAIS do JSON)
_published_workflows: Dict[str, Dict] = {}
_active_executions: Dict[str, WorkflowExecution] = {}

def parse_workflow_data(workflow_data: Dict) -> Tuple[List[FlowNode], List[FlowEdge]]:
    """
    Parseia dados REAIS do workflow JSON em estruturas de nós e edges
    """
    try:
        flow_data = workflow_data.get("flowData", {})
        nodes_raw = flow_data.get("nodes", [])
        edges_raw = flow_data.get("edges", [])

        # Parsear nós REAIS
        nodes = []
        for node_raw in nodes_raw:
            node_data = NodeData(
                label=node_raw.get("data", {}).get("label", ""),
                description=node_raw.get("data", {}).get("description", ""),
                message=node_raw.get("data", {}).get("message"),
                finalMessage=node_raw.get("data", {}).get("finalMessage"),
                options=node_raw.get("data", {}).get("options", []),
                code=node_raw.get("data", {}).get("code"),
                customId=node_raw.get("data", {}).get("customId"),
                availableSlots=node_raw.get("data", {}).get("availableSlots", []),
                confirmationMessage=node_raw.get("data", {}).get("confirmationMessage"),
                cancellationMessage=node_raw.get("data", {}).get("cancellationMessage"),
                noSlotsMessage=node_raw.get("data", {}).get("noSlotsMessage"),
                agentId=node_raw.get("data", {}).get("agentId"),
                initialMessage=node_raw.get("data", {}).get("initialMessage")
            )

            node = FlowNode(
                id=node_raw.get("id", ""),
                type=node_raw.get("type", ""),
                data=node_data,
                position=node_raw.get("position", {})
            )
            nodes.append(node)

        # Parsear edges REAIS
        edges = []
        for edge_raw in edges_raw:
            edge = FlowEdge(
                id=edge_raw.get("id", ""),
                source=edge_raw.get("source", ""),
                target=edge_raw.get("target", ""),
                sourceHandle=edge_raw.get("sourceHandle"),
                targetHandle=edge_raw.get("targetHandle")
            )
            edges.append(edge)

        logger.info(f"Workflow REAL parseado: {len(nodes)} nós, {len(edges)} conexões")
        return nodes, edges

    except Exception as e:
        logger.error(f"Erro ao parsear workflow: {e}")
        return [], []

def register_workflow(workflow_data: Dict) -> bool:
    """
    Registra um workflow publicado com dados REAIS do JSON
    """
    try:
        workflow_id = workflow_data.get("_id", "")
        if not workflow_id:
            logger.error("Workflow sem ID")
            return False

        nodes, edges = parse_workflow_data(workflow_data)
        if not nodes:
            logger.error("Workflow sem nós")
            return False

        is_update = workflow_id in _published_workflows
        if is_update:
            logger.info(f"Workflow {workflow_id} JÁ EXISTE - Atualizando com novo JSON")

            executions_to_clear = []
            for execution_key, execution in _active_executions.items():
                if execution.workflow_id == workflow_id:
                    executions_to_clear.append(execution_key)

            for execution_key in executions_to_clear:
                del _active_executions[execution_key]
                logger.info(f"Execução ativa removida: {execution_key}")

            if executions_to_clear:
                logger.info(f"{len(executions_to_clear)} execuções ativas resetadas para o workflow {workflow_id}")
        else:
            logger.info(f"Registrando NOVO workflow: {workflow_id}")

            for other_id in list(_published_workflows.keys()):
                if other_id != workflow_id:
                    _published_workflows[other_id]["enabled"] = False
                    logger.info(f"Workflow antigo desativado: {other_id}")

        _published_workflows[workflow_id] = {
            "id": workflow_id,
            "tag": workflow_data.get("_tag", ""),
            "enabled": workflow_data.get("_enabled", True),
            "nodes": nodes,
            "edges": edges,
            "created_at": workflow_data.get("_insertedAt", datetime.now(BRASIL_TZ).isoformat()),
            "updated_at": datetime.now(BRASIL_TZ).isoformat()  # Add updated_at timestamp
        }

        logger.info(f"Workflow REAL {'ATUALIZADO' if is_update else 'REGISTRADO'}: {workflow_id}")
        logger.info(f"    Nós: {len(nodes)}")
        logger.info(f"    Conexões: {len(edges)}")
        logger.info(f"    Tag: {workflow_data.get('_tag', 'Sem tag')}")
        logger.info(f"    Enabled: {workflow_data.get('_enabled', True)}")

        # Log node details for debugging
        for node in nodes:
            logger.info(f"    Nó: {node.id} ({node.type}) - {node.data.label}")
            if node.type == "options"and node.data.options:
                for i, opt in enumerate(node.data.options):
                    logger.info(f"      {i+1}. {opt.get('text', '')}")

        return True

    except Exception as e:
        logger.error(f"Erro ao registrar workflow: {e}")
        return False

def set_workflow_status(workflow_id: str, enabled: bool) -> bool:
    """
    Ativa ou desativa um workflow
    """
    try:
        if workflow_id not in _published_workflows:
            logger.error(f"Workflow não encontrado: {workflow_id}")
            return False

        _published_workflows[workflow_id]["enabled"] = enabled
        logger.info(f"Workflow {workflow_id} {'ativado' if enabled else 'desativado'}")
        return True

    except Exception as e:
        logger.error(f"Erro ao alterar status do workflow: {e}")
        return False

def find_next_node(workflow_id: str, current_node_id: str, option_index: Optional[int] = None) -> Optional[FlowNode]:
    """
    Encontra o próximo nó no fluxo REAL baseado nas conexões do JSON
    """
    try:
        workflow = _published_workflows.get(workflow_id)
        if not workflow:
            logger.error(f"Workflow não encontrado: {workflow_id}")
            return None

        edges: List[FlowEdge] = workflow["edges"]
        nodes: List[FlowNode] = workflow["nodes"]

        # Filtrar edges que saem do nó atual
        outgoing_edges = [e for e in edges if e.source == current_node_id]

        if not outgoing_edges:
            logger.info(f"Nenhuma conexão de saída do nó {current_node_id}")
            return None

        # Se option_index foi fornecido, procurar pela edge específica
        if option_index is not None:
            target_handle = f"output-{option_index}"
            target_edge = next((e for e in outgoing_edges if e.sourceHandle == target_handle), None)

            if not target_edge:
                logger.warning(f"Edge não encontrada para opção {option_index}")
                return None
        else:
            # Pegar a primeira edge disponível
            target_edge = outgoing_edges[0]

        # Encontrar o nó de destino
        next_node = next((n for n in nodes if n.id == target_edge.target), None)

        if next_node:
            logger.info(f"Próximo nó: {next_node.id} ({next_node.type})")
        else:
            logger.warning(f"Nó de destino não encontrado: {target_edge.target}")

        return next_node

    except Exception as e:
        logger.error(f"Erro ao encontrar próximo nó: {e}")
        return None

def start_workflow_execution(workflow_id: str, user_id: str) -> Optional[WorkflowExecution]:
    """
    Inicia a execução de um workflow REAL para um usuário
    """
    try:
        workflow = _published_workflows.get(workflow_id)
        if not workflow:
            logger.error(f"Workflow não encontrado: {workflow_id}")
            return None

        if not workflow["enabled"]:
            logger.error(f"Workflow desabilitado: {workflow_id}")
            return None

        # Criar nova execução
        execution = WorkflowExecution(
            workflow_id=workflow_id,
            user_id=user_id,
            current_node_id=None,
            conversation_history=[],
            waiting_for_input=False,
            created_at=datetime.now(BRASIL_TZ).isoformat()
        )

        # Salvar execução
        execution_key = f"{user_id}:{workflow_id}"
        _active_executions[execution_key] = execution

        logger.info(f"Execução iniciada: {execution_key}")
        return execution

    except Exception as e:
        logger.error(f"Erro ao iniciar execução: {e}")
        return None

def get_execution(user_id: str, workflow_id: str) -> Optional[WorkflowExecution]:
    """
    Recupera a execução ativa de um usuário
    """
    execution_key = f"{user_id}:{workflow_id}"
    return _active_executions.get(execution_key)

def process_user_message(user_id: str, workflow_id: str, message: str) -> Dict[str, Any]:
    """
    Processa mensagem do usuário e retorna resposta do bot
    EXECUTA O FLUXO REAL BASEADO NO JSON - SEM MOCK!

    Retorna uma lista de mensagens para enviar sequencialmente
    """
    try:
        # from src.aura.chatbot.chatbot import Chatbot # Not used directly in this function
        from src.aura.chatbot.booking_manager import booking_manager
        # from src.aura.chatbot.agent_manager import agent_manager # Already imported at the top

        logger.info(f"Processando mensagem de {user_id}: '{message}'")

        if agent_manager.is_agent_session_active(user_id):
            # Usuário está em atendimento com operador
            # Verificar se é comando do operador
            if message.strip().lower() == "/finalizar":
                # Operador finalizou o atendimento
                agent_manager.end_agent_session(user_id)

                # Resetar o chatbot para começar do início
                # Assuming chatbot instance is available globally or passed as parameter
                # For now, we'll just reset the execution state
                reset_conversation(user_id, workflow_id) # This effectively resets the bot's context

                return {
                    "success": True,
                    "messages": [{
                        "text": "Atendimento finalizado. Obrigado por entrar em contato!",
                        "options": []
                    }],
                    "requires_input": False,
                    "is_final": True
                }
            else:
                # Mensagem do usuário durante atendimento com operador
                # Não processar com bot, apenas retornar sucesso
                # (o operador verá a mensagem e responderá manualmente)
                # The message will be handled by the agent_manager directly.
                # We just need to acknowledge receipt by the system.
                return {
                    "success": True,
                    "messages": [], # No bot messages to send
                    "requires_input": False, # Bot is not waiting for input
                    "is_final": False
                }

        # Verificar se há execução ativa
        execution = get_execution(user_id, workflow_id)

        # Se não há execução, iniciar nova
        if not execution:
            logger.info(f"Iniciando nova execução para {user_id}")
            execution = start_workflow_execution(workflow_id, user_id)
            if not execution:
                return {
                    "success": False,
                    "messages": [{
                        "text": "Erro ao iniciar fluxo",
                        "options": []
                    }],
                    "requires_input": False,
                    "is_final": True
                }

        # Adicionar mensagem do usuário ao histórico
        execution.conversation_history.append({
            "role": "user",
            "content": message,
            "timestamp": datetime.now(BRASIL_TZ).isoformat()
        })

        workflow = _published_workflows.get(workflow_id)
        if not workflow:
            return {
                "success": False,
                "messages": [{
                    "text": "Workflow não encontrado",
                    "options": []
                }],
                "requires_input": False,
                "is_final": True
            }

        nodes: List[FlowNode] = workflow["nodes"]
        messages_to_send = []
        requires_input = False
        is_final = False
        node_type = None # To keep track of current node type

        if execution.current_node_id:
            current_node = next((n for n in nodes if n.id == execution.current_node_id), None)
            if current_node and current_node.type == "agent":
                agent_id = current_node.data.agentId

                if not agent_id:
                    return {
                        "success": False,
                        "messages": [{
                            "text": "Erro: Agente não configurado.",
                            "options": []
                        }],
                        "requires_input": False,
                        "is_final": True
                    }

                # Process message with agent
                response = agent_manager.process_message(agent_id, user_id, message)

                if not response.get("success"):
                    error_msg = response.get("error", "Erro ao processar mensagem com agente")
                    return {
                        "success": True,
                        "messages": [{
                            "text": f"❌ {error_msg}",
                            "options": []
                        }],
                        "requires_input": False, # Bot is not waiting, agent is
                        "is_final": False
                    }

                agent_message = response.get("message", "")

                messages_to_send.append({
                    "text": agent_message,
                    "options": []
                })

                execution.conversation_history.append({
                    "role": "assistant",
                    "content": agent_message,
                    "timestamp": datetime.now(BRASIL_TZ).isoformat()
                })

                # Check if agent conversation is complete
                if response.get("is_complete"):
                    execution.waiting_for_input = False

                    # Move to next node
                    next_node = find_next_node(workflow_id, current_node.id)
                    if next_node:
                        execution.current_node_id = next_node.id
                        # Continue processing from next node
                        current_node = next_node
                        while current_node:
                            logger.info(f"Processando nó: {current_node.id} ({current_node.type})")

                            if current_node.type == "sendMessage":
                                msg_text = current_node.data.message or "Mensagem não configurada"
                                messages_to_send.append({
                                    "text": msg_text,
                                    "options": []
                                })

                                execution.conversation_history.append({
                                    "role": "assistant",
                                    "content": msg_text,
                                    "timestamp": datetime.now(BRASIL_TZ).isoformat()
                                })

                                execution.current_node_id = current_node.id
                                current_node = find_next_node(workflow_id, current_node.id)

                            elif current_node.type == "options":
                                msg_text = current_node.data.message or "Escolha uma opção:"
                                options = current_node.data.options or []

                                if options:
                                    options_text = "\n\n" + "\n".join([f"{i+1}. {opt.get('text', '')}"for i, opt in enumerate(options)])
                                    full_message = msg_text + options_text
                                else:
                                    full_message = msg_text

                                messages_to_send.append({
                                    "text": full_message,
                                    "options": []
                                })

                                execution.conversation_history.append({
                                    "role": "assistant",
                                    "content": full_message,
                                    "timestamp": datetime.now(BRASIL_TZ).isoformat()
                                })

                                execution.current_node_id = current_node.id
                                execution.waiting_for_input = True

                                return {
                                    "success": True,
                                    "messages": messages_to_send,
                                    "requires_input": True,
                                    "is_final": False
                                }

                            elif current_node.type == "finalizar":
                                msg_text = current_node.data.finalMessage or current_node.data.message or ""

                                if msg_text.strip():
                                    messages_to_send.append({
                                        "text": msg_text,
                                        "options": []
                                    })

                                    execution.conversation_history.append({
                                        "role": "assistant",
                                        "content": msg_text,
                                        "timestamp": datetime.now(BRASIL_TZ).isoformat()
                                    })

                                reset_conversation(user_id, workflow_id)

                                return {
                                    "success": True,
                                    "messages": messages_to_send,
                                    "requires_input": False,
                                    "is_final": True,
                                    "archive_conversation": True
                                }

                            else:
                                execution.current_node_id = current_node.id
                                current_node = find_next_node(workflow_id, current_node.id)

                        # End of flow
                        reset_conversation(user_id, workflow_id)
                        return {
                            "success": True,
                            "messages": messages_to_send,
                            "requires_input": False,
                            "is_final": True,
                            "archive_conversation": True
                        }
                    else:
                        reset_conversation(user_id, workflow_id)
                        return {
                            "success": True,
                            "messages": messages_to_send,
                            "requires_input": False,
                            "is_final": True,
                            "archive_conversation": True
                        }

                # Continue agent conversation
                return {
                    "success": True,
                    "messages": messages_to_send,
                    "requires_input": True, # Bot is not waiting, agent is
                    "is_final": False,
                    "node_type": "agent"
                }

        # Se não há nó atual, começar pelo START
        if not execution.current_node_id:
            start_node = next((n for n in nodes if n.type == "start"), None)
            if not start_node:
                return {
                    "success": False,
                    "messages": [{
                        "text": "Nó de início não encontrado",
                        "options": []
                    }],
                    "requires_input": False,
                    "is_final": True
                }

            execution.current_node_id = start_node.id
            logger.info(f"Iniciando do nó START: {start_node.id}")

            # Avançar automaticamente do START
            current_node = find_next_node(workflow_id, start_node.id)

            # Processar todos os nós até encontrar um que requer input ou é final
            while current_node:
                execution.current_node_id = current_node.id
                logger.info(f"Processando nó: {current_node.id} ({current_node.type})")

                if current_node.type == "sendMessage":
                    # Coletar mensagem para enviar
                    msg_text = current_node.data.message or "Mensagem não configurada"
                    messages_to_send.append({
                        "text": msg_text,
                        "options": []
                    })
                    logger.info(f"Mensagem coletada: {msg_text[:50]}...")

                    # Adicionar ao histórico
                    execution.conversation_history.append({
                        "role": "assistant",
                        "content": msg_text,
                        "timestamp": datetime.now(BRASIL_TZ).isoformat()
                    })

                    # Avançar para próximo nó
                    current_node = find_next_node(workflow_id, current_node.id)

                elif current_node.type == "options":
                    # Nó de opções - requer input do usuário
                    msg_text = current_node.data.message or "Escolha uma opção:"
                    options = current_node.data.options or []

                    # Build the full message with numbered options
                    if options:
                        options_text = "\n\n" + "\n".join([f"{i+1}. {opt.get('text', '')}"for i, opt in enumerate(options)])
                        full_message = msg_text + options_text
                    else:
                        full_message = msg_text

                    messages_to_send.append({
                        "text": full_message,
                        "options": []
                    })

                    execution.conversation_history.append({
                        "role": "assistant",
                        "content": full_message,
                        "timestamp": datetime.now(BRASIL_TZ).isoformat()
                    })

                    execution.waiting_for_input = True
                    logger.info(f"Aguardando input do usuário no nó: {current_node.id}")

                    return {
                        "success": True,
                        "messages": messages_to_send,
                        "requires_input": True,
                        "is_final": False
                    }

                elif current_node.type == "agent":
                    agent_id = current_node.data.agentId
                    initial_message = current_node.data.initialMessage or "Olá! Como posso ajudar você?"

                    if not agent_id:
                        messages_to_send.append({
                            "text": "Erro: Agente não configurado.",
                            "options": []
                        })
                        return {
                            "success": False,
                            "messages": messages_to_send,
                            "requires_input": False,
                            "is_final": True
                        }

                    # Initialize agent conversation
                    init_response = agent_manager.initialize_conversation(agent_id, user_id)

                    if not init_response.get("success"):
                        error_msg = init_response.get("error", "Erro ao inicializar agente")
                        messages_to_send.append({
                            "text": f"❌ {error_msg}",
                            "options": []
                        })
                        return {
                            "success": False,
                            "messages": messages_to_send,
                            "requires_input": False,
                            "is_final": True
                        }

                    messages_to_send.append({
                        "text": initial_message,
                        "options": []
                    })

                    execution.conversation_history.append({
                        "role": "assistant",
                        "content": initial_message,
                        "timestamp": datetime.now(BRASIL_TZ).isoformat()
                    })

                    execution.waiting_for_input = True
                    logger.info(f"Aguardando input do usuário no nó de agente: {current_node.id}")

                    return {
                        "success": True,
                        "messages": messages_to_send,
                        "requires_input": True,
                        "is_final": False,
                        "node_type": "agent"
                    }

                elif current_node.type == "agendamento":
                    msg_text = current_node.data.message or "📅 Deseja agendar um horário?"
                    available_slots = current_node.data.availableSlots or []

                    # Filter out booked slots
                    filtered_slots = []
                    for slot in available_slots:
                        if slot.get("available", False):
                            time = slot.get("time", "")
                            date = slot.get("date", "")
                            if not booking_manager.is_slot_booked(time, date, workflow_id):
                                filtered_slots.append(slot)

                    if not filtered_slots:
                        no_slots_msg = current_node.data.noSlotsMessage or "😔 Não há horários disponíveis no momento.\n\nPor favor, tente novamente mais tarde."
                        messages_to_send.append({
                            "text": no_slots_msg,
                            "options": []
                        })

                        execution.conversation_history.append({
                            "role": "assistant",
                            "content": no_slots_msg,
                            "timestamp": datetime.now(BRASIL_TZ).isoformat()
                        })

                        # Move to next node
                        current_node = find_next_node(workflow_id, current_node.id)
                        continue

                    slots_text = "\n\n━━━━━━━━━━━━━━━━━━━━\n📋 *Horários Disponíveis:*\n━━━━━━━━━━━━━━━━━━━━\n\n"

                    for idx, slot in enumerate(filtered_slots, start=1):
                        time = slot.get("time", "")
                        date = slot.get("date", "")

                        # Format date nicely
                        try:
                            date_obj = datetime.strptime(date, "%Y-%m-%d")
                            date_formatted = date_obj.strftime("%d/%m/%Y")
                        except:
                            date_formatted = date

                        slots_text += f"⏰ *{idx}.* {time} - 📅 {date_formatted}\n"

                    slots_text += "\n━━━━━━━━━━━━━━━━━━━━\n\n💡 Digite o *número* do horário desejado\n❌ Digite *'cancelar'* para cancelar um agendamento"

                    full_message = msg_text + slots_text

                    messages_to_send.append({
                        "text": full_message,
                        "options": []
                    })

                    execution.conversation_history.append({
                        "role": "assistant",
                        "content": full_message,
                        "timestamp": datetime.now(BRASIL_TZ).isoformat()
                    })

                    execution.waiting_for_input = True
                    logger.info(f"Aguardando resposta de agendamento no nó: {current_node.id}")

                    return {
                        "success": True,
                        "messages": messages_to_send,
                        "requires_input": True,
                        "is_final": False,
                        "node_type": "agendamento"
                    }

                elif current_node.type == "finalizar":
                    msg_text = current_node.data.finalMessage or current_node.data.message or ""

                    # Só adicionar mensagem se houver texto
                    if msg_text.strip():
                        messages_to_send.append({
                            "text": msg_text,
                            "options": []
                        })

                        execution.conversation_history.append({
                            "role": "assistant",
                            "content": msg_text,
                            "timestamp": datetime.now(BRASIL_TZ).isoformat()
                        })

                    logger.info(f"Fluxo finalizado no nó: {current_node.id}")
                    reset_conversation(user_id, workflow_id)

                    return {
                        "success": True,
                        "messages": messages_to_send,
                        "requires_input": False,
                        "is_final": True,
                        "archive_conversation": True
                    }

                elif current_node.type == "agentes":
                    initial_message = current_node.data.initialMessage or "Encaminhando para o operador disponível... Por favor aguarde."

                    # Iniciar sessão de agente
                    agent_manager.start_agent_session(user_id, current_node.id)

                    # Enviar mensagem de transferência
                    messages_to_send.append({
                        "text": initial_message,
                        "options": []
                    })

                    # Marcar que não requer mais input do bot (operador vai responder)
                    execution.waiting_for_input = False # Bot is no longer waiting for user input
                    is_final = False  # Not final, but bot stops processing user messages

                    logger.info(f"Conversa transferida para operador - Nó: {current_node.id}")

                    # Since the bot is done processing this turn and handing over to an agent,
                    # we should return the current messages and indicate no further bot input is needed.
                    return {
                        "success": True,
                        "messages": messages_to_send,
                        "requires_input": False, # Bot is not waiting for input from the user
                        "is_final": False # The conversation is not over, but handed off.
                    }

                else:
                    # Outros tipos de nó - avançar automaticamente
                    logger.info(f"Pulando nó do tipo: {current_node.type}")
                    current_node = find_next_node(workflow_id, current_node.id)

            # Se chegou aqui, não há mais nós - finalizar
            logger.info(f"Fim do fluxo - sem mais nós")
            reset_conversation(user_id, workflow_id)

            return {
                "success": True,
                "messages": messages_to_send,
                "requires_input": False,
                "is_final": True,
                "archive_conversation": True
            }

        # Se estamos aguardando input do usuário
        if execution.waiting_for_input:
            current_node = next((n for n in nodes if n.id == execution.current_node_id), None)
            if not current_node:
                return {
                    "success": False,
                    "messages": [{
                        "text": "Nó atual não encontrado",
                        "options": []
                    }],
                    "requires_input": False,
                    "is_final": True
                }

            if current_node.type == "agendamento":
                user_input = message.strip().lower()

                if user_input in ["cancelar", "cancel", "não", "nao", "no", "n"]:
                    # Ask for cancellation code
                    code_request_msg = "🔐 Para cancelar seu agendamento, por favor informe o código de confirmação que você recebeu:"

                    messages_to_send.append({
                        "text": code_request_msg,
                        "options": []
                    })

                    execution.conversation_history.append({
                        "role": "assistant",
                        "content": code_request_msg,
                        "timestamp": datetime.now(BRASIL_TZ).isoformat()
                    })

                    # Set state to wait for cancellation code
                    execution.waiting_for_input = True
                    # Store in execution that we're waiting for cancellation code
                    if not hasattr(execution, 'cancellation_state'):
                        execution.cancellation_state = {}
                    execution.cancellation_state['waiting_code'] = True

                    return {
                        "success": True,
                        "messages": messages_to_send,
                        "requires_input": True,
                        "is_final": False,
                        "node_type": "agendamento_cancellation"
                    }

                if hasattr(execution, 'cancellation_state') and execution.cancellation_state.get('waiting_code'):
                    code = message.strip().upper()
                    booking = booking_manager.get_booking_by_code(code, user_id)

                    if booking:
                        # Valid code - ask for reason
                        execution.cancellation_state['waiting_code'] = False
                        execution.cancellation_state['waiting_reason'] = True
                        execution.cancellation_state['code'] = code

                        reason_request_msg = f"✅ Código validado com sucesso!\n\n📋 Agendamento encontrado:\n⏰ Horário: {booking['time']}\n📅 Data: {booking['date']}\n\nPor favor, descreva com detalhes o motivo do cancelamento:"

                        messages_to_send.append({
                            "text": reason_request_msg,
                            "options": []
                        })

                        execution.conversation_history.append({
                            "role": "assistant",
                            "content": reason_request_msg,
                            "timestamp": datetime.now(BRASIL_TZ).isoformat()
                        })

                        return {
                            "success": True,
                            "messages": messages_to_send,
                            "requires_input": True,
                            "is_final": False,
                            "node_type": "agendamento_cancellation"
                        }
                    else:
                        error_msg = "❌ Código inválido ou agendamento não encontrado.\n\nPor favor, verifique o código e tente novamente:"

                        return {
                            "success": True,
                            "messages": [{
                                "text": error_msg,
                                "options": []
                            }],
                            "requires_input": True,
                            "is_final": False,
                            "node_type": "agendamento_cancellation"
                        }

                if hasattr(execution, 'cancellation_state') and execution.cancellation_state.get('waiting_reason'):
                    reason = message.strip()

                    if len(reason) < 10:
                        return {
                            "success": True,
                            "messages": [{
                                "text": "Por favor, forneça uma descrição mais detalhada do motivo do cancelamento (mínimo 10 caracteres):",
                                "options": []
                            }],
                            "requires_input": True,
                            "is_final": False,
                            "node_type": "agendamento_cancellation"
                        }

                    # Cancel the booking
                    code = execution.cancellation_state['code']
                    success = booking_manager.cancel_booking(code, user_id, reason)

                    if success:
                        cancellation_msg = "✅ Cancelamento concluído com sucesso!\n\nSeu agendamento foi cancelado e o horário está novamente disponível."

                        messages_to_send.append({
                            "text": cancellation_msg,
                            "options": []
                        })

                        execution.conversation_history.append({
                            "role": "assistant",
                            "content": cancellation_msg,
                            "timestamp": datetime.now(BRASIL_TZ).isoformat()
                        })

                        execution.waiting_for_input = False
                        execution.cancellation_state = {}

                        # Move to next node
                        next_node = find_next_node(workflow_id, current_node.id)
                        if next_node:
                            execution.current_node_id = next_node.id
                            # Continue processing from next node
                            current_node = next_node
                            while current_node:
                                logger.info(f"Processando nó: {current_node.id} ({current_node.type})")

                                if current_node.type == "sendMessage":
                                    msg_text = current_node.data.message or "Mensagem não configurada"
                                    messages_to_send.append({
                                        "text": msg_text,
                                        "options": []
                                    })

                                    execution.conversation_history.append({
                                        "role": "assistant",
                                        "content": msg_text,
                                        "timestamp": datetime.now(BRASIL_TZ).isoformat()
                                    })

                                    execution.current_node_id = current_node.id
                                    current_node = find_next_node(workflow_id, current_node.id)

                                elif current_node.type == "options":
                                    msg_text = current_node.data.message or "Escolha uma opção:"
                                    options = current_node.data.options or []

                                    if options:
                                        options_text = "\n\n" + "\n".join([f"{i+1}. {opt.get('text', '')}"for i, opt in enumerate(options)])
                                        full_message = msg_text + options_text
                                    else:
                                        full_message = msg_text

                                    messages_to_send.append({
                                        "text": full_message,
                                        "options": []
                                    })

                                    execution.conversation_history.append({
                                        "role": "assistant",
                                        "content": full_message,
                                        "timestamp": datetime.now(BRASIL_TZ).isoformat()
                                    })

                                    execution.current_node_id = current_node.id
                                    execution.waiting_for_input = True

                                    return {
                                        "success": True,
                                        "messages": messages_to_send,
                                        "requires_input": True,
                                        "is_final": False
                                    }

                                elif current_node.type == "finalizar":
                                    msg_text = current_node.data.finalMessage or current_node.data.message or ""

                                    if msg_text.strip():
                                        messages_to_send.append({
                                            "text": msg_text,
                                            "options": []
                                        })

                                        execution.conversation_history.append({
                                            "role": "assistant",
                                            "content": msg_text,
                                            "timestamp": datetime.now(BRASIL_TZ).isoformat()
                                        })

                                    reset_conversation(user_id, workflow_id)

                                    return {
                                        "success": True,
                                        "messages": messages_to_send,
                                        "requires_input": False,
                                        "is_final": True,
                                        "archive_conversation": True
                                    }

                                else:
                                    execution.current_node_id = current_node.id
                                    current_node = find_next_node(workflow_id, current_node.id)

                            # End of flow
                            reset_conversation(user_id, workflow_id)
                            return {
                                "success": True,
                                "messages": messages_to_send,
                                "requires_input": False,
                                "is_final": True,
                                "archive_conversation": True
                            }
                        else:
                            reset_conversation(user_id, workflow_id)
                            return {
                                "success": True,
                                "messages": messages_to_send,
                                "requires_input": False,
                                "is_final": True,
                                "archive_conversation": True
                            }
                    else:
                        error_msg = "❌ Houve um erro ao tentar cancelar o agendamento. Por favor, tente novamente mais tarde."

                        return {
                            "success": True,
                            "messages": [{
                                "text": error_msg,
                                "options": []
                            }],
                            "requires_input": False, # User can't retry cancellation immediately
                            "is_final": False,
                            "node_type": "agendamento" # Go back to scheduling options if possible
                        }


                available_slots = current_node.data.availableSlots or []

                # Filter out booked slots
                filtered_slots = []
                for slot in available_slots:
                    if slot.get("available", False):
                        time = slot.get("time", "")
                        date = slot.get("date", "")
                        if not booking_manager.is_slot_booked(time, date, workflow_id):
                            filtered_slots.append(slot)

                if user_input.isdigit():
                    slot_index = int(user_input) - 1

                    if 0 <= slot_index < len(filtered_slots):
                        selected_slot = filtered_slots[slot_index]

                        # Generate confirmation code
                        code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))

                        booking_manager.create_booking(
                            user_id=user_id,
                            code=code,
                            time=selected_slot.get("time", ""),
                            date=selected_slot.get("date", ""),
                            workflow_id=workflow_id
                        )

                        confirmation_msg = current_node.data.confirmationMessage or "✅ Agendamento confirmado!\n\n🎫 Seu código é: {code}\n⏰ Horário: {time}\n📅 Data: {date}\n\n⚠️ Guarde este código para cancelamentos futuros!"
                        confirmation_msg = confirmation_msg.replace("{code}", code)
                        confirmation_msg = confirmation_msg.replace("{time}", selected_slot.get("time", ""))
                        confirmation_msg = confirmation_msg.replace("{date}", selected_slot.get("date", ""))

                        messages_to_send.append({
                            "text": confirmation_msg,
                            "options": []
                        })

                        execution.conversation_history.append({
                            "role": "assistant",
                            "content": confirmation_msg,
                            "timestamp": datetime.now(BRASIL_TZ).isoformat()
                        })

                        execution.waiting_for_input = False

                        # Move to next node
                        next_node = find_next_node(workflow_id, current_node.id)
                        if next_node:
                            execution.current_node_id = next_node.id
                            # Continue processing
                            current_node = next_node
                            while current_node:
                                logger.info(f"Processando nó: {current_node.id} ({current_node.type})")

                                if current_node.type == "sendMessage":
                                    msg_text = current_node.data.message or "Mensagem não configurada"
                                    messages_to_send.append({
                                        "text": msg_text,
                                        "options": []
                                    })

                                    execution.conversation_history.append({
                                        "role": "assistant",
                                        "content": msg_text,
                                        "timestamp": datetime.now(BRASIL_TZ).isoformat()
                                    })

                                    execution.current_node_id = current_node.id
                                    current_node = find_next_node(workflow_id, current_node.id)

                                elif current_node.type == "options":
                                    msg_text = current_node.data.message or "Escolha uma opção:"
                                    options = current_node.data.options or []

                                    if options:
                                        options_text = "\n\n" + "\n".join([f"{i+1}. {opt.get('text', '')}"for i, opt in enumerate(options)])
                                        full_message = msg_text + options_text
                                    else:
                                        full_message = msg_text

                                    messages_to_send.append({
                                        "text": full_message,
                                        "options": []
                                    })

                                    execution.conversation_history.append({
                                        "role": "assistant",
                                        "content": full_message,
                                        "timestamp": datetime.now(BRASIL_TZ).isoformat()
                                    })

                                    execution.current_node_id = current_node.id
                                    execution.waiting_for_input = True

                                    return {
                                        "success": True,
                                        "messages": messages_to_send,
                                        "requires_input": True,
                                        "is_final": False
                                    }

                                elif current_node.type == "agendamento":
                                    msg_text = current_node.data.message or "Deseja agendar um horário?"
                                    available_slots = current_node.data.availableSlots or []

                                    # Filter out booked slots
                                    filtered_slots = []
                                    for slot in available_slots:
                                        if slot.get("available", False):
                                            time = slot.get("time", "")
                                            date = slot.get("date", "")
                                            if not booking_manager.is_slot_booked(time, date, workflow_id):
                                                filtered_slots.append(slot)

                                    if not filtered_slots:
                                        no_slots_msg = current_node.data.noSlotsMessage or "Não há horários disponíveis no momento."
                                        messages_to_send.append({
                                            "text": no_slots_msg,
                                            "options": []
                                        })

                                        execution.conversation_history.append({
                                            "role": "assistant",
                                            "content": no_slots_msg,
                                            "timestamp": datetime.now(BRASIL_TZ).isoformat()
                                        })

                                        execution.current_node_id = current_node.id
                                        current_node = find_next_node(workflow_id, current_node.id)
                                        continue

                                    # Build message with available slots
                                    slots_text = "\n\nHorários Disponíveis:\n"
                                    slot_number = 1
                                    for slot in available_slots:
                                        if slot.get("available", False): # Redundant check, but for clarity
                                            time = slot.get("time", "")
                                            date = slot.get("date", "")
                                            date_str = f" - {date}" if date else ""
                                            slots_text += f"{slot_number}. {time}{date_str}\n"
                                            slot_number += 1

                                    full_message = msg_text + slots_text + "\n\nDigite o número do horário desejado ou 'cancelar' para cancelar."

                                    messages_to_send.append({
                                        "text": full_message,
                                        "options": []
                                    })

                                    execution.conversation_history.append({
                                        "role": "assistant",
                                        "content": full_message,
                                        "timestamp": datetime.now(BRASIL_TZ).isoformat()
                                    })

                                    execution.current_node_id = current_node.id
                                    execution.waiting_for_input = True

                                    return {
                                        "success": True,
                                        "messages": messages_to_send,
                                        "requires_input": True,
                                        "is_final": False,
                                        "node_type": "agendamento"
                                    }

                                elif current_node.type == "finalizar":
                                    msg_text = current_node.data.finalMessage or current_node.data.message or ""

                                    if msg_text.strip():
                                        messages_to_send.append({
                                            "text": msg_text,
                                            "options": []
                                        })

                                        execution.conversation_history.append({
                                            "role": "assistant",
                                            "content": msg_text,
                                            "timestamp": datetime.now(BRASIL_TZ).isoformat()
                                        })

                                    reset_conversation(user_id, workflow_id)

                                    return {
                                        "success": True,
                                        "messages": messages_to_send,
                                        "requires_input": False,
                                        "is_final": True,
                                        "archive_conversation": True
                                    }

                                else:
                                    execution.current_node_id = current_node.id
                                    current_node = find_next_node(workflow_id, current_node.id)

                            # End of flow
                            reset_conversation(user_id, workflow_id)
                            return {
                                "success": True,
                                "messages": messages_to_send,
                                "requires_input": False,
                                "is_final": True,
                                "archive_conversation": True
                            }
                        else:
                            reset_conversation(user_id, workflow_id)
                            return {
                                "success": True,
                                "messages": messages_to_send,
                                "requires_input": False,
                                "is_final": True,
                                "archive_conversation": True
                            }

                # Invalid input for booking
                error_msg = "Opção inválida. Por favor, digite o número do horário desejado ou 'cancelar' para cancelar."
                return {
                    "success": True,
                    "messages": [{
                        "text": error_msg,
                        "options": []
                    }],
                    "requires_input": True,
                    "is_final": False
                }

            # Se é um nó de opções, processar a escolha
            if current_node.type == "options":
                try:
                    option_index = int(message.strip()) - 1
                    options = current_node.data.options

                    if 0 <= option_index < len(options):
                        # Opção válida - avançar para próximo nó
                        logger.info(f"Opção válida selecionada: {option_index + 1}. {options[option_index].get('text', '')}")
                        next_node = find_next_node(workflow_id, current_node.id, option_index)

                        if not next_node:
                            # Fim do fluxo
                            logger.info(f"Fim do fluxo após opção {option_index + 1}")
                            reset_conversation(user_id, workflow_id)
                            return {
                                "success": True,
                                "messages": [],
                                "requires_input": False,
                                "is_final": True,
                                "archive_conversation": True
                            }

                        execution.current_node_id = next_node.id
                        execution.waiting_for_input = False

                        # Processar todos os nós até encontrar um que requer input ou é final
                        current_node = next_node
                        while current_node:
                            logger.info(f"Processando nó: {current_node.id} ({current_node.type})")

                            if current_node.type == "sendMessage":
                                msg_text = current_node.data.message or "Mensagem não configurada"
                                messages_to_send.append({
                                    "text": msg_text,
                                    "options": []
                                })

                                execution.conversation_history.append({
                                    "role": "assistant",
                                    "content": msg_text,
                                    "timestamp": datetime.now(BRASIL_TZ).isoformat()
                                })

                                execution.current_node_id = current_node.id
                                current_node = find_next_node(workflow_id, current_node.id)

                            elif current_node.type == "options":
                                msg_text = current_node.data.message or "Escolha uma opção:"
                                options = current_node.data.options or []

                                if options:
                                    options_text = "\n\n" + "\n".join([f"{i+1}. {opt.get('text', '')}"for i, opt in enumerate(options)])
                                    full_message = msg_text + options_text
                                else:
                                    full_message = msg_text

                                messages_to_send.append({
                                    "text": full_message,
                                    "options": []
                                })

                                execution.conversation_history.append({
                                    "role": "assistant",
                                    "content": full_message,
                                    "timestamp": datetime.now(BRASIL_TZ).isoformat()
                                })

                                execution.current_node_id = current_node.id
                                execution.waiting_for_input = True

                                return {
                                    "success": True,
                                    "messages": messages_to_send,
                                    "requires_input": True,
                                    "is_final": False
                                }

                            elif current_node.type == "agendamento":
                                msg_text = current_node.data.message or "Deseja agendar um horário?"
                                available_slots = current_node.data.availableSlots or []

                                # Filter out booked slots
                                filtered_slots = []
                                for slot in available_slots:
                                    if slot.get("available", False):
                                        time = slot.get("time", "")
                                        date = slot.get("date", "")
                                        if not booking_manager.is_slot_booked(time, date, workflow_id):
                                            filtered_slots.append(slot)

                                if not filtered_slots:
                                    no_slots_msg = current_node.data.noSlotsMessage or "Não há horários disponíveis no momento."
                                    messages_to_send.append({
                                        "text": no_slots_msg,
                                        "options": []
                                    })

                                    execution.conversation_history.append({
                                        "role": "assistant",
                                        "content": no_slots_msg,
                                        "timestamp": datetime.now(BRASIL_TZ).isoformat()
                                    })

                                    execution.current_node_id = current_node.id
                                    current_node = find_next_node(workflow_id, current_node.id)
                                    continue

                                # Build message with available slots
                                slots_text = "\n\nHorários Disponíveis:\n"
                                slot_number = 1
                                for slot in filtered_slots:
                                    if slot.get("available", False): # Redundant check, but for clarity
                                        time = slot.get("time", "")
                                        date = slot.get("date", "")
                                        date_str = f" - {date}" if date else ""
                                        slots_text += f"{slot_number}. {time}{date_str}\n"
                                        slot_number += 1

                                full_message = msg_text + slots_text + "\n\nDigite o número do horário desejado ou 'cancelar' para cancelar."

                                messages_to_send.append({
                                    "text": full_message,
                                    "options": []
                                })

                                execution.conversation_history.append({
                                    "role": "assistant",
                                    "content": full_message,
                                    "timestamp": datetime.now(BRASIL_TZ).isoformat()
                                })

                                execution.current_node_id = current_node.id
                                execution.waiting_for_input = True

                                return {
                                    "success": True,
                                    "messages": messages_to_send,
                                    "requires_input": True,
                                    "is_final": False,
                                    "node_type": "agendamento"
                                }

                            elif current_node.type == "finalizar":
                                msg_text = current_node.data.finalMessage or current_node.data.message or ""

                                if msg_text.strip():
                                    messages_to_send.append({
                                        "text": msg_text,
                                        "options": []
                                    })

                                    execution.conversation_history.append({
                                        "role": "assistant",
                                        "content": msg_text,
                                        "timestamp": datetime.now(BRASIL_TZ).isoformat()
                                    })

                                reset_conversation(user_id, workflow_id)

                                return {
                                    "success": True,
                                    "messages": messages_to_send,
                                    "requires_input": False,
                                    "is_final": True,
                                    "archive_conversation": True
                                }

                            else:
                                execution.current_node_id = current_node.id
                                current_node = find_next_node(workflow_id, current_node.id)

                        # Fim do fluxo
                        reset_conversation(user_id, workflow_id)
                        return {
                            "success": True,
                            "messages": messages_to_send,
                            "requires_input": False,
                            "is_final": True,
                            "archive_conversation": True
                        }
                    else:
                        options_list = "\n".join([f"{i+1}. {opt.get('text', '')}"for i, opt in enumerate(options)])
                        error_msg = f"Opção inválida! Por favor, digite apenas o número da opção:\n\n{options_list}"

                        return {
                            "success": True,
                            "messages": [{
                                "text": error_msg,
                                "options": []
                            }],
                            "requires_input": True,
                            "is_final": False
                        }
                except ValueError:
                    options = current_node.data.options
                    options_list = "\n".join([f"{i+1}. {opt.get('text', '')}"for i, opt in enumerate(options)])
                    error_msg = f"Por favor, digite apenas o número da opção!\n\n{options_list}"

                    return {
                        "success": True,
                        "messages": [{
                            "text": error_msg,
                            "options": []
                        }],
                        "requires_input": True,
                        "is_final": False
                    }

        # Caso padrão - não deveria chegar aqui
        logger.warning(f"Estado inesperado no processamento da mensagem")
        return {
            "success": True,
            "messages": [],
            "requires_input": False,
            "is_final": False
        }

    except Exception as e:
        logger.error(f"Erro ao processar mensagem: {e}")
        logger.exception("Stack trace:")
        return {
            "success": False,
            "messages": [{
                "text": f"Erro: {str(e)}",
                "options": []
            }],
            "requires_input": False,
            "is_final": True
        }

def get_all_workflows() -> List[Dict]:
    """
    Retorna todos os workflows publicados (DADOS REAIS)
    """
    return list(_published_workflows.values())

def get_workflow_by_id(workflow_id: str) -> Optional[Dict]:
    """
    Retorna um workflow específico (DADOS REAIS)
    """
    return _published_workflows.get(workflow_id)

def reset_conversation(user_id: str, workflow_id: str) -> bool:
    """
    Reseta a conversa de um usuário
    """
    try:
        execution_key = f"{user_id}:{workflow_id}"
        if execution_key in _active_executions:
            del _active_executions[execution_key]
            logger.info(f"Conversa resetada: {execution_key}")
            return True
        return False
    except Exception as e:
        logger.error(f"Erro ao resetar conversa: {e}")
        return False

logger.info("Bot Components API inicializado - Aguardando workflows REAIS do frontend")
