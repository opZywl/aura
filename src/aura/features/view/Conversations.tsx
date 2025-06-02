"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Search,
  Filter,
  MoreHorizontal,
  MessageSquare,
  Calendar,
  Clock,
  User,
  Bot,
  TrendingUp,
  Download,
  Eye,
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"

interface ConversationData {
  id: string
  title: string
  accountId: string
  accountName: string
  accountEmail: string
  company: string
  messageCount: number
  lastMessage: string
  lastMessageRole: "user" | "assistant"
  createdAt: Date
  updatedAt: Date
  status: "active" | "archived" | "resolved"
  tags: string[]
  satisfaction?: number
}

const mockConversations: ConversationData[] = [
  {
    id: "conv-1",
    title: "Implementação de IA para Vendas",
    accountId: "acc-1",
    accountName: "João Silva",
    accountEmail: "joao@empresa.com",
    company: "Tech Solutions",
    messageCount: 15,
    lastMessage: "Perfeito! Quando podemos agendar uma demonstração?",
    lastMessageRole: "user",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
    updatedAt: new Date(Date.now() - 1000 * 60 * 30),
    status: "active",
    tags: ["vendas", "demo", "interessado"],
    satisfaction: 5,
  },
  {
    id: "conv-2",
    title: "Dúvidas sobre Suporte 24/7",
    accountId: "acc-2",
    accountName: "Maria Santos",
    accountEmail: "maria@startup.com",
    company: "StartupXYZ",
    messageCount: 8,
    lastMessage: "Obrigada pelas informações! Vou discutir com a equipe.",
    lastMessageRole: "user",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 4),
    status: "resolved",
    tags: ["suporte", "informacao"],
    satisfaction: 4,
  },
  {
    id: "conv-3",
    title: "Integração com CRM Existente",
    accountId: "acc-3",
    accountName: "Pedro Costa",
    accountEmail: "pedro@corporation.com",
    company: "Big Corporation",
    messageCount: 23,
    lastMessage: "Vamos precisar de uma solução enterprise customizada.",
    lastMessageRole: "user",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60),
    status: "active",
    tags: ["enterprise", "integracao", "crm"],
    satisfaction: undefined,
  },
]

export default function Conversations() {
  const [conversations, setConversations] = useState<ConversationData[]>(mockConversations)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("updated")

  const filteredConversations = conversations
    .filter((conv) => {
      const matchesSearch =
        conv.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conv.accountName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conv.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conv.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))

      const matchesStatus = statusFilter === "all" || conv.status === statusFilter

      return matchesSearch && matchesStatus
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "created":
          return b.createdAt.getTime() - a.createdAt.getTime()
        case "updated":
          return b.updatedAt.getTime() - a.updatedAt.getTime()
        case "messages":
          return b.messageCount - a.messageCount
        case "title":
          return a.title.localeCompare(b.title)
        default:
          return b.updatedAt.getTime() - a.updatedAt.getTime()
      }
    })

  const getStatusBadgeVariant = (status: ConversationData["status"]) => {
    switch (status) {
      case "active":
        return "default"
      case "resolved":
        return "secondary"
      case "archived":
        return "outline"
      default:
        return "secondary"
    }
  }

  const getStatusLabel = (status: ConversationData["status"]) => {
    switch (status) {
      case "active":
        return "Ativa"
      case "resolved":
        return "Resolvida"
      case "archived":
        return "Arquivada"
      default:
        return status
    }
  }

  const getSatisfactionStars = (rating?: number) => {
    if (!rating) return "N/A"
    return "★".repeat(rating) + "☆".repeat(5 - rating)
  }

  const totalConversations = conversations.length
  const activeConversations = conversations.filter((c) => c.status === "active").length
  const resolvedConversations = conversations.filter((c) => c.status === "resolved").length
  const averageSatisfaction =
    conversations.filter((c) => c.satisfaction).reduce((sum, c) => sum + (c.satisfaction || 0), 0) /
    conversations.filter((c) => c.satisfaction).length

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Conversas</h1>
          <p className="text-muted-foreground">Monitore e analise todas as conversas do AURA</p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
          <Button variant="outline">
            <Filter className="w-4 h-4 mr-2" />
            Filtros Avançados
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Conversas</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalConversations}</div>
            <p className="text-xs text-muted-foreground">+5 desde ontem</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversas Ativas</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeConversations}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((activeConversations / totalConversations) * 100)}% do total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolvidas</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{resolvedConversations}</div>
            <p className="text-xs text-muted-foreground">
              Taxa de resolução: {Math.round((resolvedConversations / totalConversations) * 100)}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Satisfação Média</CardTitle>
            <Bot className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isNaN(averageSatisfaction) ? "N/A" : averageSatisfaction.toFixed(1)}
            </div>
            <p className="text-xs text-muted-foreground">{getSatisfactionStars(Math.round(averageSatisfaction))}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros e Busca</CardTitle>
          <CardDescription>Encontre conversas específicas usando os filtros abaixo</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por título, usuário, empresa ou tags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="active">Ativas</SelectItem>
                <SelectItem value="resolved">Resolvidas</SelectItem>
                <SelectItem value="archived">Arquivadas</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="updated">Última Atualização</SelectItem>
                <SelectItem value="created">Data de Criação</SelectItem>
                <SelectItem value="messages">Número de Mensagens</SelectItem>
                <SelectItem value="title">Título (A-Z)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Conversations Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Conversas</CardTitle>
          <CardDescription>{filteredConversations.length} conversa(s) encontrada(s)</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Conversa</TableHead>
                <TableHead>Usuário</TableHead>
                <TableHead>Empresa</TableHead>
                <TableHead>Mensagens</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Última Mensagem</TableHead>
                <TableHead>Satisfação</TableHead>
                <TableHead>Atualizada</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredConversations.map((conversation) => (
                <TableRow key={conversation.id}>
                  <TableCell>
                    <div className="space-y-1">
                      <p className="font-medium text-sm">{conversation.title}</p>
                      <div className="flex flex-wrap gap-1">
                        {conversation.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {conversation.tags.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{conversation.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="space-y-1">
                      <p className="font-medium text-sm">{conversation.accountName}</p>
                      <p className="text-xs text-muted-foreground">{conversation.accountEmail}</p>
                    </div>
                  </TableCell>

                  <TableCell>
                    <span className="text-sm">{conversation.company}</span>
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <MessageSquare className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">{conversation.messageCount}</span>
                    </div>
                  </TableCell>

                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(conversation.status)}>
                      {getStatusLabel(conversation.status)}
                    </Badge>
                  </TableCell>

                  <TableCell>
                    <div className="space-y-1 max-w-48">
                      <p className="text-sm truncate">{conversation.lastMessage}</p>
                      <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                        {conversation.lastMessageRole === "user" ? (
                          <User className="w-3 h-3" />
                        ) : (
                          <Bot className="w-3 h-3" />
                        )}
                        <span>{conversation.lastMessageRole === "user" ? "Usuário" : "AURA"}</span>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="text-sm">
                      {conversation.satisfaction ? (
                        <span title={`${conversation.satisfaction}/5 estrelas`}>
                          {getSatisfactionStars(conversation.satisfaction)}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {formatDistanceToNow(conversation.updatedAt, {
                          addSuffix: true,
                          locale: ptBR,
                        })}
                      </span>
                    </div>
                  </TableCell>

                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="w-4 h-4 mr-2" />
                          Ver Conversa
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Download className="w-4 h-4 mr-2" />
                          Exportar
                        </DropdownMenuItem>
                        <DropdownMenuItem>Arquivar</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">Excluir</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
