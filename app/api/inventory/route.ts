import { NextResponse } from "next/server"

import { readWorkshopData } from "@/src/server/workshop-data"

export const dynamic = "force-dynamic"

export async function GET() {
    const data = await readWorkshopData()

    return NextResponse.json({
        inventory: data.inventory ?? [],
    })
}
