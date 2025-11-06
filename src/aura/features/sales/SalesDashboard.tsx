"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"

import { createInventoryItem, registerSale } from "@/app/panel/vendas/actions"
import type { InventoryItem, SaleRecord, WorkshopData } from "@/src/server/workshop-data"

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

export default function SalesDashboard({ initialData }: SalesDashboardProps) {
    const router = useRouter()
    const [data, setData] = useState<WorkshopData>(initialData)
    const [successMessage, setSuccessMessage] = useState<string | null>(null)
    const [errorMessage, setErrorMessage] = useState<string | null>(null)
    const [inventorySubmitting, setInventorySubmitting] = useState(false)
    const [saleSubmitting, setSaleSubmitting] = useState(false)
    const [selectedItemId, setSelectedItemId] = useState<string>(initialData.inventory[0]?.id ?? "")

    const inventoryFormRef = useRef<HTMLFormElement>(null)
    const saleFormRef = useRef<HTMLFormElement>(null)

    useEffect(() => {
        setData(initialData)
        if (!initialData.inventory.some((item) => item.id === selectedItemId)) {
            setSelectedItemId(initialData.inventory[0]?.id ?? "")
        }
    }, [initialData, selectedItemId])

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

    const getSaleDateLabel = (sale: SaleRecord) => {
        if (!sale.date) return "-"
        const parsed = new Date(`${sale.date}T00:00:00`)
        if (Number.isNaN(parsed.getTime())) {
            return sale.date
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
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Gestão de Vendas e Estoque</h1>
                <p className="text-muted-foreground mt-1">
                    Cadastre peças, registre vendas e acompanhe o desempenho financeiro da oficina em tempo real.
                </p>
            </div>

            {(successMessage || errorMessage) && (
                <div
                    className={`rounded-lg border p-4 ${
                        errorMessage ? "border-destructive/50 bg-destructive/10 text-destructive" : "border-emerald-500/40 bg-emerald-500/10 text-emerald-600"
                    }`}
                >
                    <p className="font-medium">{errorMessage ? errorMessage : successMessage}</p>
                </div>
            )}

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
                                    <Input
                                        id="stockQuantity"
                                        name="stockQuantity"
                                        type="number"
                                        min={0}
                                        step={1}
                                        placeholder="0"
                                        required
                                    />
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
                    </CardContent>
                </Card>

                <Card className="overflow-hidden">
                    <CardHeader>
                        <CardTitle>Histórico de vendas</CardTitle>
                        <CardDescription>Detalhamento de cada venda registrada com ID e cliente.</CardDescription>
                    </CardHeader>
                    <CardContent className="px-0">
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
                                                <TableCell>{getSaleDateLabel(sale)}</TableCell>
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
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
