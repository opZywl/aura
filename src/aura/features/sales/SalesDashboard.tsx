"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
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
    SaleRequest,
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
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
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

const saleRequestStatusLabels: Record<SaleRequest["status"], string> = {
    pendente: "Pendente",
    confirmada: "Confirmada",
    cancelada: "Cancelada",
}

const saleRequestStatusClasses: Record<SaleRequest["status"], string> = {
    pendente: "bg-amber-100 text-amber-700 border border-amber-200",
    confirmada: "bg-emerald-100 text-emerald-700 border border-emerald-200",
    cancelada: "bg-rose-100 text-rose-700 border border-rose-200",
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

const CHART_COLORS = {
    vendas: "#3b82f6",
    estoque: "#8b5cf6",
    receita: "#10b981",
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
    const [financialRelatedSaleId, setFinancialRelatedSaleId] = useState<string>("none")
    const [financialRelatedOrderId, setFinancialRelatedOrderId] = useState<string>("none")
    const [maintenanceStatusSelections, setMaintenanceStatusSelections] = useState<Record<string, MaintenanceStatus>>({})
    const [dashboardTab, setDashboardTab] = useState("overview")
    const [actionTab, setActionTab] = useState("inventory")
    const [listingTab, setListingTab] = useState("inventory")
    const [maintenanceTab, setMaintenanceTab] = useState<MaintenanceStatus>("pendente")

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
            setFinancialRelatedSaleId("none")
        }
        if (!data.serviceOrders.some((order) => order.id === financialRelatedOrderId)) {
            setFinancialRelatedOrderId("none")
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
        () => [...aggregatedInventory].sort((a, b) => b.revenue - a.revenue).slice(0, 5),
        [aggregatedInventory],
    )

    const lowStockInventory = useMemo(
        () =>
            aggregatedInventory
                .filter((item) => item.stockQuantity <= item.minimumStock)
                .sort((a, b) => a.stockQuantity - b.stockQuantity)
                .slice(0, 5),
        [aggregatedInventory],
    )

    const recentSales = useMemo(
        () =>
            data.sales
                .slice()
                .sort((a, b) => {
                    if (a.date && b.date) {
                        return a.date > b.date ? -1 : 1
                    }
                    if (a.date) return -1
                    if (b.date) return 1
                    return a.id > b.id ? -1 : 1
                })
                .slice(0, 5),
        [data.sales],
    )

    const chartData = useMemo(
        () => [
            {
                metric: "Vendas",
                fullMetric: "Total de vendas (itens)",
                value: totals.totalItemsSold,
                formula: "∑ quantidades vendidas",
                formatter: (value: number) => numberFormatter.format(value),
                color: CHART_COLORS.vendas,
            },
            {
                metric: "Estoque",
                fullMetric: "Total em estoque (itens)",
                value: totals.totalStock,
                formula: "∑ quantidades em estoque",
                formatter: (value: number) => numberFormatter.format(value),
                color: CHART_COLORS.estoque,
            },
            {
                metric: "Receita",
                fullMetric: "Total ganho (R$)",
                value: Number(totals.totalRevenue.toFixed(2)),
                formula: "∑ (quantidade × preço de venda)",
                formatter: (value: number) => currencyFormatter.format(value),
                color: CHART_COLORS.receita,
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

    const saleRequestsSorted = useMemo(
        () =>
            [...(data.saleRequests ?? [])].sort((a, b) => {
                const dateA = new Date(a.createdAt).getTime()
                const dateB = new Date(b.createdAt).getTime()
                return dateB - dateA
            }),
        [data.saleRequests],
    )

    const recentServiceOrders = useMemo(() => serviceOrdersSorted.slice(0, 5), [serviceOrdersSorted])

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
        const income = data.financialRecords.reduce(
            (sum, record) => (record.type === "receita" ? sum + record.amount : sum),
            0,
        )
        const expense = data.financialRecords.reduce(
            (sum, record) => (record.type === "despesa" ? sum + record.amount : sum),
            0,
        )
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

    const recentFinancialRecords = useMemo(() => financialRecordsSorted.slice(0, 5), [financialRecordsSorted])

    const salesLookup = useMemo(() => {
        const lookup: Map<string, { label: string }> = new Map()
        data.sales.forEach((sale) => {
            lookup.set(sale.id, {
                label: `${sale.id} · ${numberFormatter.format(sale.quantity)} un (${currencyFormatter.format(sale.total)})`,
            })
        })
        return lookup
    }, [data.sales])

    const serviceOrderLookup = useMemo(() => {
        const lookup: Map<string, { code: string; customer: string }> = new Map()
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
            setFinancialRelatedSaleId("none")
            setFinancialRelatedOrderId("none")
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
            return <span className="text-red-600 dark:text-red-400 font-medium">Sem estoque</span>
        }

        if (item.stockQuantity <= item.minimumStock) {
            return <span className="text-amber-600 dark:text-amber-400 font-medium">Atenção: estoque baixo</span>
        }

        return <span className="text-emerald-600 dark:text-emerald-400 font-medium">Estoque saudável</span>
    }

    const formatDate = (dateString?: string) => {
        if (!dateString) return "-"
        try {
            const date = new Date(dateString)
            if (Number.isNaN(date.getTime())) return dateString
            return dateFormatter.format(date)
        } catch {
            return dateString
        }
    }

    const getSaleDateLabel = (saleDate?: string) => {
        return formatDate(saleDate)
    }

    const CustomTooltip = ({ active, payload }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload
            return (
                <div className="rounded-xl border-2 border-zinc-200 dark:border-zinc-600 bg-white dark:bg-zinc-800 p-4 shadow-xl">
                    <p className="mb-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100">{data.fullMetric}</p>
                    <p className="mb-1 text-2xl font-bold" style={{ color: data.color }}>
                        {data.formatter(data.value)}
                    </p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">{data.formula}</p>
                </div>
            )
        }
        return null
    }

    const openInventoryForm = () => {
        setDashboardTab("operations")
        setActionTab("inventory")
    }

    const openSaleForm = () => {
        setDashboardTab("operations")
        setActionTab("sale")
    }

    const openServiceOrderForm = () => {
        setDashboardTab("operations")
        setActionTab("service-order")
    }

    const goToSalesListing = () => {
        setDashboardTab("operations")
        setListingTab("sales")
    }

    const goToInventoryListing = () => {
        setDashboardTab("operations")
        setListingTab("inventory")
    }

    const goToServiceOrderListing = () => {
        setDashboardTab("operations")
        setListingTab("service-orders")
    }

    const goToFinancialTab = () => {
        setDashboardTab("financial")
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight" style={{ color: "inherit" }}>
                        <span className="text-zinc-900 dark:text-white">Painel unificado da oficina</span>
                    </h1>
                    <p className="text-zinc-600 dark:text-zinc-400 text-sm sm:text-base">
                        Visão simplificada para acompanhar vendas, ordens de serviço e finanças com foco no essencial.
                    </p>
                </div>
                <Button variant="outline" onClick={() => router.refresh()} className="shrink-0">
                    Atualizar dados
                </Button>
            </div>

            {(successMessage || errorMessage) && (
                <Alert
                    variant={errorMessage ? "destructive" : "default"}
                    className="border-border/60 bg-background/80 text-foreground"
                >
                    <AlertTitle>{errorMessage ? "Não foi possível concluir a ação" : "Tudo pronto!"}</AlertTitle>
                    <AlertDescription>{errorMessage ?? successMessage}</AlertDescription>
                </Alert>
            )}

            <Tabs value={dashboardTab} onValueChange={setDashboardTab} className="space-y-6">
                <TabsList className="grid w-full gap-1 sm:grid-cols-3 lg:max-w-xl bg-zinc-200 dark:bg-zinc-800 p-1 rounded-lg">
                    <TabsTrigger
                        value="overview"
                        className="rounded-md data-[state=active]:bg-white data-[state=active]:text-zinc-900 data-[state=active]:shadow-sm dark:data-[state=active]:bg-zinc-900 dark:data-[state=active]:text-white text-zinc-600 dark:text-zinc-400"
                    >
                        Resumo
                    </TabsTrigger>
                    <TabsTrigger
                        value="operations"
                        className="rounded-md data-[state=active]:bg-white data-[state=active]:text-zinc-900 data-[state=active]:shadow-sm dark:data-[state=active]:bg-zinc-900 dark:data-[state=active]:text-white text-zinc-600 dark:text-zinc-400"
                    >
                        Operações
                    </TabsTrigger>
                    <TabsTrigger
                        value="financial"
                        className="rounded-md data-[state=active]:bg-white data-[state=active]:text-zinc-900 data-[state=active]:shadow-sm dark:data-[state=active]:bg-zinc-900 dark:data-[state=active]:text-white text-zinc-600 dark:text-zinc-400"
                    >
                        Financeiro
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-6">
                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        <Card className="border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-sm">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg font-semibold text-zinc-900 dark:text-white">
                                    Vendas registradas
                                </CardTitle>
                                <CardDescription className="text-zinc-500 dark:text-zinc-400">
                                    Operações concluídas no painel.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <p className="text-4xl font-bold text-blue-600 dark:text-blue-400">
                                    {numberFormatter.format(totals.totalSalesCount)}
                                </p>
                                <p className="text-zinc-600 dark:text-zinc-400 text-sm">
                                    Itens vendidos: {numberFormatter.format(totals.totalItemsSold)}
                                </p>
                                <Button
                                    variant="link"
                                    size="sm"
                                    className="h-auto p-0 text-blue-600 dark:text-blue-400 hover:text-blue-700"
                                    onClick={openSaleForm}
                                >
                                    Registrar nova venda →
                                </Button>
                            </CardContent>
                        </Card>

                        <Card className="border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-sm">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg font-semibold text-zinc-900 dark:text-white">
                                    Estoque disponível
                                </CardTitle>
                                <CardDescription className="text-zinc-500 dark:text-zinc-400">
                                    Unidades prontas para venda.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <p className="text-4xl font-bold text-purple-600 dark:text-purple-400">
                                    {numberFormatter.format(totals.totalStock)}
                                </p>
                                <p className="text-zinc-600 dark:text-zinc-400 text-sm">
                                    Valor estimado: {currencyFormatter.format(totals.stockValue)}
                                </p>
                                <Button
                                    variant="link"
                                    size="sm"
                                    className="h-auto p-0 text-purple-600 dark:text-purple-400 hover:text-purple-700"
                                    onClick={openInventoryForm}
                                >
                                    Cadastrar nova peça →
                                </Button>
                            </CardContent>
                        </Card>

                        <Card className="border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-sm">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg font-semibold text-zinc-900 dark:text-white">Receita acumulada</CardTitle>
                                <CardDescription className="text-zinc-500 dark:text-zinc-400">
                                    Somatório das vendas confirmadas.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <p className="text-4xl font-bold text-emerald-600 dark:text-emerald-400">
                                    {currencyFormatter.format(totals.totalRevenue)}
                                </p>
                                <p className="text-zinc-600 dark:text-zinc-400 text-sm">
                                    Ticket médio:{" "}
                                    {currencyFormatter.format(totals.totalSalesCount ? totals.totalRevenue / totals.totalSalesCount : 0)}
                                </p>
                                <Button
                                    variant="link"
                                    size="sm"
                                    className="h-auto p-0 text-emerald-600 dark:text-emerald-400 hover:text-emerald-700"
                                    onClick={goToFinancialTab}
                                >
                                    Abrir fluxo financeiro →
                                </Button>
                            </CardContent>
                        </Card>

                        <Card className="border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-sm">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg font-semibold text-zinc-900 dark:text-white">
                                    Alertas de estoque
                                </CardTitle>
                                <CardDescription className="text-zinc-500 dark:text-zinc-400">
                                    Itens no limite mínimo definido.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <p className="text-4xl font-bold text-amber-600 dark:text-amber-400">
                                    {numberFormatter.format(totals.lowStockItems)}
                                </p>
                                <p className="text-zinc-600 dark:text-zinc-400 text-sm">
                                    Priorize o reabastecimento para evitar rupturas.
                                </p>
                                <Button
                                    variant="link"
                                    size="sm"
                                    className="h-auto p-0 text-amber-600 dark:text-amber-400 hover:text-amber-700"
                                    onClick={goToInventoryListing}
                                >
                                    Ver peças com baixa →
                                </Button>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid gap-6 lg:grid-cols-3">
                        <Card className="border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-sm lg:col-span-2">
                            <CardHeader>
                                <CardTitle className="text-xl font-semibold text-zinc-900 dark:text-white">
                                    Resumo consolidado
                                </CardTitle>
                                <CardDescription className="text-zinc-500 dark:text-zinc-400">
                                    Comparativo direto entre volume, estoque e receita.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="h-80 w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={chartData} margin={{ top: 20, right: 30, bottom: 20, left: 20 }}>
                                            <CartesianGrid
                                                strokeDasharray="3 3"
                                                stroke="#e5e7eb"
                                                className="dark:stroke-zinc-700"
                                                vertical={false}
                                            />
                                            <XAxis
                                                dataKey="metric"
                                                tick={{ fontSize: 14, fontWeight: 600, fill: "#374151" }}
                                                tickLine={false}
                                                axisLine={false}
                                                className="dark:[&_text]:fill-zinc-300"
                                            />
                                            <YAxis
                                                tickFormatter={(value) => {
                                                    if (value >= 1000) return `${(value / 1000).toFixed(0)}k`
                                                    return numberFormatter.format(value)
                                                }}
                                                tick={{ fontSize: 12, fill: "#6b7280" }}
                                                tickLine={false}
                                                axisLine={false}
                                                width={50}
                                                className="dark:[&_text]:fill-zinc-400"
                                            />
                                            <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(0,0,0,0.05)" }} />
                                            <Bar dataKey="value" radius={[8, 8, 0, 0]} maxBarSize={100}>
                                                {chartData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>

                                <div className="grid gap-4 sm:grid-cols-3">
                                    {chartData.map((entry) => (
                                        <div
                                            key={entry.metric}
                                            className="rounded-xl border-2 p-4 transition-all hover:shadow-md bg-white dark:bg-zinc-800"
                                            style={{ borderColor: entry.color }}
                                        >
                                            <div className="mb-2 flex items-center gap-2">
                                                <div className="h-3 w-3 rounded-full" style={{ backgroundColor: entry.color }} />
                                                <p className="text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-300">
                                                    {entry.fullMetric}
                                                </p>
                                            </div>
                                            <p className="text-2xl font-bold" style={{ color: entry.color }}>
                                                {entry.formatter(entry.value)}
                                            </p>
                                            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{entry.formula}</p>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-xl font-semibold text-zinc-900 dark:text-white">
                                    Destaques de peças
                                </CardTitle>
                                <CardDescription className="text-zinc-500 dark:text-zinc-400">
                                    Produtos que merecem atenção imediata.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6 text-sm">
                                <div>
                                    <p className="text-xs font-bold uppercase tracking-wide text-zinc-500 dark:text-zinc-400 mb-3">
                                        Mais vendidos
                                    </p>
                                    {topSellingItems.length > 0 ? (
                                        <ul className="space-y-2">
                                            {topSellingItems.map((item, index) => (
                                                <li
                                                    key={item.id}
                                                    className="flex items-center justify-between rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3 py-2.5"
                                                >
                                                    <div>
                                                        <p className="font-semibold text-zinc-900 dark:text-white">
                                                            {index + 1}. {item.name}
                                                        </p>
                                                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                                            {numberFormatter.format(item.soldQuantity)} un · {currencyFormatter.format(item.revenue)}
                                                        </p>
                                                    </div>
                                                    <Badge
                                                        variant="secondary"
                                                        className="text-xs bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300"
                                                    >
                                                        {item.category ?? "freio"}
                                                    </Badge>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="text-zinc-500 dark:text-zinc-400 text-sm py-2">Nenhuma venda registrada ainda.</p>
                                    )}
                                </div>

                                <div>
                                    <p className="text-xs font-bold uppercase tracking-wide text-zinc-500 dark:text-zinc-400 mb-3">
                                        Estoque crítico
                                    </p>
                                    {lowStockInventory.length > 0 ? (
                                        <ul className="space-y-2">
                                            {lowStockInventory.map((item) => (
                                                <li
                                                    key={item.id}
                                                    className="flex items-center justify-between rounded-lg border border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/30 px-3 py-2.5"
                                                >
                                                    <div>
                                                        <p className="font-semibold text-zinc-900 dark:text-white">{item.name}</p>
                                                        <p className="text-xs text-amber-600 dark:text-amber-400">
                                                            {numberFormatter.format(item.stockQuantity)} un restantes
                                                        </p>
                                                    </div>
                                                    <Badge className="text-xs bg-amber-200 dark:bg-amber-800 text-amber-800 dark:text-amber-200 border-0">
                                                        Baixo
                                                    </Badge>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="text-emerald-600 dark:text-emerald-400 text-sm py-2">Nenhum item no limite mínimo.</p>
                                    )}
                                </div>

                                <Button variant="outline" size="sm" className="w-full bg-transparent" onClick={goToInventoryListing}>
                                    Abrir detalhes do estoque
                                </Button>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid gap-6 lg:grid-cols-2">
                        <Card className="border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-sm">
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle className="text-lg font-semibold text-zinc-900 dark:text-white">Vendas recentes</CardTitle>
                                    <CardDescription className="text-zinc-500 dark:text-zinc-400">
                                        Últimas movimentações registradas.
                                    </CardDescription>
                                </div>
                                <Button variant="outline" size="sm" onClick={goToSalesListing}>
                                    Ver todas
                                </Button>
                            </CardHeader>
                            <CardContent>
                                {recentSales.length > 0 ? (
                                    <div className="space-y-3">
                                        {recentSales.map((sale) => {
                                            const item = data.inventory.find((i) => i.id === sale.itemId)
                                            return (
                                                <div
                                                    key={sale.id}
                                                    className="flex items-center justify-between rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 p-3"
                                                >
                                                    <div>
                                                        <p className="font-semibold text-zinc-900 dark:text-white">{item?.name ?? sale.itemId}</p>
                                                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                                            {numberFormatter.format(sale.quantity)} un · {getSaleDateLabel(sale.date)}
                                                        </p>
                                                    </div>
                                                    <p className="font-bold text-emerald-600 dark:text-emerald-400">
                                                        {currencyFormatter.format(sale.total)}
                                                    </p>
                                                </div>
                                            )
                                        })}
                                    </div>
                                ) : (
                                    <p className="text-zinc-500 dark:text-zinc-400 text-sm py-4 text-center">
                                        Nenhuma venda registrada ainda.
                                    </p>
                                )}
                            </CardContent>
                        </Card>

                        <Card className="border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-sm">
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle className="text-lg font-semibold text-zinc-900 dark:text-white">
                                        Ordens em andamento
                                    </CardTitle>
                                    <CardDescription className="text-zinc-500 dark:text-zinc-400">
                                        Status das últimas solicitações.
                                    </CardDescription>
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm" onClick={goToServiceOrderListing}>
                                        Ver ordens
                                    </Button>
                                    <Button variant="default" size="sm" onClick={openServiceOrderForm}>
                                        Nova ordem
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {recentServiceOrders.length > 0 ? (
                                    <div className="space-y-3">
                                        {recentServiceOrders.map((order) => (
                                            <div
                                                key={order.id}
                                                className="flex items-center justify-between rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 p-3"
                                            >
                                                <div>
                                                    <p className="font-semibold text-zinc-900 dark:text-white">{order.code}</p>
                                                    <p className="text-xs text-zinc-500 dark:text-zinc-400">{order.customer}</p>
                                                </div>
                                                <Badge className={serviceOrderStatusBadgeClasses[order.status]}>
                                                    {serviceOrderStatusLabels[order.status]}
                                                </Badge>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-zinc-500 dark:text-zinc-400 text-sm py-4 text-center">
                                        Nenhuma ordem de serviço registrada.
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="operations" className="space-y-6">
                    <div className="grid gap-4 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
                        <Card className="border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-lg font-semibold text-zinc-900 dark:text-white">Ações rápidas</CardTitle>
                                <CardDescription className="text-zinc-500 dark:text-zinc-400">
                                    Cadastre e atualize informações sem sair da tela.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Tabs value={actionTab} onValueChange={setActionTab} className="space-y-4">
                                    <TabsList className="grid w-full gap-1 md:grid-cols-4 bg-zinc-200 dark:bg-zinc-800 p-1 rounded-lg">
                                        <TabsTrigger
                                            value="inventory"
                                            className="rounded-md data-[state=active]:bg-white data-[state=active]:text-zinc-900 data-[state=active]:shadow-sm dark:data-[state=active]:bg-zinc-900 dark:data-[state=active]:text-white text-zinc-600 dark:text-zinc-400"
                                        >
                                            Peças
                                        </TabsTrigger>
                                        <TabsTrigger
                                            value="sale"
                                            className="rounded-md data-[state=active]:bg-white data-[state=active]:text-zinc-900 data-[state=active]:shadow-sm dark:data-[state=active]:bg-zinc-900 dark:data-[state=active]:text-white text-zinc-600 dark:text-zinc-400"
                                        >
                                            Vendas
                                        </TabsTrigger>
                                        <TabsTrigger
                                            value="service-order"
                                            className="rounded-md data-[state=active]:bg-white data-[state=active]:text-zinc-900 data-[state=active]:shadow-sm dark:data-[state=active]:bg-zinc-900 dark:data-[state=active]:text-white text-zinc-600 dark:text-zinc-400"
                                        >
                                            Ordens
                                        </TabsTrigger>
                                        <TabsTrigger
                                            value="maintenance"
                                            className="rounded-md data-[state=active]:bg-white data-[state=active]:text-zinc-900 data-[state=active]:shadow-sm dark:data-[state=active]:bg-zinc-900 dark:data-[state=active]:text-white text-zinc-600 dark:text-zinc-400"
                                        >
                                            Manutenção
                                        </TabsTrigger>
                                    </TabsList>
                                    <TabsContent value="inventory" className="space-y-4">
                                        <form ref={inventoryFormRef} action={handleCreateInventoryItem} className="space-y-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="name" className="text-zinc-900 dark:text-white">
                                                    Nome da peça
                                                </Label>
                                                <Input
                                                    id="name"
                                                    name="name"
                                                    placeholder="Ex: Pastilha de freio traseira"
                                                    required
                                                    className="bg-white dark:bg-zinc-800 border-zinc-300 dark:border-zinc-600"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="category" className="text-zinc-900 dark:text-white">
                                                    Categoria
                                                </Label>
                                                <Input
                                                    id="category"
                                                    name="category"
                                                    placeholder="Ex: Freios"
                                                    required
                                                    className="bg-white dark:bg-zinc-800 border-zinc-300 dark:border-zinc-600"
                                                />
                                            </div>
                                            <div className="grid gap-4 sm:grid-cols-2">
                                                <div className="space-y-2">
                                                    <Label htmlFor="unitPrice" className="text-zinc-900 dark:text-white">
                                                        Preço unitário (R$)
                                                    </Label>
                                                    <Input
                                                        id="unitPrice"
                                                        name="unitPrice"
                                                        type="number"
                                                        inputMode="decimal"
                                                        min={0}
                                                        step="0.01"
                                                        placeholder="0,00"
                                                        required
                                                        className="bg-white dark:bg-zinc-800 border-zinc-300 dark:border-zinc-600"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="stockQuantity" className="text-zinc-900 dark:text-white">
                                                        Estoque inicial
                                                    </Label>
                                                    <Input
                                                        id="stockQuantity"
                                                        name="stockQuantity"
                                                        type="number"
                                                        min={0}
                                                        step={1}
                                                        placeholder="0"
                                                        required
                                                        className="bg-white dark:bg-zinc-800 border-zinc-300 dark:border-zinc-600"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="minimumStock" className="text-zinc-900 dark:text-white">
                                                    Estoque mínimo desejado
                                                </Label>
                                                <Input
                                                    id="minimumStock"
                                                    name="minimumStock"
                                                    type="number"
                                                    min={0}
                                                    step={1}
                                                    placeholder="0"
                                                    className="bg-white dark:bg-zinc-800 border-zinc-300 dark:border-zinc-600"
                                                />
                                            </div>
                                            <Button type="submit" className="w-full" disabled={inventorySubmitting}>
                                                {inventorySubmitting ? "Salvando..." : "Cadastrar peça"}
                                            </Button>
                                        </form>
                                    </TabsContent>
                                    <TabsContent value="sale" className="space-y-4">
                                        <form ref={saleFormRef} action={handleRegisterSale} className="space-y-4">
                                            <div className="space-y-2">
                                                <Label className="text-zinc-900 dark:text-white">Peça vendida</Label>
                                                <Select value={selectedItemId} onValueChange={handleSelectedItemChange}>
                                                    <SelectTrigger className="bg-white dark:bg-zinc-800 border-zinc-300 dark:border-zinc-600">
                                                        <SelectValue placeholder="Selecione uma peça" />
                                                    </SelectTrigger>
                                                    <SelectContent className="bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700">
                                                        {data.inventory.map((item) => (
                                                            <SelectItem key={item.id} value={item.id} className="text-zinc-900 dark:text-white">
                                                                {item.name} · {item.stockQuantity} un disponíveis
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <input type="hidden" name="itemId" value={selectedItemId} />
                                            </div>
                                            <div className="grid gap-4 sm:grid-cols-2">
                                                <div className="space-y-2">
                                                    <Label htmlFor="quantity" className="text-zinc-900 dark:text-white">
                                                        Quantidade
                                                    </Label>
                                                    <Input
                                                        id="quantity"
                                                        name="quantity"
                                                        type="number"
                                                        min={1}
                                                        step={1}
                                                        placeholder="0"
                                                        required
                                                        className="bg-white dark:bg-zinc-800 border-zinc-300 dark:border-zinc-600"
                                                    />
                                                    {selectedItem && (
                                                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                                            Disponível em estoque: {numberFormatter.format(selectedItem.stockQuantity)} unidades.
                                                        </p>
                                                    )}
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="salePrice" className="text-zinc-900 dark:text-white">
                                                        Preço de venda (R$)
                                                    </Label>
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
                                                        className="bg-white dark:bg-zinc-800 border-zinc-300 dark:border-zinc-600"
                                                    />
                                                </div>
                                            </div>
                                            <div className="grid gap-4 sm:grid-cols-2">
                                                <div className="space-y-2">
                                                    <Label htmlFor="date" className="text-zinc-900 dark:text-white">
                                                        Data da venda
                                                    </Label>
                                                    <Input
                                                        id="date"
                                                        name="date"
                                                        type="date"
                                                        max={new Date().toISOString().slice(0, 10)}
                                                        className="bg-white dark:bg-zinc-800 border-zinc-300 dark:border-zinc-600"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="customer" className="text-zinc-900 dark:text-white">
                                                        Cliente
                                                    </Label>
                                                    <Input
                                                        id="customer"
                                                        name="customer"
                                                        placeholder="Nome ou razão social"
                                                        className="bg-white dark:bg-zinc-800 border-zinc-300 dark:border-zinc-600"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="notes" className="text-zinc-900 dark:text-white">
                                                    Observações
                                                </Label>
                                                <Textarea
                                                    id="notes"
                                                    name="notes"
                                                    placeholder="Detalhes adicionais da venda"
                                                    rows={3}
                                                    className="bg-white dark:bg-zinc-800 border-zinc-300 dark:border-zinc-600"
                                                />
                                            </div>
                                            <Button type="submit" className="w-full" disabled={saleSubmitting || !selectedItemId}>
                                                {saleSubmitting ? "Registrando..." : "Registrar venda"}
                                            </Button>
                                        </form>
                                    </TabsContent>
                                    <TabsContent value="service-order" className="space-y-4">
                                        <form ref={serviceOrderFormRef} action={handleCreateServiceOrder} className="space-y-4">
                                            <div className="grid gap-4 sm:grid-cols-2">
                                                <div className="space-y-2">
                                                    <Label htmlFor="customer" className="text-zinc-900 dark:text-white">
                                                        Cliente
                                                    </Label>
                                                    <Input
                                                        id="customer"
                                                        name="customer"
                                                        placeholder="Nome completo ou razão social"
                                                        required
                                                        className="bg-white dark:bg-zinc-800 border-zinc-300 dark:border-zinc-600"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="vehicle" className="text-zinc-900 dark:text-white">
                                                        Veículo
                                                    </Label>
                                                    <Input
                                                        id="vehicle"
                                                        name="vehicle"
                                                        placeholder="Ex: Toyota Corolla 2019"
                                                        required
                                                        className="bg-white dark:bg-zinc-800 border-zinc-300 dark:border-zinc-600"
                                                    />
                                                </div>
                                            </div>
                                            <div className="grid gap-4 sm:grid-cols-2">
                                                <div className="space-y-2">
                                                    <Label className="text-zinc-900 dark:text-white">Status</Label>
                                                    <Select
                                                        value={serviceOrderStatusValue}
                                                        onValueChange={(value) => setServiceOrderStatusValue(value as ServiceOrderStatus)}
                                                    >
                                                        <SelectTrigger className="bg-white dark:bg-zinc-800 border-zinc-300 dark:border-zinc-600">
                                                            <SelectValue placeholder="Selecione o status" />
                                                        </SelectTrigger>
                                                        <SelectContent className="bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700">
                                                            <SelectItem value="aberta" className="text-zinc-900 dark:text-white">
                                                                Aberta
                                                            </SelectItem>
                                                            <SelectItem value="em_andamento" className="text-zinc-900 dark:text-white">
                                                                Em andamento
                                                            </SelectItem>
                                                            <SelectItem value="aguardando_peca" className="text-zinc-900 dark:text-white">
                                                                Aguardando peça
                                                            </SelectItem>
                                                            <SelectItem value="concluida" className="text-zinc-900 dark:text-white">
                                                                Concluída
                                                            </SelectItem>
                                                            <SelectItem value="cancelada" className="text-zinc-900 dark:text-white">
                                                                Cancelada
                                                            </SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <input type="hidden" name="status" value={serviceOrderStatusValue} />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-zinc-900 dark:text-white">Prioridade</Label>
                                                    <Select
                                                        value={serviceOrderPriorityValue}
                                                        onValueChange={(value) => setServiceOrderPriorityValue(value as ServiceOrder["priority"])}
                                                    >
                                                        <SelectTrigger className="bg-white dark:bg-zinc-800 border-zinc-300 dark:border-zinc-600">
                                                            <SelectValue placeholder="Defina a prioridade" />
                                                        </SelectTrigger>
                                                        <SelectContent className="bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700">
                                                            <SelectItem value="baixa" className="text-zinc-900 dark:text-white">
                                                                Baixa
                                                            </SelectItem>
                                                            <SelectItem value="media" className="text-zinc-900 dark:text-white">
                                                                Média
                                                            </SelectItem>
                                                            <SelectItem value="alta" className="text-zinc-900 dark:text-white">
                                                                Alta
                                                            </SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <input type="hidden" name="priority" value={serviceOrderPriorityValue} />
                                                </div>
                                            </div>
                                            <div className="grid gap-4 sm:grid-cols-2">
                                                <div className="space-y-2">
                                                    <Label htmlFor="technician" className="text-zinc-900 dark:text-white">
                                                        Responsável
                                                    </Label>
                                                    <Input
                                                        id="technician"
                                                        name="technician"
                                                        placeholder="Nome do técnico"
                                                        className="bg-white dark:bg-zinc-800 border-zinc-300 dark:border-zinc-600"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="expectedDelivery" className="text-zinc-900 dark:text-white">
                                                        Previsão de entrega
                                                    </Label>
                                                    <Input
                                                        id="expectedDelivery"
                                                        name="expectedDelivery"
                                                        type="date"
                                                        className="bg-white dark:bg-zinc-800 border-zinc-300 dark:border-zinc-600"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="issueDescription" className="text-zinc-900 dark:text-white">
                                                    Descrição do problema
                                                </Label>
                                                <Textarea
                                                    id="issueDescription"
                                                    name="issueDescription"
                                                    placeholder="Resumo do relato do cliente"
                                                    rows={3}
                                                    className="bg-white dark:bg-zinc-800 border-zinc-300 dark:border-zinc-600"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="services" className="text-zinc-900 dark:text-white">
                                                    Serviços (uma linha "Descrição - valor")
                                                </Label>
                                                <Textarea
                                                    id="services"
                                                    name="services"
                                                    placeholder={`Ex:\nRevisão geral - 350\nAlinhamento e balanceamento - 180`}
                                                    rows={3}
                                                    className="bg-white dark:bg-zinc-800 border-zinc-300 dark:border-zinc-600"
                                                />
                                            </div>
                                            <div className="grid gap-4 sm:grid-cols-2">
                                                <div className="space-y-2">
                                                    <Label htmlFor="partsCost" className="text-zinc-900 dark:text-white">
                                                        Custo com peças (R$)
                                                    </Label>
                                                    <Input
                                                        id="partsCost"
                                                        name="partsCost"
                                                        type="number"
                                                        inputMode="decimal"
                                                        min={0}
                                                        step="0.01"
                                                        placeholder="0,00"
                                                        className="bg-white dark:bg-zinc-800 border-zinc-300 dark:border-zinc-600"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="amountPaid" className="text-zinc-900 dark:text-white">
                                                        Valor pago (R$)
                                                    </Label>
                                                    <Input
                                                        id="amountPaid"
                                                        name="amountPaid"
                                                        type="number"
                                                        inputMode="decimal"
                                                        min={0}
                                                        step="0.01"
                                                        placeholder="0,00"
                                                        className="bg-white dark:bg-zinc-800 border-zinc-300 dark:border-zinc-600"
                                                    />
                                                </div>
                                            </div>
                                            <Button type="submit" className="w-full" disabled={serviceOrderSubmitting}>
                                                {serviceOrderSubmitting ? "Registrando..." : "Salvar ordem"}
                                            </Button>
                                        </form>
                                    </TabsContent>
                                    <TabsContent value="maintenance" className="space-y-4">
                                        <form ref={maintenanceFormRef} action={handleCreateMaintenanceTask} className="space-y-4">
                                            <div className="space-y-2">
                                                <Label className="text-zinc-900 dark:text-white">Ordem vinculada</Label>
                                                <Select value={maintenanceOrderId} onValueChange={setMaintenanceOrderId}>
                                                    <SelectTrigger className="bg-white dark:bg-zinc-800 border-zinc-300 dark:border-zinc-600">
                                                        <SelectValue placeholder="Selecione a ordem" />
                                                    </SelectTrigger>
                                                    <SelectContent className="bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700">
                                                        {data.serviceOrders.map((order) => (
                                                            <SelectItem key={order.id} value={order.id} className="text-zinc-900 dark:text-white">
                                                                {order.code} · {order.customer}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <input type="hidden" name="orderId" value={maintenanceOrderId} />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="maintenance-title" className="text-zinc-900 dark:text-white">
                                                    Título da atividade
                                                </Label>
                                                <Input
                                                    id="maintenance-title"
                                                    name="title"
                                                    placeholder="Ex: Ajustar freio traseiro"
                                                    required
                                                    className="bg-white dark:bg-zinc-800 border-zinc-300 dark:border-zinc-600"
                                                />
                                            </div>
                                            <div className="grid gap-4 sm:grid-cols-2">
                                                <div className="space-y-2">
                                                    <Label className="text-zinc-900 dark:text-white">Status</Label>
                                                    <Select
                                                        value={maintenanceStatusValue}
                                                        onValueChange={(value) => setMaintenanceStatusValue(value as MaintenanceStatus)}
                                                    >
                                                        <SelectTrigger className="bg-white dark:bg-zinc-800 border-zinc-300 dark:border-zinc-600">
                                                            <SelectValue placeholder="Defina o status" />
                                                        </SelectTrigger>
                                                        <SelectContent className="bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700">
                                                            <SelectItem value="pendente" className="text-zinc-900 dark:text-white">
                                                                Pendente
                                                            </SelectItem>
                                                            <SelectItem value="em_andamento" className="text-zinc-900 dark:text-white">
                                                                Em andamento
                                                            </SelectItem>
                                                            <SelectItem value="concluida" className="text-zinc-900 dark:text-white">
                                                                Concluída
                                                            </SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                    <input type="hidden" name="status" value={maintenanceStatusValue} />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="maintenance-technician" className="text-zinc-900 dark:text-white">
                                                        Técnico
                                                    </Label>
                                                    <Input
                                                        id="maintenance-technician"
                                                        name="technician"
                                                        placeholder="Nome do responsável"
                                                        className="bg-white dark:bg-zinc-800 border-zinc-300 dark:border-zinc-600"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="maintenance-start" className="text-zinc-900 dark:text-white">
                                                    Início
                                                </Label>
                                                <Input
                                                    id="maintenance-start"
                                                    name="startDate"
                                                    type="date"
                                                    defaultValue={new Date().toISOString().slice(0, 10)}
                                                    className="bg-white dark:bg-zinc-800 border-zinc-300 dark:border-zinc-600"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label htmlFor="maintenance-notes" className="text-zinc-900 dark:text-white">
                                                    Notas
                                                </Label>
                                                <Textarea
                                                    id="maintenance-notes"
                                                    name="notes"
                                                    placeholder="Observações relevantes"
                                                    rows={3}
                                                    className="bg-white dark:bg-zinc-800 border-zinc-300 dark:border-zinc-600"
                                                />
                                            </div>
                                            <Button type="submit" className="w-full" disabled={maintenanceSubmitting || !maintenanceOrderId}>
                                                {maintenanceSubmitting ? "Registrando..." : "Registrar atividade"}
                                            </Button>
                                        </form>
                                    </TabsContent>
                                </Tabs>
                            </CardContent>
                        </Card>
                        <Card className="border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-lg font-semibold text-zinc-900 dark:text-white">Dados essenciais</CardTitle>
                                <CardDescription className="text-zinc-500 dark:text-zinc-400">
                                    Troque de aba para visualizar o que precisa agora.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Tabs value={listingTab} onValueChange={setListingTab} className="space-y-4">
                                    <TabsList className="grid w-full gap-1 md:grid-cols-4 bg-zinc-200 dark:bg-zinc-800 p-1 rounded-lg">
                                        <TabsTrigger
                                            value="inventory"
                                            className="rounded-md data-[state=active]:bg-white data-[state=active]:text-zinc-900 data-[state=active]:shadow-sm dark:data-[state=active]:bg-zinc-900 dark:data-[state=active]:text-white text-zinc-600 dark:text-zinc-400"
                                        >
                                            Estoque
                                        </TabsTrigger>
                                        <TabsTrigger
                                            value="sales"
                                            className="rounded-md data-[state=active]:bg-white data-[state=active]:text-zinc-900 data-[state=active]:shadow-sm dark:data-[state=active]:bg-zinc-900 dark:data-[state=active]:text-white text-zinc-600 dark:text-zinc-400"
                                        >
                                            Vendas
                                        </TabsTrigger>
                                        <TabsTrigger
                                            value="requests"
                                            className="rounded-md data-[state=active]:bg-white data-[state=active]:text-zinc-900 data-[state=active]:shadow-sm dark:data-[state=active]:bg-zinc-900 dark:data-[state=active]:text-white text-zinc-600 dark:text-zinc-400"
                                        >
                                            Pedidos
                                        </TabsTrigger>
                                        <TabsTrigger
                                            value="service-orders"
                                            className="rounded-md data-[state=active]:bg-white data-[state=active]:text-zinc-900 data-[state=active]:shadow-sm dark:data-[state=active]:bg-zinc-900 dark:data-[state=active]:text-white text-zinc-600 dark:text-zinc-400"
                                        >
                                            Ordens
                                        </TabsTrigger>
                                    </TabsList>
                                    <TabsContent value="inventory">
                                        <ScrollArea className="max-h-[360px]">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow className="border-zinc-200 dark:border-zinc-700">
                                                        <TableHead className="text-zinc-700 dark:text-zinc-300">Peça</TableHead>
                                                        <TableHead className="text-zinc-700 dark:text-zinc-300">Categoria</TableHead>
                                                        <TableHead className="text-right text-zinc-700 dark:text-zinc-300">Estoque</TableHead>
                                                        <TableHead className="text-right text-zinc-700 dark:text-zinc-300">Min.</TableHead>
                                                        <TableHead className="text-right text-zinc-700 dark:text-zinc-300">Preço</TableHead>
                                                        <TableHead className="text-zinc-700 dark:text-zinc-300">Status</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {aggregatedInventory.map((item) => (
                                                        <TableRow
                                                            key={item.id}
                                                            className={`border-zinc-200 dark:border-zinc-700 ${item.stockQuantity <= item.minimumStock ? "bg-amber-50 dark:bg-amber-900/20" : ""}`}
                                                        >
                                                            <TableCell>
                                                                <div className="font-medium text-zinc-900 dark:text-white">{item.name}</div>
                                                                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                                                    Vendidos: {numberFormatter.format(item.soldQuantity)} · Receita:{" "}
                                                                    {currencyFormatter.format(item.revenue)}
                                                                </p>
                                                            </TableCell>
                                                            <TableCell className="text-zinc-700 dark:text-zinc-300">{item.category}</TableCell>
                                                            <TableCell className="text-right text-zinc-700 dark:text-zinc-300">
                                                                {numberFormatter.format(item.stockQuantity)}
                                                            </TableCell>
                                                            <TableCell className="text-right text-zinc-700 dark:text-zinc-300">
                                                                {numberFormatter.format(item.minimumStock)}
                                                            </TableCell>
                                                            <TableCell className="text-right text-zinc-700 dark:text-zinc-300">
                                                                {currencyFormatter.format(item.unitPrice)}
                                                            </TableCell>
                                                            <TableCell>{renderStatus(item)}</TableCell>
                                                        </TableRow>
                                                    ))}
                                                    {aggregatedInventory.length === 0 && (
                                                        <TableRow>
                                                            <TableCell colSpan={6} className="text-center text-zinc-500 dark:text-zinc-400 py-6">
                                                                Cadastre suas primeiras peças para começar o controle.
                                                            </TableCell>
                                                        </TableRow>
                                                    )}
                                                </TableBody>
                                            </Table>
                                        </ScrollArea>
                                    </TabsContent>
                                    <TabsContent value="sales">
                                        <ScrollArea className="max-h-[360px]">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow className="border-zinc-200 dark:border-zinc-700">
                                                        <TableHead className="text-zinc-700 dark:text-zinc-300">ID</TableHead>
                                                        <TableHead className="text-zinc-700 dark:text-zinc-300">Peça</TableHead>
                                                        <TableHead className="text-right text-zinc-700 dark:text-zinc-300">Qtde.</TableHead>
                                                        <TableHead className="text-right text-zinc-700 dark:text-zinc-300">Total</TableHead>
                                                        <TableHead className="text-zinc-700 dark:text-zinc-300">Cliente</TableHead>
                                                        <TableHead className="text-zinc-700 dark:text-zinc-300">Data</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {data.sales
                                                        .slice()
                                                        .sort((a, b) => (a.date > b.date ? -1 : 1))
                                                        .map((sale) => {
                                                            const item = data.inventory.find((inventoryItem) => inventoryItem.id === sale.itemId)
                                                            return (
                                                                <TableRow key={sale.id} className="border-zinc-200 dark:border-zinc-700">
                                                                    <TableCell className="font-mono text-xs text-zinc-700 dark:text-zinc-300">
                                                                        {sale.id}
                                                                    </TableCell>
                                                                    <TableCell className="text-zinc-900 dark:text-white">
                                                                        {item?.name ?? "Peça removida"}
                                                                    </TableCell>
                                                                    <TableCell className="text-right text-zinc-700 dark:text-zinc-300">
                                                                        {numberFormatter.format(sale.quantity)}
                                                                    </TableCell>
                                                                    <TableCell className="text-right text-zinc-700 dark:text-zinc-300">
                                                                        {currencyFormatter.format(sale.total)}
                                                                    </TableCell>
                                                                    <TableCell className="text-zinc-700 dark:text-zinc-300">
                                                                        {sale.customer ?? "-"}
                                                                    </TableCell>
                                                                    <TableCell className="text-zinc-700 dark:text-zinc-300">
                                                                        {getSaleDateLabel(sale.date)}
                                                                    </TableCell>
                                                                </TableRow>
                                                            )
                                                        })}
                                                    {data.sales.length === 0 && (
                                                        <TableRow>
                                                            <TableCell colSpan={6} className="text-center text-zinc-500 dark:text-zinc-400 py-6">
                                                                Nenhuma venda registrada até o momento.
                                                            </TableCell>
                                                        </TableRow>
                                                    )}
                                                </TableBody>
                                            </Table>
                                        </ScrollArea>
                                    </TabsContent>
                                    <TabsContent value="requests">
                                        <ScrollArea className="max-h-[360px]">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow className="border-zinc-200 dark:border-zinc-700">
                                                        <TableHead className="text-zinc-700 dark:text-zinc-300">Item</TableHead>
                                                        <TableHead className="text-zinc-700 dark:text-zinc-300">Tipo</TableHead>
                                                        <TableHead className="text-zinc-700 dark:text-zinc-300">Status</TableHead>
                                                        <TableHead className="text-right text-zinc-700 dark:text-zinc-300">Valor</TableHead>
                                                        <TableHead className="text-zinc-700 dark:text-zinc-300">Prazo</TableHead>
                                                        <TableHead className="text-zinc-700 dark:text-zinc-300">Origem</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {saleRequestsSorted.map((request) => {
                                                        const amount =
                                                            typeof request.price === "number" ? currencyFormatter.format(request.price) : "—"
                                                        const deadline = request.pickupDeadline || request.contactBy
                                                        return (
                                                            <TableRow key={request.id} className="border-zinc-200 dark:border-zinc-700">
                                                                <TableCell>
                                                                    <div className="font-medium text-zinc-900 dark:text-white">{request.itemName}</div>
                                                                    {request.requestedName && (
                                                                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                                                            Solicitado: {request.requestedName}
                                                                        </p>
                                                                    )}
                                                                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                                                        {getSaleDateLabel(request.createdAt)}
                                                                    </p>
                                                                </TableCell>
                                                                <TableCell>
                                                                    <Badge
                                                                        variant="outline"
                                                                        className="border-zinc-300 dark:border-zinc-600 text-zinc-700 dark:text-zinc-300"
                                                                    >
                                                                        {request.type === "estoque" ? "Estoque" : "Solicitação"}
                                                                    </Badge>
                                                                </TableCell>
                                                                <TableCell>
                                                                    <Badge className={saleRequestStatusClasses[request.status]}>
                                                                        {saleRequestStatusLabels[request.status]}
                                                                    </Badge>
                                                                </TableCell>
                                                                <TableCell className="text-right text-zinc-700 dark:text-zinc-300">{amount}</TableCell>
                                                                <TableCell className="text-zinc-700 dark:text-zinc-300">
                                                                    {deadline ? getSaleDateLabel(deadline) : "—"}
                                                                </TableCell>
                                                                <TableCell className="capitalize text-zinc-700 dark:text-zinc-300">
                                                                    {request.source ?? "workflow"}
                                                                </TableCell>
                                                            </TableRow>
                                                        )
                                                    })}
                                                    {saleRequestsSorted.length === 0 && (
                                                        <TableRow>
                                                            <TableCell colSpan={6} className="text-center text-zinc-500 dark:text-zinc-400 py-6">
                                                                Nenhum pedido registrado ainda.
                                                            </TableCell>
                                                        </TableRow>
                                                    )}
                                                </TableBody>
                                            </Table>
                                        </ScrollArea>
                                    </TabsContent>
                                    <TabsContent value="service-orders">
                                        <ScrollArea className="max-h-[360px]">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow className="border-zinc-200 dark:border-zinc-700">
                                                        <TableHead className="text-zinc-700 dark:text-zinc-300">Código</TableHead>
                                                        <TableHead className="text-zinc-700 dark:text-zinc-300">Cliente</TableHead>
                                                        <TableHead className="text-zinc-700 dark:text-zinc-300">Veículo</TableHead>
                                                        <TableHead className="text-zinc-700 dark:text-zinc-300">Status</TableHead>
                                                        <TableHead className="text-zinc-700 dark:text-zinc-300">Prioridade</TableHead>
                                                        <TableHead className="text-right text-zinc-700 dark:text-zinc-300">Previsto</TableHead>
                                                        <TableHead className="text-right text-zinc-700 dark:text-zinc-300">Pago</TableHead>
                                                        <TableHead className="text-right text-zinc-700 dark:text-zinc-300">Saldo</TableHead>
                                                        <TableHead className="text-zinc-700 dark:text-zinc-300">Entrega</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {serviceOrdersSorted.map((order) => (
                                                        <TableRow key={order.id} className="border-zinc-200 dark:border-zinc-700">
                                                            <TableCell className="font-mono text-xs text-zinc-700 dark:text-zinc-300">
                                                                {order.code}
                                                            </TableCell>
                                                            <TableCell>
                                                                <div className="font-medium text-zinc-900 dark:text-white">{order.customer}</div>
                                                                <p className="text-xs text-zinc-500 dark:text-zinc-400">{order.technician}</p>
                                                            </TableCell>
                                                            <TableCell className="text-zinc-700 dark:text-zinc-300">{order.vehicle}</TableCell>
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
                                                            <TableCell className="text-right text-zinc-700 dark:text-zinc-300">
                                                                {currencyFormatter.format(order.totalEstimate)}
                                                            </TableCell>
                                                            <TableCell className="text-right text-zinc-700 dark:text-zinc-300">
                                                                {currencyFormatter.format(order.amountPaid)}
                                                            </TableCell>
                                                            <TableCell className="text-right text-zinc-700 dark:text-zinc-300">
                                                                {currencyFormatter.format(order.balance)}
                                                            </TableCell>
                                                            <TableCell className="text-zinc-700 dark:text-zinc-300">
                                                                {order.expectedDelivery ? getSaleDateLabel(order.expectedDelivery) : "-"}
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                    {serviceOrdersSorted.length === 0 && (
                                                        <TableRow>
                                                            <TableCell colSpan={9} className="text-center text-zinc-500 dark:text-zinc-400 py-6">
                                                                Nenhuma ordem cadastrada. Utilize o formulário para iniciar o controle.
                                                            </TableCell>
                                                        </TableRow>
                                                    )}
                                                </TableBody>
                                            </Table>
                                        </ScrollArea>
                                    </TabsContent>
                                </Tabs>
                            </CardContent>
                        </Card>
                    </div>

                    <Card className="border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-lg font-semibold text-zinc-900 dark:text-white">
                                Pipeline de manutenção
                            </CardTitle>
                            <CardDescription className="text-zinc-500 dark:text-zinc-400">
                                Atualize o status das atividades em andamento.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Tabs
                                value={maintenanceTab}
                                onValueChange={(value) => setMaintenanceTab(value as MaintenanceStatus)}
                                className="space-y-4"
                            >
                                <TabsList className="grid w-full gap-1 md:grid-cols-3 bg-zinc-200 dark:bg-zinc-800 p-1 rounded-lg">
                                    {maintenanceColumns.map((column) => (
                                        <TabsTrigger
                                            key={column.status}
                                            value={column.status}
                                            className="rounded-md data-[state=active]:bg-white data-[state=active]:text-zinc-900 data-[state=active]:shadow-sm dark:data-[state=active]:bg-zinc-900 dark:data-[state=active]:text-white text-zinc-600 dark:text-zinc-400"
                                        >
                                            {column.title}
                                        </TabsTrigger>
                                    ))}
                                </TabsList>
                                {maintenanceColumns.map((column) => (
                                    <TabsContent key={column.status} value={column.status} className="space-y-3">
                                        {maintenanceByStatus[column.status].length === 0 ? (
                                            <p className="text-sm text-zinc-500 dark:text-zinc-400">{column.description}</p>
                                        ) : (
                                            maintenanceByStatus[column.status].map(({ task, order }) => {
                                                const currentStatus = maintenanceStatusSelections[task.id] ?? task.status
                                                return (
                                                    <div
                                                        key={task.id}
                                                        className="rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 p-4 space-y-3"
                                                    >
                                                        <div className="flex items-center justify-between gap-2">
                                                            <p className="font-medium text-zinc-900 dark:text-white">{task.title}</p>
                                                            <Badge className={maintenanceStatusBadgeClasses[task.status]}>
                                                                {maintenanceStatusLabels[task.status]}
                                                            </Badge>
                                                        </div>
                                                        <div className="space-y-1 text-xs text-zinc-500 dark:text-zinc-400">
                                                            <p>Ordem: {order ? `${order.code} · ${order.customer}` : "Ordem removida"}</p>
                                                            <p>Técnico: {task.technician ?? "-"}</p>
                                                            <p>
                                                                Início: {getSaleDateLabel(task.startDate)}
                                                                {task.endDate ? ` · Fim: ${getSaleDateLabel(task.endDate)}` : ""}
                                                            </p>
                                                            {task.notes && <p>Notas: {task.notes}</p>}
                                                        </div>
                                                        <form
                                                            action={handleUpdateMaintenanceTaskStatus}
                                                            className="flex flex-col gap-2 sm:flex-row sm:items-center"
                                                        >
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
                                                                <SelectTrigger className="sm:w-48 bg-white dark:bg-zinc-800 border-zinc-300 dark:border-zinc-600">
                                                                    <SelectValue placeholder="Atualizar status" />
                                                                </SelectTrigger>
                                                                <SelectContent className="bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700">
                                                                    <SelectItem value="pendente" className="text-zinc-900 dark:text-white">
                                                                        Pendente
                                                                    </SelectItem>
                                                                    <SelectItem value="em_andamento" className="text-zinc-900 dark:text-white">
                                                                        Em andamento
                                                                    </SelectItem>
                                                                    <SelectItem value="concluida" className="text-zinc-900 dark:text-white">
                                                                        Concluída
                                                                    </SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                            <input type="hidden" name="status" value={currentStatus} />
                                                            <Button
                                                                type="submit"
                                                                variant="secondary"
                                                                size="sm"
                                                                disabled={updatingMaintenanceTaskId === task.id}
                                                            >
                                                                {updatingMaintenanceTaskId === task.id ? "Atualizando..." : "Atualizar"}
                                                            </Button>
                                                        </form>
                                                    </div>
                                                )
                                            })
                                        )}
                                    </TabsContent>
                                ))}
                            </Tabs>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="financial" className="space-y-6">
                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        <Card className="border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-sm">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg font-semibold text-zinc-900 dark:text-white">Receitas</CardTitle>
                                <CardDescription className="text-zinc-500 dark:text-zinc-400">
                                    Entradas registradas em vendas e serviços.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-4xl font-bold text-emerald-600 dark:text-emerald-400">
                                    {currencyFormatter.format(financialSummary.income)}
                                </p>
                                <p className="text-zinc-600 dark:text-zinc-400 text-sm mt-2">
                                    Ticket médio: {currencyFormatter.format(financialSummary.averageTicket)}
                                </p>
                            </CardContent>
                        </Card>
                        <Card className="border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-sm">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg font-semibold text-zinc-900 dark:text-white">Despesas</CardTitle>
                                <CardDescription className="text-zinc-500 dark:text-zinc-400">
                                    Saídas com peças, serviços terceirizados e custos operacionais.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-4xl font-bold text-red-600 dark:text-red-400">
                                    {currencyFormatter.format(financialSummary.expense)}
                                </p>
                                <p className="text-zinc-600 dark:text-zinc-400 text-sm mt-2">Saldo líquido abaixo.</p>
                            </CardContent>
                        </Card>
                        <Card className="border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-sm">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg font-semibold text-zinc-900 dark:text-white">Saldo líquido</CardTitle>
                                <CardDescription className="text-zinc-500 dark:text-zinc-400">
                                    Diferença entre receitas e despesas.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p
                                    className={`text-4xl font-bold ${financialSummary.net >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}
                                >
                                    {currencyFormatter.format(financialSummary.net)}
                                </p>
                                <p className="text-zinc-600 dark:text-zinc-400 text-sm mt-2">
                                    {financialSummary.net >= 0 ? "Resultado positivo" : "Resultado negativo"}
                                </p>
                            </CardContent>
                        </Card>
                        <Card className="border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-sm">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg font-semibold text-zinc-900 dark:text-white">A receber</CardTitle>
                                <CardDescription className="text-zinc-500 dark:text-zinc-400">
                                    Valores pendentes de ordens de serviço.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-4xl font-bold text-blue-600 dark:text-blue-400">
                                    {currencyFormatter.format(financialSummary.outstandingOrders)}
                                </p>
                                <p className="text-zinc-600 dark:text-zinc-400 text-sm mt-2">
                                    {serviceOrderStats.totalOrders} ordens cadastradas
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid gap-6 lg:grid-cols-2">
                        <Card className="border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-lg font-semibold text-zinc-900 dark:text-white">
                                    Adicionar registro financeiro
                                </CardTitle>
                                <CardDescription className="text-zinc-500 dark:text-zinc-400">
                                    Lance receitas extras ou despesas operacionais.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form ref={financialFormRef} action={handleRegisterFinancialRecord} className="space-y-4">
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label className="text-zinc-900 dark:text-white">Tipo</Label>
                                            <Select
                                                value={financialType}
                                                onValueChange={(value) => setFinancialType(value as FinancialRecord["type"])}
                                            >
                                                <SelectTrigger className="bg-white dark:bg-zinc-800 border-zinc-300 dark:border-zinc-600">
                                                    <SelectValue placeholder="Selecione o tipo" />
                                                </SelectTrigger>
                                                <SelectContent className="bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700">
                                                    <SelectItem value="receita" className="text-zinc-900 dark:text-white">
                                                        Receita
                                                    </SelectItem>
                                                    <SelectItem value="despesa" className="text-zinc-900 dark:text-white">
                                                        Despesa
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <input type="hidden" name="type" value={financialType} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="financial-date" className="text-zinc-900 dark:text-white">
                                                Data
                                            </Label>
                                            <Input
                                                id="financial-date"
                                                name="date"
                                                type="date"
                                                defaultValue={new Date().toISOString().slice(0, 10)}
                                                className="bg-white dark:bg-zinc-800 border-zinc-300 dark:border-zinc-600"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="financial-category" className="text-zinc-900 dark:text-white">
                                            Categoria
                                        </Label>
                                        <Input
                                            id="financial-category"
                                            name="category"
                                            placeholder="Ex: Serviços terceirizados"
                                            required
                                            className="bg-white dark:bg-zinc-800 border-zinc-300 dark:border-zinc-600"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="financial-description" className="text-zinc-900 dark:text-white">
                                            Descrição
                                        </Label>
                                        <Input
                                            id="financial-description"
                                            name="description"
                                            placeholder="Detalhes do lançamento"
                                            className="bg-white dark:bg-zinc-800 border-zinc-300 dark:border-zinc-600"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="financial-amount" className="text-zinc-900 dark:text-white">
                                            Valor (R$)
                                        </Label>
                                        <Input
                                            id="financial-amount"
                                            name="amount"
                                            type="number"
                                            inputMode="decimal"
                                            min={0}
                                            step="0.01"
                                            placeholder="0,00"
                                            required
                                            className="bg-white dark:bg-zinc-800 border-zinc-300 dark:border-zinc-600"
                                        />
                                    </div>
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label className="text-zinc-900 dark:text-white">Venda relacionada (opcional)</Label>
                                            <Select value={financialRelatedSaleId} onValueChange={setFinancialRelatedSaleId}>
                                                <SelectTrigger className="bg-white dark:bg-zinc-800 border-zinc-300 dark:border-zinc-600">
                                                    <SelectValue placeholder="Nenhuma" />
                                                </SelectTrigger>
                                                <SelectContent className="bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700">
                                                    <SelectItem value="none" className="text-zinc-900 dark:text-white">
                                                        Nenhuma
                                                    </SelectItem>
                                                    {data.sales.map((sale) => (
                                                        <SelectItem key={sale.id} value={sale.id} className="text-zinc-900 dark:text-white">
                                                            {salesLookup.get(sale.id)?.label ?? sale.id}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <input
                                                type="hidden"
                                                name="relatedSaleId"
                                                value={financialRelatedSaleId === "none" ? "" : financialRelatedSaleId}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-zinc-900 dark:text-white">Ordem relacionada (opcional)</Label>
                                            <Select value={financialRelatedOrderId} onValueChange={setFinancialRelatedOrderId}>
                                                <SelectTrigger className="bg-white dark:bg-zinc-800 border-zinc-300 dark:border-zinc-600">
                                                    <SelectValue placeholder="Nenhuma" />
                                                </SelectTrigger>
                                                <SelectContent className="bg-white dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700">
                                                    <SelectItem value="none" className="text-zinc-900 dark:text-white">
                                                        Nenhuma
                                                    </SelectItem>
                                                    {data.serviceOrders.map((order) => (
                                                        <SelectItem key={order.id} value={order.id} className="text-zinc-900 dark:text-white">
                                                            {serviceOrderLookup.get(order.id)?.code ?? order.id} ·{" "}
                                                            {serviceOrderLookup.get(order.id)?.customer}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <input
                                                type="hidden"
                                                name="relatedOrderId"
                                                value={financialRelatedOrderId === "none" ? "" : financialRelatedOrderId}
                                            />
                                        </div>
                                    </div>
                                    <Button type="submit" className="w-full" disabled={financialSubmitting}>
                                        {financialSubmitting ? "Registrando..." : "Adicionar registro"}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>

                        <Card className="border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-lg font-semibold text-zinc-900 dark:text-white">
                                    Últimos lançamentos
                                </CardTitle>
                                <CardDescription className="text-zinc-500 dark:text-zinc-400">
                                    Histórico recente de movimentações financeiras.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {recentFinancialRecords.length > 0 ? (
                                    <div className="space-y-3">
                                        {recentFinancialRecords.map((record) => (
                                            <div
                                                key={record.id}
                                                className="flex items-center justify-between rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 p-3"
                                            >
                                                <div>
                                                    <p className="font-semibold text-zinc-900 dark:text-white">{record.category}</p>
                                                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                                        {record.description ?? "Sem descrição"} · {getSaleDateLabel(record.date)}
                                                    </p>
                                                </div>
                                                <p
                                                    className={`font-bold ${record.type === "receita" ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}
                                                >
                                                    {record.type === "receita" ? "+" : "-"} {currencyFormatter.format(record.amount)}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-zinc-500 dark:text-zinc-400 text-sm py-4 text-center">
                                        Nenhum registro financeiro cadastrado.
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}
