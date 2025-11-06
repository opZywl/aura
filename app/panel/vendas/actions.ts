"use server"

import { randomUUID } from "node:crypto"
import { revalidatePath } from "next/cache"

import {
    readWorkshopData,
    writeWorkshopData,
    type InventoryItem,
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

    await writeWorkshopData({ inventory: updatedInventory, sales: updatedSales })
    revalidatePath("/panel/vendas")

    return {
        success: true,
        message: `Venda registrada com sucesso (ID ${saleId}).`,
    }
}
