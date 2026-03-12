import type { Product, ProductsData, SupplierData } from "./types";
import { matchCosts, type CostMatch } from "./cost-matching";

// ── Types ──────────────────────────────────────────────────────────

export type SalesProduct = {
  product_id: string;
  product_name: string;
  category_name: string;
  total_quantity: number;
  total_sales: number;
  transaction_count: number;
  avg_price: number;
  first_sale: string;
  last_sale: string;
};

export type SalesData = {
  period: { from: string; to: string };
  fetched_at: string;
  total_transactions: number;
  total_revenue: number;
  total_detail_rows: number;
  products: SalesProduct[];
};

export type Recommendation =
  | "keep"
  | "promote"
  | "review_price"
  | "reduce_cost"
  | "consider_remove"
  | "new_opportunity";

export type AbcRank = "A" | "B" | "C";

export type MenuAnalysisItem = {
  product_id: string;
  product_name: string;
  category_name: string;
  selling_price: number;
  // Sales metrics
  total_quantity: number;
  total_sales: number;
  transaction_count: number;
  monthly_sales: number;
  // Cost metrics
  estimated_cost: number | null;
  cost_ratio: number | null;
  estimated_profit: number | null;
  monthly_profit: number | null;
  // ABC classification
  abc_sales: AbcRank;
  abc_quantity: AbcRank;
  abc_profit: AbcRank;
  // Recommendation
  recommendation: Recommendation;
  recommendation_reason: string;
};

// ── Room charge categories (excluded from menu analysis) ──────────

const ROOM_CHARGE_CATEGORIES = new Set([
  "Bar time",
  "Bar time延長",
  "Cafe time",
  "Cafe time延長",
]);

// ── ABC helper ─────────────────────────────────────────────────────

function assignAbcRanks<T>(
  items: T[],
  getValue: (item: T) => number
): Map<T, AbcRank> {
  const sorted = [...items].sort((a, b) => getValue(b) - getValue(a));
  const total = sorted.reduce((sum, item) => sum + Math.max(0, getValue(item)), 0);
  const result = new Map<T, AbcRank>();

  if (total === 0) {
    for (const item of sorted) result.set(item, "C");
    return result;
  }

  let cumulative = 0;
  for (const item of sorted) {
    cumulative += Math.max(0, getValue(item));
    const ratio = cumulative / total;
    if (ratio <= 0.7) {
      result.set(item, "A");
    } else if (ratio <= 0.9) {
      result.set(item, "B");
    } else {
      result.set(item, "C");
    }
  }

  return result;
}

// ── Recommendation logic ───────────────────────────────────────────

function determineRecommendation(
  abcSales: AbcRank,
  abcProfit: AbcRank,
  abcQuantity: AbcRank,
  costRatio: number | null,
  transactionCount: number
): { recommendation: Recommendation; reason: string } {
  const cr = costRatio ?? 0;
  const hasCost = costRatio !== null;

  // keep: A rank in sales + cost ratio < 30%
  if (abcSales === "A" && hasCost && cr < 0.3) {
    return { recommendation: "keep", reason: "売上上位かつ低原価率で優良商品" };
  }
  if (abcSales === "A" && !hasCost) {
    return { recommendation: "keep", reason: "売上上位の主力商品" };
  }

  // reduce_cost: cost ratio > 40%
  if (hasCost && cr > 0.4) {
    return {
      recommendation: "reduce_cost",
      reason: `原価率${(cr * 100).toFixed(0)}%と高い。仕入先変更やレシピ見直しを検討`,
    };
  }

  // review_price: cost ratio > 35% + A/B rank in sales
  if (
    hasCost &&
    cr > 0.35 &&
    (abcSales === "A" || abcSales === "B")
  ) {
    return {
      recommendation: "review_price",
      reason: `売上はあるが原価率${(cr * 100).toFixed(0)}%。値上げ検討`,
    };
  }

  // promote: High profit margin + B/C rank in sales
  if (
    hasCost &&
    cr < 0.25 &&
    (abcSales === "B" || abcSales === "C") &&
    (abcProfit === "A" || abcProfit === "B")
  ) {
    return {
      recommendation: "promote",
      reason: "利益率が高いが販売数が少ない。プロモーション強化で売上向上の余地あり",
    };
  }
  if (
    hasCost &&
    cr < 0.2 &&
    (abcSales === "B" || abcSales === "C")
  ) {
    return {
      recommendation: "promote",
      reason: `原価率${(cr * 100).toFixed(0)}%と優秀。販売強化でさらなる利益が見込める`,
    };
  }

  // consider_remove: C rank in all + low transaction count
  if (
    abcSales === "C" &&
    abcQuantity === "C" &&
    transactionCount <= 5
  ) {
    return {
      recommendation: "consider_remove",
      reason: `取引回数${transactionCount}回。売上・数量ともに下位で廃止を検討`,
    };
  }
  if (abcSales === "C" && abcQuantity === "C" && abcProfit === "C") {
    return {
      recommendation: "consider_remove",
      reason: "売上・数量・利益すべて下位。メニューからの除外を検討",
    };
  }

  // Default: keep
  return { recommendation: "keep", reason: "標準的な商品。現状維持" };
}

// ── Main analysis ──────────────────────────────────────────────────

export type MenuAnalysisResult = {
  items: MenuAnalysisItem[];
  deadStock: {
    product_id: string;
    product_name: string;
    category_name: string;
    selling_price: number;
  }[];
  roomCharges: SalesProduct[];
  summary: {
    activeProductCount: number;
    totalRevenue: number;
    monthlyAvgRevenue: number;
    improvementCount: number;
    periodMonths: number;
  };
  abcMatrix: Record<string, Record<string, number>>;
};

export function analyzeMenu(
  productsData: ProductsData,
  supplierData: SupplierData,
  salesData: SalesData
): MenuAnalysisResult {
  const products = productsData.products;
  const salesProducts = salesData.products;
  const costMatches = matchCosts(products, supplierData);

  // Build lookup maps
  const salesMap = new Map<string, SalesProduct>();
  for (const sp of salesProducts) {
    salesMap.set(sp.product_id, sp);
  }

  const costMap = new Map<string, CostMatch>();
  for (const cm of costMatches) {
    costMap.set(cm.product_id, cm);
  }

  // Period in months (~90 days = 3 months)
  const periodMonths = 3;

  // Separate room charges from menu items
  const roomCharges = salesProducts.filter((sp) =>
    ROOM_CHARGE_CATEGORIES.has(sp.category_name)
  );

  // Filter to menu items only (products with sales, excluding room charges & free items)
  const menuSalesProducts = salesProducts.filter(
    (sp) =>
      !ROOM_CHARGE_CATEGORIES.has(sp.category_name) &&
      sp.total_sales > 0
  );

  // Build raw analysis items with cost info
  type RawItem = {
    salesProduct: SalesProduct;
    costMatch: CostMatch | undefined;
    selling_price: number;
    estimated_cost: number | null;
    cost_ratio: number | null;
    estimated_profit: number | null;
    monthly_profit: number | null;
    monthly_sales: number;
  };

  const rawItems: RawItem[] = menuSalesProducts.map((sp) => {
    const cm = costMap.get(sp.product_id);
    const sellingPrice = sp.avg_price > 0 ? sp.avg_price : (cm?.selling_price ?? 0);

    let estimatedCost: number | null = null;
    let costRatio: number | null = null;
    let estimatedProfit: number | null = null;
    let monthlyProfit: number | null = null;

    if (cm && cm.match_type !== "unmatched" && cm.estimated_cost > 0) {
      estimatedCost = cm.estimated_cost;
      costRatio = cm.cost_ratio;
      estimatedProfit = sellingPrice - estimatedCost;
      const monthlyQuantity = sp.total_quantity / periodMonths;
      monthlyProfit = estimatedProfit * monthlyQuantity;
    }

    const monthlySales = sp.total_sales / periodMonths;

    return {
      salesProduct: sp,
      costMatch: cm,
      selling_price: sellingPrice,
      estimated_cost: estimatedCost,
      cost_ratio: costRatio,
      estimated_profit: estimatedProfit,
      monthly_profit: monthlyProfit,
      monthly_sales: monthlySales,
    };
  });

  // ABC analysis
  const salesRanks = assignAbcRanks(rawItems, (r) => r.salesProduct.total_sales);
  const quantityRanks = assignAbcRanks(rawItems, (r) => r.salesProduct.total_quantity);
  const profitRanks = assignAbcRanks(rawItems, (r) =>
    r.monthly_profit !== null && r.monthly_profit > 0 ? r.monthly_profit : 0
  );

  // Build final items with recommendations
  const items: MenuAnalysisItem[] = rawItems.map((raw) => {
    const abcSales = salesRanks.get(raw) ?? "C";
    const abcQuantity = quantityRanks.get(raw) ?? "C";
    const abcProfit = profitRanks.get(raw) ?? "C";

    const { recommendation, reason } = determineRecommendation(
      abcSales,
      abcProfit,
      abcQuantity,
      raw.cost_ratio,
      raw.salesProduct.transaction_count
    );

    return {
      product_id: raw.salesProduct.product_id,
      product_name: raw.salesProduct.product_name,
      category_name: raw.salesProduct.category_name,
      selling_price: raw.selling_price,
      total_quantity: raw.salesProduct.total_quantity,
      total_sales: raw.salesProduct.total_sales,
      transaction_count: raw.salesProduct.transaction_count,
      monthly_sales: raw.monthly_sales,
      estimated_cost: raw.estimated_cost,
      cost_ratio: raw.cost_ratio,
      estimated_profit: raw.estimated_profit,
      monthly_profit: raw.monthly_profit,
      abc_sales: abcSales,
      abc_quantity: abcQuantity,
      abc_profit: abcProfit,
      recommendation,
      recommendation_reason: reason,
    };
  });

  // Dead stock: products registered in POS but with zero sales in 90 days
  const salesProductIds = new Set(salesProducts.map((sp) => sp.product_id));
  const deadStock = products
    .filter(
      (p) =>
        !salesProductIds.has(p.product_id) &&
        !ROOM_CHARGE_CATEGORIES.has(p.category_name) &&
        p.price > 0 &&
        p.display_flag === "1"
    )
    .map((p) => ({
      product_id: p.product_id,
      product_name: p.product_name,
      category_name: p.category_name,
      selling_price: p.price,
    }));

  // ABC matrix: sales rank x profit rank
  const abcMatrix: Record<string, Record<string, number>> = {
    A: { A: 0, B: 0, C: 0 },
    B: { A: 0, B: 0, C: 0 },
    C: { A: 0, B: 0, C: 0 },
  };
  for (const item of items) {
    abcMatrix[item.abc_profit][item.abc_sales]++;
  }

  // Summary
  const menuRevenue = menuSalesProducts.reduce(
    (sum, sp) => sum + sp.total_sales,
    0
  );
  const improvementCount = items.filter(
    (item) => item.recommendation !== "keep"
  ).length;

  return {
    items,
    deadStock,
    roomCharges,
    summary: {
      activeProductCount: menuSalesProducts.length,
      totalRevenue: menuRevenue,
      monthlyAvgRevenue: Math.round(menuRevenue / periodMonths),
      improvementCount,
      periodMonths,
    },
    abcMatrix,
  };
}

// ── Recommendation metadata ────────────────────────────────────────

export const RECOMMENDATION_META: Record<
  Recommendation,
  { label: string; color: string; bgClass: string; textClass: string; borderClass: string }
> = {
  keep: {
    label: "維持",
    color: "emerald",
    bgClass: "bg-emerald-50 dark:bg-emerald-500/10",
    textClass: "text-emerald-700 dark:text-emerald-400",
    borderClass: "ring-emerald-600/20 dark:ring-emerald-500/20",
  },
  promote: {
    label: "強化推奨",
    color: "blue",
    bgClass: "bg-blue-50 dark:bg-blue-500/10",
    textClass: "text-blue-700 dark:text-blue-400",
    borderClass: "ring-blue-600/20 dark:ring-blue-500/20",
  },
  review_price: {
    label: "価格見直し",
    color: "amber",
    bgClass: "bg-amber-50 dark:bg-amber-500/10",
    textClass: "text-amber-700 dark:text-amber-400",
    borderClass: "ring-amber-600/20 dark:ring-amber-500/20",
  },
  reduce_cost: {
    label: "原価改善",
    color: "orange",
    bgClass: "bg-orange-50 dark:bg-orange-500/10",
    textClass: "text-orange-700 dark:text-orange-400",
    borderClass: "ring-orange-600/20 dark:ring-orange-500/20",
  },
  consider_remove: {
    label: "廃止検討",
    color: "red",
    bgClass: "bg-red-50 dark:bg-red-500/10",
    textClass: "text-red-700 dark:text-red-400",
    borderClass: "ring-red-600/20 dark:ring-red-500/20",
  },
  new_opportunity: {
    label: "販売ゼロ",
    color: "gray",
    bgClass: "bg-gray-50 dark:bg-gray-500/10",
    textClass: "text-gray-700 dark:text-gray-400",
    borderClass: "ring-gray-600/20 dark:ring-gray-500/20",
  },
};
