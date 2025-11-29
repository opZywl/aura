import { randomUUID } from "node:crypto"

import { NextResponse } from "next/server"

import {
    readWorkshopData,
    writeWorkshopData,
    type InventoryItem,
    type SaleRequest,
    type SaleRequestStatus,
    type SaleRequestType,
} from "@/src/server/workshop-data"

export const dynamic = "force-dynamic"

function sanitizeText(value: unknown): string {
    if (typeof value !== "string") return ""
    return value.trim()
}

function normalizeType(value: unknown): SaleRequestType | null {
    return value === "estoque" || value === "solicitacao" ? value : null
}

function normalizeStatus(value: unknown): SaleRequestStatus | null {
    return value === "pendente" || value === "confirmada" || value === "cancelada" ? value : null
}

function parsePrice(value: unknown): number | undefined {
    if (typeof value !== "number" && typeof value !== "string") return undefined
    const parsed = Number(value)
    return Number.isFinite(parsed) ? Number(parsed.toFixed(2)) : undefined
}

export async function GET() {
    const data = await readWorkshopData()

    return NextResponse.json({ saleRequests: data.saleRequests ?? [] })
}

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const type = normalizeType(body?.type)
        const itemName = sanitizeText(body?.itemName)
        const requestedName = sanitizeText(body?.requestedName)
        const notes = sanitizeText(body?.notes)
        const price = parsePrice(body?.price)
        const source = body?.source === "painel" ? "painel" : "workflow"

        if (!type) {
            return NextResponse.json({ error: "Tipo de pedido inválido." }, { status: 400 })
        }

        if (!itemName && !requestedName) {
            return NextResponse.json({ error: "Informe o item desejado." }, { status: 400 })
        }

        const data = await readWorkshopData()
        const now = new Date()

        const newRequest: SaleRequest = {
            id: `pedido-${randomUUID()}`,
            type,
            itemId: sanitizeText(body?.itemId) || undefined,
            itemName: itemName || requestedName,
            requestedName: requestedName || undefined,
            price,
            status: "pendente",
            createdAt: now.toISOString(),
            source,
            notes: notes || undefined,
        }

        if (type === "estoque") {
            const pickupDeadline = new Date(now)
            pickupDeadline.setDate(pickupDeadline.getDate() + 3)
            newRequest.pickupDeadline = pickupDeadline.toISOString()
        } else {
            const contactBy = new Date(now)
            contactBy.setDate(contactBy.getDate() + 7)
            newRequest.contactBy = contactBy.toISOString()
        }

        const updatedData = {
            ...data,
            saleRequests: [...(data.saleRequests ?? []), newRequest],
        }

        await writeWorkshopData(updatedData)

        return NextResponse.json({ saleRequest: newRequest }, { status: 201 })
    } catch (error) {
        console.error("Erro ao registrar pedido:", error)
        return NextResponse.json({ error: "Não foi possível registrar o pedido." }, { status: 500 })
    }
}

export async function PATCH(request: Request) {
    try {
        const body = await request.json()
        const requestId = sanitizeText(body?.id)
        const status = normalizeStatus(body?.status)
        const restock = body?.restock === true
        const restockQuantity = Number.isFinite(Number(body?.restockQuantity))
            ? Math.max(1, Math.floor(Number(body.restockQuantity)))
            : 1
        const restockPrice = parsePrice(body?.restockPrice)

        if (!requestId) {
            return NextResponse.json({ error: "Informe o ID do pedido." }, { status: 400 })
        }

        if (!status) {
            return NextResponse.json({ error: "Status inválido." }, { status: 400 })
        }

        const data = await readWorkshopData()
        const existing = data.saleRequests.find((entry) => entry.id === requestId)

        if (!existing) {
            return NextResponse.json({ error: "Pedido não encontrado." }, { status: 404 })
        }

        const updatedRequest: SaleRequest = { ...existing, status }
        let updatedInventory = data.inventory

        if (status === "confirmada" && restock) {
            const normalizedPrice = restockPrice ?? existing.price ?? 0
            const normalizedName = existing.itemName || existing.requestedName || "Item solicitado"

            const inventoryMatch = updatedInventory.find(
                (item) => item.id === existing.itemId || item.name.toLowerCase() === normalizedName.toLowerCase(),
            )

            if (inventoryMatch) {
                updatedInventory = updatedInventory.map((item) =>
                    item.id === inventoryMatch.id
                        ? {
                              ...item,
                              unitPrice: normalizedPrice > 0 ? normalizedPrice : item.unitPrice,
                              stockQuantity: item.stockQuantity + restockQuantity,
                          }
                        : item,
                )
                updatedRequest.itemId = inventoryMatch.id
                updatedRequest.itemName = inventoryMatch.name
            } else {
                const newItem: InventoryItem = {
                    id: `item-${randomUUID()}`,
                    name: normalizedName,
                    category: existing.type === "solicitacao" ? "Solicitações" : "Vendas",
                    unitPrice: normalizedPrice > 0 ? normalizedPrice : 0,
                    stockQuantity: restockQuantity,
                    minimumStock: 0,
                }

                updatedInventory = [...updatedInventory, newItem]
                updatedRequest.itemId = newItem.id
                updatedRequest.itemName = newItem.name
            }
        }

        const updatedRequests = data.saleRequests.map((entry) => (entry.id === requestId ? updatedRequest : entry))

        await writeWorkshopData({
            ...data,
            inventory: updatedInventory,
            saleRequests: updatedRequests,
        })

        return NextResponse.json({ saleRequest: updatedRequest })
    } catch (error) {
        console.error("Erro ao atualizar pedido:", error)
        return NextResponse.json({ error: "Não foi possível atualizar o pedido." }, { status: 500 })
    }
}
