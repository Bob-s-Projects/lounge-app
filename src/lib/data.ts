import productsJson from "@/data/products.json"
import supplierJson from "@/data/supplier_prices.json"
import salesJson from "@/data/sales_summary.json"
import type {
  ProductsData,
  SupplierData,
  Product,
  SupplierItem,
  CategoryGroup,
} from "./types"

const productsData = productsJson as ProductsData
const supplierData = supplierJson as SupplierData

export type SalesProduct = {
  product_id: string
  product_name: string
  category_name: string
  total_quantity: number
  total_sales: number
  transaction_count: number
  avg_price: number
  first_sale: string
  last_sale: string
}

export type SalesSummary = {
  period: { from: string; to: string }
  fetched_at: string
  total_transactions: number
  total_revenue: number
  total_detail_rows: number
  products: SalesProduct[]
}

const salesData = salesJson as SalesSummary

/** All POS products */
export function getProducts(): Product[] {
  return productsData.products
}

/** Products data metadata */
export function getProductsMeta() {
  return {
    updatedAt: productsData.updated_at,
    totalCount: productsData.total_count,
  }
}

/** All supplier items */
export function getSupplierItems(): SupplierItem[] {
  return supplierData.items
}

/** Supplier data metadata */
export function getSupplierMeta() {
  return {
    source: supplierData.source,
    date: supplierData.date,
    customerCode: supplierData.customer_code,
    customerName: supplierData.customer_name,
    note: supplierData.note,
    categories: supplierData.categories,
  }
}

/** POS products grouped by category */
export function getProductCategories(): CategoryGroup[] {
  const products = getProducts()
  const grouped = new Map<string, Product[]>()

  for (const p of products) {
    const key = p.category_name
    if (!grouped.has(key)) grouped.set(key, [])
    grouped.get(key)!.push(p)
  }

  const categories: CategoryGroup[] = []
  for (const [name, items] of grouped) {
    const withCost = items.filter(
      (p) => p.cost_ratio !== null && p.cost_ratio > 0
    )
    const avgCostRatio =
      withCost.length > 0
        ? withCost.reduce((sum, p) => sum + (p.cost_ratio ?? 0), 0) /
          withCost.length
        : null
    const totalRevenue = items.reduce((sum, p) => sum + p.price, 0)

    categories.push({ name, count: items.length, avgCostRatio, totalRevenue })
  }

  return categories.sort((a, b) => b.count - a.count)
}

/** Supplier items grouped by category */
export function getSupplierCategories() {
  const items = getSupplierItems()
  const grouped = new Map<string, SupplierItem[]>()

  for (const item of items) {
    const key = item.category_name
    if (!grouped.has(key)) grouped.set(key, [])
    grouped.get(key)!.push(item)
  }

  return Array.from(grouped.entries())
    .map(([name, items]) => ({
      name,
      count: items.length,
      avgUnitPrice:
        items.reduce((sum, i) => sum + i.unit_price, 0) / items.length,
    }))
    .sort((a, b) => b.count - a.count)
}

/** Sales summary data */
export function getSalesSummary(): SalesSummary {
  return salesData
}

/** Sales products */
export function getSalesProducts(): SalesProduct[] {
  return salesData.products
}

/** Dashboard summary metrics */
export function getDashboardMetrics() {
  const products = getProducts()
  const supplierItems = getSupplierItems()
  const productCategories = getProductCategories()

  const productsWithCost = products.filter(
    (p) => p.cost_ratio !== null && p.cost_ratio > 0
  )
  const avgCostRatio =
    productsWithCost.length > 0
      ? productsWithCost.reduce((sum, p) => sum + (p.cost_ratio ?? 0), 0) /
        productsWithCost.length
      : null

  return {
    totalProducts: products.length,
    totalSupplierItems: supplierItems.length,
    avgCostRatio,
    categoryCount: productCategories.length,
    productsUpdatedAt: productsData.updated_at,
    supplierDate: supplierData.date,
  }
}
