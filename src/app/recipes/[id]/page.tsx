import { notFound } from "next/navigation"
import { ChefHat } from "lucide-react"
import { BreadcrumbNav } from "@/components/breadcrumb-nav"
import { RecipeForm } from "@/components/recipe-form"
import { getSupplierItems } from "@/app/recipes/actions"
import { supabase } from "@/lib/supabase"

export const metadata = {
  title: "レシピ編集 | 原価管理",
}

async function getRecipe(id: number) {
  const { data: recipe, error } = await supabase
    .from("recipes")
    .select("id, name, category, description, difficulty, prep_time_min, steps, estimated_cost, is_active")
    .eq("id", id)
    .single()

  if (error || !recipe) return null

  const { data: ingredients } = await supabase
    .from("recipe_ingredients")
    .select("name, amount, unit, supplier_item_id, cost, sort_order")
    .eq("recipe_id", id)
    .order("sort_order")

  return {
    ...recipe,
    ingredients: ingredients ?? [],
  }
}

export default async function RecipeEditPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id: idParam } = await params
  const id = parseInt(idParam)

  if (isNaN(id)) {
    notFound()
  }

  const [recipe, supplierItems] = await Promise.all([
    getRecipe(id),
    getSupplierItems(),
  ])

  if (!recipe) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <BreadcrumbNav />
      <div className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10">
          <ChefHat className="size-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            {recipe.name}
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            レシピの編集・材料管理
          </p>
        </div>
      </div>

      <RecipeForm mode="edit" recipe={recipe} supplierItems={supplierItems} />
    </div>
  )
}
