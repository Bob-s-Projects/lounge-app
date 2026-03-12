import { Package } from "lucide-react";
import productsData from "@/data/products.json";
import supplierData from "@/data/supplier_prices.json";
import type { ProductsData, SupplierData } from "@/lib/types";
import { matchCosts } from "@/lib/cost-matching";
import { ProductsTable } from "@/components/products-table";

export const metadata = {
  title: "商品一覧 | 原価管理",
};

export default function ProductsPage() {
  const data = productsData as ProductsData;
  const products = data.products;
  const supplier = supplierData as SupplierData;

  const categories = Array.from(
    new Set(products.map((p) => p.category_name))
  ).sort();

  const costMatches = matchCosts(products, supplier);

  // Summary stats
  const matched = costMatches.filter((m) => m.match_type !== "unmatched");
  const directCount = costMatches.filter((m) => m.match_type === "direct").length;
  const recipeCount = costMatches.filter((m) => m.match_type === "recipe").length;

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <Package className="size-5 text-primary" />
          <h1 className="text-2xl font-bold tracking-tight">商品一覧</h1>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          POS登録商品 {data.total_count.toLocaleString()} 件（最終更新: {new Date(data.updated_at).toLocaleDateString("ja-JP")}）
          ／原価マッチ済: {matched.length}件（直接: {directCount}件、レシピ: {recipeCount}件）
        </p>
      </div>

      <ProductsTable products={products} categories={categories} costMatches={costMatches} />
    </div>
  );
}
