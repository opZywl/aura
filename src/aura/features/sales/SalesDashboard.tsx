"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"

import {
    createInventoryItem,
    createMaintenanceTask,
    createServiceOrder,
    registerFinancialRecord,
    registerSale,
    updateMaintenanceTaskStatus,
} from "@/app/panel/vendas/actions"
import type {
    FinancialRecord,
    InventoryItem,
    MaintenanceStatus,
    MaintenanceTask,
    ServiceOrder,
    ServiceOrderStatus,
    WorkshopData,
} from "@/src/server/workshop-data"

interface SalesDashboardProps {
    initialData: WorkshopData
}
interface AggregatedItem extends InventoryItem {
    soldQuantity: number
    revenue: number
}

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
})

const numberFormatter = new Intl.NumberFormat("pt-BR")

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
    timeZone: "UTC",
})

const serviceOrderStatusLabels: Record<ServiceOrderStatus, string> = {
    aberta: "Aberta",
    em_andamento: "Em andamento",
    aguardando_peca: "Aguardando peça",
    concluida: "Concluída",
    cancelada: "Cancelada",
}

const serviceOrderStatusBadgeClasses: Record<ServiceOrderStatus, string> = {
    aberta: "bg-sky-100 text-sky-700 border border-sky-200",
    em_andamento: "bg-amber-100 text-amber-700 border border-amber-200",
    aguardando_peca: "bg-purple-100 text-purple-700 border border-purple-200",
    concluida: "bg-emerald-100 text-emerald-700 border border-emerald-200",
    cancelada: "bg-rose-100 text-rose-700 border border-rose-200",
}

const priorityLabels: Record<ServiceOrder["priority"], string> = {
    baixa: "Baixa",
    media: "Média",
    alta: "Alta",
}

const priorityBadgeClasses: Record<ServiceOrder["priority"], string> = {
    baixa: "bg-emerald-100 text-emerald-700 border border-emerald-200",
    media: "bg-sky-100 text-sky-700 border border-sky-200",
    alta: "bg-rose-100 text-rose-700 border border-rose-200",
}

const maintenanceStatusLabels: Record<MaintenanceStatus, string> = {
    pendente: "Pendente",
    em_andamento: "Em andamento",
    concluida: "Concluída",
}

const maintenanceStatusBadgeClasses: Record<MaintenanceStatus, string> = {
    pendente: "bg-slate-100 text-slate-700 border border-slate-200",
    em_andamento: "bg-amber-100 text-amber-700 border border-amber-200",
    concluida: "bg-emerald-100 text-emerald-700 border border-emerald-200",
}

const maintenanceColumns: { status: MaintenanceStatus; title: string; description: string }[] = [
    { status: "pendente", title: "Pendentes", description: "Aguardando início" },
    { status: "em_andamento", title: "Em andamento", description: "Execução em progresso" },
    { status: "concluida", title: "Concluídas", description: "Finalizadas e liberadas" },
]

type MaintenanceWithOrder = {
    task: MaintenanceTask
    order?: ServiceOrder
}
export default function SalesDashboard({ initialData }: SalesDashboardProps) {
    const router = useRouter()
    const [data, setData] = useState<WorkshopData>(initialData)
    const [successMessage, setSuccessMessage] = useState<string | null>(null)
    const [errorMessage, setErrorMessage] = useState<string | null>(null)
    const [inventorySubmitting, setInventorySubmitting] = useState(false)
    const [saleSubmitting, setSaleSubmitting] = useState(false)
    const [serviceOrderSubmitting, setServiceOrderSubmitting] = useState(false)
    const [maintenanceSubmitting, setMaintenanceSubmitting] = useState(false)
    const [financialSubmitting, setFinancialSubmitting] = useState(false)
    const [updatingMaintenanceTaskId, setUpdatingMaintenanceTaskId] = useState<string | null>(null)
    const [selectedItemId, setSelectedItemId] = useState<string>(initialData.inventory[0]?.id ?? "")
    const [serviceOrderStatusValue, setServiceOrderStatusValue] = useState<ServiceOrderStatus>("aberta")
    const [serviceOrderPriorityValue, setServiceOrderPriorityValue] = useState<ServiceOrder["priority"]>("media")
    const [maintenanceOrderId, setMaintenanceOrderId] = useState<string>(initialData.serviceOrders[0]?.id ?? "")
    const [maintenanceStatusValue, setMaintenanceStatusValue] = useState<MaintenanceStatus>("pendente")
    const [financialType, setFinancialType] = useState<FinancialRecord["type"]>("receita")
    const [financialRelatedSaleId, setFinancialRelatedSaleId] = useState<string>("")
    const [financialRelatedOrderId, setFinancialRelatedOrderId] = useState<string>("")
    const [maintenanceStatusSelections, setMaintenanceStatusSelections] = useState<Record<string, MaintenanceStatus>>({})

    const inventoryFormRef = useRef<HTMLFormElement>(null)
    const saleFormRef = useRef<HTMLFormElement>(null)
    const serviceOrderFormRef = useRef<HTMLFormElement>(null)
    const maintenanceFormRef = useRef<HTMLFormElement>(null)
    const financialFormRef = useRef<HTMLFormElement>(null)

    useEffect(() => {
        setData(initialData)
    }, [initialData])

    useEffect(() => {
        if (!data.inventory.some((item) => item.id === selectedItemId)) {
            setSelectedItemId(data.inventory[0]?.id ?? "")
        }
    }, [data.inventory, selectedItemId])

    useEffect(() => {
        if (!data.serviceOrders.some((order) => order.id === maintenanceOrderId)) {
            setMaintenanceOrderId(data.serviceOrders[0]?.id ?? "")
        }
    }, [data.serviceOrders, maintenanceOrderId])

    useEffect(() => {
        setMaintenanceStatusSelections((prev) => {
            const next: Record<string, MaintenanceStatus> = {}
            data.maintenanceTasks.forEach((task) => {
                next[task.id] = prev[task.id] ?? task.status
            })
            return next
        })
    }, [data.maintenanceTasks])

    useEffect(() => {
        if (!data.sales.some((sale) => sale.id === financialRelatedSaleId)) {
            setFinancialRelatedSaleId("")
        }
        if (!data.serviceOrders.some((order) => order.id === financialRelatedOrderId)) {
            setFinancialRelatedOrderId("")
        }
    }, [data.sales, data.serviceOrders, financialRelatedSaleId, financialRelatedOrderId])

    const selectedItem = useMemo(
        () => data.inventory.find((item) => item.id === selectedItemId),
        [data.inventory, selectedItemId],
    )
    const aggregatedInventory: AggregatedItem[] = useMemo(() => {
        const salesByItem = data.sales.reduce<Record<string, { quantity: number; revenue: number }>>((acc, sale) => {
            if (!acc[sale.itemId]) {
                acc[sale.itemId] = { quantity: 0, revenue: 0 }
            }
            acc[sale.itemId].quantity += sale.quantity
            acc[sale.itemId].revenue += sale.total
            return acc
        }, {})

        return data.inventory.map((item) => ({
            ...item,
            soldQuantity: salesByItem[item.id]?.quantity ?? 0,
            revenue: salesByItem[item.id]?.revenue ?? 0,
        }))
    }, [data.inventory, data.sales])

    const totals = useMemo(() => {
        const totalSalesCount = data.sales.length
        const totalItemsSold = data.sales.reduce((sum, sale) => sum + sale.quantity, 0)
        const totalRevenue = data.sales.reduce((sum, sale) => sum + sale.total, 0)
        const totalStock = data.inventory.reduce((sum, item) => sum + item.stockQuantity, 0)
        const stockValue = data.inventory.reduce((sum, item) => sum + item.stockQuantity * item.unitPrice, 0)
        const lowStockItems = data.inventory.filter((item) => item.stockQuantity <= item.minimumStock).length

        return {
            totalSalesCount,
            totalItemsSold,
            totalRevenue,
            totalStock,
            stockValue,
            lowStockItems,
        }
    }, [data.inventory, data.sales])

    const topSellingItems = useMemo(
        () =>
            [...aggregatedInventory]
                .sort((a, b) => b.revenue - a.revenue)
                .slice(0, 5),
        [aggregatedInventory],
    )

    const chartData = useMemo(
        () => [
            {
                metric: "Total de vendas (itens)",
                value: totals.totalItemsSold,
                formula: "∑ quantidades vendidas",
                formatter: (value: number) => numberFormatter.format(value),
            },
            {
                metric: "Total em estoque (itens)",
                value: totals.totalStock,
                formula: "∑ quantidades em estoque",
                formatter: (value: number) => numberFormatter.format(value),
            },
            {
                metric: "Total ganho (R$)",
                value: Number(totals.totalRevenue.toFixed(2)),
                formula: "∑ (quantidade × preço de venda)",
                formatter: (value: number) => currencyFormatter.format(value),
            },
        ],
        [totals.totalItemsSold, totals.totalStock, totals.totalRevenue],
    )

    const serviceOrdersSorted = useMemo(
        () =>
            [...data.serviceOrders].sort((a, b) => {
                const dateA = new Date(a.createdAt).getTime()
                const dateB = new Date(b.createdAt).getTime()
                return dateB - dateA
            }),
        [data.serviceOrders],
    )
    const serviceOrderStats = useMemo(() => {
        const statusCounts: Record<ServiceOrderStatus, number> = {
            aberta: 0,
            em_andamento: 0,
            aguardando_peca: 0,
            concluida: 0,
            cancelada: 0,
        }

        let totalEstimate = 0
        let totalReceived = 0
        let totalBalance = 0
        let highPriority = 0
        let dueSoon = 0
        const today = new Date()

        data.serviceOrders.forEach((order) => {
            statusCounts[order.status] += 1
            totalEstimate += order.totalEstimate
            totalReceived += order.amountPaid
            totalBalance += order.balance
            if (order.priority === "alta") {
                highPriority += 1
            }
            if (order.expectedDelivery) {
                const due = new Date(order.expectedDelivery)
                if (!Number.isNaN(due.getTime())) {
                    const diffDays = (due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
                    if (diffDays <= 2) {
                        dueSoon += 1
                    }
                }
            }
        })

        return {
            totalOrders: data.serviceOrders.length,
            statusCounts,
            totalEstimate,
            totalReceived,
            totalBalance,
            highPriority,
            dueSoon,
        }
    }, [data.serviceOrders])

    const maintenanceByStatus = useMemo(() => {
        const groups: Record<MaintenanceStatus, MaintenanceWithOrder[]> = {
            pendente: [],
            em_andamento: [],
            concluida: [],
        }

        data.maintenanceTasks.forEach((task) => {
            const order = data.serviceOrders.find((serviceOrder) => serviceOrder.id === task.orderId)
            groups[task.status].push({ task, order })
        })

        return groups
    }, [data.maintenanceTasks, data.serviceOrders])

    const financialSummary = useMemo(() => {
        const income = data.financialRecords.reduce((sum, record) => (record.type === "receita" ? sum + record.amount : sum), 0)
        const expense = data.financialRecords.reduce((sum, record) => (record.type === "despesa" ? sum + record.amount : sum), 0)
        const outstandingOrders = data.serviceOrders.reduce((sum, order) => sum + order.balance, 0)
        const averageTicket = totals.totalSalesCount ? totals.totalRevenue / totals.totalSalesCount : 0

        return {
            income,
            expense,
            net: income - expense,
            outstandingOrders,
            averageTicket,
        }
    }, [data.financialRecords, data.serviceOrders, totals.totalSalesCount, totals.totalRevenue])

    const financialRecordsSorted = useMemo(
        () =>
            [...data.financialRecords].sort((a, b) => {
                if (a.date === b.date) {
                    return a.id < b.id ? 1 : -1
                }
                return a.date < b.date ? 1 : -1
            }),
        [data.financialRecords],
    )

    const salesLookup = useMemo(() => {
        const lookup = new Map<string, { label: string }>()
        data.sales.forEach((sale) => {
            lookup.set(sale.id, {
                label: `${sale.id} · ${numberFormatter.format(sale.quantity)} un (${currencyFormatter.format(sale.total)})`,
            })
        })
        return lookup
    }, [data.sales])

    const serviceOrderLookup = useMemo(() => {
        const lookup = new Map<string, { code: string; customer: string }>()
        data.serviceOrders.forEach((order) => {
            lookup.set(order.id, { code: order.code, customer: order.customer })
        })
        return lookup
    }, [data.serviceOrders])
    const handleCreateInventoryItem = async (formData: FormData) => {
        setInventorySubmitting(true)
        setSuccessMessage(null)
        setErrorMessage(null)

        const result = await createInventoryItem(formData)

        if (result?.error) {
            setErrorMessage(result.error)
        } else {
            setSuccessMessage(result?.message ?? "Peça cadastrada com sucesso.")
            inventoryFormRef.current?.reset()
        }

        setInventorySubmitting(false)
        router.refresh()
    }

    const handleRegisterSale = async (formData: FormData) => {
        setSaleSubmitting(true)
        setSuccessMessage(null)
        setErrorMessage(null)

        const result = await registerSale(formData)

        if (result?.error) {
            setErrorMessage(result.error)
        } else {
            setSuccessMessage(result?.message ?? "Venda registrada com sucesso.")
            saleFormRef.current?.reset()
            setSelectedItemId(data.inventory[0]?.id ?? "")
        }

        setSaleSubmitting(false)
        router.refresh()
    }

    const handleCreateServiceOrder = async (formData: FormData) => {
        setServiceOrderSubmitting(true)
        setSuccessMessage(null)
        setErrorMessage(null)

        const result = await createServiceOrder(formData)

        if (result?.error) {
            setErrorMessage(result.error)
        } else {
            setSuccessMessage(result?.message ?? "Ordem de serviço criada com sucesso.")
            serviceOrderFormRef.current?.reset()
            setServiceOrderStatusValue("aberta")
            setServiceOrderPriorityValue("media")
        }

        setServiceOrderSubmitting(false)
        router.refresh()
    }

    const handleCreateMaintenanceTask = async (formData: FormData) => {
        setMaintenanceSubmitting(true)
        setSuccessMessage(null)
        setErrorMessage(null)

        const result = await createMaintenanceTask(formData)

        if (result?.error) {
            setErrorMessage(result.error)
        } else {
            setSuccessMessage(result?.message ?? "Atividade de manutenção registrada.")
            maintenanceFormRef.current?.reset()
            setMaintenanceStatusValue("pendente")
        }

        setMaintenanceSubmitting(false)
        router.refresh()
    }

    const handleUpdateMaintenanceTaskStatus = async (formData: FormData) => {
        const taskId = (formData.get("taskId") ?? "").toString()
        setUpdatingMaintenanceTaskId(taskId || null)
        setSuccessMessage(null)
        setErrorMessage(null)

        const result = await updateMaintenanceTaskStatus(formData)

        if (result?.error) {
            setErrorMessage(result.error)
        } else {
            setSuccessMessage(result?.message ?? "Status atualizado.")
        }

        setUpdatingMaintenanceTaskId(null)
        router.refresh()
    }

    const handleRegisterFinancialRecord = async (formData: FormData) => {
        setFinancialSubmitting(true)
        setSuccessMessage(null)
        setErrorMessage(null)

        const result = await registerFinancialRecord(formData)

        if (result?.error) {
            setErrorMessage(result.error)
        } else {
            setSuccessMessage(result?.message ?? "Registro financeiro adicionado.")
            financialFormRef.current?.reset()
            setFinancialType("receita")
            setFinancialRelatedSaleId("")
            setFinancialRelatedOrderId("")
        }

        setFinancialSubmitting(false)
        router.refresh()
    }

    const handleSelectedItemChange = (value: string) => {
        setSelectedItemId(value)
        setErrorMessage(null)
    }
    const renderStatus = (item: AggregatedItem) => {
        if (item.stockQuantity === 0) {
            return <span className="text-destructive font-medium">Sem estoque</span>
        }

        if (item.stockQuantity <= item.minimumStock) {
            return <span className="text-amber-500 font-medium">Atenção: estoque baixo</span>
        }

        return <span className="text-emerald-500 font-medium">Estoque saudável</span>
    }

    const getSaleDateLabel = (saleDate?: string) => {
        if (!saleDate) return "-"
        const parsed = new Date(`${saleDate}T00:00:00`)
        if (Number.isNaN(parsed.getTime())) {
            return saleDate
        }
        return dateFormatter.format(parsed)
    }

    const tooltipFormatter = (value: number, name: string, props: any) => {
        const payload = props?.payload as { formatter?: (value: number) => string } | undefined
        if (payload?.formatter) {
            return payload.formatter(value)
        }
        return numberFormatter.format(value)
    }
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Gestão completa da oficina</h1>
                <p className="text-muted-foreground mt-1">
                    Controle vendas, ordens de serviço, manutenção em andamento e fluxo financeiro em um único painel.
                </p>
            </div>

            {(successMessage || errorMessage) && (
                <div
                    className={`rounded-lg border p-4 ${
                        errorMessage
                            ? "border-destructive/50 bg-destructive/10 text-destructive"
                            : "border-emerald-500/40 bg-emerald-500/10 text-emerald-600"
                    }`}
                >
                    <p className="font-medium">{errorMessage ? errorMessage : successMessage}</p>
                </div>
            )}

            <Tabs defaultValue="overview" className="space-y-6">
                <TabsList className="w-full gap-2 sm:w-auto">
                    <TabsTrigger value="overview" className="flex-1 sm:flex-none">
                        Vendas & Estoque
                    </TabsTrigger>
                    <TabsTrigger value="orders" className="flex-1 sm:flex-none">
                        Ordens de Serviço
                    </TabsTrigger>
                    <TabsTrigger value="financial" className="flex-1 sm:flex-none">
                        Financeiro
                    </TabsTrigger>
                </TabsList>
                <TabsContent value="overview" className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Total de vendas</CardTitle>
                                <CardDescription>Soma das quantidades vendidas (∑ quantidades).</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-3xl font-semibold">{numberFormatter.format(totals.totalItemsSold)}</p>
                                <p className="text-muted-foreground text-sm mt-2">{totals.totalSalesCount} operações registradas.</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle>Total em estoque</CardTitle>
                                <CardDescription>Soma das unidades disponíveis (∑ estoque atual).</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-3xl font-semibold">{numberFormatter.format(totals.totalStock)}</p>
                                <p className="text-muted-foreground text-sm mt-2">
                                    Valor de reposição estimado: {currencyFormatter.format(totals.stockValue)}
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle>Total ganho</CardTitle>
                                <CardDescription>Receita acumulada (∑ quantidade × preço de venda).</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-3xl font-semibold">{currencyFormatter.format(totals.totalRevenue)}</p>
                                <p className="text-muted-foreground text-sm mt-2">
                                    Ticket médio: {currencyFormatter.format(totals.totalSalesCount ? totals.totalRevenue / totals.totalSalesCount : 0)}
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle>Alertas de estoque</CardTitle>
                                <CardDescription>Itens com estoque igual ou abaixo do mínimo definido.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-3xl font-semibold">{numberFormatter.format(totals.lowStockItems)}</p>
                                <p className="text-muted-foreground text-sm mt-2">Monitore para evitar rupturas e atrasos.</p>
                            </CardContent>
                        </Card>
                    </div>
                    <Card>
                        <CardHeader>
                            <CardTitle>Resumo consolidado</CardTitle>
                            <CardDescription>Comparativo direto entre vendas, estoque e receita.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="h-72 w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={chartData}>
                                        <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                                        <XAxis dataKey="metric" tick={{ fontSize: 12 }} interval={0} />
                                        <YAxis tickFormatter={(value) => numberFormatter.format(value)} tick={{ fontSize: 12 }} />
                                        <Tooltip formatter={tooltipFormatter as any} labelFormatter={(label) => label} />
                                        <Bar dataKey="value" radius={[6, 6, 0, 0]} fill="hsl(var(--primary))" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="grid gap-2 md:grid-cols-3">
                                {chartData.map((entry) => (
                                    <div key={entry.metric} className="rounded-md border p-3 text-sm">
                                        <p className="font-semibold text-foreground">{entry.metric}</p>
                                        <p className="text-muted-foreground">{entry.formula}</p>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                    <div className="grid gap-6 lg:grid-cols-3">
                        <Card className="lg:col-span-1">
                            <CardHeader>
                                <CardTitle>Cadastrar nova peça</CardTitle>
                                <CardDescription>Inclua itens no estoque para disponibilizar no painel de vendas.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form ref={inventoryFormRef} action={handleCreateInventoryItem} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Nome da peça</Label>
                                        <Input id="name" name="name" placeholder="Ex: Pastilha de freio traseira" required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="category">Categoria</Label>
                                        <Input id="category" name="category" placeholder="Ex: Freios" required />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="unitPrice">Preço unitário (R$)</Label>
                                            <Input
                                                id="unitPrice"
                                                name="unitPrice"
                                                type="number"
                                                inputMode="decimal"
                                                min={0}
                                                step="0.01"
                                                placeholder="0,00"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="stockQuantity">Estoque inicial</Label>
                                            <Input id="stockQuantity" name="stockQuantity" type="number" min={0} step={1} placeholder="0" required />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="minimumStock">Estoque mínimo desejado</Label>
                                        <Input id="minimumStock" name="minimumStock" type="number" min={0} step={1} placeholder="0" />
                                    </div>
                                    <Button type="submit" className="w-full" disabled={inventorySubmitting}>
                                        {inventorySubmitting ? "Salvando..." : "Cadastrar peça"}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                        <Card className="lg:col-span-1">
                            <CardHeader>
                                <CardTitle>Registrar venda</CardTitle>
                                <CardDescription>Atualize o estoque automaticamente ao registrar uma nova venda.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form ref={saleFormRef} action={handleRegisterSale} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>Peça vendida</Label>
                                        <Select value={selectedItemId} onValueChange={handleSelectedItemChange}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecione uma peça" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {data.inventory.map((item) => (
                                                    <SelectItem key={item.id} value={item.id}>
                                                        {item.name} · {item.stockQuantity} un disponíveis
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <input type="hidden" name="itemId" value={selectedItemId} />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="quantity">Quantidade</Label>
                                            <Input id="quantity" name="quantity" type="number" min={1} step={1} placeholder="0" required />
                                            {selectedItem && (
                                                <p className="text-xs text-muted-foreground">
                                                    Disponível em estoque: {numberFormatter.format(selectedItem.stockQuantity)} unidades.
                                                </p>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="salePrice">Preço de venda (R$)</Label>
                                            <Input
                                                key={selectedItem?.id ?? "salePrice"}
                                                id="salePrice"
                                                name="salePrice"
                                                type="number"
                                                inputMode="decimal"
                                                min={0}
                                                step="0.01"
                                                placeholder="0,00"
                                                defaultValue={selectedItem?.unitPrice}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="date">Data da venda</Label>
                                            <Input id="date" name="date" type="date" max={new Date().toISOString().slice(0, 10)} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="customer">Cliente</Label>
                                            <Input id="customer" name="customer" placeholder="Nome ou razão social" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="notes">Observações</Label>
                                        <Textarea id="notes" name="notes" placeholder="Detalhes adicionais da venda" rows={3} />
                                    </div>
                                    <Button type="submit" className="w-full" disabled={saleSubmitting || !selectedItemId}>
                                        {saleSubmitting ? "Registrando..." : "Registrar venda"}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                        <Card className="lg:col-span-1">
                            <CardHeader>
                                <CardTitle>Top itens vendidos</CardTitle>
                                <CardDescription>Ranking por faturamento acumulado (∑ venda.total).</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {topSellingItems.length === 0 ? (
                                    <p className="text-muted-foreground text-sm">Nenhuma venda registrada até o momento.</p>
                                ) : (
                                    <ul className="space-y-3 text-sm">
                                        {topSellingItems.map((item, index) => (
                                            <li key={item.id} className="flex items-start justify-between gap-3">
                                                <div>
                                                    <p className="font-medium text-foreground">
                                                        {index + 1}. {item.name}
                                                    </p>
                                                    <p className="text-muted-foreground">
                                                        {numberFormatter.format(item.soldQuantity)} un · {currencyFormatter.format(item.revenue)}
                                                    </p>
                                                </div>
                                                <span className="rounded-full bg-primary/10 px-2 py-1 text-xs font-semibold text-primary">
                                                    {item.category}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                    <div className="grid gap-6 lg:grid-cols-2">
                        <Card className="overflow-hidden">
                            <CardHeader>
                                <CardTitle>Controle de estoque</CardTitle>
                                <CardDescription>Visão geral das peças cadastradas e seu status atual.</CardDescription>
                            </CardHeader>
                            <CardContent className="px-0">
                                <ScrollArea className="w-full">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Peça</TableHead>
                                                <TableHead>Categoria</TableHead>
                                                <TableHead className="text-right">Estoque</TableHead>
                                                <TableHead className="text-right">Min.</TableHead>
                                                <TableHead className="text-right">Preço</TableHead>
                                                <TableHead>Status</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {aggregatedInventory.map((item) => (
                                                <TableRow key={item.id} className={item.stockQuantity <= item.minimumStock ? "bg-amber-500/5" : undefined}>
                                                    <TableCell>
                                                        <div className="font-medium text-foreground">{item.name}</div>
                                                        <p className="text-xs text-muted-foreground">
                                                            Vendidos: {numberFormatter.format(item.soldQuantity)} · Receita: {currencyFormatter.format(item.revenue)}
                                                        </p>
                                                    </TableCell>
                                                    <TableCell>{item.category}</TableCell>
                                                    <TableCell className="text-right">{numberFormatter.format(item.stockQuantity)}</TableCell>
                                                    <TableCell className="text-right">{numberFormatter.format(item.minimumStock)}</TableCell>
                                                    <TableCell className="text-right">{currencyFormatter.format(item.unitPrice)}</TableCell>
                                                    <TableCell>{renderStatus(item)}</TableCell>
                                                </TableRow>
                                            ))}
                                            {aggregatedInventory.length === 0 && (
                                                <TableRow>
                                                    <TableCell colSpan={6} className="text-center text-muted-foreground py-6">
                                                        Cadastre suas primeiras peças para começar o controle.
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </ScrollArea>
                            </CardContent>
                        </Card>

                        <Card className="overflow-hidden">
                            <CardHeader>
                                <CardTitle>Histórico de vendas</CardTitle>
                                <CardDescription>Detalhamento de cada venda registrada com ID e cliente.</CardDescription>
                            </CardHeader>
                            <CardContent className="px-0">
                                <ScrollArea className="w-full">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>ID</TableHead>
                                                <TableHead>Peça</TableHead>
                                                <TableHead className="text-right">Qtde.</TableHead>
                                                <TableHead className="text-right">Total</TableHead>
                                                <TableHead>Cliente</TableHead>
                                                <TableHead>Data</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {data.sales
                                                .slice()
                                                .sort((a, b) => (a.date > b.date ? -1 : 1))
                                                .map((sale) => {
                                                    const item = data.inventory.find((inventoryItem) => inventoryItem.id === sale.itemId)
                                                    return (
                                                        <TableRow key={sale.id}>
                                                            <TableCell className="font-mono text-xs">{sale.id}</TableCell>
                                                            <TableCell>{item?.name ?? "Peça removida"}</TableCell>
                                                            <TableCell className="text-right">{numberFormatter.format(sale.quantity)}</TableCell>
                                                            <TableCell className="text-right">{currencyFormatter.format(sale.total)}</TableCell>
                                                            <TableCell>{sale.customer ?? "-"}</TableCell>
                                                            <TableCell>{getSaleDateLabel(sale.date)}</TableCell>
                                                        </TableRow>
                                                    )
                                                })}
                                            {data.sales.length === 0 && (
                                                <TableRow>
                                                    <TableCell colSpan={6} className="text-center text-muted-foreground py-6">
                                                        Nenhuma venda registrada até o momento.
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </ScrollArea>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
                <TabsContent value="orders" className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Ordens em aberto</CardTitle>
                                <CardDescription>Total de ordens criadas na oficina.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-3xl font-semibold">{numberFormatter.format(serviceOrderStats.totalOrders)}</p>
                                <p className="text-muted-foreground text-sm mt-2">
                                    {numberFormatter.format(serviceOrderStats.statusCounts.em_andamento)} em andamento · {numberFormatter.format(serviceOrderStats.statusCounts.aguardando_peca)} aguardando peça.
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle>Faturamento previsto</CardTitle>
                                <CardDescription>Somatório das ordens registradas (serviços + peças).</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-3xl font-semibold">{currencyFormatter.format(serviceOrderStats.totalEstimate)}</p>
                                <p className="text-muted-foreground text-sm mt-2">
                                    Recebido: {currencyFormatter.format(serviceOrderStats.totalReceived)} · Em aberto: {currencyFormatter.format(serviceOrderStats.totalBalance)}
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle>Prioridades críticas</CardTitle>
                                <CardDescription>Ordens sinalizadas como alta prioridade.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-3xl font-semibold">{numberFormatter.format(serviceOrderStats.highPriority)}</p>
                                <p className="text-muted-foreground text-sm mt-2">
                                    {numberFormatter.format(serviceOrderStats.dueSoon)} entregas previstas em até 48h.
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle>Status das ordens</CardTitle>
                                <CardDescription>Distribuição geral por etapa de atendimento.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-2 text-sm">
                                {Object.entries(serviceOrderStats.statusCounts).map(([status, value]) => (
                                    <div key={status} className="flex items-center justify-between">
                                        <span className="text-muted-foreground">{serviceOrderStatusLabels[status as ServiceOrderStatus]}</span>
                                        <span className="font-medium text-foreground">{numberFormatter.format(value)}</span>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </div>
                    <div className="grid gap-6 lg:grid-cols-3">
                        <Card className="lg:col-span-2 overflow-hidden">
                            <CardHeader>
                                <CardTitle>Ordens de serviço</CardTitle>
                                <CardDescription>Controle operacional com status, prazos e faturamento.</CardDescription>
                            </CardHeader>
                            <CardContent className="px-0">
                                <ScrollArea className="w-full">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Código</TableHead>
                                                <TableHead>Cliente</TableHead>
                                                <TableHead>Veículo</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead>Prioridade</TableHead>
                                                <TableHead className="text-right">Previsto</TableHead>
                                                <TableHead className="text-right">Pago</TableHead>
                                                <TableHead className="text-right">Saldo</TableHead>
                                                <TableHead>Entrega</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {serviceOrdersSorted.map((order) => (
                                                <TableRow key={order.id}>
                                                    <TableCell className="font-mono text-xs">{order.code}</TableCell>
                                                    <TableCell>
                                                        <div className="font-medium text-foreground">{order.customer}</div>
                                                        <p className="text-xs text-muted-foreground">{order.technician}</p>
                                                    </TableCell>
                                                    <TableCell>{order.vehicle}</TableCell>
                                                    <TableCell>
                                                        <Badge className={serviceOrderStatusBadgeClasses[order.status]}>
                                                            {serviceOrderStatusLabels[order.status]}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge className={priorityBadgeClasses[order.priority]}>
                                                            {priorityLabels[order.priority]}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-right">{currencyFormatter.format(order.totalEstimate)}</TableCell>
                                                    <TableCell className="text-right">{currencyFormatter.format(order.amountPaid)}</TableCell>
                                                    <TableCell className="text-right">{currencyFormatter.format(order.balance)}</TableCell>
                                                    <TableCell>{order.expectedDelivery ? getSaleDateLabel(order.expectedDelivery) : "-"}</TableCell>
                                                </TableRow>
                                            ))}
                                            {serviceOrdersSorted.length === 0 && (
                                                <TableRow>
                                                    <TableCell colSpan={9} className="text-center text-muted-foreground py-6">
                                                        Nenhuma ordem cadastrada. Utilize o formulário ao lado para iniciar o controle.
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </ScrollArea>
                            </CardContent>
                        </Card>
                        <Card className="lg:col-span-1">
                            <CardHeader>
                                <CardTitle>Criar ordem de serviço</CardTitle>
                                <CardDescription>Cadastre ordens com valores, prioridade e previsão de entrega.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form ref={serviceOrderFormRef} action={handleCreateServiceOrder} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="customer">Cliente</Label>
                                        <Input id="customer" name="customer" placeholder="Nome completo ou razão social" required />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="vehicle">Veículo</Label>
                                        <Input id="vehicle" name="vehicle" placeholder="Ex: Toyota Corolla 2019" required />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Status</Label>
                                            <Select value={serviceOrderStatusValue} onValueChange={(value) => setServiceOrderStatusValue(value as ServiceOrderStatus)}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Selecione o status" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="aberta">Aberta</SelectItem>
                                                    <SelectItem value="em_andamento">Em andamento</SelectItem>
                                                    <SelectItem value="aguardando_peca">Aguardando peça</SelectItem>
                                                    <SelectItem value="concluida">Concluída</SelectItem>
                                                    <SelectItem value="cancelada">Cancelada</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <input type="hidden" name="status" value={serviceOrderStatusValue} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Prioridade</Label>
                                            <Select value={serviceOrderPriorityValue} onValueChange={(value) => setServiceOrderPriorityValue(value as ServiceOrder["priority"]) }>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Defina a prioridade" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="baixa">Baixa</SelectItem>
                                                    <SelectItem value="media">Média</SelectItem>
                                                    <SelectItem value="alta">Alta</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <input type="hidden" name="priority" value={serviceOrderPriorityValue} />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="technician">Responsável</Label>
                                        <Input id="technician" name="technician" placeholder="Nome do técnico" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="expectedDelivery">Previsão de entrega</Label>
                                        <Input id="expectedDelivery" name="expectedDelivery" type="date" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="issueDescription">Descrição do problema</Label>
                                        <Textarea id="issueDescription" name="issueDescription" placeholder="Resumo do relato do cliente" rows={3} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="services">Serviços (uma linha "Descrição - valor")</Label>
                                        <Textarea
                                            id="services"
                                            name="services"
                                            placeholder={"Ex:\nRevisão geral - 350\nAlinhamento e balanceamento - 180"}
                                            rows={3}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="partsCost">Custo com peças (R$)</Label>
                                            <Input id="partsCost" name="partsCost" type="number" inputMode="decimal" min={0} step="0.01" placeholder="0,00" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="amountPaid">Valor pago (R$)</Label>
                                            <Input id="amountPaid" name="amountPaid" type="number" inputMode="decimal" min={0} step="0.01" placeholder="0,00" />
                                        </div>
                                    </div>
                                    <Button type="submit" className="w-full" disabled={serviceOrderSubmitting}>
                                        {serviceOrderSubmitting ? "Registrando..." : "Salvar ordem"}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </div>
                    <div className="grid gap-6 lg:grid-cols-3">
                        {maintenanceColumns.map((column) => (
                            <Card key={column.status} className="flex flex-col">
                                <CardHeader>
                                    <CardTitle>{column.title}</CardTitle>
                                    <CardDescription>{column.description}</CardDescription>
                                </CardHeader>
                                <CardContent className="flex-1 space-y-3">
                                    {maintenanceByStatus[column.status].length === 0 ? (
                                        <p className="text-sm text-muted-foreground">Nenhuma atividade cadastrada.</p>
                                    ) : (
                                        maintenanceByStatus[column.status].map(({ task, order }) => {
                                            const currentStatus = maintenanceStatusSelections[task.id] ?? task.status
                                            return (
                                                <div key={task.id} className="rounded-lg border p-3 space-y-2">
                                                    <div className="flex items-center justify-between gap-2">
                                                        <p className="font-medium text-foreground">{task.title}</p>
                                                        <Badge className={maintenanceStatusBadgeClasses[task.status]}>
                                                            {maintenanceStatusLabels[task.status]}
                                                        </Badge>
                                                    </div>
                                                    <div className="text-xs text-muted-foreground space-y-1">
                                                        <p>
                                                            Ordem: {order ? `${order.code} · ${order.customer}` : "Ordem removida"}
                                                        </p>
                                                        <p>Técnico: {task.technician}</p>
                                                        <p>
                                                            Início: {getSaleDateLabel(task.startDate)}
                                                            {task.endDate ? ` · Fim: ${getSaleDateLabel(task.endDate)}` : ""}
                                                        </p>
                                                        {task.notes && <p>Notas: {task.notes}</p>}
                                                    </div>
                                                    <form action={handleUpdateMaintenanceTaskStatus} className="space-y-2">
                                                        <input type="hidden" name="taskId" value={task.id} />
                                                        <Select
                                                            value={currentStatus}
                                                            onValueChange={(value) =>
                                                                setMaintenanceStatusSelections((prev) => ({
                                                                    ...prev,
                                                                    [task.id]: value as MaintenanceStatus,
                                                                }))
                                                            }
                                                        >
                                                            <SelectTrigger>
                                                                <SelectValue placeholder="Atualizar status" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="pendente">Pendente</SelectItem>
                                                                <SelectItem value="em_andamento">Em andamento</SelectItem>
                                                                <SelectItem value="concluida">Concluída</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                        <input type="hidden" name="status" value={currentStatus} />
                                                        <Button type="submit" variant="secondary" size="sm" disabled={updatingMaintenanceTaskId === task.id}>
                                                            {updatingMaintenanceTaskId === task.id ? "Atualizando..." : "Atualizar"}
                                                        </Button>
                                                    </form>
                                                </div>
                                            )
                                        })
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                        <Card>
                            <CardHeader>
                                <CardTitle>Registrar atividade de manutenção</CardTitle>
                                <CardDescription>Controle tarefas específicas vinculadas às ordens.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form ref={maintenanceFormRef} action={handleCreateMaintenanceTask} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label>Ordem vinculada</Label>
                                        <Select value={maintenanceOrderId} onValueChange={setMaintenanceOrderId}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecione a ordem" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {data.serviceOrders.map((order) => (
                                                    <SelectItem key={order.id} value={order.id}>
                                                        {order.code} · {order.customer}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <input type="hidden" name="orderId" value={maintenanceOrderId} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="maintenance-title">Título da atividade</Label>
                                        <Input id="maintenance-title" name="title" placeholder="Ex: Ajustar freio traseiro" required />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label>Status</Label>
                                            <Select value={maintenanceStatusValue} onValueChange={(value) => setMaintenanceStatusValue(value as MaintenanceStatus)}>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Defina o status" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="pendente">Pendente</SelectItem>
                                                    <SelectItem value="em_andamento">Em andamento</SelectItem>
                                                    <SelectItem value="concluida">Concluída</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <input type="hidden" name="status" value={maintenanceStatusValue} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="maintenance-technician">Técnico</Label>
                                            <Input id="maintenance-technician" name="technician" placeholder="Nome do responsável" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="maintenance-start">Início</Label>
                                        <Input id="maintenance-start" name="startDate" type="date" defaultValue={new Date().toISOString().slice(0, 10)} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="maintenance-notes">Notas</Label>
                                        <Textarea id="maintenance-notes" name="notes" placeholder="Observações relevantes" rows={3} />
                                    </div>
                                    <Button type="submit" className="w-full" disabled={maintenanceSubmitting || !maintenanceOrderId}>
                                        {maintenanceSubmitting ? "Registrando..." : "Registrar atividade"}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
                <TabsContent value="financial" className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Receitas</CardTitle>
                                <CardDescription>Entradas registradas em vendas e serviços.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-3xl font-semibold">{currencyFormatter.format(financialSummary.income)}</p>
                                <p className="text-muted-foreground text-sm mt-2">
                                    Ticket médio: {currencyFormatter.format(financialSummary.averageTicket)}
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle>Despesas</CardTitle>
                                <CardDescription>Saídas com peças, serviços terceirizados e custos operacionais.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-3xl font-semibold">{currencyFormatter.format(financialSummary.expense)}</p>
                                <p className="text-muted-foreground text-sm mt-2">Saldo líquido abaixo.</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle>Resultado</CardTitle>
                                <CardDescription>Diferença entre receitas e despesas no período.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-3xl font-semibold">{currencyFormatter.format(financialSummary.net)}</p>
                                <p className="text-muted-foreground text-sm mt-2">
                                    {financialSummary.net >= 0 ? "Oficina positiva" : "Atenção ao fluxo de caixa"}
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle>Recebimentos pendentes</CardTitle>
                                <CardDescription>Saldo a receber das ordens de serviço em aberto.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-3xl font-semibold">{currencyFormatter.format(financialSummary.outstandingOrders)}</p>
                                <p className="text-muted-foreground text-sm mt-2">
                                    Distribuído em {numberFormatter.format(serviceOrderStats.totalOrders)} ordens ativas.
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                    <Card className="overflow-hidden">
                        <CardHeader>
                            <CardTitle>Registros financeiros</CardTitle>
                            <CardDescription>Histórico consolidado de receitas e despesas da oficina.</CardDescription>
                        </CardHeader>
                        <CardContent className="px-0">
                            <ScrollArea className="w-full">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Tipo</TableHead>
                                            <TableHead>Categoria</TableHead>
                                            <TableHead>Descrição</TableHead>
                                            <TableHead className="text-right">Valor</TableHead>
                                            <TableHead>Data</TableHead>
                                            <TableHead>Vinculado</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {financialRecordsSorted.map((record) => (
                                            <TableRow key={record.id}>
                                                <TableCell>
                                                    <Badge className={record.type === "receita" ? "bg-emerald-100 text-emerald-700 border border-emerald-200" : "bg-rose-100 text-rose-700 border border-rose-200"}>
                                                        {record.type === "receita" ? "Receita" : "Despesa"}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>{record.category}</TableCell>
                                                <TableCell>
                                                    <div className="font-medium text-foreground">{record.description}</div>
                                                    <p className="text-xs text-muted-foreground">{record.id}</p>
                                                </TableCell>
                                                <TableCell className="text-right">{currencyFormatter.format(record.amount)}</TableCell>
                                                <TableCell>{getSaleDateLabel(record.date)}</TableCell>
                                                <TableCell className="text-sm text-muted-foreground">
                                                    {record.relatedServiceOrderId && serviceOrderLookup.get(record.relatedServiceOrderId)
                                                        ? `${serviceOrderLookup.get(record.relatedServiceOrderId)!.code} · ${serviceOrderLookup.get(record.relatedServiceOrderId)!.customer}`
                                                        : record.relatedSaleId && salesLookup.get(record.relatedSaleId)
                                                          ? salesLookup.get(record.relatedSaleId)!.label
                                                          : "-"}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                        {financialRecordsSorted.length === 0 && (
                                            <TableRow>
                                                <TableCell colSpan={6} className="text-center text-muted-foreground py-6">
                                                    Nenhum lançamento financeiro cadastrado.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </ScrollArea>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Adicionar registro financeiro</CardTitle>
                            <CardDescription>Lance receitas extras ou despesas operacionais.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form ref={financialFormRef} action={handleRegisterFinancialRecord} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Tipo</Label>
                                        <Select value={financialType} onValueChange={(value) => setFinancialType(value as FinancialRecord["type"]) }>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Selecione o tipo" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="receita">Receita</SelectItem>
                                                <SelectItem value="despesa">Despesa</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <input type="hidden" name="type" value={financialType} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="financial-date">Data</Label>
                                        <Input id="financial-date" name="date" type="date" defaultValue={new Date().toISOString().slice(0, 10)} />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="financial-category">Categoria</Label>
                                    <Input id="financial-category" name="category" placeholder="Ex: Serviços terceirizados" required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="financial-description">Descrição</Label>
                                    <Textarea id="financial-description" name="description" placeholder="Detalhe do lançamento" rows={3} required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="financial-amount">Valor (R$)</Label>
                                    <Input id="financial-amount" name="amount" type="number" inputMode="decimal" min={0} step="0.01" placeholder="0,00" required />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Vincular a uma ordem</Label>
                                        <Select value={financialRelatedOrderId} onValueChange={setFinancialRelatedOrderId}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Opcional" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="">Sem vínculo</SelectItem>
                                                {data.serviceOrders.map((order) => (
                                                    <SelectItem key={order.id} value={order.id}>
                                                        {order.code}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <input type="hidden" name="relatedServiceOrderId" value={financialRelatedOrderId} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Vincular a uma venda</Label>
                                        <Select value={financialRelatedSaleId} onValueChange={setFinancialRelatedSaleId}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Opcional" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="">Sem vínculo</SelectItem>
                                                {data.sales.map((sale) => (
                                                    <SelectItem key={sale.id} value={sale.id}>
                                                        {sale.id}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <input type="hidden" name="relatedSaleId" value={financialRelatedSaleId} />
                                    </div>
                                </div>
                                <Button type="submit" className="w-full" disabled={financialSubmitting}>
                                    {financialSubmitting ? "Registrando..." : "Adicionar registro"}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
