"use client"

import { useState } from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import {
  Wine,
  UtensilsCrossed,
  Wind,
  Package,
  AlertTriangle,
  LayoutGrid,
  CookingPot,
  GlassWater,
  Boxes,
} from "lucide-react"

// ── Types ──

type MenuProduct = {
  product_id: string
  product_name: string
  category_name: string
  price: number
  display_flag: string
  sales_quantity: number
  sales_revenue: number
  has_sales: boolean
}

type MenuSection = {
  key: string
  label: string
  items: MenuProduct[]
}

type SummaryData = {
  activeMenuCount: number
  drinkCount: number
  foodCount: number
  avgSpendPerTransaction: number
  deadStockCount: number
}

interface GrandMenuViewProps {
  drinkSections: MenuSection[]
  foodSections: MenuSection[]
  shishaSections: MenuSection[]
  otherSections: MenuSection[]
  summary: SummaryData
}

// ── Helpers ──

function formatYen(v: number): string {
  return new Intl.NumberFormat("ja-JP", {
    style: "currency",
    currency: "JPY",
    maximumFractionDigits: 0,
  }).format(v)
}

function SectionIcon({ group }: { group: string }) {
  switch (group) {
    case "drink":
      return <Wine className="size-4" />
    case "food":
      return <UtensilsCrossed className="size-4" />
    case "shisha":
      return <Wind className="size-4" />
    default:
      return <Package className="size-4" />
  }
}

// Category header color strips
function getCategoryHeaderColor(group: string): string {
  switch (group) {
    case "drink":
      return "bg-gradient-to-r from-indigo-500/10 to-transparent border-l-4 border-l-indigo-500"
    case "food":
      return "bg-gradient-to-r from-amber-500/10 to-transparent border-l-4 border-l-amber-500"
    case "shisha":
      return "bg-gradient-to-r from-emerald-500/10 to-transparent border-l-4 border-l-emerald-500"
    default:
      return "bg-gradient-to-r from-gray-500/10 to-transparent border-l-4 border-l-gray-400"
  }
}

// ── Main component ──

export function GrandMenuView({
  drinkSections,
  foodSections,
  shishaSections,
  otherSections,
  summary,
}: GrandMenuViewProps) {
  const [activeTab, setActiveTab] = useState("drink")

  const tabGroups = [
    {
      key: "drink",
      label: "ドリンクメニュー",
      sections: drinkSections,
      icon: <GlassWater className="size-4" />,
    },
    {
      key: "food",
      label: "フードメニュー",
      sections: foodSections,
      icon: <CookingPot className="size-4" />,
    },
    {
      key: "shisha",
      label: "シーシャ",
      sections: shishaSections,
      icon: <Wind className="size-4" />,
    },
    {
      key: "other",
      label: "その他",
      sections: otherSections,
      icon: <Boxes className="size-4" />,
    },
  ]

  const totalItemsInTab = (sections: MenuSection[]) =>
    sections.reduce((sum, s) => sum + s.items.length, 0)

  return (
    <div className="space-y-6">
      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="shadow-sm hover:shadow-md transition-all duration-200 rounded-xl bg-gradient-to-br from-indigo-50/80 to-white dark:from-indigo-950/20 dark:to-card border-indigo-100 dark:border-indigo-900/30">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription>提供中メニュー数</CardDescription>
            <div className="size-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center">
              <LayoutGrid className="size-4 text-indigo-600 dark:text-indigo-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl md:text-3xl font-bold tabular-nums">
              {summary.activeMenuCount}
            </div>
            <p className="text-xs text-muted-foreground">
              表示中 & 90日以内に売上あり
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-sm hover:shadow-md transition-all duration-200 rounded-xl bg-gradient-to-br from-blue-50/80 to-white dark:from-blue-950/20 dark:to-card border-blue-100 dark:border-blue-900/30">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription>ドリンク数</CardDescription>
            <div className="size-8 rounded-lg bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
              <GlassWater className="size-4 text-blue-600 dark:text-blue-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl md:text-3xl font-bold tabular-nums">{summary.drinkCount}</div>
            <p className="text-xs text-muted-foreground">
              アルコール + ソフトドリンク
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-sm hover:shadow-md transition-all duration-200 rounded-xl bg-gradient-to-br from-amber-50/80 to-white dark:from-amber-950/20 dark:to-card border-amber-100 dark:border-amber-900/30">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription>フード数</CardDescription>
            <div className="size-8 rounded-lg bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center">
              <CookingPot className="size-4 text-amber-600 dark:text-amber-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl md:text-3xl font-bold tabular-nums">{summary.foodCount}</div>
            <p className="text-xs text-muted-foreground">
              フード + かき氷
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-sm hover:shadow-md transition-all duration-200 rounded-xl bg-gradient-to-br from-emerald-50/80 to-white dark:from-emerald-950/20 dark:to-card border-emerald-100 dark:border-emerald-900/30">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardDescription>平均客単価</CardDescription>
            <div className="size-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
              <Wine className="size-4 text-emerald-600 dark:text-emerald-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl md:text-3xl font-bold tabular-nums">
              {formatYen(summary.avgSpendPerTransaction)}
            </div>
            <p className="text-xs text-muted-foreground">
              90日間の総売上 / 取引数
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Menu tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full justify-start flex-wrap h-auto gap-1 bg-muted/40 p-1.5 rounded-xl">
          {tabGroups.map((g) => (
            <TabsTrigger key={g.key} value={g.key} className="gap-1.5 transition-all data-[state=active]:font-semibold data-[state=active]:shadow-sm">
              {g.icon}
              <span>{g.label}</span>
              <Badge variant="secondary" className="ml-1 text-[10px] px-1.5 h-4">
                {totalItemsInTab(g.sections)}
              </Badge>
            </TabsTrigger>
          ))}
        </TabsList>

        {tabGroups.map((g) => (
          <TabsContent key={g.key} value={g.key}>
            <div className="space-y-6 pt-2">
              {g.sections.map((section) => (
                <SectionCard
                  key={section.key}
                  section={section}
                  group={g.key}
                />
              ))}
              {g.sections.length === 0 && (
                <p className="text-sm text-muted-foreground py-8 text-center">
                  該当カテゴリのメニューはありません
                </p>
              )}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* Dead stock alert */}
      {summary.deadStockCount > 0 && (
        <Card className="shadow-sm hover:shadow-md transition-all duration-200 rounded-xl border-amber-200 dark:border-amber-900/50 bg-gradient-to-br from-amber-50/40 to-white dark:from-amber-950/10 dark:to-card">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="size-8 rounded-lg bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center">
                <AlertTriangle className="size-4 text-amber-500" />
              </div>
              <CardTitle className="text-base">デッドストック警告</CardTitle>
            </div>
            <CardDescription>
              メニューに掲載中だが90日間売上ゼロの商品:{" "}
              <span className="font-semibold text-amber-600">
                {summary.deadStockCount}件
              </span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              下のグリッドで灰色ドットの商品がデッドストックです。メニューからの削除または価格・提案の見直しを検討してください。
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// ── Section card ──

function SectionCard({
  section,
  group,
}: {
  section: MenuSection
  group: string
}) {
  return (
    <Card className="shadow-sm hover:shadow-md transition-all duration-200 rounded-xl overflow-hidden">
      <CardHeader className={`pb-3 ${getCategoryHeaderColor(group)}`}>
        <div className="flex items-center gap-2">
          <SectionIcon group={group} />
          <CardTitle className="text-base">{section.label}</CardTitle>
          <Badge variant="outline" className="ml-1">
            {section.items.length}品
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <ScrollArea className="max-h-[500px]">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
            {section.items.map((item) => (
              <MenuItemCard key={item.product_id} item={item} />
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

// ── Menu item card ──

function MenuItemCard({ item }: { item: MenuProduct }) {
  return (
    <div
      className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm hover:scale-[1.02] transition-all duration-200 cursor-default ${
        item.has_sales
          ? "hover:shadow-sm hover:border-indigo-200 dark:hover:border-indigo-800"
          : "bg-red-50/50 dark:bg-red-950/10 border-red-100 dark:border-red-900/20"
      }`}
    >
      <span
        className={`size-2 shrink-0 rounded-full ${
          item.has_sales
            ? "bg-emerald-500"
            : "bg-gray-300 dark:bg-gray-600"
        }`}
        title={item.has_sales ? "売上あり" : "売上なし（90日間）"}
      />
      <span className="flex-1 truncate" title={item.product_name}>
        {item.product_name}
      </span>
      <span className="shrink-0 tabular-nums font-medium text-muted-foreground">
        {formatYen(item.price)}
      </span>
    </div>
  )
}
