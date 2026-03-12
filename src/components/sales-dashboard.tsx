"use client"

import { useState, useMemo } from "react"
import {
  Bar,
  BarChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Cell,
} from "recharts"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react"

// ── Types ──

export type SalesProductItem = {
  product_id: string
  product_name: string
  category_name: string
  total_quantity: number
  total_sales: number
  transaction_count: number
  avg_price: number
}

type CategorySales = {
  category: string
  revenue: number
  quantity: number
  productCount: number
}

interface SalesDashboardProps {
  products: SalesProductItem[]
  totalRevenue: number
  totalTransactions: number
  periodFrom: string
  periodTo: string
}

// ── Helpers ──

function formatYen(v: number): string {
  return new Intl.NumberFormat("ja-JP", {
    style: "currency",
    currency: "JPY",
    maximumFractionDigits: 0,
  }).format(v)
}

function formatCompactYen(v: number): string {
  if (v >= 1_000_000) {
    return `\u00a5${(v / 1_000_000).toFixed(1)}M`
  }
  if (v >= 10_000) {
    return `\u00a5${(v / 10_000).toFixed(1)}万`
  }
  return formatYen(v)
}

function formatNumber(v: number): string {
  return new Intl.NumberFormat("ja-JP").format(v)
}

// Chart colors
const CHART_COLORS = [
  "hsl(221, 83%, 53%)",
  "hsl(262, 83%, 58%)",
  "hsl(330, 81%, 60%)",
  "hsl(25, 95%, 53%)",
  "hsl(142, 71%, 45%)",
  "hsl(199, 89%, 48%)",
  "hsl(47, 96%, 53%)",
  "hsl(0, 72%, 51%)",
  "hsl(180, 70%, 45%)",
  "hsl(300, 60%, 50%)",
]

const chartConfig: ChartConfig = {
  revenue: {
    label: "売上",
    color: "hsl(221, 83%, 53%)",
  },
}

// Sort types
type SortKey = "rank" | "quantity" | "revenue" | "transaction_count" | "avg_price"
type SortDir = "asc" | "desc"

// ── Main component ──

export function SalesDashboard({
  products,
  totalRevenue,
  totalTransactions,
  periodFrom,
  periodTo,
}: SalesDashboardProps) {
  const [sortKey, setSortKey] = useState<SortKey>("revenue")
  const [sortDir, setSortDir] = useState<SortDir>("desc")

  // Aggregate by category
  const categoryData = useMemo(() => {
    const map = new Map<string, CategorySales>()
    for (const p of products) {
      const existing = map.get(p.category_name)
      if (existing) {
        existing.revenue += p.total_sales
        existing.quantity += p.total_quantity
        existing.productCount += 1
      } else {
        map.set(p.category_name, {
          category: p.category_name,
          revenue: p.total_sales,
          quantity: p.total_quantity,
          productCount: 1,
        })
      }
    }
    return Array.from(map.values()).sort((a, b) => b.revenue - a.revenue)
  }, [products])

  // Top 10 categories for chart
  const top10Categories = categoryData.slice(0, 10)

  // Unique categories for tabs
  const categories = categoryData.map((c) => c.category)

  // Sorted top 30 for table
  const top30 = useMemo(() => {
    const sorted = [...products].sort((a, b) => b.total_sales - a.total_sales)
    return sorted.slice(0, 30)
  }, [products])

  // Sortable top 30
  const sortedTop30 = useMemo(() => {
    const items = [...top30]
    items.sort((a, b) => {
      let aVal: number, bVal: number
      switch (sortKey) {
        case "quantity":
          aVal = a.total_quantity
          bVal = b.total_quantity
          break
        case "revenue":
          aVal = a.total_sales
          bVal = b.total_sales
          break
        case "transaction_count":
          aVal = a.transaction_count
          bVal = b.transaction_count
          break
        case "avg_price":
          aVal = a.avg_price
          bVal = b.avg_price
          break
        default:
          aVal = a.total_sales
          bVal = b.total_sales
      }
      return sortDir === "desc" ? bVal - aVal : aVal - bVal
    })
    return items
  }, [top30, sortKey, sortDir])

  // Category tab selection
  const [activeCategory, setActiveCategory] = useState(categories[0] ?? "")

  const categoryProducts = useMemo(() => {
    return products
      .filter((p) => p.category_name === activeCategory)
      .sort((a, b) => b.total_sales - a.total_sales)
  }, [products, activeCategory])

  const uniqueProductCount = products.filter((p) => p.total_sales > 0).length
  const avgSpend =
    totalTransactions > 0 ? Math.round(totalRevenue / totalTransactions) : 0

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === "desc" ? "asc" : "desc"))
    } else {
      setSortKey(key)
      setSortDir("desc")
    }
  }

  function SortIcon({ column }: { column: SortKey }) {
    if (sortKey !== column) return <ArrowUpDown className="size-3 ml-1" />
    return sortDir === "desc" ? (
      <ArrowDown className="size-3 ml-1" />
    ) : (
      <ArrowUp className="size-3 ml-1" />
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>総売上</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCompactYen(totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              {formatYen(totalRevenue)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>取引数</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatNumber(totalTransactions)}
            </div>
            <p className="text-xs text-muted-foreground">
              {periodFrom} 〜 {periodTo}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>平均客単価</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatYen(avgSpend)}</div>
            <p className="text-xs text-muted-foreground">
              総売上 / 取引数
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>商品数</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{uniqueProductCount}</div>
            <p className="text-xs text-muted-foreground">
              売上のあるユニーク商品
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Category chart */}
      <Card>
        <CardHeader>
          <CardTitle>カテゴリ別売上ランキング</CardTitle>
          <CardDescription>
            売上金額の上位10カテゴリ
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={chartConfig}
            className="h-[400px] w-full"
          >
            <BarChart
              data={top10Categories}
              layout="vertical"
              margin={{ top: 5, right: 30, bottom: 5, left: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis
                type="number"
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => formatCompactYen(v)}
              />
              <YAxis
                type="category"
                dataKey="category"
                tickLine={false}
                axisLine={false}
                width={180}
                tick={{ fontSize: 11 }}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(value) => [
                      formatYen(value as number),
                      "売上",
                    ]}
                  />
                }
              />
              <Bar dataKey="revenue" radius={[0, 4, 4, 0]}>
                {top10Categories.map((_, index) => (
                  <Cell
                    key={`cat-${index}`}
                    fill={CHART_COLORS[index % CHART_COLORS.length]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Top 30 table */}
      <Card>
        <CardHeader>
          <CardTitle>売れ筋商品 TOP30</CardTitle>
          <CardDescription>
            売上金額順の上位30商品（ヘッダークリックでソート切替）
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
                  <TableHead
                    className="text-right cursor-pointer select-none"
                    onClick={() => handleSort("quantity")}
                  >
                    <span className="inline-flex items-center">
                      数量
                      <SortIcon column="quantity" />
                    </span>
                  </TableHead>
                  <TableHead
                    className="text-right cursor-pointer select-none"
                    onClick={() => handleSort("revenue")}
                  >
                    <span className="inline-flex items-center">
                      売上
                      <SortIcon column="revenue" />
                    </span>
                  </TableHead>
                  <TableHead
                    className="text-right cursor-pointer select-none"
                    onClick={() => handleSort("avg_price")}
                  >
                    <span className="inline-flex items-center">
                      平均単価
                      <SortIcon column="avg_price" />
                    </span>
                  </TableHead>
                  <TableHead
                    className="text-right cursor-pointer select-none"
                    onClick={() => handleSort("transaction_count")}
                  >
                    <span className="inline-flex items-center">
                      取引数
                      <SortIcon column="transaction_count" />
                    </span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedTop30.map((item, i) => (
                  <TableRow key={item.product_id}>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {i + 1}
                    </TableCell>
                    <TableCell className="font-medium">
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
                    <TableCell className="text-right tabular-nums">
                      {formatYen(item.total_sales)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatYen(item.avg_price)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatNumber(item.transaction_count)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Category detail tabs */}
      <Card>
        <CardHeader>
          <CardTitle>カテゴリ別詳細</CardTitle>
          <CardDescription>
            カテゴリを選択して商品別の売上を確認
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs
            value={activeCategory}
            onValueChange={setActiveCategory}
          >
            <ScrollArea className="w-full">
              <TabsList className="w-full justify-start flex-wrap h-auto gap-1">
                {categories.map((cat) => (
                  <TabsTrigger key={cat} value={cat} className="text-xs">
                    {cat}
                  </TabsTrigger>
                ))}
              </TabsList>
            </ScrollArea>

            {categories.map((cat) => (
              <TabsContent key={cat} value={cat}>
                <div className="rounded-lg border overflow-x-auto mt-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">#</TableHead>
                        <TableHead>商品名</TableHead>
                        <TableHead className="text-right">数量</TableHead>
                        <TableHead className="text-right">売上</TableHead>
                        <TableHead className="text-right">平均単価</TableHead>
                        <TableHead className="text-right">取引数</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {cat === activeCategory &&
                        categoryProducts.map((item, i) => (
                          <TableRow key={item.product_id}>
                            <TableCell className="font-mono text-xs text-muted-foreground">
                              {i + 1}
                            </TableCell>
                            <TableCell className="font-medium">
                              {item.product_name}
                            </TableCell>
                            <TableCell className="text-right tabular-nums">
                              {formatNumber(item.total_quantity)}
                            </TableCell>
                            <TableCell className="text-right tabular-nums">
                              {formatYen(item.total_sales)}
                            </TableCell>
                            <TableCell className="text-right tabular-nums">
                              {formatYen(item.avg_price)}
                            </TableCell>
                            <TableCell className="text-right tabular-nums">
                              {formatNumber(item.transaction_count)}
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
