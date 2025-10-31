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

    def to_dict(self) -> Dict:
        return {
            "workflow_id": self.workflow_id,
            "user_id": self.user_id,
            "current_node_id": self.current_node_id,
            "conversation_history": self.conversation_history,
            "waiting_for_input": self.waiting_for_input,
            "created_at": self.created_at
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
                finalMessage=node_raw.get("data", {}).get("finalMessage"),  # Add finalMessage field
                options=node_raw.get("data", {}).get("options", []),
                code=node_raw.get("data", {}).get("code"),
                customId=node_raw.get("data", {}).get("customId")
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
        logger.info(f"Processando mensagem de {user_id}: '{message}'")

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
                        "options": []  # Don't send options as buttons
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
