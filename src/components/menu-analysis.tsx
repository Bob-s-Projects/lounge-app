"use client";

import { useState, useMemo } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ShoppingBag,
  TrendingUp,
  BarChart3,
  AlertTriangle,
  ArrowUpDown,
  Trophy,
  PackageX,
} from "lucide-react";
import { formatYen, formatNumber } from "@/lib/format";
import type {
  MenuAnalysisItem,
  MenuAnalysisResult,
  Recommendation,
} from "@/lib/menu-analysis";
import { RECOMMENDATION_META } from "@/lib/menu-analysis";

// ── Sort state ─────────────────────────────────────────────────────

type SortKey =
  | "product_name"
  | "category_name"
  | "total_sales"
  | "total_quantity"
  | "cost_ratio"
  | "monthly_profit"
  | "transaction_count";

type SortDirection = "asc" | "desc";

function useSortableItems(items: MenuAnalysisItem[], defaultKey: SortKey = "total_sales") {
  const [sortKey, setSortKey] = useState<SortKey>(defaultKey);
  const [sortDir, setSortDir] = useState<SortDirection>("desc");

  const sorted = useMemo(() => {
    return [...items].sort((a, b) => {
      let aVal: number | string;
      let bVal: number | string;

      switch (sortKey) {
        case "product_name":
          aVal = a.product_name;
          bVal = b.product_name;
          break;
        case "category_name":
          aVal = a.category_name;
          bVal = b.category_name;
          break;
        case "total_sales":
          aVal = a.total_sales;
          bVal = b.total_sales;
          break;
        case "total_quantity":
          aVal = a.total_quantity;
          bVal = b.total_quantity;
          break;
        case "cost_ratio":
          aVal = a.cost_ratio ?? -1;
          bVal = b.cost_ratio ?? -1;
          break;
        case "monthly_profit":
          aVal = a.monthly_profit ?? -Infinity;
          bVal = b.monthly_profit ?? -Infinity;
          break;
        case "transaction_count":
          aVal = a.transaction_count;
          bVal = b.transaction_count;
          break;
        default:
          return 0;
      }

      if (typeof aVal === "string" && typeof bVal === "string") {
        return sortDir === "asc"
          ? aVal.localeCompare(bVal, "ja")
          : bVal.localeCompare(aVal, "ja");
      }

      const diff = (aVal as number) - (bVal as number);
      return sortDir === "asc" ? diff : -diff;
    });
  }, [items, sortKey, sortDir]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  return { sorted, sortKey, sortDir, toggleSort };
}

// ── Recommendation badge ───────────────────────────────────────────

function RecommendationBadge({ rec }: { rec: Recommendation }) {
  const meta = RECOMMENDATION_META[rec];
  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${meta.bgClass} ${meta.textClass} ${meta.borderClass}`}
    >
      {meta.label}
    </span>
  );
}

function AbcBadge({ rank }: { rank: "A" | "B" | "C" }) {
  const styles = {
    A: "bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-400",
    B: "bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-500/10 dark:text-amber-400",
    C: "bg-red-50 text-red-700 ring-red-600/20 dark:bg-red-500/10 dark:text-red-400",
  };
  return (
    <span
      className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-xs font-bold ring-1 ring-inset ${styles[rank]}`}
    >
      {rank}
    </span>
  );
}

function CostRatioBadge({ ratio }: { ratio: number | null }) {
  if (ratio === null) {
    return (
      <span className="text-xs text-muted-foreground">--</span>
    );
  }
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

// ── Sortable header ────────────────────────────────────────────────

function SortableHead({
  label,
  sortKey: key,
  currentKey,
  currentDir,
  onToggle,
  className,
}: {
  label: string;
  sortKey: SortKey;
  currentKey: SortKey;
  currentDir: SortDirection;
  onToggle: (key: SortKey) => void;
  className?: string;
}) {
  const isActive = currentKey === key;
  return (
    <TableHead className={className}>
      <button
        className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
        onClick={() => onToggle(key)}
      >
        {label}
        <ArrowUpDown
          className={`size-3 ${isActive ? "text-foreground" : "text-muted-foreground/40"}`}
        />
        {isActive && (
          <span className="text-[10px] text-muted-foreground">
            {currentDir === "asc" ? "\u2191" : "\u2193"}
          </span>
        )}
      </button>
    </TableHead>
  );
}

// ── Format helpers ─────────────────────────────────────────────────

function formatCompact(value: number): string {
  if (value >= 10_000_000) {
    return `\u00a5${(value / 1_000_000).toFixed(1)}M`;
  }
  if (value >= 1_000_000) {
    return `\u00a5${(value / 1_000_000).toFixed(1)}M`;
  }
  if (value >= 10_000) {
    return `\u00a5${(value / 10_000).toFixed(1)}万`;
  }
  return formatYen(value);
}

function formatMonthlyProfit(value: number | null): string {
  if (value === null) return "--";
  if (value >= 10_000) {
    return `\u00a5${(value / 10_000).toFixed(1)}万`;
  }
  return formatYen(Math.round(value));
}

// ── Recommendation priority for sorting ────────────────────────────

const REC_PRIORITY: Record<Recommendation, number> = {
  reduce_cost: 0,
  review_price: 1,
  consider_remove: 2,
  promote: 3,
  keep: 4,
  new_opportunity: 5,
};

// ── Data table component ───────────────────────────────────────────

function MenuTable({
  items,
  defaultSort = "total_sales",
}: {
  items: MenuAnalysisItem[];
  defaultSort?: SortKey;
}) {
  const { sorted, sortKey, sortDir, toggleSort } = useSortableItems(
    items,
    defaultSort
  );

  if (items.length === 0) {
    return (
      <div className="py-8 text-center text-sm text-muted-foreground">
        該当する商品はありません
      </div>
    );
  }

  return (
    <div className="rounded-lg border overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <SortableHead
              label="商品名"
              sortKey="product_name"
              currentKey={sortKey}
              currentDir={sortDir}
              onToggle={toggleSort}
            />
            <SortableHead
              label="カテゴリ"
              sortKey="category_name"
              currentKey={sortKey}
              currentDir={sortDir}
              onToggle={toggleSort}
            />
            <SortableHead
              label="売上(90日)"
              sortKey="total_sales"
              currentKey={sortKey}
              currentDir={sortDir}
              onToggle={toggleSort}
              className="text-right"
            />
            <SortableHead
              label="数量"
              sortKey="total_quantity"
              currentKey={sortKey}
              currentDir={sortDir}
              onToggle={toggleSort}
              className="text-right"
            />
            <SortableHead
              label="推定原価率"
              sortKey="cost_ratio"
              currentKey={sortKey}
              currentDir={sortDir}
              onToggle={toggleSort}
              className="text-right"
            />
            <SortableHead
              label="月間利益"
              sortKey="monthly_profit"
              currentKey={sortKey}
              currentDir={sortDir}
              onToggle={toggleSort}
              className="text-right"
            />
            <TableHead>ABC</TableHead>
            <TableHead>判定</TableHead>
            <TableHead className="min-w-[200px]">理由</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sorted.map((item) => (
            <TableRow key={item.product_id}>
              <TableCell className="font-medium max-w-[180px] truncate">
                {item.product_name}
              </TableCell>
              <TableCell>
                <Badge variant="secondary" className="text-[10px]">
                  {item.category_name}
                </Badge>
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {formatYen(item.total_sales)}
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {formatNumber(item.total_quantity)}
              </TableCell>
              <TableCell className="text-right">
                <CostRatioBadge ratio={item.cost_ratio} />
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {formatMonthlyProfit(item.monthly_profit)}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-0.5">
                  <AbcBadge rank={item.abc_sales} />
                  <AbcBadge rank={item.abc_profit} />
                </div>
              </TableCell>
              <TableCell>
                <RecommendationBadge rec={item.recommendation} />
              </TableCell>
              <TableCell className="text-xs text-muted-foreground max-w-[250px]">
                {item.recommendation_reason}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

// ── Main exported component ────────────────────────────────────────

interface MenuAnalysisDashboardProps {
  data: MenuAnalysisResult;
}

export function MenuAnalysisDashboard({ data }: MenuAnalysisDashboardProps) {
  const { items, deadStock, summary, abcMatrix } = data;

  // Group by recommendation
  const recGroups = useMemo(() => {
    const groups: Record<Recommendation, MenuAnalysisItem[]> = {
      keep: [],
      promote: [],
      review_price: [],
      reduce_cost: [],
      consider_remove: [],
      new_opportunity: [],
    };
    for (const item of items) {
      groups[item.recommendation].push(item);
    }
    return groups;
  }, [items]);

  // All items sorted by recommendation priority then sales desc
  const allSorted = useMemo(() => {
    return [...items].sort((a, b) => {
      const pa = REC_PRIORITY[a.recommendation];
      const pb = REC_PRIORITY[b.recommendation];
      if (pa !== pb) return pa - pb;
      return b.total_sales - a.total_sales;
    });
  }, [items]);

  // Top 20 by revenue
  const topByRevenue = useMemo(() => {
    return [...items].sort((a, b) => b.total_sales - a.total_sales).slice(0, 20);
  }, [items]);

  // Tab count badges
  const tabCounts = {
    all: items.length,
    promote: recGroups.promote.length,
    review_price: recGroups.review_price.length,
    reduce_cost: recGroups.reduce_cost.length,
    consider_remove: recGroups.consider_remove.length,
  };

  return (
    <div className="space-y-6">
      {/* Section 1: Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription>販売商品数</CardDescription>
            <ShoppingBag className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatNumber(summary.activeProductCount)}
            </div>
            <p className="text-xs text-muted-foreground">
              過去90日間に売上のある商品
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription>総売上</CardDescription>
            <TrendingUp className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCompact(summary.totalRevenue)}
            </div>
            <p className="text-xs text-muted-foreground">
              90日間のメニュー売上（チャージ除く）
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription>月間平均売上</CardDescription>
            <BarChart3 className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCompact(summary.monthlyAvgRevenue)}
            </div>
            <p className="text-xs text-muted-foreground">
              90日間を3ヶ月で割った月平均
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription>改善対象商品</CardDescription>
            <AlertTriangle className="size-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">
              {formatNumber(summary.improvementCount)}
            </div>
            <p className="text-xs text-muted-foreground">
              「維持」以外の判定がついた商品
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Section 2: ABC Matrix */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="size-5" />
            ABC分析マトリクス（売上 x 利益）
          </CardTitle>
          <CardDescription>
            売上ランクと利益ランクの組み合わせで商品を分類。A=上位70%, B=70-90%, C=下位10%
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full max-w-lg border-collapse text-sm">
              <thead>
                <tr>
                  <th className="border p-2 bg-muted text-left"></th>
                  <th className="border p-2 bg-muted text-center font-medium">売上A</th>
                  <th className="border p-2 bg-muted text-center font-medium">売上B</th>
                  <th className="border p-2 bg-muted text-center font-medium">売上C</th>
                </tr>
              </thead>
              <tbody>
                {(["A", "B", "C"] as const).map((profitRank) => (
                  <tr key={profitRank}>
                    <td className="border p-2 bg-muted font-medium">利益{profitRank}</td>
                    {(["A", "B", "C"] as const).map((salesRank) => {
                      const count = abcMatrix[profitRank][salesRank];
                      // Cell styling based on position
                      let cellStyle = "";
                      let cellLabel = "";
                      if (profitRank === "A" && salesRank === "A") {
                        cellStyle = "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400";
                        cellLabel = "維持";
                      } else if (
                        (profitRank === "A" && salesRank === "B") ||
                        (profitRank === "A" && salesRank === "C")
                      ) {
                        cellStyle = "bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400";
                        cellLabel = "強化推奨";
                      } else if (profitRank === "B" && salesRank === "A") {
                        cellStyle = "bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400";
                        cellLabel = "価格見直し";
                      } else if (profitRank === "B" && salesRank === "B") {
                        cellStyle = "bg-emerald-50/50 dark:bg-emerald-500/5 text-emerald-700 dark:text-emerald-400";
                        cellLabel = "維持";
                      } else if (profitRank === "C" && salesRank === "A") {
                        cellStyle = "bg-orange-50 dark:bg-orange-500/10 text-orange-700 dark:text-orange-400";
                        cellLabel = "原価改善";
                      } else {
                        cellStyle = "bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400";
                        cellLabel = "廃止検討";
                      }
                      return (
                        <td
                          key={salesRank}
                          className={`border p-3 text-center ${cellStyle}`}
                        >
                          <div className="text-xs font-medium">{cellLabel}</div>
                          <div className="text-lg font-bold">{count}</div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Section 3: Advice Tabs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="size-5" />
            メニュー改廃アドバイス
          </CardTitle>
          <CardDescription>
            各商品の推奨アクションをタブで切り替えて確認できます
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue={0}>
            <TabsList className="flex-wrap">
              <TabsTrigger value={0}>
                全体
                <Badge variant="secondary" className="ml-1 text-[10px] px-1.5 py-0">
                  {tabCounts.all}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value={1}>
                強化推奨
                <Badge variant="secondary" className="ml-1 text-[10px] px-1.5 py-0 bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400">
                  {tabCounts.promote}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value={2}>
                価格見直し
                <Badge variant="secondary" className="ml-1 text-[10px] px-1.5 py-0 bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400">
                  {tabCounts.review_price}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value={3}>
                原価改善
                <Badge variant="secondary" className="ml-1 text-[10px] px-1.5 py-0 bg-orange-50 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400">
                  {tabCounts.reduce_cost}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value={4}>
                廃止検討
                <Badge variant="secondary" className="ml-1 text-[10px] px-1.5 py-0 bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400">
                  {tabCounts.consider_remove}
                </Badge>
              </TabsTrigger>
            </TabsList>

            <TabsContent value={0} className="mt-4">
              <MenuTable items={allSorted} />
            </TabsContent>
            <TabsContent value={1} className="mt-4">
              <MenuTable items={recGroups.promote} />
            </TabsContent>
            <TabsContent value={2} className="mt-4">
              <MenuTable items={recGroups.review_price} />
            </TabsContent>
            <TabsContent value={3} className="mt-4">
              <MenuTable items={recGroups.reduce_cost} />
            </TabsContent>
            <TabsContent value={4} className="mt-4">
              <MenuTable items={recGroups.consider_remove} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Section 4: Top 20 by revenue */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="size-5" />
            売れ筋ランキング TOP20
          </CardTitle>
          <CardDescription>
            過去90日間の売上金額で並べた上位20商品
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>商品名</TableHead>
                  <TableHead>カテゴリ</TableHead>
                  <TableHead className="text-right">数量</TableHead>
                  <TableHead className="text-right">売上</TableHead>
                  <TableHead className="text-right">推定原価率</TableHead>
                  <TableHead>ABC</TableHead>
                  <TableHead>判定</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topByRevenue.map((item, i) => (
                  <TableRow key={item.product_id}>
                    <TableCell className="font-mono text-xs text-muted-foreground font-bold">
                      {i + 1}
                    </TableCell>
                    <TableCell className="font-medium max-w-[180px] truncate">
                      {item.product_name}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-[10px]">
                        {item.category_name}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatNumber(item.total_quantity)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums font-medium">
                      {formatYen(item.total_sales)}
                    </TableCell>
                    <TableCell className="text-right">
                      <CostRatioBadge ratio={item.cost_ratio} />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-0.5">
                        <AbcBadge rank={item.abc_sales} />
                        <AbcBadge rank={item.abc_profit} />
                      </div>
                    </TableCell>
                    <TableCell>
                      <RecommendationBadge rec={item.recommendation} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Section 5: Dead stock */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PackageX className="size-5 text-red-500" />
            販売ゼロ商品（過去90日間）
          </CardTitle>
          <CardDescription>
            POS登録済みだが過去90日間に1件も販売がない商品 ({deadStock.length}件)。メニューからの除外を検討してください。
          </CardDescription>
        </CardHeader>
        <CardContent>
          {deadStock.length === 0 ? (
            <div className="py-4 text-center text-sm text-muted-foreground">
              該当する商品はありません
            </div>
          ) : (
            <ScrollArea className="h-[400px]">
              <div className="rounded-lg border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>商品名</TableHead>
                      <TableHead>カテゴリ</TableHead>
                      <TableHead className="text-right">設定価格</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {deadStock.map((item) => (
                      <TableRow key={item.product_id}>
                        <TableCell className="font-medium">
                          {item.product_name}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="text-[10px]">
                            {item.category_name}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {formatYen(item.selling_price)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
