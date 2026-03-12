import { Truck, PackageSearch, Layers, TrendingUp, TrendingDown } from "lucide-react";
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
      <div>
        <div className="flex items-center gap-2">
          <Truck className="size-5 text-primary" />
          <h1 className="text-2xl font-bold tracking-tight">仕入れ価格一覧</h1>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          納品価格一覧（{data.date.replace(/-/g, "/")} 更新）
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              総品目数
            </CardTitle>
            <PackageSearch className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalItems.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              カテゴリ数
            </CardTitle>
            <Layers className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categoryCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              最高単価
            </CardTitle>
            <TrendingUp className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatYen(maxPrice)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              最低単価
            </CardTitle>
            <TrendingDown className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatYen(minPrice)}</div>
          </CardContent>
        </Card>
      </div>

      <SuppliersTable items={items} categories={categories} />
    </div>
  );
}
