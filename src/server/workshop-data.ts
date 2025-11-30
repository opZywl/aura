import fs from "node:fs/promises"
import fsSync from "node:fs"
import path from "node:path"

export interface InventoryItem {
    id: string
    name: string
    category: string
    unitPrice: number
    stockQuantity: number
    minimumStock: number
}

export interface SaleRecord {
    id: string
    itemId: string
    quantity: number
    unitPrice: number
    total: number
    date: string
    customer?: string
    notes?: string
}

export type SaleRequestType = "estoque" | "solicitacao"

export type SaleRequestStatus = "pendente" | "confirmada" | "cancelada"

export interface SaleRequest {
    id: string
    type: SaleRequestType
    itemId?: string
    itemName: string
    requestedName?: string
    price?: number
    status: SaleRequestStatus
    createdAt: string
    pickupDeadline?: string
    contactBy?: string
    source?: "workflow" | "painel"
    notes?: string
}

export type ServiceOrderStatus = "aberta" | "em_andamento" | "aguardando_peca" | "concluida" | "cancelada"

export type ServicePriority = "baixa" | "media" | "alta"

export interface ServiceOrderService {
    description: string
    cost: number
}

export interface ServiceOrder {
    id: string
    code: string
    customer: string
    vehicle: string
    technician: string
    status: ServiceOrderStatus
    priority: ServicePriority
    issueDescription: string
    services: ServiceOrderService[]
    createdAt: string
    expectedDelivery?: string
    partsCost: number
    amountPaid: number
    totalEstimate: number
    balance: number
}

export type MaintenanceStatus = "pendente" | "em_andamento" | "concluida"

export interface MaintenanceTask {
    id: string
    orderId: string
    title: string
    status: MaintenanceStatus
    technician: string
    startDate: string
    endDate?: string
    notes?: string
}

export type FinancialRecordType = "receita" | "despesa"

export interface FinancialRecord {
    id: string
    type: FinancialRecordType
    category: string
    description: string
    amount: number
    date: string
    relatedSaleId?: string
    relatedServiceOrderId?: string
}

export interface WorkshopData {
    inventory: InventoryItem[]
    sales: SaleRecord[]
    serviceOrders: ServiceOrder[]
    maintenanceTasks: MaintenanceTask[]
    financialRecords: FinancialRecord[]
    saleRequests: SaleRequest[]
}

const envDataFile = process.env.AURA_WORKSHOP_DATA_FILE
    ? path.resolve(process.env.AURA_WORKSHOP_DATA_FILE)
    : null

const defaultDataFile = path.join(process.cwd(), "src/data/workshopData.json")

// Arquivos legados usados por versões anteriores do bot
const legacyDataFiles = [
    path.join(process.cwd(), "src/aura/data/workshopData.json"),
    path.join(process.cwd(), "data/workshopData.json"),
]

const dataFilePath = envDataFile ?? legacyDataFiles.find((file) => fsSync.existsSync(file)) ?? defaultDataFile

async function ensureDataFile(): Promise<void> {
    try {
        await fs.access(dataFilePath)
        return
    } catch (error) {
        // Continua para criação do arquivo padrão
    }

    const defaultData: WorkshopData = {
        inventory: [],
        sales: [],
        serviceOrders: [],
        maintenanceTasks: [],
        financialRecords: [],
        saleRequests: [],
    }

    await fs.mkdir(path.dirname(dataFilePath), { recursive: true })
    await fs.writeFile(dataFilePath, JSON.stringify(defaultData, null, 2), "utf-8")
}

function tryRecoverJson(raw: string): Partial<WorkshopData> | null {
    const start = raw.indexOf("{")

    if (start === -1) {
        return null
    }

    for (let end = raw.length; end > start; end -= 1) {
        const candidate = raw.slice(start, end).trimEnd()

        if (!candidate.endsWith("}")) {
            continue
        }

        try {
            return JSON.parse(candidate) as Partial<WorkshopData>
        } catch (error) {
            continue
        }
    }

    return null
}

export async function readWorkshopData(): Promise<WorkshopData> {
    await ensureDataFile()
    const raw = await fs.readFile(dataFilePath, "utf-8")
    let parsed: Partial<WorkshopData>

    try {
        parsed = JSON.parse(raw) as Partial<WorkshopData>
    } catch (error) {
        const recovered = tryRecoverJson(raw)

        if (!recovered) {
            throw error
        }

        parsed = recovered
        await fs.writeFile(dataFilePath, JSON.stringify(parsed, null, 2), "utf-8")
    }

    return {
        inventory: parsed.inventory ?? [],
        sales: parsed.sales ?? [],
        serviceOrders: parsed.serviceOrders ?? [],
        maintenanceTasks: parsed.maintenanceTasks ?? [],
        financialRecords: parsed.financialRecords ?? [],
        saleRequests: parsed.saleRequests ?? [],
    }
}

export async function writeWorkshopData(data: WorkshopData): Promise<void> {
    await fs.writeFile(dataFilePath, JSON.stringify(data, null, 2), "utf-8")
}