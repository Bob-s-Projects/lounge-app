import Link from "next/link"
import { ChefHat, Plus } from "lucide-react"
import { BreadcrumbNav } from "@/components/breadcrumb-nav"
import { Card, CardContent } from "@/components/ui/card"
import { EmptyState } from "@/components/empty-state"
import { supabase } from "@/lib/supabase"
import { RecipeListClient } from "./recipe-list-client"

export const metadata = {
  title: "レシピ管理 | 原価管理",
}

// ── カテゴリ色マッピング ──
const CATEGORY_COLORS: Record<string, string> = {
  ドリンク: "bg-sky-100 text-sky-700 dark:bg-sky-900/50 dark:text-sky-300",
  カクテル: "bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300",
  フード: "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300",
  デザート: "bg-pink-100 text-pink-700 dark:bg-pink-900/50 dark:text-pink-300",
  その他: "bg-gray-100 text-gray-700 dark:bg-gray-800/50 dark:text-gray-300",
}

export type RecipeRow = {
  id: number
  name: string
  category: string
  description: string | null
  estimated_cost: number
  difficulty: number
  prep_time_min: number | null
  is_active: boolean
  ingredient_count: number
}

async function getRecipes(): Promise<RecipeRow[]> {
  // レシピ一覧取得（材料数はサブクエリ）
  const { data: recipes, error } = await supabase
    .from("recipes")
    .select("id, name, category, description, estimated_cost, difficulty, prep_time_min, is_active")
    .order("updated_at", { ascending: false })

  if (error) {
    throw new Error(`レシピの取得に失敗しました: ${error.message}`)
  }

  if (!recipes || recipes.length === 0) return []

  // 材料数を取得
  const { data: counts } = await supabase
    .from("recipe_ingredients")
    .select("recipe_id")

  const countMap = new Map<number, number>()
  if (counts) {
    for (const row of counts) {
      countMap.set(row.recipe_id, (countMap.get(row.recipe_id) ?? 0) + 1)
    }
  }

  return recipes.map((r) => ({
    ...r,
    ingredient_count: countMap.get(r.id) ?? 0,
  }))
}

export default async function RecipesPage() {
  const recipes = await getRecipes()

  const categories = Array.from(new Set(recipes.map((r) => r.category)))

  return (
    <div className="space-y-6">
      <BreadcrumbNav />
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10">
            <ChefHat className="size-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              レシピ管理
            </h1>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {recipes.length > 0
                ? `全${recipes.length}件のレシピ`
                : "レシピを作成して原価管理を始めましょう"}
            </p>
          </div>
        </div>
        <Link
          href="/recipes/new"
          className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-lg bg-primary px-2.5 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90"
        >
          <Plus className="size-4" />
          新規レシピ
        </Link>
      </div>

      {recipes.length === 0 ? (
        <Card>
          <CardContent className="py-4">
            <EmptyState
              icon={ChefHat}
              title="レシピがまだありません"
              description="最初のレシピを作成して、材料のコスト管理を始めましょう。"
              action={
                <Link
                  href="/recipes/new"
                  className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-primary px-3 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90"
                >
                  <Plus className="size-4" />
                  最初のレシピを作成
                </Link>
              }
            />
          </CardContent>
        </Card>
      ) : (
        <RecipeListClient
          recipes={recipes}
          categories={categories}
          categoryColors={CATEGORY_COLORS}
        />
      )}
    </div>
  )
}
