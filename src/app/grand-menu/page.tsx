import { SidebarTrigger } from "@/components/ui/sidebar"
import { getProducts, getSalesSummary } from "@/lib/data"
import { GrandMenuView } from "@/components/grand-menu-view"

// ── Category mapping ──

type MenuSectionKey =
  | "ビール"
  | "ウイスキー"
  | "ハイボール"
  | "カクテル"
  | "ワイン"
  | "シャンパン・スパークリング"
  | "焼酎・サワー"
  | "ソフトドリンク"
  | "その他ドリンク"
  | "フード"
  | "シーシャ"
  | "ボトル"
  | "ルーム料金"
  | "その他"

function mapCategoryToSection(categoryName: string): MenuSectionKey {
  if (categoryName === "Bar time" || categoryName === "Bar time延長")
    return "ルーム料金"
  if (categoryName === "Cafe time" || categoryName === "Cafe time延長")
    return "ルーム料金"
  if (
    categoryName === "ハウスシーシャ" ||
    categoryName === "オーダーシーシャ" ||
    categoryName === "シーシャオプション"
  )
    return "シーシャ"
  if (categoryName === "ボトル") return "ボトル"
  if (categoryName === "フード" || categoryName === "カップ麺") return "フード"
  if (categoryName === "カクテル") return "カクテル"
  if (categoryName === "ワイン") return "ワイン"
  if (
    categoryName.includes("ワイン") &&
    categoryName.includes("ボトル")
  )
    return "ワイン"
  if (
    categoryName === "シャンパン" ||
    categoryName === "スパークリング" ||
    categoryName.includes("シャンパン") ||
    categoryName.includes("スパークリング")
  )
    return "シャンパン・スパークリング"
  if (categoryName === "ビール") return "ビール"
  if (categoryName === "ウィスキー" || categoryName === "ウイスキー")
    return "ウイスキー"
  if (categoryName === "ハイボール") return "ハイボール"
  if (categoryName === "焼酎" || categoryName === "サワー") return "焼酎・サワー"
  if (categoryName === "ソフトドリンク" || categoryName === "ノンアルコール")
    return "ソフトドリンク"
  if (
    categoryName === "通常かき氷" ||
    categoryName === "季節かき氷" ||
    categoryName === "氷ヲ刻メ" ||
    categoryName === "無料かき氷"
  )
    return "フード"
  if (
    categoryName === "アルコール" ||
    categoryName === "ショット" ||
    categoryName === "季節ドリンク" ||
    categoryName === "無料ドリンク"
  )
    return "その他ドリンク"
  if (
    categoryName === "チャージ" ||
    categoryName === "パーティ" ||
    categoryName === "箱貸し"
  )
    return "ルーム料金"
  if (
    categoryName === "サービス" ||
    categoryName === "手打ち商品＆損害請求" ||
    categoryName === "無料レンタル" ||
    categoryName === "シーシャ台オプション" ||
    categoryName === "オプション" ||
    categoryName === "アフヌン"
  )
    return "その他"
  return "その他"
}

// ── Section group definitions ──

const DRINK_SECTIONS: MenuSectionKey[] = [
  "ビール",
  "ウイスキー",
  "ハイボール",
  "カクテル",
  "ワイン",
  "シャンパン・スパークリング",
  "焼酎・サワー",
  "ソフトドリンク",
  "その他ドリンク",
]

const FOOD_SECTIONS: MenuSectionKey[] = ["フード"]
const SHISHA_SECTIONS: MenuSectionKey[] = ["シーシャ"]
const OTHER_SECTIONS: MenuSectionKey[] = ["ボトル", "ルーム料金", "その他"]

// ── Page ──

export default function GrandMenuPage() {
  const products = getProducts()
  const salesSummary = getSalesSummary()

  // Build sales lookup by product_id
  const salesMap = new Map<
    string,
    { quantity: number; revenue: number }
  >()
  for (const sp of salesSummary.products) {
    salesMap.set(sp.product_id, {
      quantity: sp.total_quantity,
      revenue: sp.total_sales,
    })
  }

  // Build menu products with sales data
  const menuProducts = products
    .filter((p) => p.display_flag === "1")
    .map((p) => {
      const sales = salesMap.get(p.product_id)
      return {
        product_id: p.product_id,
        product_name: p.product_name,
        category_name: p.category_name,
        price: p.price,
        display_flag: p.display_flag,
        sales_quantity: sales?.quantity ?? 0,
        sales_revenue: sales?.revenue ?? 0,
        has_sales: (sales?.quantity ?? 0) > 0,
        section: mapCategoryToSection(p.category_name),
      }
    })

  // Group by section
  const sectionMap = new Map<
    MenuSectionKey,
    typeof menuProducts
  >()
  for (const mp of menuProducts) {
    const items = sectionMap.get(mp.section) ?? []
    items.push(mp)
    sectionMap.set(mp.section, items)
  }

  // Sort items within each section by sales volume (top sellers first)
  for (const items of sectionMap.values()) {
    items.sort((a, b) => b.sales_revenue - a.sales_revenue)
  }

  // Build section arrays
  function buildSections(keys: MenuSectionKey[]) {
    return keys
      .map((key) => ({
        key,
        label: key,
        items: (sectionMap.get(key) ?? []).map((mp) => ({
          product_id: mp.product_id,
          product_name: mp.product_name,
          category_name: mp.category_name,
          price: mp.price,
          display_flag: mp.display_flag,
          sales_quantity: mp.sales_quantity,
          sales_revenue: mp.sales_revenue,
          has_sales: mp.has_sales,
        })),
      }))
      .filter((s) => s.items.length > 0)
  }

  const drinkSections = buildSections(DRINK_SECTIONS)
  const foodSections = buildSections(FOOD_SECTIONS)
  const shishaSections = buildSections(SHISHA_SECTIONS)
  const otherSections = buildSections(OTHER_SECTIONS)

  // Compute summary
  const activeWithSales = menuProducts.filter((mp) => mp.has_sales)
  const drinkKeys = new Set(DRINK_SECTIONS)
  const foodKeys = new Set(FOOD_SECTIONS)
  const drinkCount = menuProducts.filter((mp) => drinkKeys.has(mp.section)).length
  const foodCount = menuProducts.filter((mp) => foodKeys.has(mp.section)).length
  const avgSpend =
    salesSummary.total_transactions > 0
      ? Math.round(
          salesSummary.total_revenue / salesSummary.total_transactions
        )
      : 0

  const deadStockCount = menuProducts.filter(
    (mp) => !mp.has_sales && mp.price > 0
  ).length

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="md:hidden" />
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            グランドメニュー
          </h1>
          <p className="text-sm text-muted-foreground">
            現在提供中のメニュー構成
          </p>
        </div>
      </div>

      <GrandMenuView
        drinkSections={drinkSections}
        foodSections={foodSections}
        shishaSections={shishaSections}
        otherSections={otherSections}
        summary={{
          activeMenuCount: activeWithSales.length,
          drinkCount,
          foodCount,
          avgSpendPerTransaction: avgSpend,
          deadStockCount,
        }}
      />
    </div>
  )
}
