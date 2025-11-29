"use client"

import { useMemo } from "react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
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
    const totals = useMemo(() => {
        const total = saleRequests.length
        const pending = saleRequests.filter((request) => request.status === "pendente").length
        const confirmed = saleRequests.filter((request) => request.status === "confirmada").length
        const cancelled = saleRequests.filter((request) => request.status === "cancelada").length

        return { total, pending, confirmed, cancelled }
    }, [saleRequests])

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
                    {saleRequests.length === 0 ? (
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
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {saleRequests.map((request) => {
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
