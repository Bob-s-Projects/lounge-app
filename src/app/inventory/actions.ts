"use server"

import { revalidatePath } from "next/cache"
import { supabase, createServiceClient } from "@/lib/supabase"

// ---------- Types ----------

export type InventoryItem = {
  id: number
  supplier_item_id: number | null
  product_id: number | null
  name: string
  category: string
  current_stock: number
  unit: string
  par_level: number | null
  location: string | null
  last_counted_at: string | null
  note: string | null
  created_at: string
  updated_at: string
}

export type InventoryLog = {
  id: number
  inventory_id: number
  change_type: string
  quantity: number
  note: string | null
  staff_id: number | null
  created_at: string
}

export type SupplierItemOption = {
  id: number
  name: string
  category: string
  spec: string | null
  unit_price: number
}

// ---------- Reads (anon client) ----------

export async function getInventoryItems(): Promise<InventoryItem[]> {
  const { data, error } = await supabase
    .from("inventory")
    .select("*")
    .order("category")
    .order("name")

  if (error) throw new Error(`在庫データの取得に失敗しました: ${error.message}`)
  return (data ?? []) as InventoryItem[]
}

export async function getInventoryLogs(inventoryId?: number): Promise<InventoryLog[]> {
  let query = supabase
    .from("inventory_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100)

  if (inventoryId) {
    query = query.eq("inventory_id", inventoryId)
  }

  const { data, error } = await query
  if (error) throw new Error(`履歴の取得に失敗しました: ${error.message}`)
  return (data ?? []) as InventoryLog[]
}

export async function getSupplierItemsForLinking(): Promise<SupplierItemOption[]> {
  const { data, error } = await supabase
    .from("supplier_items")
    .select("id, name, category, spec, unit_price")
    .order("category")
    .order("name")

  if (error) throw new Error(`仕入品目の取得に失敗しました: ${error.message}`)
  return (data ?? []) as SupplierItemOption[]
}

// ---------- Writes (service client) ----------

export async function createInventoryItem(formData: {
  name: string
  category: string
  unit: string
  par_level: number | null
  location: string | null
  supplier_item_id: number | null
  current_stock?: number
  note?: string | null
}): Promise<{ success: boolean; error?: string }> {
  const db = createServiceClient()

  const { error } = await db.from("inventory").insert({
    name: formData.name,
    category: formData.category,
    unit: formData.unit,
    par_level: formData.par_level,
    location: formData.location || null,
    supplier_item_id: formData.supplier_item_id,
    current_stock: formData.current_stock ?? 0,
    note: formData.note ?? null,
  })

  if (error) return { success: false, error: error.message }

  revalidatePath("/inventory")
  return { success: true }
}

export async function updateInventoryItem(
  id: number,
  formData: {
    name: string
    category: string
    unit: string
    par_level: number | null
    location: string | null
    supplier_item_id: number | null
    note?: string | null
  }
): Promise<{ success: boolean; error?: string }> {
  const db = createServiceClient()

  const { error } = await db
    .from("inventory")
    .update({
      name: formData.name,
      category: formData.category,
      unit: formData.unit,
      par_level: formData.par_level,
      location: formData.location || null,
      supplier_item_id: formData.supplier_item_id,
      note: formData.note ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)

  if (error) return { success: false, error: error.message }

  revalidatePath("/inventory")
  return { success: true }
}

export async function deleteInventoryItem(
  id: number
): Promise<{ success: boolean; error?: string }> {
  const db = createServiceClient()

  const { error } = await db.from("inventory").delete().eq("id", id)

  if (error) return { success: false, error: error.message }

  revalidatePath("/inventory")
  return { success: true }
}

export async function recordStockChange(
  inventoryId: number,
  changeType: string,
  quantity: number,
  note?: string
): Promise<{ success: boolean; error?: string }> {
  const db = createServiceClient()

  // Get current stock
  const { data: current, error: fetchError } = await db
    .from("inventory")
    .select("current_stock")
    .eq("id", inventoryId)
    .single()

  if (fetchError || !current) {
    return { success: false, error: "在庫品目が見つかりません" }
  }

  // Calculate new stock based on change type
  const currentStock = Number(current.current_stock)
  let newStock: number
  if (changeType === "入荷") {
    newStock = currentStock + quantity
  } else if (changeType === "消費" || changeType === "廃棄") {
    newStock = Math.max(0, currentStock - quantity)
  } else {
    // 移動 - quantity can be positive or negative
    newStock = currentStock + quantity
  }

  // Insert log
  const { error: logError } = await db.from("inventory_logs").insert({
    inventory_id: inventoryId,
    change_type: changeType,
    quantity,
    note: note || null,
  })

  if (logError) return { success: false, error: logError.message }

  // Update stock
  const { error: updateError } = await db
    .from("inventory")
    .update({
      current_stock: newStock,
      updated_at: new Date().toISOString(),
    })
    .eq("id", inventoryId)

  if (updateError) return { success: false, error: updateError.message }

  revalidatePath("/inventory")
  return { success: true }
}

export async function performStocktake(
  items: { id: number; newStock: number; note?: string }[]
): Promise<{ success: boolean; error?: string; updatedCount?: number }> {
  const db = createServiceClient()
  const now = new Date().toISOString()
  let updatedCount = 0

  // Get all current stocks for the items
  const ids = items.map((i) => i.id)
  const { data: currentItems, error: fetchError } = await db
    .from("inventory")
    .select("id, current_stock")
    .in("id", ids)

  if (fetchError) return { success: false, error: fetchError.message }

  const currentMap = new Map(
    (currentItems ?? []).map((i) => [i.id, Number(i.current_stock)])
  )

  for (const item of items) {
    const oldStock = currentMap.get(item.id) ?? 0
    const diff = item.newStock - oldStock

    // Always create log for stocktake (even if no change, to record the count)
    const { error: logError } = await db.from("inventory_logs").insert({
      inventory_id: item.id,
      change_type: "棚卸",
      quantity: diff,
      note: item.note || null,
    })

    if (logError) return { success: false, error: logError.message }

    // Update stock and last counted date
    const { error: updateError } = await db
      .from("inventory")
      .update({
        current_stock: item.newStock,
        last_counted_at: now,
        updated_at: now,
      })
      .eq("id", item.id)

    if (updateError) return { success: false, error: updateError.message }

    if (diff !== 0) updatedCount++
  }

  revalidatePath("/inventory")
  revalidatePath("/inventory/stocktake")
  return { success: true, updatedCount }
}
