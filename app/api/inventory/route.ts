import { NextResponse } from "next/server"

import { readWorkshopData } from "@/src/server/workshop-data"

export async function GET() {
    const data = await readWorkshopData()

    return NextResponse.json({
        inventory: data.inventory ?? [],
    })
}
