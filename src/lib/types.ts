// Product from POS (Smaregi)
export type Product = {
  product_id: string
  product_code: string
  product_name: string
  category_id: string
  category_name: string
  price: number
  cost: number
  cost_ratio: number | null
  tax_division: string
  display_flag: string
  group_code: string | null
  description: string | null
}

// Supplier item from delivery price list
export type SupplierItem = {
  supplier_code: string
  product_name: string
  category_code: string
  category_name: string
  spec: string
  case_quantity: number
  wholesale_price: number
  unit_price: number
  last_shipped: string | null
}

// Supplier data
export type SupplierData = {
  source: string
  date: string
  customer_code: string
  customer_name: string
  note: string
  categories: { code: string; name: string }[]
  items: SupplierItem[]
}

// Products data
export type ProductsData = {
  updated_at: string
  total_count: number
  products: Product[]
}

// Category for grouping
export type CategoryGroup = {
  name: string
  count: number
  avgCostRatio: number | null
  totalRevenue: number
}
