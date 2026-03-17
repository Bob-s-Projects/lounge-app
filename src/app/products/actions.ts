"use server"

import { revalidatePath } from "next/cache"
import { supabase, createServiceClient } from "@/lib/supabase"

export type SupabaseProduct = {
  id: number
  smaregi_product_id: string | null
  product_code: string | null
  name: string
  category: string
  price: number
  cost: number
  cost_ratio: number | null
  description: string | null
  image_url: string | null
  is_active: boolean
  display_order: number
  tags: string[]
  created_at: string
  updated_at: string
}

export async function getProducts(): Promise<SupabaseProduct[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("category", { ascending: true })
    .order("name", { ascending: true })

  if (error) {
    console.error("Failed to fetch products:", error)
    throw new Error("商品の取得に失敗しました")
  }

  return data ?? []
}

export async function getCategories(): Promise<string[]> {
  const { data, error } = await supabase
    .from("products")
    .select("category")

  if (error) {
    console.error("Failed to fetch categories:", error)
    return []
  }

  const categories = Array.from(
    new Set((data ?? []).map((row: { category: string }) => row.category))
  ).sort()

  return categories
}

type MutationResult = { success: true } | { success: false; error: string }

export async function createProduct(formData: FormData): Promise<MutationResult> {
  const name = formData.get("name") as string
  const category = formData.get("category") as string
  const price = Number(formData.get("price") ?? 0)
  const cost = Number(formData.get("cost") ?? 0)
  const description = (formData.get("description") as string) || null
  const tagsRaw = formData.get("tags") as string
  const tags = tagsRaw
    ? tagsRaw.split(",").map((t) => t.trim()).filter(Boolean)
    : []
  const isActive = formData.get("is_active") === "true"

  if (!name || !name.trim()) {
    return { success: false, error: "商品名は必須です" }
  }
  if (price < 0) {
    return { success: false, error: "販売価格は0以上で入力してください" }
  }
  if (cost < 0) {
    return { success: false, error: "原価は0以上で入力してください" }
  }

  const client = createServiceClient()
  const { error } = await client.from("products").insert({
    name: name.trim(),
    category: category || "未分類",
    price,
    cost,
    description,
    tags,
    is_active: isActive,
  })

  if (error) {
    console.error("Failed to create product:", error)
    return { success: false, error: "商品の作成に失敗しました" }
  }

  revalidatePath("/products")
  return { success: true }
}

export async function updateProduct(
  id: number,
  formData: FormData
): Promise<MutationResult> {
  const name = formData.get("name") as string
  const category = formData.get("category") as string
  const price = Number(formData.get("price") ?? 0)
  const cost = Number(formData.get("cost") ?? 0)
  const description = (formData.get("description") as string) || null
  const tagsRaw = formData.get("tags") as string
  const tags = tagsRaw
    ? tagsRaw.split(",").map((t) => t.trim()).filter(Boolean)
    : []
  const isActive = formData.get("is_active") === "true"

  if (!name || !name.trim()) {
    return { success: false, error: "商品名は必須です" }
  }
  if (price < 0) {
    return { success: false, error: "販売価格は0以上で入力してください" }
  }
  if (cost < 0) {
    return { success: false, error: "原価は0以上で入力してください" }
  }

  const client = createServiceClient()
  const { error } = await client
    .from("products")
    .update({
      name: name.trim(),
      category: category || "未分類",
      price,
      cost,
      description,
      tags,
      is_active: isActive,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)

  if (error) {
    console.error("Failed to update product:", error)
    return { success: false, error: "商品の更新に失敗しました" }
  }

  revalidatePath("/products")
  return { success: true }
}

export async function deleteProduct(id: number): Promise<MutationResult> {
  const client = createServiceClient()
  const { error } = await client.from("products").delete().eq("id", id)

  if (error) {
    console.error("Failed to delete product:", error)
    return { success: false, error: "商品の削除に失敗しました" }
  }

  revalidatePath("/products")
  return { success: true }
}

export async function toggleProductActive(
  id: number,
  isActive: boolean
): Promise<MutationResult> {
  const client = createServiceClient()
  const { error } = await client
    .from("products")
    .update({
      is_active: isActive,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)

  if (error) {
    console.error("Failed to toggle product status:", error)
    return { success: false, error: "ステータスの変更に失敗しました" }
  }

  revalidatePath("/products")
  return { success: true }
}
