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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import {
  ShoppingBag,
  TrendingUp,
  BarChart3,
  AlertTriangle,
  ArrowUpDown,
  Trophy,
  PackageX,
  Search,
  Filter,
  Printer,
  ClipboardCheck,
  FileText,
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
    A: "bg-emerald-100 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-900/30 dark:text-emerald-300 font-semibold",
    B: "bg-amber-100 text-amber-700 ring-amber-600/20 dark:bg-amber-900/30 dark:text-amber-300",
    C: "bg-red-100 text-red-700 ring-red-600/20 dark:bg-red-900/30 dark:text-red-300",
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
    <TableHead className={`font-semibold text-xs uppercase tracking-wider ${className ?? ""}`}>
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
    <div className="rounded-xl border overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
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
            <TableHead className="text-center font-semibold text-xs uppercase tracking-wider">売上ABC</TableHead>
            <TableHead className="text-center font-semibold text-xs uppercase tracking-wider">利益ABC</TableHead>
            <TableHead className="font-semibold text-xs uppercase tracking-wider">判定</TableHead>
            <TableHead className="min-w-[200px] font-semibold text-xs uppercase tracking-wider">理由</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sorted.map((item, i) => (
            <TableRow key={item.product_id} className={i % 2 === 0 ? "bg-muted/20" : ""}>
              <TableCell className="font-medium max-w-[180px] truncate">
                {item.product_name}
              </TableCell>
              <TableCell>
                <Badge variant="secondary" className="text-[10px]">
                  {item.category_name}
                </Badge>
              </TableCell>
              <TableCell className="text-right tabular-nums font-medium">
                {formatYen(item.total_sales)}
              </TableCell>
              <TableCell className="text-right tabular-nums font-medium">
                {formatNumber(item.total_quantity)}
              </TableCell>
              <TableCell className="text-right">
                <CostRatioBadge ratio={item.cost_ratio} />
              </TableCell>
              <TableCell className="text-right tabular-nums font-medium">
                {formatMonthlyProfit(item.monthly_profit)}
              </TableCell>
              <TableCell className="text-center">
                <AbcBadge rank={item.abc_sales} />
              </TableCell>
              <TableCell className="text-center">
                <AbcBadge rank={item.abc_profit} />
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
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Extract unique categories
  const categories = useMemo(() => {
    const cats = new Set<string>();
    for (const item of items) cats.add(item.category_name);
    for (const item of deadStock) cats.add(item.category_name);
    return Array.from(cats).sort((a, b) => a.localeCompare(b, "ja"));
  }, [items, deadStock]);

  // Filtered items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (categoryFilter !== "all" && item.category_name !== categoryFilter) return false;
      if (searchQuery && !item.product_name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    });
  }, [items, categoryFilter, searchQuery]);

  const filteredDeadStock = useMemo(() => {
    return deadStock.filter((item) => {
      if (categoryFilter !== "all" && item.category_name !== categoryFilter) return false;
      if (searchQuery && !item.product_name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    });
  }, [deadStock, categoryFilter, searchQuery]);

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
    for (const item of filteredItems) {
      groups[item.recommendation].push(item);
    }
    return groups;
  }, [filteredItems]);

  // All items sorted by recommendation priority then sales desc
  const allSorted = useMemo(() => {
    return [...filteredItems].sort((a, b) => {
      const pa = REC_PRIORITY[a.recommendation];
      const pb = REC_PRIORITY[b.recommendation];
      if (pa !== pb) return pa - pb;
      return b.total_sales - a.total_sales;
    });
  }, [filteredItems]);

  // Top 20 by revenue
  const topByRevenue = useMemo(() => {
    return [...filteredItems].sort((a, b) => b.total_sales - a.total_sales).slice(0, 20);
  }, [filteredItems]);

  // Tab count badges
  const tabCounts = {
    all: filteredItems.length,
    promote: recGroups.promote.length,
    review_price: recGroups.review_price.length,
    reduce_cost: recGroups.reduce_cost.length,
    consider_remove: recGroups.consider_remove.length,
  };

  const isFiltered = categoryFilter !== "all" || searchQuery !== "";

  return (
    <div className="space-y-6">
      {/* Action buttons */}
      <div className="flex flex-wrap items-center gap-2">
        <Link
          href="/menu/report"
          className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-primary px-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <Printer className="size-3.5" />
          提案書を印刷
        </Link>
        <Link
          href="/menu/report/feedback"
          className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-input bg-background px-3 text-sm font-medium hover:bg-muted transition-colors"
        >
          <ClipboardCheck className="size-3.5" />
          フィードバック入力
        </Link>
        <Link
          href="/menu/draft"
          className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-input bg-background px-3 text-sm font-medium hover:bg-muted transition-colors"
        >
          <FileText className="size-3.5" />
          メニュー表ドラフト
        </Link>
      </div>

      {/* Filters */}
      <Card className="shadow-sm rounded-xl">
        <CardContent className="pt-6">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="size-7 rounded-lg bg-muted flex items-center justify-center">
                <Filter className="size-3.5 text-muted-foreground" />
              </div>
              <span className="text-sm font-medium">絞り込み</span>
            </div>
            <Select value={categoryFilter} onValueChange={(v) => setCategoryFilter(v ?? "all")}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="カテゴリ" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">すべてのカテゴリ</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
              <Input
                placeholder="商品名で検索..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-[200px]"
              />
            </div>
            {isFiltered && (
              <button
                className="text-xs text-muted-foreground hover:text-foreground underline transition-colors"
                onClick={() => { setCategoryFilter("all"); setSearchQuery(""); }}
              >
                フィルタ解除
              </button>
            )}
            {isFiltered && (
              <Badge variant="secondary">
                {filteredItems.length + filteredDeadStock.length}件表示中
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Section 1: Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-sm hover:shadow-md transition-all duration-200 rounded-xl bg-gradient-to-br from-emerald-50/80 to-white dark:from-emerald-950/20 dark:to-card border-emerald-100 dark:border-emerald-900/30">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription>販売商品数</CardDescription>
            <div className="size-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
              <ShoppingBag className="size-4 text-emerald-600 dark:text-emerald-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl md:text-3xl font-bold tabular-nums">
              {formatNumber(summary.activeProductCount)}
            </div>
            <p className="text-xs text-muted-foreground">
              過去90日間に売上のある商品
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-sm hover:shadow-md transition-all duration-200 rounded-xl bg-gradient-to-br from-indigo-50/80 to-white dark:from-indigo-950/20 dark:to-card border-indigo-100 dark:border-indigo-900/30">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription>総売上</CardDescription>
            <div className="size-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center">
              <TrendingUp className="size-4 text-indigo-600 dark:text-indigo-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl md:text-3xl font-bold tabular-nums">
              {formatCompact(summary.totalRevenue)}
            </div>
            <p className="text-xs text-muted-foreground">
              90日間のメニュー売上（チャージ除く）
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-sm hover:shadow-md transition-all duration-200 rounded-xl bg-gradient-to-br from-blue-50/80 to-white dark:from-blue-950/20 dark:to-card border-blue-100 dark:border-blue-900/30">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription>月間平均売上</CardDescription>
            <div className="size-8 rounded-lg bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
              <BarChart3 className="size-4 text-blue-600 dark:text-blue-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl md:text-3xl font-bold tabular-nums">
              {formatCompact(summary.monthlyAvgRevenue)}
            </div>
            <p className="text-xs text-muted-foreground">
              90日間を3ヶ月で割った月平均
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-sm hover:shadow-md transition-all duration-200 rounded-xl bg-gradient-to-br from-amber-50/80 to-white dark:from-amber-950/20 dark:to-card border-amber-100 dark:border-amber-900/30">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription>改善対象商品</CardDescription>
            <div className="size-8 rounded-lg bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center">
              <AlertTriangle className="size-4 text-amber-600 dark:text-amber-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl md:text-3xl font-bold tabular-nums text-amber-600">
              {formatNumber(summary.improvementCount)}
            </div>
            <p className="text-xs text-muted-foreground">
              「維持」以外の判定がついた商品
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Section 2: ABC Matrix */}
      <Card className="shadow-sm hover:shadow-md transition-all duration-200 rounded-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="size-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center">
              <BarChart3 className="size-4 text-indigo-600 dark:text-indigo-400" />
            </div>
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
                  <th className="border p-2 bg-muted/60 text-left font-semibold text-xs uppercase tracking-wider"></th>
                  <th className="border p-2 bg-muted/60 text-center font-semibold text-xs uppercase tracking-wider">売上A</th>
                  <th className="border p-2 bg-muted/60 text-center font-semibold text-xs uppercase tracking-wider">売上B</th>
                  <th className="border p-2 bg-muted/60 text-center font-semibold text-xs uppercase tracking-wider">売上C</th>
                </tr>
              </thead>
              <tbody>
                {(["A", "B", "C"] as const).map((profitRank) => (
                  <tr key={profitRank}>
                    <td className="border p-2 bg-muted/60 font-semibold text-xs uppercase tracking-wider">利益{profitRank}</td>
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
                          className={`border p-3 text-center rounded-sm ${cellStyle}`}
                        >
                          <div className="text-xs font-medium">{cellLabel}</div>
                          <div className="text-lg font-bold tabular-nums">{count}</div>
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
      <Card className="shadow-sm hover:shadow-md transition-all duration-200 rounded-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="size-8 rounded-lg bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center">
              <AlertTriangle className="size-4 text-amber-600 dark:text-amber-400" />
            </div>
            メニュー改廃アドバイス
          </CardTitle>
          <CardDescription>
            各商品の推奨アクションをタブで切り替えて確認できます
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue={0}>
            <TabsList className="flex-wrap bg-muted/40 p-1 rounded-lg">
              <TabsTrigger value={0} className="transition-all data-[state=active]:font-semibold data-[state=active]:shadow-sm">
                全体
                <Badge variant="secondary" className="ml-1 text-[10px] px-1.5 py-0">
                  {tabCounts.all}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value={1} className="transition-all data-[state=active]:font-semibold data-[state=active]:shadow-sm">
                強化推奨
                <Badge variant="secondary" className="ml-1 text-[10px] px-1.5 py-0 bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400">
                  {tabCounts.promote}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value={2} className="transition-all data-[state=active]:font-semibold data-[state=active]:shadow-sm">
                価格見直し
                <Badge variant="secondary" className="ml-1 text-[10px] px-1.5 py-0 bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400">
                  {tabCounts.review_price}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value={3} className="transition-all data-[state=active]:font-semibold data-[state=active]:shadow-sm">
                原価改善
                <Badge variant="secondary" className="ml-1 text-[10px] px-1.5 py-0 bg-orange-50 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400">
                  {tabCounts.reduce_cost}
                </Badge>
              </TabsTrigger>
              <TabsTrigger value={4} className="transition-all data-[state=active]:font-semibold data-[state=active]:shadow-sm">
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
      <Card className="shadow-sm hover:shadow-md transition-all duration-200 rounded-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="size-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center">
              <Trophy className="size-4 text-indigo-600 dark:text-indigo-400" />
            </div>
            売れ筋ランキング TOP20
          </CardTitle>
          <CardDescription>
            過去90日間の売上金額で並べた上位20商品
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
                  <TableHead className="text-right font-semibold text-xs uppercase tracking-wider">数量</TableHead>
                  <TableHead className="text-right font-semibold text-xs uppercase tracking-wider">売上</TableHead>
                  <TableHead className="text-right font-semibold text-xs uppercase tracking-wider">推定原価率</TableHead>
                  <TableHead className="text-center font-semibold text-xs uppercase tracking-wider">売上ABC</TableHead>
                  <TableHead className="text-center font-semibold text-xs uppercase tracking-wider">利益ABC</TableHead>
                  <TableHead className="font-semibold text-xs uppercase tracking-wider">判定</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topByRevenue.map((item, i) => (
                  <TableRow key={item.product_id} className={i % 2 === 0 ? "bg-muted/20" : ""}>
                    <TableCell className="font-mono text-xs text-muted-foreground font-bold tabular-nums">
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
                    <TableCell className="text-right tabular-nums font-medium">
                      {formatNumber(item.total_quantity)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums font-medium">
                      {formatYen(item.total_sales)}
                    </TableCell>
                    <TableCell className="text-right">
                      <CostRatioBadge ratio={item.cost_ratio} />
                    </TableCell>
                    <TableCell className="text-center">
                      <AbcBadge rank={item.abc_sales} />
                    </TableCell>
                    <TableCell className="text-center">
                      <AbcBadge rank={item.abc_profit} />
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
      <Card className="shadow-sm hover:shadow-md transition-all duration-200 rounded-xl border-red-100 dark:border-red-900/30 bg-gradient-to-br from-red-50/30 to-white dark:from-red-950/10 dark:to-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="size-8 rounded-lg bg-red-100 dark:bg-red-900/40 flex items-center justify-center">
              <PackageX className="size-4 text-red-500" />
            </div>
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
              <div className="rounded-xl border overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="font-semibold text-xs uppercase tracking-wider">商品名</TableHead>
                      <TableHead className="font-semibold text-xs uppercase tracking-wider">カテゴリ</TableHead>
                      <TableHead className="text-right font-semibold text-xs uppercase tracking-wider">設定価格</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {deadStock.map((item, i) => (
                      <TableRow key={item.product_id} className={i % 2 === 0 ? "bg-muted/20" : ""}>
                        <TableCell className="font-medium">
                          {item.product_name}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="text-[10px]">
                            {item.category_name}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right tabular-nums font-medium">
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
