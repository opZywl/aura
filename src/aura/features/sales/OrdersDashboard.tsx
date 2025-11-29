"use client"

import { useMemo, useState } from "react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { type SaleRequest } from "@/src/server/workshop-data"

interface OrdersDashboardProps {
    saleRequests: SaleRequest[]
}

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
})

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
})

const statusLabels: Record<SaleRequest["status"], string> = {
    pendente: "Pendente",
    confirmada: "Confirmada",
    cancelada: "Cancelada",
}

const statusClasses: Record<SaleRequest["status"], string> = {
    pendente: "bg-amber-100 text-amber-700 border border-amber-200",
    confirmada: "bg-emerald-100 text-emerald-700 border border-emerald-200",
    cancelada: "bg-rose-100 text-rose-700 border border-rose-200",
}

const typeLabels: Record<SaleRequest["type"], string> = {
    estoque: "Item em estoque",
    solicitacao: "Solicitação especial",
}

export default function OrdersDashboard({ saleRequests }: OrdersDashboardProps) {
    const [requests, setRequests] = useState<SaleRequest[]>(saleRequests)
    const [submittingId, setSubmittingId] = useState<string | null>(null)

    const handleUpdateStatus = async (request: SaleRequest, status: SaleRequest["status"]) => {
        try {
            setSubmittingId(request.id)

            const response = await fetch("/api/pedidos", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id: request.id,
                    status,
                    restock: status === "confirmada",
                }),
            })

            if (!response.ok) {
                throw new Error("Falha ao atualizar pedido")
            }

            const payload = await response.json()
            const updated: SaleRequest = payload.saleRequest
            setRequests((prev) => prev.map((entry) => (entry.id === updated.id ? updated : entry)))
        } catch (error) {
            console.error("Erro ao atualizar status do pedido:", error)
        } finally {
            setSubmittingId(null)
        }
    }

    const totals = useMemo(() => {
        const total = requests.length
        const pending = requests.filter((request) => request.status === "pendente").length
        const confirmed = requests.filter((request) => request.status === "confirmada").length
        const cancelled = requests.filter((request) => request.status === "cancelada").length

        return { total, pending, confirmed, cancelled }
    }, [requests])

    return (
        <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Pedidos totais</CardDescription>
                        <CardTitle className="text-3xl font-bold">{totals.total}</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground">
                        Entradas registradas pelo fluxo e painel.
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Pedidos pendentes</CardDescription>
                        <CardTitle className="text-3xl font-bold">{totals.pending}</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground">
                        Aguardando retirada ou confirmação.
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Confirmados</CardDescription>
                        <CardTitle className="text-3xl font-bold">{totals.confirmed}</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground">
                        Pedidos já validados.
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>Cancelados</CardDescription>
                        <CardTitle className="text-3xl font-bold">{totals.cancelled}</CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm text-muted-foreground">
                        Inclui itens expirados ou recusados.
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader className="pb-3">
                    <CardTitle>Pedidos registrados</CardTitle>
                    <CardDescription>Pedidos vindos do node de vendas e solicitações especiais.</CardDescription>
                </CardHeader>
                <Separator />
                <CardContent className="pt-4">
                    {requests.length === 0 ? (
                        <Alert>
                            <AlertTitle>Nenhum pedido encontrado</AlertTitle>
                            <AlertDescription>
                                Quando os clientes confirmarem compras ou solicitarem itens, eles aparecerão aqui.
                            </AlertDescription>
                        </Alert>
                    ) : (
                        <ScrollArea className="max-h-[520px] pr-4">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Pedido</TableHead>
                                        <TableHead>Tipo</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Valor</TableHead>
                                        <TableHead>Prazo</TableHead>
                                        <TableHead>Origem</TableHead>
                                        <TableHead className="text-right">Ações</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {requests.map((request) => {
                                        const value =
                                            typeof request.price === "number"
                                                ? currencyFormatter.format(request.price)
                                                : "—"
                                        const deadline = request.pickupDeadline || request.contactBy
                                        const deadlineLabel = deadline
                                            ? dateFormatter.format(new Date(deadline))
                                            : "—"

                                        return (
                                            <TableRow key={request.id}>
                                                <TableCell>
                                                    <div className="space-y-1">
                                                        <p className="font-medium leading-tight">{request.itemName}</p>
                                                        {request.requestedName && (
                                                            <p className="text-xs text-muted-foreground">
                                                                Solicitado: {request.requestedName}
                                                            </p>
                                                        )}
                                                        <p className="text-xs text-muted-foreground">
                                                            {dateFormatter.format(new Date(request.createdAt))}
                                                        </p>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className="text-xs">
                                                        {typeLabels[request.type]}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className={`${statusClasses[request.status]} text-xs`}>
                                                        {statusLabels[request.status]}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>{value}</TableCell>
                                                <TableCell>{deadlineLabel}</TableCell>
                                                <TableCell className="capitalize">{request.source ?? "workflow"}</TableCell>
                                                <TableCell className="space-x-2 text-right">
                                                    {request.status === "pendente" ? (
                                                        <>
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                disabled={submittingId === request.id}
                                                                onClick={() => handleUpdateStatus(request, "confirmada")}
                                                            >
                                                                Aceitar
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="ghost"
                                                                className="text-destructive"
                                                                disabled={submittingId === request.id}
                                                                onClick={() => handleUpdateStatus(request, "cancelada")}
                                                            >
                                                                Recusar
                                                            </Button>
                                                        </>
                                                    ) : (
                                                        <Badge variant="secondary" className="text-xs">
                                                            {statusLabels[request.status]}
                                                        </Badge>
                                                    )}
                                                </TableCell>
                                            </TableRow>
                                        )
                                    })}
                                </TableBody>
                            </Table>
                        </ScrollArea>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
