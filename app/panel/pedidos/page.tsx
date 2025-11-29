import Panel from "@/src/aura/features/view/Panel"
import OrdersDashboard from "@/src/aura/features/sales/OrdersDashboard"
import { readWorkshopData } from "@/src/server/workshop-data"

export const dynamic = "force-dynamic"

export default async function PedidosPage() {
    const data = await readWorkshopData()

    return (
        <Panel>
            <OrdersDashboard saleRequests={data.saleRequests ?? []} />
        </Panel>
    )
}
