import fs from "node:fs/promises"
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

export interface WorkshopData {
    inventory: InventoryItem[]
    sales: SaleRecord[]
}

const dataFilePath = path.join(process.cwd(), "src/data/workshopData.json")

async function ensureDataFile(): Promise<void> {
    try {
        await fs.access(dataFilePath)
    } catch (error) {
        const defaultData: WorkshopData = { inventory: [], sales: [] }
        await fs.mkdir(path.dirname(dataFilePath), { recursive: true })
        await fs.writeFile(dataFilePath, JSON.stringify(defaultData, null, 2), "utf-8")
    }
}

export async function readWorkshopData(): Promise<WorkshopData> {
    await ensureDataFile()
    const raw = await fs.readFile(dataFilePath, "utf-8")
    return JSON.parse(raw) as WorkshopData
}

export async function writeWorkshopData(data: WorkshopData): Promise<void> {
    await fs.writeFile(dataFilePath, JSON.stringify(data, null, 2), "utf-8")
}
