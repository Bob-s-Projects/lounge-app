"use client";

import {
  Bar,
  BarChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Cell,
} from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  AlertTriangle,
  TrendingUp,
  HelpCircle,
  ArrowUpRight,
  CheckCircle2,
  BarChart3,
  AlertCircle,
  CircleHelp,
} from "lucide-react";
import type { CostMatch } from "@/lib/cost-matching";
import { formatYen } from "@/lib/format";

// ── Types ──

type DistributionItem = { range: string; count: number };
type CategoryItem = { category: string; avgRatio: number; count: number };

interface AnalysisDashboardProps {
  distribution: DistributionItem[];
  categoryData: CategoryItem[];
  highCostItems: CostMatch[];
  highCostProducts: CostMatch[];
  unmatchedProducts: CostMatch[];
  highMarginProducts: CostMatch[];
  totalMatched: number;
  totalProducts: number;
}

// ── Chart configs ──

const distributionConfig: ChartConfig = {
  count: {
    label: "商品数",
    color: "hsl(239, 84%, 67%)",
  },
};

const categoryConfig: ChartConfig = {
  avgRatio: {
    label: "平均原価率",
    color: "hsl(45, 93%, 47%)",
  },
};

// ── Color helpers ──

function ratioColor(pct: number): string {
  if (pct < 25) return "hsl(160, 60%, 45%)";
  if (pct <= 35) return "hsl(45, 93%, 47%)";
  return "hsl(350, 80%, 55%)";
}

function RatioBadge({ ratio }: { ratio: number }) {
  const pct = ratio * 100;
  const label = `${pct.toFixed(1)}%`;

  if (pct < 25) {
    return (
      <span className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-500/20">
        {label}
      </span>
    );
  }
  if (pct <= 35) {
    return (
      <span className="inline-flex items-center rounded-md bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700 ring-1 ring-inset ring-amber-600/20 dark:bg-amber-500/10 dark:text-amber-400 dark:ring-amber-500/20">
        {label}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-md bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/20 dark:bg-red-500/10 dark:text-red-400 dark:ring-red-500/20">
      {label}
    </span>
  );
}

function MatchBadge({ type }: { type: string }) {
  switch (type) {
    case "direct":
      return (
        <Badge variant="default" className="text-[10px] px-1.5 py-0">
          直接
        </Badge>
      );
    case "recipe":
      return (
        <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400">
          レシピ
        </Badge>
      );
    default:
      return null;
  }
}

// ── Main component ──

export function AnalysisDashboard({
  distribution,
  categoryData,
  highCostItems,
  highCostProducts,
  unmatchedProducts,
  highMarginProducts,
  totalMatched,
  totalProducts,
}: AnalysisDashboardProps) {
  // Summary stats
  const avgRatio =
    highCostItems.length > 0
      ? highCostItems.reduce((sum, m) => sum + m.cost_ratio, 0) /
        totalMatched
      : 0;

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-sm hover:shadow-md transition-all duration-200 rounded-xl bg-gradient-to-br from-blue-50/80 to-white dark:from-blue-950/20 dark:to-card border-blue-100 dark:border-blue-900/30">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription>マッチ済み商品</CardDescription>
            <div className="size-8 rounded-lg bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
              <CheckCircle2 className="size-4 text-blue-600 dark:text-blue-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl md:text-3xl font-bold tabular-nums">{totalMatched}</div>
            <p className="text-xs text-muted-foreground">
              全{totalProducts}商品中
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-sm hover:shadow-md transition-all duration-200 rounded-xl bg-gradient-to-br from-indigo-50/80 to-white dark:from-indigo-950/20 dark:to-card border-indigo-100 dark:border-indigo-900/30">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription>平均推定原価率</CardDescription>
            <div className="size-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center">
              <BarChart3 className="size-4 text-indigo-600 dark:text-indigo-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl md:text-3xl font-bold tabular-nums">
              {(avgRatio * 100).toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              マッチ済み商品の平均
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-sm hover:shadow-md transition-all duration-200 rounded-xl bg-gradient-to-br from-red-50/80 to-white dark:from-red-950/20 dark:to-card border-red-100 dark:border-red-900/30">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription>高原価率商品</CardDescription>
            <div className="size-8 rounded-lg bg-red-100 dark:bg-red-900/40 flex items-center justify-center">
              <AlertCircle className="size-4 text-red-600 dark:text-red-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl md:text-3xl font-bold tabular-nums text-red-600">
              {highCostProducts.length}
            </div>
            <p className="text-xs text-muted-foreground">原価率35%超</p>
          </CardContent>
        </Card>
        <Card className="shadow-sm hover:shadow-md transition-all duration-200 rounded-xl bg-gradient-to-br from-amber-50/80 to-white dark:from-amber-950/20 dark:to-card border-amber-100 dark:border-amber-900/30">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription>未マッチ商品</CardDescription>
            <div className="size-8 rounded-lg bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center">
              <CircleHelp className="size-4 text-amber-600 dark:text-amber-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl md:text-3xl font-bold tabular-nums text-amber-600">
              {unmatchedProducts.length}
            </div>
            <p className="text-xs text-muted-foreground">
              原価未推定（有料品のみ）
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Distribution chart */}
        <Card className="shadow-sm hover:shadow-md transition-all duration-200 rounded-xl">
          <CardHeader>
            <CardTitle>原価率分布</CardTitle>
            <CardDescription>
              推定原価率のレンジ別商品数
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={distributionConfig} className="h-[280px] w-full">
              <BarChart data={distribution} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.3} />
                <XAxis dataKey="range" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {distribution.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        index < 2
                          ? "hsl(160, 60%, 45%)"
                          : index === 2
                          ? "hsl(160, 40%, 55%)"
                          : index === 3
                          ? "hsl(45, 93%, 47%)"
                          : "hsl(350, 80%, 55%)"
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Category bar chart */}
        <Card className="shadow-sm hover:shadow-md transition-all duration-200 rounded-xl">
          <CardHeader>
            <CardTitle>カテゴリ別原価率</CardTitle>
            <CardDescription>
              カテゴリごとの平均推定原価率
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={categoryConfig} className="h-[280px] w-full">
              <BarChart
                data={categoryData.slice(0, 12)}
                layout="vertical"
                margin={{ top: 5, right: 20, bottom: 5, left: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} strokeOpacity={0.3} />
                <XAxis
                  type="number"
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `${v}%`}
                />
                <YAxis
                  type="category"
                  dataKey="category"
                  tickLine={false}
                  axisLine={false}
                  width={120}
                  tick={{ fontSize: 11 }}
                />
                <ChartTooltip
                  content={
                    <ChartTooltipContent
                      formatter={(value, name) => [
                        `${value}%`,
                        "平均原価率",
                      ]}
                    />
                  }
                />
                <Bar dataKey="avgRatio" radius={[0, 6, 6, 0]}>
                  {categoryData.slice(0, 12).map((entry, index) => (
                    <Cell
                      key={`cat-${index}`}
                      fill={ratioColor(entry.avgRatio)}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* High cost items table */}
      <Card className="shadow-sm hover:shadow-md transition-all duration-200 rounded-xl">
        <CardHeader>
          <CardTitle>原価率ランキング（上位20件）</CardTitle>
          <CardDescription>
            推定原価率が高い順に並べた商品一覧
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="w-12 font-semibold text-xs uppercase tracking-wider">#</TableHead>
                  <TableHead className="font-semibold text-xs uppercase tracking-wider">商品名</TableHead>
                  <TableHead className="font-semibold text-xs uppercase tracking-wider">カテゴリ</TableHead>
                  <TableHead className="text-right font-semibold text-xs uppercase tracking-wider">販売価格</TableHead>
                  <TableHead className="text-right font-semibold text-xs uppercase tracking-wider">推定原価</TableHead>
                  <TableHead className="text-right font-semibold text-xs uppercase tracking-wider">推定原価率</TableHead>
                  <TableHead className="font-semibold text-xs uppercase tracking-wider">種別</TableHead>
                  <TableHead className="font-semibold text-xs uppercase tracking-wider">内訳</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {highCostItems.map((item, i) => (
                  <TableRow key={item.product_id} className={i % 2 === 0 ? "bg-muted/20" : ""}>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {i + 1}
                    </TableCell>
                    <TableCell className="font-medium">
                      {item.product_name}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{item.category_name}</Badge>
                    </TableCell>
                    <TableCell className="text-right tabular-nums font-medium">
                      {formatYen(item.selling_price)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums font-medium">
                      {formatYen(item.estimated_cost)}
                    </TableCell>
                    <TableCell className="text-right">
                      <RatioBadge ratio={item.cost_ratio} />
                    </TableCell>
                    <TableCell>
                      <MatchBadge type={item.match_type} />
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground max-w-[200px] truncate">
                      {item.match_details}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Suggestions cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {/* High cost products */}
        <Card className="shadow-sm hover:shadow-md transition-all duration-200 rounded-xl border-red-200 dark:border-red-900/50 bg-gradient-to-br from-red-50/40 to-white dark:from-red-950/10 dark:to-card">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="size-8 rounded-lg bg-red-100 dark:bg-red-900/40 flex items-center justify-center">
                <AlertTriangle className="size-4 text-red-500" />
              </div>
              <CardTitle className="text-base">原価率が高い商品</CardTitle>
            </div>
            <CardDescription>
              原価率35%超 - 価格見直しまたは仕入れ先変更を検討
            </CardDescription>
          </CardHeader>
          <CardContent>
            {highCostProducts.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                該当商品なし
              </p>
            ) : (
              <ul className="space-y-2">
                {highCostProducts.slice(0, 8).map((item) => (
                  <li
                    key={item.product_id}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="truncate mr-2">{item.product_name}</span>
                    <div className="flex items-center gap-2 shrink-0">
                      <RatioBadge ratio={item.cost_ratio} />
                      <ArrowUpRight className="size-3 text-red-400" />
                    </div>
                  </li>
                ))}
                {highCostProducts.length > 8 && (
                  <li className="text-xs text-muted-foreground pt-1">
                    他 {highCostProducts.length - 8} 件
                  </li>
                )}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Unmatched products */}
        <Card className="shadow-sm hover:shadow-md transition-all duration-200 rounded-xl border-amber-200 dark:border-amber-900/50 bg-gradient-to-br from-amber-50/40 to-white dark:from-amber-950/10 dark:to-card">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="size-8 rounded-lg bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center">
                <HelpCircle className="size-4 text-amber-500" />
              </div>
              <CardTitle className="text-base">原価未設定商品</CardTitle>
            </div>
            <CardDescription>
              仕入れデータとマッチしない有料商品 - 原価登録を推奨
            </CardDescription>
          </CardHeader>
          <CardContent>
            {unmatchedProducts.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                該当商品なし
              </p>
            ) : (
              <ul className="space-y-2">
                {unmatchedProducts.slice(0, 8).map((item) => (
                  <li
                    key={item.product_id}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="truncate mr-2">{item.product_name}</span>
                    <span className="text-xs text-muted-foreground shrink-0 tabular-nums">
                      {formatYen(item.selling_price)}
                    </span>
                  </li>
                ))}
                {unmatchedProducts.length > 8 && (
                  <li className="text-xs text-muted-foreground pt-1">
                    他 {unmatchedProducts.length - 8} 件
                  </li>
                )}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* High margin products */}
        <Card className="shadow-sm hover:shadow-md transition-all duration-200 rounded-xl border-emerald-200 dark:border-emerald-900/50 bg-gradient-to-br from-emerald-50/40 to-white dark:from-emerald-950/10 dark:to-card">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="size-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
                <TrendingUp className="size-4 text-emerald-500" />
              </div>
              <CardTitle className="text-base">利益率が高い商品</CardTitle>
            </div>
            <CardDescription>
              原価率15%未満 - おすすめ強化・プロモーション推奨
            </CardDescription>
          </CardHeader>
          <CardContent>
            {highMarginProducts.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                該当商品なし
              </p>
            ) : (
              <ul className="space-y-2">
                {highMarginProducts.slice(0, 8).map((item) => (
                  <li
                    key={item.product_id}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="truncate mr-2">{item.product_name}</span>
                    <div className="flex items-center gap-2 shrink-0">
                      <RatioBadge ratio={item.cost_ratio} />
                    </div>
                  </li>
                ))}
                {highMarginProducts.length > 8 && (
                  <li className="text-xs text-muted-foreground pt-1">
                    他 {highMarginProducts.length - 8} 件
                  </li>
                )}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
