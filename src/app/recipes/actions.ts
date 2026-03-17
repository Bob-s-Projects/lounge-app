"use server"

import { revalidatePath } from "next/cache"
import { createServiceClient } from "@/lib/supabase"
import { supabase } from "@/lib/supabase"

// ── Types ──

export type IngredientInput = {
  name: string
  amount: number
  unit: string
  supplier_item_id: number | null
  cost: number
  sort_order: number
}

export type RecipeInput = {
  name: string
  category: string
  description: string
  difficulty: number
  prep_time_min: number | null
  steps: string[]
  ingredients: IngredientInput[]
}

export type SupplierItemOption = {
  id: number
  name: string
  unit_price: number
  spec: string | null
  category: string
}

// ── Server Actions ──

export async function createRecipe(input: RecipeInput): Promise<{ id: number }> {
  const service = createServiceClient()

  const estimatedCost = input.ingredients.reduce((sum, i) => sum + i.cost, 0)

  const { data: recipe, error } = await service
    .from("recipes")
    .insert({
      name: input.name,
      category: input.category,
      description: input.description || null,
      difficulty: input.difficulty,
      prep_time_min: input.prep_time_min,
      steps: input.steps.filter((s) => s.trim() !== ""),
      estimated_cost: estimatedCost,
    })
    .select("id")
    .single()

  if (error || !recipe) {
    throw new Error(`レシピの作成に失敗しました: ${error?.message}`)
  }

  if (input.ingredients.length > 0) {
    const ingredientRows = input.ingredients.map((ing, idx) => ({
      recipe_id: recipe.id,
      name: ing.name,
      amount: ing.amount,
      unit: ing.unit,
      supplier_item_id: ing.supplier_item_id,
      cost: ing.cost,
      sort_order: idx,
    }))

    const { error: ingError } = await service
      .from("recipe_ingredients")
      .insert(ingredientRows)

    if (ingError) {
      throw new Error(`材料の保存に失敗しました: ${ingError.message}`)
    }
  }

  revalidatePath("/recipes")
  return { id: recipe.id }
}

export async function updateRecipe(id: number, input: RecipeInput): Promise<void> {
  const service = createServiceClient()

  const estimatedCost = input.ingredients.reduce((sum, i) => sum + i.cost, 0)

  const { error } = await service
    .from("recipes")
    .update({
      name: input.name,
      category: input.category,
      description: input.description || null,
      difficulty: input.difficulty,
      prep_time_min: input.prep_time_min,
      steps: input.steps.filter((s) => s.trim() !== ""),
      estimated_cost: estimatedCost,
    })
    .eq("id", id)

  if (error) {
    throw new Error(`レシピの更新に失敗しました: ${error.message}`)
  }

  // 既存の材料を削除してから再挿入
  const { error: deleteError } = await service
    .from("recipe_ingredients")
    .delete()
    .eq("recipe_id", id)

  if (deleteError) {
    throw new Error(`材料の更新に失敗しました: ${deleteError.message}`)
  }

  if (input.ingredients.length > 0) {
    const ingredientRows = input.ingredients.map((ing, idx) => ({
      recipe_id: id,
      name: ing.name,
      amount: ing.amount,
      unit: ing.unit,
      supplier_item_id: ing.supplier_item_id,
      cost: ing.cost,
      sort_order: idx,
    }))

    const { error: ingError } = await service
      .from("recipe_ingredients")
      .insert(ingredientRows)

    if (ingError) {
      throw new Error(`材料の保存に失敗しました: ${ingError.message}`)
    }
  }

  revalidatePath("/recipes")
  revalidatePath(`/recipes/${id}`)
}

export async function deleteRecipe(id: number): Promise<void> {
  const service = createServiceClient()

  const { error } = await service
    .from("recipes")
    .delete()
    .eq("id", id)

  if (error) {
    throw new Error(`レシピの削除に失敗しました: ${error.message}`)
  }

  revalidatePath("/recipes")
}

export async function getSupplierItems(): Promise<SupplierItemOption[]> {
  const { data, error } = await supabase
    .from("supplier_items")
    .select("id, name, unit_price, spec, category")
    .order("category")
    .order("name")

  if (error) {
    throw new Error(`仕入れ品目の取得に失敗しました: ${error.message}`)
  }

  return (data ?? []) as SupplierItemOption[]
}
