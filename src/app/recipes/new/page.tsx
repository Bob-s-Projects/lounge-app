import { ChefHat } from "lucide-react"
import { BreadcrumbNav } from "@/components/breadcrumb-nav"
import { RecipeForm } from "@/components/recipe-form"
import { getSupplierItems } from "@/app/recipes/actions"

export const metadata = {
  title: "新規レシピ | 原価管理",
}

export default async function NewRecipePage() {
  const supplierItems = await getSupplierItems()

  return (
    <div className="space-y-6">
      <BreadcrumbNav />
      <div className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10">
          <ChefHat className="size-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            新規レシピ
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            材料とコストを登録して原価を管理
          </p>
        </div>
      </div>

      <RecipeForm mode="create" supplierItems={supplierItems} />
    </div>
  )
}
