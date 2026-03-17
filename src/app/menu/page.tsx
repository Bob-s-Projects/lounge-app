import { UtensilsCrossed } from "lucide-react";
import { BreadcrumbNav } from "@/components/breadcrumb-nav";
import productsData from "@/data/products.json";
import supplierData from "@/data/supplier_prices.json";
import salesData from "@/data/sales_summary.json";
import type { ProductsData, SupplierData } from "@/lib/types";
import { analyzeMenu, type SalesData } from "@/lib/menu-analysis";
import { MenuAnalysisDashboard } from "@/components/menu-analysis";

export const metadata = {
  title: "メニュー改廃アドバイス | 原価管理",
};

export default function MenuPage() {
  const result = analyzeMenu(
    productsData as ProductsData,
    supplierData as SupplierData,
    salesData as SalesData
  );

  return (
    <div className="space-y-6">
      <BreadcrumbNav />
      <div className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10">
          <UtensilsCrossed className="size-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
            メニュー改廃アドバイス
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            過去90日間の売上データとABC分析に基づくメニュー改善提案。対象商品{" "}
            {result.items.length} 件（チャージ・ルーム料金除く）
          </p>
        </div>
      </div>

      <MenuAnalysisDashboard data={result} />
    </div>
  );
}
