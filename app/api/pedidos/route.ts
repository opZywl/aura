import { randomUUID } from "node:crypto"

import { NextResponse } from "next/server"

import {
    readWorkshopData,
    writeWorkshopData,
    type SaleRequest,
    type SaleRequestType,
} from "@/src/server/workshop-data"

function sanitizeText(value: unknown): string {
    if (typeof value !== "string") return ""
    return value.trim()
}

function normalizeType(value: unknown): SaleRequestType | null {
    return value === "estoque" || value === "solicitacao" ? value : null
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
