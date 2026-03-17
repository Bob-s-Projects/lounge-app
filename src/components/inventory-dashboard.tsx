"use client"

import { useState, useMemo, useTransition } from "react"
import Link from "next/link"
import { Button, buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Search,
  ClipboardCheck,
  ArrowDownUp,
  Trash2,
  Edit3,
  History,
  AlertTriangle,
  Package,
  TrendingUp,
  TrendingDown,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { EmptyState } from "@/components/empty-state"
import { InventoryForm } from "@/components/inventory-form"
import type { InventoryItem, InventoryLog } from "@/app/inventory/actions"
import {
  recordStockChange,
  deleteInventoryItem,
  getInventoryLogs,
} from "@/app/inventory/actions"

interface InventoryDashboardProps {
  items: InventoryItem[]
}

const CHANGE_TYPES = [
  { value: "入荷", label: "入荷", icon: TrendingUp, color: "text-emerald-600" },
  { value: "消費", label: "消費", icon: TrendingDown, color: "text-amber-600" },
  { value: "廃棄", label: "廃棄", icon: Trash2, color: "text-red-600" },
  { value: "移動", label: "移動", icon: ArrowDownUp, color: "text-blue-600" },
]

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "\u2014"
  return new Date(dateStr).toLocaleDateString("ja-JP", {
    month: "short",
    day: "numeric",
  })
}

function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString("ja-JP", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function stockStatusBadge(current: number, parLevel: number | null) {
  if (parLevel === null) {
    return <Badge variant="secondary">-</Badge>
  }
  if (current <= 0) {
    return (
      <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
        欠品
      </Badge>
    )
  }
  if (current < parLevel) {
    return (
      <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
        要発注
      </Badge>
    )
  }
  return (
    <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
      適正
    </Badge>
  )
}

function stockBarColor(current: number, parLevel: number | null): string {
  if (parLevel === null || parLevel === 0) return "bg-muted"
  const ratio = current / parLevel
  if (ratio >= 1.5) return "bg-emerald-500"
  if (ratio >= 1) return "bg-emerald-400"
  if (ratio >= 0.5) return "bg-amber-400"
  return "bg-red-500"
}

// ---------- Stock Adjustment Dialog ----------

function StockAdjustDialog({
  item,
  onSuccess,
}: {
  item: InventoryItem
  onSuccess: () => void
}) {
  const [open, setOpen] = useState(false)
  const [changeType, setChangeType] = useState("入荷")
  const [quantity, setQuantity] = useState("")
  const [note, setNote] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const qty = Number(quantity)
    if (!qty || qty <= 0) {
      setError("数量を正しく入力してください")
      return
    }
    setLoading(true)
    setError(null)

    const result = await recordStockChange(item.id, changeType, qty, note || undefined)
    if (result.success) {
      setOpen(false)
      setQuantity("")
      setNote("")
      setChangeType("入荷")
      onSuccess()
    } else {
      setError(result.error ?? "更新に失敗しました")
    }
    setLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={
        <Button variant="ghost" size="icon-xs" title="在庫増減">
          <ArrowDownUp className="size-3.5" />
        </Button>
      } />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>在庫増減: {item.name}</DialogTitle>
          <DialogDescription>
            現在の在庫: {item.current_stock} {item.unit}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>変動種別</Label>
              <Select value={changeType} onValueChange={(v) => setChangeType(v ?? "入荷")}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CHANGE_TYPES.map((ct) => (
                    <SelectItem key={ct.value} value={ct.value}>
                      {ct.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>数量</Label>
              <Input
                type="number"
                step="0.1"
                min="0.1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="0"
                required
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>メモ</Label>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="備考..."
              className="min-h-10"
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>
              キャンセル
            </DialogClose>
            <Button type="submit" disabled={loading}>
              {loading ? "処理中..." : "記録"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ---------- History Dialog ----------

function HistoryDialog({ item }: { item: InventoryItem }) {
  const [open, setOpen] = useState(false)
  const [logs, setLogs] = useState<InventoryLog[]>([])
  const [loading, setLoading] = useState(false)

  async function loadLogs() {
    setLoading(true)
    try {
      const data = await getInventoryLogs(item.id)
      setLogs(data)
    } catch {
      // ignore
    }
    setLoading(false)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        setOpen(val)
        if (val) loadLogs()
      }}
    >
      <DialogTrigger render={
        <Button variant="ghost" size="icon-xs" title="履歴">
          <History className="size-3.5" />
        </Button>
      } />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>変動履歴: {item.name}</DialogTitle>
          <DialogDescription>直近の在庫変動記録</DialogDescription>
        </DialogHeader>
        {loading ? (
          <p className="text-sm text-muted-foreground py-4 text-center">
            読み込み中...
          </p>
        ) : logs.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">
            まだ変動記録がありません
          </p>
        ) : (
          <div className="max-h-64 overflow-y-auto -mx-4 px-4">
            <div className="space-y-2">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between rounded-lg border px-3 py-2"
                >
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="secondary"
                      className={
                        log.change_type === "入荷"
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                          : log.change_type === "廃棄"
                            ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                            : log.change_type === "棚卸"
                              ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                              : ""
                      }
                    >
                      {log.change_type}
                    </Badge>
                    <span className="text-sm tabular-nums font-medium">
                      {log.quantity > 0 ? "+" : ""}
                      {log.quantity}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-muted-foreground">
                      {formatDateTime(log.created_at)}
                    </span>
                    {log.note && (
                      <p className="text-xs text-muted-foreground truncate max-w-[120px]">
                        {log.note}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>
            閉じる
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ---------- Delete Confirmation ----------

function DeleteDialog({
  item,
  onSuccess,
}: {
  item: InventoryItem
  onSuccess: () => void
}) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    setLoading(true)
    const result = await deleteInventoryItem(item.id)
    if (result.success) {
      setOpen(false)
      onSuccess()
    }
    setLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={
        <Button variant="ghost" size="icon-xs" title="削除">
          <Trash2 className="size-3.5 text-muted-foreground hover:text-destructive" />
        </Button>
      } />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>在庫品目を削除</DialogTitle>
          <DialogDescription>
            「{item.name}」を削除しますか？関連する変動履歴もすべて削除されます。
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>
            キャンセル
          </DialogClose>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={loading}
          >
            {loading ? "削除中..." : "削除"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ---------- Main Dashboard Component ----------

export function InventoryDashboard({ items }: InventoryDashboardProps) {
  const [search, setSearch] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("__all__")
  const [, startTransition] = useTransition()

  const categories = useMemo(() => {
    const cats = Array.from(new Set(items.map((i) => i.category))).sort()
    return cats
  }, [items])

  const filtered = useMemo(() => {
    let result = items
    if (categoryFilter !== "__all__") {
      result = result.filter((i) => i.category === categoryFilter)
    }
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(
        (i) =>
          i.name.toLowerCase().includes(q) ||
          i.category.toLowerCase().includes(q) ||
          (i.location ?? "").toLowerCase().includes(q)
      )
    }
    return result
  }, [items, categoryFilter, search])

  const belowParItems = items.filter(
    (i) => i.par_level !== null && i.current_stock < i.par_level
  )

  function handleRefresh() {
    startTransition(() => {
      // Trigger revalidation through router
      window.location.reload()
    })
  }

  // Empty state
  if (items.length === 0) {
    return (
      <EmptyState
        icon={Package}
        title="在庫品目がありません"
        description="在庫品目を登録して、在庫管理を始めましょう。仕入品目から一括インポートすることもできます。"
        action={
          <div className="flex flex-col items-center gap-3 sm:flex-row">
            <InventoryForm onSuccess={handleRefresh} />
          </div>
        }
      />
    )
  }

  return (
    <div className="space-y-4">
      {/* Alert banner for below-par items */}
      {belowParItems.length > 0 && (
        <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-800/50 dark:bg-amber-950/20">
          <AlertTriangle className="size-4 text-amber-600 shrink-0" />
          <span className="text-sm text-amber-800 dark:text-amber-300">
            <strong>{belowParItems.length}品目</strong>が発注点を下回っています:
            {" "}
            {belowParItems
              .slice(0, 3)
              .map((i) => i.name)
              .join("、")}
            {belowParItems.length > 3 && ` 他${belowParItems.length - 3}品目`}
          </span>
        </div>
      )}

      {/* Controls */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="品名・カテゴリ・保管場所で検索..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex items-center gap-2">
          <Select value={categoryFilter} onValueChange={(v) => setCategoryFilter(v ?? "__all__")}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="カテゴリで絞り込み" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">すべてのカテゴリ</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="text-sm text-muted-foreground whitespace-nowrap tabular-nums">
            {filtered.length} 件
          </span>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-2">
        <InventoryForm onSuccess={handleRefresh} />
        <Link
          href="/inventory/stocktake"
          className={cn(buttonVariants({ variant: "outline", size: "sm" }), "gap-1.5")}
        >
          <ClipboardCheck className="size-4" />
          棚卸し開始
        </Link>
      </div>

      {/* Table */}
      <div className="rounded-xl border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="font-semibold text-xs uppercase tracking-wider">
                品名
              </TableHead>
              <TableHead className="font-semibold text-xs uppercase tracking-wider">
                カテゴリ
              </TableHead>
              <TableHead className="font-semibold text-xs uppercase tracking-wider text-right">
                在庫数
              </TableHead>
              <TableHead className="font-semibold text-xs uppercase tracking-wider text-right">
                発注点
              </TableHead>
              <TableHead className="font-semibold text-xs uppercase tracking-wider hidden md:table-cell">
                保管場所
              </TableHead>
              <TableHead className="font-semibold text-xs uppercase tracking-wider hidden lg:table-cell">
                最終棚卸
              </TableHead>
              <TableHead className="font-semibold text-xs uppercase tracking-wider">
                状態
              </TableHead>
              <TableHead className="font-semibold text-xs uppercase tracking-wider w-[100px]">
                操作
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="h-24 text-center text-muted-foreground"
                >
                  該当する品目がありません
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((item, i) => {
                const isLow =
                  item.par_level !== null && item.current_stock < item.par_level
                return (
                  <TableRow
                    key={item.id}
                    className={`${i % 2 === 0 ? "bg-muted/20" : ""} ${isLow ? "bg-red-50/50 dark:bg-red-950/10" : ""}`}
                  >
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {isLow && (
                          <AlertTriangle className="size-3.5 text-amber-500 shrink-0" />
                        )}
                        <span className="font-medium max-w-[200px] truncate block">
                          {item.name}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{item.category}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <div className="hidden sm:block w-16 h-1.5 rounded-full bg-muted overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${stockBarColor(item.current_stock, item.par_level)}`}
                            style={{
                              width: `${Math.min(100, item.par_level ? (item.current_stock / item.par_level) * 60 + 10 : 50)}%`,
                            }}
                          />
                        </div>
                        <span className="tabular-nums font-medium">
                          {item.current_stock}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {item.unit}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {item.par_level !== null ? (
                        <span>
                          {item.par_level} {item.unit}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">{"\u2014"}</span>
                      )}
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm">
                      {item.location ?? (
                        <span className="text-muted-foreground">{"\u2014"}</span>
                      )}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-sm tabular-nums">
                      {formatDate(item.last_counted_at)}
                    </TableCell>
                    <TableCell>{stockStatusBadge(item.current_stock, item.par_level)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-0.5">
                        <StockAdjustDialog item={item} onSuccess={handleRefresh} />
                        <HistoryDialog item={item} />
                        <InventoryForm
                          item={item}
                          onSuccess={handleRefresh}
                          trigger={
                            <Button variant="ghost" size="icon-xs" title="編集">
                              <Edit3 className="size-3.5" />
                            </Button>
                          }
                        />
                        <DeleteDialog item={item} onSuccess={handleRefresh} />
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
