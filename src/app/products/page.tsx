import { Package } from "lucide-react"
import { BreadcrumbNav } from "@/components/breadcrumb-nav"
import { ProductsTable } from "@/components/products-table"
import { getProducts, getCategories } from "./actions"

export const metadata = {
  title: "商品マスタ | 原価管理",
}

export default async function ProductsPage() {
  const [products, categories] = await Promise.all([
    getProducts(),
    getCategories(),
  ])

  const activeCount = products.filter((p) => p.is_active).length

  return (
    <div className="space-y-6">
      <BreadcrumbNav />
      <div className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10">
          <Package className="size-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">商品マスタ</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            全 {products.length.toLocaleString()} 件（有効: {activeCount.toLocaleString()} 件）
          </p>
        </div>
      </div>

      <ProductsTable products={products} categories={categories} />
    </div>
  )
}
