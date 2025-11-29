"use server"

import { randomUUID } from "node:crypto"
import { revalidatePath } from "next/cache"

import {
    readWorkshopData,
    writeWorkshopData,
    type FinancialRecord,
    type InventoryItem,
    type MaintenanceStatus,
    type MaintenanceTask,
    type ServiceOrder,
    type ServiceOrderService,
    type ServiceOrderStatus,
    type WorkshopData,
} from "@/src/server/workshop-data"

function parseNumber(value: FormDataEntryValue | null, fallback = 0): number {
    if (value === null) return fallback
    const parsed = typeof value === "string" ? Number(value.replace(",", ".")) : Number(value)
    return Number.isFinite(parsed) ? parsed : fallback
}

function sanitizeText(value: FormDataEntryValue | null): string {
    if (!value) return ""
    return String(value).trim()
}

export async function createInventoryItem(formData: FormData) {
    const name = sanitizeText(formData.get("name"))
    const category = sanitizeText(formData.get("category"))
    const unitPrice = parseNumber(formData.get("unitPrice"))
    const stockQuantity = parseNumber(formData.get("stockQuantity"))
    const minimumStock = parseNumber(formData.get("minimumStock"))

    if (!name) {
        return { error: "Informe o nome da peça." }
    }

    if (!category) {
        return { error: "Informe a categoria da peça." }
    }

    if (unitPrice <= 0) {
        return { error: "O preço unitário deve ser maior que zero." }
    }

    if (stockQuantity < 0) {
        return { error: "O estoque inicial não pode ser negativo." }
    }

    const data = await readWorkshopData()

    const alreadyExists = data.inventory.some((item) => item.name.toLowerCase() === name.toLowerCase())
    if (alreadyExists) {
        return { error: "Já existe uma peça cadastrada com esse nome." }
    }

    const newItem: InventoryItem = {
        id: `item-${randomUUID()}`,
        name,
        category,
        unitPrice: Number(unitPrice.toFixed(2)),
        stockQuantity: Math.floor(stockQuantity),
        minimumStock: Math.max(0, Math.floor(minimumStock)),
    }

    const updatedData: WorkshopData = {
        ...data,
        inventory: [...data.inventory, newItem],
    }

    await writeWorkshopData(updatedData)
    revalidatePath("/panel/vendas")

    return {
        success: true,
        message: `Peça "${newItem.name}" cadastrada com sucesso.`,
    }
}

export async function registerSale(formData: FormData) {
    const itemId = sanitizeText(formData.get("itemId"))
    const quantity = parseNumber(formData.get("quantity"))
    const explicitUnitPrice = formData.get("salePrice")
    const customer = sanitizeText(formData.get("customer"))
    const notes = sanitizeText(formData.get("notes"))
    const dateInput = sanitizeText(formData.get("date"))

    if (!itemId) {
        return { error: "Selecione a peça vendida." }
    }

    if (quantity <= 0) {
        return { error: "A quantidade vendida deve ser maior que zero." }
    }

    const data = await readWorkshopData()
    const inventoryItem = data.inventory.find((item) => item.id === itemId)

    if (!inventoryItem) {
        return { error: "Peça não encontrada no estoque." }
    }

    const unitPrice = explicitUnitPrice ? parseNumber(explicitUnitPrice, inventoryItem.unitPrice) : inventoryItem.unitPrice

    if (unitPrice <= 0) {
        return { error: "O preço de venda deve ser maior que zero." }
    }

    if (quantity > inventoryItem.stockQuantity) {
        return {
            error: `Estoque insuficiente. Disponível: ${inventoryItem.stockQuantity} unidade(s).`,
        }
    }

    const normalizedDate = dateInput || new Date().toISOString().slice(0, 10)
    const total = Number((unitPrice * quantity).toFixed(2))

    const updatedInventory = data.inventory.map((item) =>
        item.id === itemId
            ? {
                  ...item,
                  stockQuantity: item.stockQuantity - Math.floor(quantity),
              }
            : item,
    )

    const saleId = `sale-${randomUUID()}`

    const updatedSales = [
        ...data.sales,
        {
            id: saleId,
            itemId,
            quantity: Math.floor(quantity),
            unitPrice: Number(unitPrice.toFixed(2)),
            total,
            date: normalizedDate,
            customer: customer || undefined,
            notes: notes || undefined,
        },
    ]

    const financialRecord: FinancialRecord = {
        id: `fin-${randomUUID()}`,
        type: "receita",
        category: "Vendas de peças",
        description: `Venda de ${inventoryItem.name}`,
        amount: total,
        date: normalizedDate,
        relatedSaleId: saleId,
    }

    await writeWorkshopData({
        ...data,
        inventory: updatedInventory,
        sales: updatedSales,
        financialRecords: [...data.financialRecords, financialRecord],
    })
    revalidatePath("/panel/vendas")

    return {
        success: true,
        message: `Venda registrada com sucesso (ID ${saleId}).`,
    }
}

function normalizeServiceOrderStatus(value: string): ServiceOrderStatus | null {
    const normalized = value as ServiceOrderStatus
    if (["aberta", "em_andamento", "aguardando_peca", "concluida", "cancelada"].includes(normalized)) {
        return normalized
    }
    return null
}

function normalizeMaintenanceStatus(value: string): MaintenanceStatus | null {
    const normalized = value as MaintenanceStatus
    if (["pendente", "em_andamento", "concluida"].includes(normalized)) {
        return normalized
    }
    return null
}

function parseServicesInput(raw: string): ServiceOrderService[] {
    return raw
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter((line) => line.length > 0)
        .map((line) => {
            const [descriptionPart, costPart] = line.split(/\s+-\s+|\s*;\s*|\|/)
            const description = descriptionPart?.trim() ?? ""
            const cost = Number((costPart ?? "0").toString().replace(",", "."))

            return {
                description,
                cost: Number.isFinite(cost) ? Number(cost.toFixed(2)) : 0,
            }
        })
        .filter((service) => service.description)
}

export async function createServiceOrder(formData: FormData) {
    const customer = sanitizeText(formData.get("customer"))
    const vehicle = sanitizeText(formData.get("vehicle"))
    const technician = sanitizeText(formData.get("technician"))
    const statusInput = sanitizeText(formData.get("status"))
    const priorityInput = sanitizeText(formData.get("priority"))
    const issueDescription = sanitizeText(formData.get("issueDescription"))
    const expectedDelivery = sanitizeText(formData.get("expectedDelivery"))
    const servicesInput = sanitizeText(formData.get("services"))
    const partsCost = parseNumber(formData.get("partsCost"))
    const amountPaid = parseNumber(formData.get("amountPaid"))

    if (!customer) {
        return { error: "Informe o cliente da ordem de serviço." }
    }

    if (!vehicle) {
        return { error: "Informe o veículo atendido." }
    }

    const status = normalizeServiceOrderStatus(statusInput || "aberta")
    if (!status) {
        return { error: "Status da ordem de serviço inválido." }
    }

    const priority = (priorityInput || "media") as ServiceOrder["priority"]
    if (!["baixa", "media", "alta"].includes(priority)) {
        return { error: "Prioridade inválida." }
    }

    const services = servicesInput ? parseServicesInput(servicesInput) : []
    const servicesTotal = services.reduce((sum, service) => sum + service.cost, 0)
    const normalizedPartsCost = Math.max(0, Number(partsCost.toFixed(2)))

    if (services.length === 0 && normalizedPartsCost === 0) {
        return { error: "Informe ao menos um serviço ou custo de peças." }
    }

    const totalEstimate = Number((servicesTotal + normalizedPartsCost).toFixed(2))
    if (totalEstimate <= 0) {
        return { error: "O valor estimado deve ser maior que zero." }
    }
    const normalizedAmountPaid = Math.max(0, Number(amountPaid.toFixed(2)))
    const balance = Number(Math.max(0, totalEstimate - normalizedAmountPaid).toFixed(2))

    const data = await readWorkshopData()
    const orderSequence = data.serviceOrders.length + 1
    const orderCode = `OS-${new Date().getFullYear()}-${orderSequence.toString().padStart(3, "0")}`

    const newOrder: ServiceOrder = {
        id: `os-${randomUUID()}`,
        code: orderCode,
        customer,
        vehicle,
        technician: technician || "Equipe",
        status,
        priority,
        issueDescription,
        services,
        createdAt: new Date().toISOString(),
        expectedDelivery: expectedDelivery || undefined,
        partsCost: normalizedPartsCost,
        amountPaid: normalizedAmountPaid,
        totalEstimate,
        balance,
    }

    const updatedServiceOrders = [newOrder, ...data.serviceOrders]

    const updatedFinancialRecords: FinancialRecord[] =
        normalizedAmountPaid > 0
            ? [
                  ...data.financialRecords,
                  {
                      id: `fin-${randomUUID()}`,
                      type: "receita",
                      category: "Ordens de serviço",
                      description: `Pagamento recebido ${newOrder.code}`,
                      amount: normalizedAmountPaid,
                      date: new Date().toISOString().slice(0, 10),
                      relatedServiceOrderId: newOrder.id,
                  },
              ]
            : data.financialRecords

    await writeWorkshopData({
        ...data,
        serviceOrders: updatedServiceOrders,
        financialRecords: updatedFinancialRecords,
    })

    revalidatePath("/panel/vendas")

    return {
        success: true,
        message: `Ordem de serviço ${newOrder.code} criada com sucesso.`,
    }
}

export async function createMaintenanceTask(formData: FormData) {
    const orderId = sanitizeText(formData.get("orderId"))
    const title = sanitizeText(formData.get("title"))
    const technician = sanitizeText(formData.get("technician"))
    const statusInput = sanitizeText(formData.get("status"))
    const startDate = sanitizeText(formData.get("startDate"))
    const notes = sanitizeText(formData.get("notes"))

    if (!orderId) {
        return { error: "Selecione uma ordem de serviço relacionada." }
    }

    if (!title) {
        return { error: "Informe o título da atividade de manutenção." }
    }

    const status = normalizeMaintenanceStatus(statusInput || "pendente")
    if (!status) {
        return { error: "Status da manutenção inválido." }
    }

    const data = await readWorkshopData()
    const relatedOrder = data.serviceOrders.find((order) => order.id === orderId)

    if (!relatedOrder) {
        return { error: "Ordem de serviço não encontrada." }
    }

    const task: MaintenanceTask = {
        id: `mt-${randomUUID()}`,
        orderId,
        title,
        status,
        technician: technician || relatedOrder.technician,
        startDate: startDate || new Date().toISOString().slice(0, 10),
        notes: notes || undefined,
        endDate: status === "concluida" ? startDate || new Date().toISOString().slice(0, 10) : undefined,
    }

    await writeWorkshopData({
        ...data,
        maintenanceTasks: [task, ...data.maintenanceTasks],
    })

    revalidatePath("/panel/vendas")

    return {
        success: true,
        message: `Atividade de manutenção registrada para ${relatedOrder.code}.`,
    }
}

export async function updateMaintenanceTaskStatus(formData: FormData) {
    const taskId = sanitizeText(formData.get("taskId"))
    const statusInput = sanitizeText(formData.get("status"))

    if (!taskId) {
        return { error: "Tarefa inválida." }
    }

    const status = normalizeMaintenanceStatus(statusInput || "pendente")
    if (!status) {
        return { error: "Status de manutenção inválido." }
    }

    const data = await readWorkshopData()
    const taskExists = data.maintenanceTasks.some((task) => task.id === taskId)

    if (!taskExists) {
        return { error: "Atividade não encontrada." }
    }

    const updatedTasks = data.maintenanceTasks.map((task) =>
        task.id === taskId
            ? {
                  ...task,
                  status,
                  endDate:
                      status === "concluida"
                          ? task.endDate || new Date().toISOString().slice(0, 10)
                          : undefined,
              }
            : task,
    )

    await writeWorkshopData({
        ...data,
        maintenanceTasks: updatedTasks,
    })

    revalidatePath("/panel/vendas")

    return {
        success: true,
        message: "Status da manutenção atualizado com sucesso.",
    }
}

export async function registerFinancialRecord(formData: FormData) {
    const type = sanitizeText(formData.get("type")) as FinancialRecord["type"]
    const category = sanitizeText(formData.get("category"))
    const description = sanitizeText(formData.get("description"))
    const amount = parseNumber(formData.get("amount"))
    const date = sanitizeText(formData.get("date"))
    const relatedSaleId = sanitizeText(formData.get("relatedSaleId"))
    const relatedServiceOrderId = sanitizeText(formData.get("relatedServiceOrderId"))

    if (!type || !["receita", "despesa"].includes(type)) {
        return { error: "Selecione o tipo de registro financeiro." }
    }

    if (!category) {
        return { error: "Informe a categoria." }
    }

    if (!description) {
        return { error: "Informe a descrição." }
    }

    if (amount <= 0) {
        return { error: "O valor deve ser maior que zero." }
    }

    const data = await readWorkshopData()

    const record: FinancialRecord = {
        id: `fin-${randomUUID()}`,
        type,
        category,
        description,
        amount: Number(amount.toFixed(2)),
        date: date || new Date().toISOString().slice(0, 10),
        relatedSaleId: relatedSaleId || undefined,
        relatedServiceOrderId: relatedServiceOrderId || undefined,
    }

    await writeWorkshopData({
        ...data,
        financialRecords: [record, ...data.financialRecords],
    })

    revalidatePath("/panel/vendas")

    return {
        success: true,
        message: "Registro financeiro adicionado com sucesso.",
    }
}