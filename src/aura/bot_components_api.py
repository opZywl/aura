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

        logger.info(f"✅ Workflow REAL parseado: {len(nodes)} nós, {len(edges)} conexões")
        return nodes, edges

    except Exception as e:
        logger.error(f"❌ Erro ao parsear workflow: {e}")
        return [], []

def register_workflow(workflow_data: Dict) -> bool:
    """
    Registra um workflow publicado com dados REAIS do JSON
    """
    try:
        workflow_id = workflow_data.get("_id", "")
        if not workflow_id:
            logger.error("❌ Workflow sem ID")
            return False

        nodes, edges = parse_workflow_data(workflow_data)
        if not nodes:
            logger.error("❌ Workflow sem nós")
            return False

        _published_workflows[workflow_id] = {
            "id": workflow_id,
            "tag": workflow_data.get("_tag", ""),
            "enabled": workflow_data.get("_enabled", True),
            "nodes": nodes,
            "edges": edges,
            "created_at": workflow_data.get("_insertedAt", datetime.now(BRASIL_TZ).isoformat())
        }

        logger.info(f"✅ Workflow REAL registrado: {workflow_id}")
        return True

    except Exception as e:
        logger.error(f"❌ Erro ao registrar workflow: {e}")
        return False

def set_workflow_status(workflow_id: str, enabled: bool) -> bool:
    """
    Ativa ou desativa um workflow
    """
    try:
        if workflow_id not in _published_workflows:
            logger.error(f"❌ Workflow não encontrado: {workflow_id}")
            return False

        _published_workflows[workflow_id]["enabled"] = enabled
        logger.info(f"✅ Workflow {workflow_id} {'ativado' if enabled else 'desativado'}")
        return True

    except Exception as e:
        logger.error(f"❌ Erro ao alterar status do workflow: {e}")
        return False

def find_next_node(workflow_id: str, current_node_id: str, option_index: Optional[int] = None) -> Optional[FlowNode]:
    """
    Encontra o próximo nó no fluxo REAL baseado nas conexões do JSON
    """
    try:
        workflow = _published_workflows.get(workflow_id)
        if not workflow:
            logger.error(f"❌ Workflow não encontrado: {workflow_id}")
            return None

        edges: List[FlowEdge] = workflow["edges"]
        nodes: List[FlowNode] = workflow["nodes"]

        # Filtrar edges que saem do nó atual
        outgoing_edges = [e for e in edges if e.source == current_node_id]

        if not outgoing_edges:
            logger.info(f"🏁 Nenhuma conexão de saída do nó {current_node_id}")
            return None

        # Se option_index foi fornecido, procurar pela edge específica
        if option_index is not None:
            target_handle = f"output-{option_index}"
            target_edge = next((e for e in outgoing_edges if e.sourceHandle == target_handle), None)

            if not target_edge:
                logger.warning(f"⚠️ Edge não encontrada para opção {option_index}")
                return None
        else:
            # Pegar a primeira edge disponível
            target_edge = outgoing_edges[0]

        # Encontrar o nó de destino
        next_node = next((n for n in nodes if n.id == target_edge.target), None)

        if next_node:
            logger.info(f"➡️ Próximo nó REAL: {next_node.id} ({next_node.type})")
        else:
            logger.warning(f"⚠️ Nó de destino não encontrado: {target_edge.target}")

        return next_node

    except Exception as e:
        logger.error(f"❌ Erro ao encontrar próximo nó: {e}")
        return None

def start_workflow_execution(workflow_id: str, user_id: str) -> Optional[WorkflowExecution]:
    """
    Inicia a execução de um workflow REAL para um usuário
    """
    try:
        workflow = _published_workflows.get(workflow_id)
        if not workflow:
            logger.error(f"❌ Workflow não encontrado: {workflow_id}")
            return None

        if not workflow["enabled"]:
            logger.error(f"❌ Workflow desabilitado: {workflow_id}")
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

        logger.info(f"✅ Execução iniciada: {execution_key}")
        return execution

    except Exception as e:
        logger.error(f"❌ Erro ao iniciar execução: {e}")
        return None

def get_execution(user_id: str, workflow_id: str) -> Optional[WorkflowExecution]:
    """
    Recupera a execução ativa de um usuário
    """
    execution_key = f"{user_id}:{workflow_id}"
    return _active_executions.get(execution_key)

def process_node_response(workflow_id: str, node: FlowNode) -> Dict[str, Any]:
    """
    Processa um nó REAL e retorna a resposta apropriada
    USA 100% OS DADOS DO JSON - SEM MOCK!
    """
    try:
        response = {
            "node_id": node.id,
            "node_type": node.type,
            "message": "",
            "options": [],
            "requires_input": False,
            "is_final": False
        }

        if node.type == "start":
            # Nó de início - avançar automaticamente
            next_node = find_next_node(workflow_id, node.id)
            if next_node:
                return process_node_response(workflow_id, next_node)
            else:
                response["message"] = "⚠️ Fluxo não configurado corretamente"
                response["is_final"] = True

        elif node.type == "sendMessage":
            # Nó de enviar mensagem - USA A MENSAGEM REAL DO JSON
            response["message"] = node.data.message or "Mensagem não configurada"

            # Verificar se há próximo nó
            next_node = find_next_node(workflow_id, node.id)
            if not next_node:
                response["is_final"] = True

        elif node.type == "options":
            # Nó de opções - USA AS OPÇÕES REAIS DO JSON
            response["message"] = node.data.message or "Escolha uma opção:"
            response["options"] = node.data.options or []
            response["requires_input"] = True

        elif node.type == "finalizar":
            # Nó de finalização - USA A MENSAGEM REAL DO JSON
            response["message"] = node.data.message or "Conversa finalizada. Obrigado!"
            response["is_final"] = True

        elif node.type == "code":
            # Nó de código (executar código customizado)
            response["message"] = "⚙️ Processando código customizado..."
            # TODO: Implementar execução de código
            next_node = find_next_node(workflow_id, node.id)
            if not next_node:
                response["is_final"] = True

        elif node.type == "conditional":
            # Nó condicional (avaliar condição)
            response["message"] = "🔀 Avaliando condição..."
            # TODO: Implementar avaliação de condição
            next_node = find_next_node(workflow_id, node.id)
            if not next_node:
                response["is_final"] = True

        else:
            response["message"] = f"⚠️ Tipo de nó não suportado: {node.type}"
            response["is_final"] = True

        return response

    except Exception as e:
        logger.error(f"❌ Erro ao processar nó: {e}")
        return {
            "node_id": node.id,
            "node_type": node.type,
            "message": f"❌ Erro ao processar nó: {str(e)}",
            "options": [],
            "requires_input": False,
            "is_final": True
        }

def process_user_message(user_id: str, workflow_id: str, message: str) -> Dict[str, Any]:
    """
    Processa mensagem do usuário e retorna resposta do bot
    EXECUTA O FLUXO REAL BASEADO NO JSON - SEM MOCK!

    Esta é a função principal que o webhook do Telegram deve chamar
    """
    try:
        logger.info(f"💬 Processando mensagem de {user_id}: '{message}'")

        # Verificar se há execução ativa
        execution = get_execution(user_id, workflow_id)

        # Se não há execução, iniciar nova
        if not execution:
            logger.info(f"🚀 Iniciando nova execução para {user_id}")
            execution = start_workflow_execution(workflow_id, user_id)
            if not execution:
                return {
                    "success": False,
                    "message": "❌ Erro ao iniciar fluxo",
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
                "message": "❌ Workflow não encontrado",
                "requires_input": False,
                "is_final": True
            }

        nodes: List[FlowNode] = workflow["nodes"]

        # Se não há nó atual, começar pelo START
        if not execution.current_node_id:
            start_node = next((n for n in nodes if n.type == "start"), None)
            if not start_node:
                return {
                    "success": False,
                    "message": "❌ Nó de início não encontrado",
                    "requires_input": False,
                    "is_final": True
                }

            # Processar nó de início
            execution.current_node_id = start_node.id
            response = process_node_response(workflow_id, start_node)

            # Se não requer input, avançar automaticamente
            while not response["requires_input"] and not response["is_final"]:
                next_node = find_next_node(workflow_id, execution.current_node_id)
                if not next_node:
                    break
                execution.current_node_id = next_node.id
                response = process_node_response(workflow_id, next_node)

            # Adicionar resposta ao histórico
            execution.conversation_history.append({
                "role": "assistant",
                "content": response["message"],
                "timestamp": datetime.now(BRASIL_TZ).isoformat()
            })

            execution.waiting_for_input = response["requires_input"]

            return {
                "success": True,
                **response
            }

        # Se estamos aguardando input do usuário
        if execution.waiting_for_input:
            current_node = next((n for n in nodes if n.id == execution.current_node_id), None)
            if not current_node:
                return {
                    "success": False,
                    "message": "❌ Nó atual não encontrado",
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
                        next_node = find_next_node(workflow_id, current_node.id, option_index)
                        if not next_node:
                            return {
                                "success": True,
                                "message": "🏁 Fim do fluxo",
                                "requires_input": False,
                                "is_final": True
                            }

                        execution.current_node_id = next_node.id
                        execution.waiting_for_input = False

                        response = process_node_response(workflow_id, next_node)

                        # Se não requer input, continuar avançando
                        while not response["requires_input"] and not response["is_final"]:
                            next_node = find_next_node(workflow_id, execution.current_node_id)
                            if not next_node:
                                break
                            execution.current_node_id = next_node.id
                            response = process_node_response(workflow_id, next_node)

                        # Adicionar resposta ao histórico
                        execution.conversation_history.append({
                            "role": "assistant",
                            "content": response["message"],
                            "timestamp": datetime.now(BRASIL_TZ).isoformat()
                        })

                        execution.waiting_for_input = response["requires_input"]

                        return {
                            "success": True,
                            **response
                        }
                    else:
                        # Opção inválida - repetir opções
                        return {
                            "success": True,
                            "message": f"❌ Opção inválida! {current_node.data.message or 'Escolha uma opção:'}\n\n" +
                                       "\n".join([f"{i+1}. {opt.get('text', '')}" for i, opt in enumerate(options)]) +
                                       "\n\n💡 Digite apenas o número da opção",
                            "options": options,
                            "requires_input": True,
                            "is_final": False
                        }
                except ValueError:
                    # Input não é um número
                    options = current_node.data.options
                    return {
                        "success": True,
                        "message": f"❌ Por favor, digite apenas o número da opção!\n\n" +
                                   "\n".join([f"{i+1}. {opt.get('text', '')}" for i, opt in enumerate(options)]),
                        "options": options,
                        "requires_input": True,
                        "is_final": False
                    }

        # Caso padrão - continuar fluxo
        next_node = find_next_node(workflow_id, execution.current_node_id)
        if not next_node:
            return {
                "success": True,
                "message": "🏁 Fim do fluxo",
                "requires_input": False,
                "is_final": True
            }

        execution.current_node_id = next_node.id
        response = process_node_response(workflow_id, next_node)

        # Adicionar resposta ao histórico
        execution.conversation_history.append({
            "role": "assistant",
            "content": response["message"],
            "timestamp": datetime.now(BRASIL_TZ).isoformat()
        })

        execution.waiting_for_input = response["requires_input"]

        return {
            "success": True,
            **response
        }

    except Exception as e:
        logger.error(f"❌ Erro ao processar mensagem: {e}")
        return {
            "success": False,
            "message": f"❌ Erro: {str(e)}",
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
            logger.info(f"🔄 Conversa resetada: {execution_key}")
            return True
        return False
    except Exception as e:
        logger.error(f"❌ Erro ao resetar conversa: {e}")
        return False

# O sistema não inicializa mais com workflow de exemplo
# Todos os workflows devem ser publicados via frontend usando /api/bot/workflows
logger.info("✅ Bot Components API inicializado - Aguardando workflows REAIS do frontend")
