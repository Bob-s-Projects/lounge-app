import { BarChart3 } from "lucide-react";
import productsData from "@/data/products.json";
import supplierData from "@/data/supplier_prices.json";
import type { ProductsData, SupplierData } from "@/lib/types";
import { matchCosts, type CostMatch } from "@/lib/cost-matching";
import { AnalysisDashboard } from "@/components/analysis-dashboard";

export const metadata = {
  title: "原価分析 | 原価管理",
};

export default function AnalysisPage() {
  const products = (productsData as ProductsData).products;
  const supplier = supplierData as SupplierData;
  const costMatches = matchCosts(products, supplier);

  // Pre-compute server-side data
  const matchedItems = costMatches.filter(
    (m) => m.match_type !== "unmatched" && m.selling_price > 0 && m.estimated_cost > 0
  );

  // Distribution buckets
  const distribution = [
    { range: "0-10%", count: 0 },
    { range: "10-20%", count: 0 },
    { range: "20-30%", count: 0 },
    { range: "30-40%", count: 0 },
    { range: "40%+", count: 0 },
  ];
  for (const item of matchedItems) {
    const pct = item.cost_ratio * 100;
    if (pct < 10) distribution[0].count++;
    else if (pct < 20) distribution[1].count++;
    else if (pct < 30) distribution[2].count++;
    else if (pct < 40) distribution[3].count++;
    else distribution[4].count++;
  }

  // Category averages
  const categoryMap = new Map<string, { totalRatio: number; count: number }>();
  for (const item of matchedItems) {
    const existing = categoryMap.get(item.category_name);
    if (existing) {
      existing.totalRatio += item.cost_ratio;
      existing.count++;
    } else {
      categoryMap.set(item.category_name, {
        totalRatio: item.cost_ratio,
        count: 1,
      });
    }
  }
  const categoryData = Array.from(categoryMap.entries())
    .map(([name, data]) => ({
      category: name,
      avgRatio: Math.round((data.totalRatio / data.count) * 1000) / 10,
      count: data.count,
    }))
    .sort((a, b) => b.avgRatio - a.avgRatio);

  // High cost ratio items (sorted desc)
  const highCostItems = [...matchedItems]
    .sort((a, b) => b.cost_ratio - a.cost_ratio)
    .slice(0, 20);

  // Suggestions
  const highCostProducts = matchedItems.filter((m) => m.cost_ratio > 0.35);
  const unmatchedWithPrice = costMatches.filter(
    (m) => m.match_type === "unmatched" && m.selling_price > 0 &&
      !["対象外カテゴリ", "無料商品"].includes(m.match_details)
  );
  const highMarginProducts = matchedItems
    .filter((m) => m.cost_ratio < 0.15 && m.selling_price >= 500)
    .sort((a, b) => a.cost_ratio - b.cost_ratio)
    .slice(0, 10);

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <BarChart3 className="size-5 text-primary" />
          <h1 className="text-2xl font-bold tracking-tight">原価分析</h1>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          仕入れデータに基づく推定原価率の分析。マッチ済み商品 {matchedItems.length} 件を対象。
        </p>
      </div>

      <AnalysisDashboard
        distribution={distribution}
        categoryData={categoryData}
        highCostItems={highCostItems}
        highCostProducts={highCostProducts}
        unmatchedProducts={unmatchedWithPrice}
        highMarginProducts={highMarginProducts}
        totalMatched={matchedItems.length}
        totalProducts={costMatches.length}
      />
    </div>
  );
}
