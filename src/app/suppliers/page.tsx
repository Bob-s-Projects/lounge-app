import { Receipt, PackageSearch, Layers, TrendingUp, TrendingDown } from "lucide-react";
import { BreadcrumbNav } from "@/components/breadcrumb-nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import supplierData from "@/data/supplier_prices.json";
import type { SupplierData } from "@/lib/types";
import { SuppliersTable } from "@/components/suppliers-table";
import { formatYen } from "@/lib/format";

export const metadata = {
  title: "仕入れ価格一覧 | 原価管理",
};

export default function SuppliersPage() {
  const data = supplierData as SupplierData;
  const items = data.items;
  const categories = data.categories;

  const totalItems = items.length;
  const categoryCount = categories.length;
  const maxPrice = Math.max(...items.map((i) => i.wholesale_price));
  const minPrice = Math.min(...items.map((i) => i.wholesale_price));

  return (
    <div className="space-y-6">
      <BreadcrumbNav />
      <div className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10">
          <Receipt className="size-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">仕入れ価格一覧</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            納品価格一覧（{data.date.replace(/-/g, "/")} 更新）
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-sm hover:shadow-md transition-all duration-200 bg-gradient-to-br from-emerald-50 to-emerald-50/30 dark:from-emerald-950/20 dark:to-emerald-950/5">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              総品目数
            </CardTitle>
            <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
              <PackageSearch className="size-4 text-emerald-600 dark:text-emerald-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tabular-nums">{totalItems.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card className="shadow-sm hover:shadow-md transition-all duration-200 bg-gradient-to-br from-emerald-50 to-emerald-50/30 dark:from-emerald-950/20 dark:to-emerald-950/5">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              カテゴリ数
            </CardTitle>
            <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
              <Layers className="size-4 text-emerald-600 dark:text-emerald-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tabular-nums">{categoryCount}</div>
          </CardContent>
        </Card>
        <Card className="shadow-sm hover:shadow-md transition-all duration-200 bg-gradient-to-br from-amber-50 to-amber-50/30 dark:from-amber-950/20 dark:to-amber-950/5">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              最高単価
            </CardTitle>
            <div className="flex size-8 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/30">
              <TrendingUp className="size-4 text-amber-600 dark:text-amber-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tabular-nums">{formatYen(maxPrice)}</div>
          </CardContent>
        </Card>
        <Card className="shadow-sm hover:shadow-md transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              最低単価
            </CardTitle>
            <div className="flex size-8 items-center justify-center rounded-lg bg-muted">
              <TrendingDown className="size-4 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tabular-nums">{formatYen(minPrice)}</div>
          </CardContent>
        </Card>
      </div>

      <SuppliersTable items={items} categories={categories} />
    </div>
  );
}
