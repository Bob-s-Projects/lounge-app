import { ClipboardCheck } from "lucide-react"
import { BreadcrumbNav } from "@/components/breadcrumb-nav"
import { getInventoryItems } from "@/app/inventory/actions"
import { StocktakeForm } from "@/components/stocktake-form"

export const metadata = {
  title: "棚卸し | 原価管理",
}

export const dynamic = "force-dynamic"

export default async function StocktakePage() {
  const items = await getInventoryItems()

  return (
    <div className="space-y-6">
      <BreadcrumbNav />
      <div className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10">
          <ClipboardCheck className="size-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            棚卸し
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            各品目の実在庫を入力して棚卸しを実施します（{items.length}品目）
          </p>
        </div>
      </div>

      <StocktakeForm items={items} />
    </div>
  )
}
