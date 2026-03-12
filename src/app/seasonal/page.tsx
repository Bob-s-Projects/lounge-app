import { SidebarTrigger } from "@/components/ui/sidebar"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import {
  Cherry,
  Sun,
  Leaf,
  Snowflake,
  IceCreamCone,
  Lightbulb,
  FlaskConical,
  CheckCircle2,
  ExternalLink,
} from "lucide-react"

// ── Static data ──

const SEASONS = [
  {
    key: "spring",
    label: "春",
    period: "3月〜5月",
    theme: "桜・新緑",
    examples: "桜モヒート、いちごスパークリング、春フルーツカクテル",
    color: "bg-pink-50 dark:bg-pink-950/30 border-pink-200 dark:border-pink-800",
    badgeColor: "bg-pink-100 text-pink-700 dark:bg-pink-900/50 dark:text-pink-300",
    icon: Cherry,
  },
  {
    key: "summer",
    label: "夏",
    period: "6月〜8月",
    theme: "かき氷・トロピカル",
    examples: "かき氷各種、トロピカルドリンク、フローズンカクテル",
    color: "bg-sky-50 dark:bg-sky-950/30 border-sky-200 dark:border-sky-800",
    badgeColor: "bg-sky-100 text-sky-700 dark:bg-sky-900/50 dark:text-sky-300",
    icon: Sun,
  },
  {
    key: "autumn",
    label: "秋",
    period: "9月〜11月",
    theme: "秋の味覚",
    examples: "モンブランラテ、巨峰スパークリング、栗カクテル",
    color: "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800",
    badgeColor: "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300",
    icon: Leaf,
  },
  {
    key: "winter",
    label: "冬",
    period: "12月〜2月",
    theme: "ホットドリンク・クリスマス",
    examples: "ホットバタードラム、グリューワイン、ホットカクテル",
    color: "bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800",
    badgeColor: "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300",
    icon: Snowflake,
  },
]

const KAKIGORI_ITEMS = [
  { name: "いちごミルクかき氷", price: 1500, estimatedCost: 320, costRatio: 21.3 },
  { name: "マンゴーかき氷", price: 1500, estimatedCost: 350, costRatio: 23.3 },
  { name: "抹茶かき氷", price: 1500, estimatedCost: 280, costRatio: 18.7 },
  { name: "ブルーハワイかき氷", price: 1200, estimatedCost: 200, costRatio: 16.7 },
  { name: "レモンかき氷", price: 1200, estimatedCost: 180, costRatio: 15.0 },
]

function formatYen(v: number): string {
  return `\u00a5${v.toLocaleString("ja-JP")}`
}

// ── Current season logic ──

function getCurrentSeason(): string {
  const month = 3 // March 2026
  if (month >= 3 && month <= 5) return "spring"
  if (month >= 6 && month <= 8) return "summer"
  if (month >= 9 && month <= 11) return "autumn"
  return "winter"
}

// ── Page ──

export default function SeasonalPage() {
  const currentSeason = getCurrentSeason()

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="md:hidden" />
        <div>
          <h1 className="text-2xl font-bold tracking-tight">季節メニュー</h1>
          <p className="text-sm text-muted-foreground">
            季節限定メニューの企画・管理
          </p>
        </div>
      </div>

      {/* Current season card */}
      <Card className="border-pink-200 dark:border-pink-800 bg-gradient-to-r from-pink-50/50 to-transparent dark:from-pink-950/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-pink-100 dark:bg-pink-900/50">
                <Cherry className="size-5 text-pink-600 dark:text-pink-400" />
              </div>
              <div>
                <CardTitle className="text-xl">2026年 春メニュー</CardTitle>
                <CardDescription>期間: 3月〜5月</CardDescription>
              </div>
            </div>
            <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/50 dark:text-emerald-300 dark:border-emerald-800">
              提供中
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            テーマ: 桜・新緑 / 桜モヒート、いちごスパークリング、春フルーツカクテルなど提供予定
          </p>
        </CardContent>
      </Card>

      {/* Seasonal timeline */}
      <Card>
        <CardHeader>
          <CardTitle>年間シーズンプラン</CardTitle>
          <CardDescription>
            季節ごとのメニューテーマと主要アイテム
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {SEASONS.map((season) => {
              const Icon = season.icon
              const isCurrent = season.key === currentSeason
              return (
                <div
                  key={season.key}
                  className={`rounded-xl border p-4 transition-all ${
                    season.color
                  } ${isCurrent ? "ring-2 ring-offset-2 ring-pink-400 dark:ring-pink-600" : ""}`}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Icon className="size-5" />
                    <span className="font-semibold text-base">
                      {season.label}
                    </span>
                    <span
                      className={`ml-auto inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${season.badgeColor}`}
                    >
                      {season.period}
                    </span>
                  </div>
                  <div className="space-y-1.5 text-sm">
                    <div>
                      <span className="text-muted-foreground">テーマ: </span>
                      <span className="font-medium">{season.theme}</span>
                    </div>
                    <div className="text-muted-foreground text-xs leading-relaxed">
                      {season.examples}
                    </div>
                  </div>
                  {isCurrent && (
                    <div className="mt-3">
                      <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/50 dark:text-emerald-300 text-[10px]">
                        現在のシーズン
                      </Badge>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Kakigori section */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <IceCreamCone className="size-5 text-sky-500" />
            <div>
              <CardTitle>かき氷メニュー（夏季限定 6月〜9月）</CardTitle>
              <CardDescription>
                夏季の主力メニュー - 原価率・価格設定の計画
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            <a
              href="https://ledian-menu-dashboard.pages.dev/kakigori.html"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm font-medium hover:bg-accent transition-colors"
            >
              <IceCreamCone className="size-4" />
              春かき氷レシピ集
              <ExternalLink className="size-3 text-muted-foreground" />
            </a>
            <a
              href="https://ledian-menu-dashboard.pages.dev/recipes.html"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm font-medium hover:bg-accent transition-colors"
            >
              全レシピを見る
              <ExternalLink className="size-3 text-muted-foreground" />
            </a>
          </div>
          <div className="rounded-lg border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>商品名</TableHead>
                  <TableHead className="text-right">予定価格</TableHead>
                  <TableHead className="text-right">推定原価</TableHead>
                  <TableHead className="text-right">推定原価率</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {KAKIGORI_ITEMS.map((item) => (
                  <TableRow key={item.name}>
                    <TableCell className="font-medium">
                      {item.name}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatYen(item.price)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatYen(item.estimatedCost)}
                    </TableCell>
                    <TableCell className="text-right">
                      <span
                        className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${
                          item.costRatio < 20
                            ? "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-400"
                            : "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20 dark:bg-amber-500/10 dark:text-amber-400"
                        }`}
                      >
                        {item.costRatio.toFixed(1)}%
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Planning section */}
      <div>
        <h2 className="text-lg font-semibold mb-4">新メニュー企画</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Lightbulb className="size-4 text-amber-500" />
                <CardDescription>企画中のメニュー</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3</div>
              <p className="text-xs text-muted-foreground">
                アイデア・調査段階
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <FlaskConical className="size-4 text-blue-500" />
                <CardDescription>試作中</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1</div>
              <p className="text-xs text-muted-foreground">
                レシピ・原価検証中
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="size-4 text-emerald-500" />
                <CardDescription>採用決定</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">
                提供開始待ち
              </p>
            </CardContent>
          </Card>
        </div>
        <p className="mt-3 text-sm text-muted-foreground">
          新メニューの企画・承認フローは今後実装予定
        </p>
      </div>
    </div>
  )
}
