import Panel from "@/src/aura/features/view/Panel"
import SalesDashboard from "@/src/aura/features/sales/SalesDashboard"
import { readWorkshopData } from "@/src/server/workshop-data"

export const dynamic = "force-dynamic"

export default async function VendasPage() {
    const data = await readWorkshopData()

    return (
        <Panel>
            <SalesDashboard initialData={data} />
        </Panel>
    )
}
