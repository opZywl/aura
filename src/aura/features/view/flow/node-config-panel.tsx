"use client"

import { useState, useEffect } from "react"
import { X, Copy, Trash2, Send, List, Settings, GitBranch, Code, CheckCircle, Upload, Download } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { NodeData, WorkflowNode } from "@/lib/types"
import CodeEditor from "./code-editor"
import { useTheme } from "../homePanels/ThemeContext"
import { toast } from "@/components/ui/use-toast"

const extractHexColor = (input?: string, fallback = "#6366f1") => {
    if (!input) return fallback
    const match = input.match(/#[0-9a-fA-F]{6}/)
    return match ? match[0] : fallback
}

const toRgba = (hex: string, alpha: number) => {
    const sanitized = hex.replace("#", "")
    if (sanitized.length !== 6) {
        return `rgba(99, 102, 241, ${alpha})`
    }

    const r = Number.parseInt(sanitized.slice(0, 2), 16)
    const g = Number.parseInt(sanitized.slice(2, 4), 16)
    const b = Number.parseInt(sanitized.slice(4, 6), 16)

    return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

const typeIcons: Record<string, LucideIcon> = {
    sendMessage: Send,
    options: List,
    process: Settings,
    conditional: GitBranch,
    code: Code,
    finalizar: CheckCircle,
    input: Upload,
    output: Download,
}

interface NodeConfigPanelProps {
    node: WorkflowNode
    updateNodeDataAction: (nodeId: string, data: NodeData) => void
    onCloseAction: () => void
    onRemoveAction: () => void
}

// Mapeamento de tipos para nomes em português
const getNodeTypeName = (type: string): string => {
    const typeNames: Record<string, string> = {
        sendMessage: "Enviar Mensagem",
        options: "Opções",
        process: "Processar",
        conditional: "Condicional",
        code: "Código",
        finalizar: "Finalizar",
        input: "Entrada",
        output: "Saída",
    }
    return typeNames[type] || type
}

export default function NodeConfigPanel({
    node,
    updateNodeDataAction,
    onCloseAction,
    onRemoveAction,
}: NodeConfigPanelProps) {
    const { theme, currentGradient } = useTheme()
    const [localData, setLocalData] = useState<NodeData>({ ...node.data })
    const isDark = theme === "dark"
    const accentHex = extractHexColor(currentGradient?.primary, isDark ? "#6366f1" : "#4338ca")
    const secondaryHex = extractHexColor(currentGradient?.secondary, isDark ? accentHex : "#6366f1")
    const NodeIcon = typeIcons[node.type ?? ""] || Settings
    const helperTextColor = isDark ? "rgba(148,163,184,0.75)" : "rgba(100,116,139,0.85)"

    const getFieldStyles = (alpha = 0.55) => ({
        background: isDark
            ? `rgba(17, 24, 39, ${alpha})`
            : `rgba(255, 255, 255, ${Math.min(0.96, 0.78 + alpha * 0.35)})`,
        borderColor: toRgba(accentHex, isDark ? 0.32 : 0.18),
        color: isDark ? "#e2e8f0" : "#0f172a",
        boxShadow: `0 14px 28px ${toRgba(accentHex, isDark ? 0.22 : 0.14)}`,
    })
    const selectContentClass = `${
        isDark ? "bg-slate-950/95 text-slate-100 border-slate-800" : "bg-white text-slate-900 border-slate-200"
    } rounded-xl border shadow-xl`

    // Sincronizar mudanças em tempo real
    useEffect(() => {
        setLocalData({ ...node.data })
    }, [node.data])

    const handleChange = <K extends keyof NodeData>(key: K, value: NodeData[K]) => {
        const newData: NodeData = {
            ...localData,
            [key]: value,
        }
        setLocalData(newData)
        updateNodeDataAction(node.id, newData)
    }

    const copyNodeId = () => {
        const idToCopy = localData.customId || node.id
        void navigator.clipboard.writeText(idToCopy)
        toast({
            title: "ID copiado!",
            description: `ID ${idToCopy} copiado para a área de transferência`,
        })
    }

    const handleRemove = () => {
        if (confirm("Tem certeza que deseja remover este nó?")) {
            onRemoveAction()
        }
    }

    const renderInputFields = () => {
        switch (node.type) {
            case "input":
                return (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="dataSource">Fonte de Dados</Label>
                            <Select
                                value={localData.dataSource || "manual"}
                                onValueChange={(value) => handleChange("dataSource", value as NodeData["dataSource"])}
                            >
                                <SelectTrigger
                                    id="dataSource"
                                    className="rounded-xl border bg-transparent px-3 py-2 text-sm focus:outline-none"
                                    style={getFieldStyles(0.6)}
                                >
                                    <SelectValue placeholder="Selecione a fonte de dados" />
                                </SelectTrigger>
                                <SelectContent className={selectContentClass} position="popper" sideOffset={8}>
                                    <SelectItem value="manual">Entrada Manual</SelectItem>
                                    <SelectItem value="api">API</SelectItem>
                                    <SelectItem value="database">Banco de Dados</SelectItem>
                                    <SelectItem value="file">Upload de Arquivo</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="sampleData">Dados de Exemplo (JSON)</Label>
                            <Textarea
                                id="sampleData"
                                value={localData.sampleData || ""}
                                onChange={(e) => handleChange("sampleData", e.target.value)}
                                className="h-32 resize-none rounded-xl border px-3 py-3 text-sm shadow-inner focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-0"
                                style={getFieldStyles()}
                                placeholder='{"chave": "valor"}'
                            />
                            <p className="text-xs" style={{ color: helperTextColor }}>
                                Utilize JSON para mapear a entrada inicial do fluxo.
                            </p>
                        </div>
                    </div>
                )

            case "output":
                return (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="outputType">Tipo de Saída</Label>
                            <Select
                                value={localData.outputType || "console"}
                                onValueChange={(value) => handleChange("outputType", value as NodeData["outputType"])}
                            >
                                <SelectTrigger
                                    id="outputType"
                                    className="rounded-xl border bg-transparent px-3 py-2 text-sm focus:outline-none"
                                    style={getFieldStyles(0.6)}
                                >
                                    <SelectValue placeholder="Selecione o tipo de saída" />
                                </SelectTrigger>
                                <SelectContent className={selectContentClass} position="popper" sideOffset={8}>
                                    <SelectItem value="console">Console</SelectItem>
                                    <SelectItem value="api">API</SelectItem>
                                    <SelectItem value="database">Banco de Dados</SelectItem>
                                    <SelectItem value="file">Arquivo</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="outputFormat">Formato de Saída</Label>
                            <Select
                                value={localData.outputFormat || "json"}
                                onValueChange={(value) => handleChange("outputFormat", value as NodeData["outputFormat"])}
                            >
                                <SelectTrigger
                                    id="outputFormat"
                                    className="rounded-xl border bg-transparent px-3 py-2 text-sm focus:outline-none"
                                    style={getFieldStyles(0.6)}
                                >
                                    <SelectValue placeholder="Selecione o formato" />
                                </SelectTrigger>
                                <SelectContent className={selectContentClass} position="popper" sideOffset={8}>
                                    <SelectItem value="json">JSON</SelectItem>
                                    <SelectItem value="csv">CSV</SelectItem>
                                    <SelectItem value="xml">XML</SelectItem>
                                    <SelectItem value="text">Texto Simples</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                )

            case "process":
                return (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="processType">Tipo de Processo</Label>
                            <Select
                                value={localData.processType || "transform"}
                                onValueChange={(value) => handleChange("processType", value as NodeData["processType"])}
                            >
                                <SelectTrigger
                                    id="processType"
                                    className="rounded-xl border bg-transparent px-3 py-2 text-sm focus:outline-none"
                                    style={getFieldStyles(0.6)}
                                >
                                    <SelectValue placeholder="Selecione o tipo de processo" />
                                </SelectTrigger>
                                <SelectContent className={selectContentClass} position="popper" sideOffset={8}>
                                    <SelectItem value="transform">Transformar</SelectItem>
                                    <SelectItem value="filter">Filtrar</SelectItem>
                                    <SelectItem value="aggregate">Agregar</SelectItem>
                                    <SelectItem value="sort">Ordenar</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="processConfig">Configuração do Processo (JSON)</Label>
                            <Textarea
                                id="processConfig"
                                value={localData.processConfig || ""}
                                onChange={(e) => handleChange("processConfig", e.target.value)}
                                className="h-32 resize-none rounded-xl border px-3 py-3 text-sm shadow-inner focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-0"
                                style={getFieldStyles()}
                                placeholder='{"operacao": "valor"}'
                            />
                            <p className="text-xs" style={{ color: helperTextColor }}>
                                Defina regras em JSON para transformar ou filtrar dados do fluxo.
                            </p>
                        </div>
                    </div>
                )

            case "conditional":
                return (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="condition">Condição</Label>
                            <Input
                                id="condition"
                                value={localData.condition || ""}
                                onChange={(e) => handleChange("condition", e.target.value)}
                                placeholder="dados.valor > 10"
                                className="rounded-xl border px-3 py-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-0"
                                style={getFieldStyles(0.55)}
                            />
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="trueLabel">Rótulo do Caminho Verdadeiro</Label>
                                <Input
                                    id="trueLabel"
                                    value={localData.trueLabel || "Sim"}
                                    onChange={(e) => handleChange("trueLabel", e.target.value)}
                                    className="rounded-xl border px-3 py-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-0"
                                    style={getFieldStyles(0.5)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="falseLabel">Rótulo do Caminho Falso</Label>
                                <Input
                                    id="falseLabel"
                                    value={localData.falseLabel || "Não"}
                                    onChange={(e) => handleChange("falseLabel", e.target.value)}
                                    className="rounded-xl border px-3 py-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-0"
                                    style={getFieldStyles(0.5)}
                                />
                            </div>
                        </div>
                    </div>
                )

            case "code":
                return (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="codeLanguage">Linguagem</Label>
                            <Select
                                value={localData.codeLanguage || "javascript"}
                                onValueChange={(value) => handleChange("codeLanguage", value as NodeData["codeLanguage"])}
                            >
                                <SelectTrigger
                                    id="codeLanguage"
                                    className="rounded-xl border bg-transparent px-3 py-2 text-sm focus:outline-none"
                                    style={getFieldStyles(0.6)}
                                >
                                    <SelectValue placeholder="Selecione a linguagem" />
                                </SelectTrigger>
                                <SelectContent className={selectContentClass} position="popper" sideOffset={8}>
                                    <SelectItem value="javascript">JavaScript</SelectItem>
                                    <SelectItem value="typescript">TypeScript</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="code">Código</Label>
                            <div
                                className="rounded-xl border p-3"
                                style={getFieldStyles(0.48)}
                            >
                                <CodeEditor
                                    value={
                                        localData.code ||
                                        "// Escreva seu código aqui\nfunction processar(dados) {\n  // Transformar dados\n  return dados;\n}"
                                    }
                                    onChangeAction={(value) => handleChange("code", value)}
                                    language={localData.codeLanguage || "javascript"}
                                />
                            </div>
                        </div>
                    </div>
                )

            case "sendMessage":
                return (
                    <div className="space-y-2">
                        <Label htmlFor="message">Mensagem</Label>
                        <Textarea
                            id="message"
                            value={localData.message || ""}
                            onChange={(e) => handleChange("message", e.target.value)}
                            className="h-36 resize-none rounded-xl border px-3 py-3 text-sm shadow-inner focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-0"
                            style={getFieldStyles()}
                            placeholder="Digite a mensagem que será enviada..."
                        />
                        <p className="text-xs" style={{ color: helperTextColor }}>
                            Utilize quebras de linha, emojis e links para personalizar o atendimento.
                        </p>
                    </div>
                )

            case "options":
                {
                    const optionsToRender =
                        localData.options && localData.options.length > 0
                            ? localData.options
                            : [{ text: "Opção 1", digit: "1" }]

                    return (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="message">Mensagem</Label>
                                <Textarea
                                    id="message"
                                    value={localData.message || ""}
                                    onChange={(e) => handleChange("message", e.target.value)}
                                    className="h-36 resize-none rounded-xl border px-3 py-3 text-sm shadow-inner focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-0"
                                    style={getFieldStyles()}
                                    placeholder="Digite a mensagem que será exibida com as opções..."
                                />
                                <p className="text-xs" style={{ color: helperTextColor }}>
                                    Apresente instruções claras antes de listar as escolhas disponíveis.
                                </p>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <Label>Configurar Opções</Label>
                                    <span className="text-xs" style={{ color: helperTextColor }}>
                                        Até 10 opções são suportadas
                                    </span>
                                </div>

                                {optionsToRender.map((option, index) => (
                                    <div
                                        key={index}
                                        className="flex flex-col gap-3 rounded-xl border p-3 shadow-sm md:flex-row md:items-center"
                                        style={getFieldStyles(0.48)}
                                    >
                                        <div className="flex items-center gap-2">
                                            <span
                                                className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold"
                                                style={{
                                                    background: toRgba(accentHex, isDark ? 0.28 : 0.15),
                                                    color: isDark ? "#e0f2fe" : "#1f2937",
                                                }}
                                            >
                                                {index + 1}
                                            </span>
                                            <Input
                                                value={option.text || ""}
                                                onChange={(e) => {
                                                    const newOptions = optionsToRender.map((existingOption, existingIndex) =>
                                                        existingIndex === index
                                                            ? { ...existingOption, text: e.target.value }
                                                            : existingOption,
                                                    )
                                                    handleChange("options", newOptions)
                                                }}
                                                placeholder="Texto da opção"
                                                className="flex-1 rounded-xl border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-0"
                                                style={getFieldStyles(0.5)}
                                            />
                                        </div>

                                        <div className="flex items-center gap-2 md:w-32">
                                            <Input
                                                value={option.digit || ""}
                                                onChange={(e) => {
                                                    const newOptions = optionsToRender.map((existingOption, existingIndex) =>
                                                        existingIndex === index
                                                            ? { ...existingOption, digit: e.target.value }
                                                            : existingOption,
                                                    )
                                                    handleChange("options", newOptions)
                                                }}
                                                placeholder="Dígito"
                                                className="w-full rounded-xl border px-3 py-2 text-center text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-0"
                                                style={getFieldStyles(0.5)}
                                            />

                                            {index > 0 && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => {
                                                        const newOptions = optionsToRender.filter((_, i) => i !== index)
                                                        handleChange("options", newOptions)
                                                    }}
                                                    className="h-9 w-9 rounded-xl"
                                                    style={{
                                                        background: isDark
                                                            ? "rgba(239,68,68,0.15)"
                                                            : "rgba(254,226,226,0.95)",
                                                        color: "#ef4444",
                                                    }}
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                ))}

                                <Button
                                    variant="ghost"
                                    onClick={() => {
                                        const nextIndex = optionsToRender.length + 1
                                        const newOptions = [
                                            ...optionsToRender,
                                            {
                                                text: `Opção ${nextIndex}`,
                                                digit: `${nextIndex}`,
                                            },
                                        ]
                                        handleChange("options", newOptions)
                                    }}
                                    className="w-full rounded-xl px-4 py-2.5 text-sm font-semibold shadow-lg transition-transform hover:scale-[1.01]"
                                    style={{
                                        background: `linear-gradient(135deg, ${toRgba(accentHex, 0.6)}, ${toRgba(secondaryHex, 0.55)})`,
                                        color: "#ffffff",
                                        boxShadow: `0 18px 36px ${toRgba(accentHex, isDark ? 0.35 : 0.25)}`,
                                    }}
                                >
                                    + Adicionar opção
                                </Button>
                            </div>
                        </div>
                    )
                }

            case "finalizar":
                return (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="finalizationType">Tipo de Finalização</Label>
                            <Select
                                value={localData.finalizationType || "success"}
                                onValueChange={(value) => handleChange("finalizationType", value as NodeData["finalizationType"])}
                            >
                                <SelectTrigger
                                    id="finalizationType"
                                    className="rounded-xl border bg-transparent px-3 py-2 text-sm focus:outline-none"
                                    style={getFieldStyles(0.6)}
                                >
                                    <SelectValue placeholder="Selecione o tipo" />
                                </SelectTrigger>
                                <SelectContent className={selectContentClass} position="popper" sideOffset={8}>
                                    <SelectItem value="success">Sucesso</SelectItem>
                                    <SelectItem value="error">Erro</SelectItem>
                                    <SelectItem value="timeout">Timeout</SelectItem>
                                    <SelectItem value="cancel">Cancelamento</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="finalMessage">Mensagem Final</Label>
                            <Textarea
                                id="finalMessage"
                                value={localData.finalMessage || ""}
                                onChange={(e) => handleChange("finalMessage", e.target.value)}
                                className="h-28 resize-none rounded-xl border px-3 py-3 text-sm shadow-inner focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-0"
                                style={getFieldStyles()}
                                placeholder="Mensagem exibida ao finalizar o fluxo..."
                            />
                            <p className="text-xs" style={{ color: helperTextColor }}>
                                Personalize a despedida que será enviada ao usuário no encerramento do atendimento.
                            </p>
                        </div>
                    </div>
                )

            default:
                return null
        }
    }

    return (
        <div
            className="relative flex h-full flex-col overflow-hidden rounded-2xl"
            onClick={(e) => e.stopPropagation()}
            style={{
                background: isDark
                    ? "linear-gradient(180deg, rgba(12,12,18,0.92) 0%, rgba(15,17,25,0.88) 100%)"
                    : "linear-gradient(180deg, rgba(255,255,255,0.97) 0%, rgba(248,250,252,0.92) 100%)",
                border: `1px solid ${toRgba(accentHex, isDark ? 0.45 : 0.28)}`,
                boxShadow: `0 28px 48px ${toRgba(accentHex, isDark ? 0.28 : 0.18)}`,
            }}
        >
            <div
                className="relative flex items-center justify-between border-b px-4 py-4"
                style={{
                    borderColor: toRgba(accentHex, isDark ? 0.35 : 0.2),
                    background: isDark
                        ? `linear-gradient(135deg, ${toRgba(accentHex, 0.28)}, ${toRgba(secondaryHex, 0.22)})`
                        : `linear-gradient(135deg, ${toRgba(accentHex, 0.18)}, rgba(255,255,255,0.95))`,
                    boxShadow: `inset 0 -1px 0 ${toRgba(accentHex, 0.25)}`,
                }}
            >
                <div className="flex items-center gap-3">
                    <div
                        className="flex h-12 w-12 items-center justify-center rounded-2xl shadow-lg"
                        style={{
                            background: isDark
                                ? `linear-gradient(135deg, ${toRgba(accentHex, 0.38)}, ${toRgba(secondaryHex, 0.28)})`
                                : `linear-gradient(135deg, ${toRgba(accentHex, 0.22)}, ${toRgba(secondaryHex, 0.18)})`,
                            boxShadow: `0 18px 32px ${toRgba(accentHex, isDark ? 0.35 : 0.22)}`,
                        }}
                    >
                        <NodeIcon className="h-5 w-5" style={{ color: isDark ? "#f8fafc" : "#1f2937" }} />
                    </div>
                    <div>
                        <p className="text-[11px] uppercase tracking-[0.2em]" style={{ color: helperTextColor }}>
                            Componente selecionado
                        </p>
                        <h2 className="text-lg font-semibold" style={{ color: isDark ? "#f8fafc" : "#0f172a" }}>
                            {getNodeTypeName(node.type ?? "unknown")}
                        </h2>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={handleRemove}
                        className="h-9 w-9 rounded-xl transition-transform hover:scale-105"
                        style={{
                            background: isDark ? "rgba(239,68,68,0.18)" : "rgba(254,226,226,0.96)",
                            color: "#ef4444",
                            border: "1px solid rgba(248,113,113,0.35)",
                            boxShadow: "0 12px 24px rgba(248,113,113,0.2)",
                        }}
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                            e.stopPropagation()
                            onCloseAction()
                        }}
                        className="h-9 w-9 rounded-xl transition-transform hover:scale-105"
                        style={{
                            background: isDark ? "rgba(255,255,255,0.12)" : "rgba(15,23,42,0.08)",
                            color: isDark ? "#e2e8f0" : "#475569",
                            border: `1px solid ${toRgba(accentHex, isDark ? 0.18 : 0.12)}`,
                        }}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-5 space-y-6" style={{ minHeight: 0 }}>
                <div className="rounded-xl border px-4 py-3" style={getFieldStyles(0.5)}>
                    <div className="flex items-center justify-between gap-2">
                        <Label htmlFor="nodeId" className="text-sm font-medium">
                            ID do Componente
                        </Label>
                        <span className="text-xs" style={{ color: helperTextColor }}>
                            Somente leitura
                        </span>
                    </div>
                    <div className="mt-3 flex items-center gap-2">
                        <Input
                            id="nodeId"
                            value={localData.customId || node.id}
                            readOnly
                            className="flex-1 rounded-xl border px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-0"
                            style={{
                                ...getFieldStyles(0.45),
                                boxShadow: "none",
                                color: isDark ? "#cbd5f5" : "#0f172a",
                            }}
                            placeholder="ID único do componente"
                        />
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={copyNodeId}
                            title="Copiar ID"
                            className="h-9 w-9 rounded-xl"
                            style={{
                                background: `linear-gradient(135deg, ${toRgba(accentHex, 0.6)}, ${toRgba(secondaryHex, 0.5)})`,
                                color: "#ffffff",
                                boxShadow: `0 12px 24px ${toRgba(accentHex, isDark ? 0.35 : 0.25)}`,
                            }}
                        >
                            <Copy className="h-4 w-4" />
                        </Button>
                    </div>
                    <p className="mt-2 text-xs" style={{ color: helperTextColor }}>
                        O ID é gerado automaticamente e não pode ser alterado.
                    </p>
                </div>

                <div className="h-px rounded-full" style={{ background: toRgba(accentHex, isDark ? 0.25 : 0.12) }} />

                {renderInputFields()}
            </div>
        </div>
    )
}
