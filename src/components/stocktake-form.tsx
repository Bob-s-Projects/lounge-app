"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Button, buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import {
  ArrowLeft,
  Check,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  Package,
} from "lucide-react"
import { EmptyState } from "@/components/empty-state"
import type { InventoryItem } from "@/app/inventory/actions"
import { performStocktake } from "@/app/inventory/actions"
import Link from "next/link"

interface StocktakeFormProps {
  items: InventoryItem[]
}

type StocktakeEntry = {
  id: number
  name: string
  category: string
  unit: string
  currentStock: number
  newStock: string
  note: string
}

function DiffBadge({ current, newVal }: { current: number; newVal: string }) {
  const parsed = parseFloat(newVal)
  if (isNaN(parsed) || newVal === "") {
    return <span className="text-xs text-muted-foreground">{"\u2014"}</span>
  }
  const diff = parsed - current
  if (diff === 0) {
    return (
      <span className="inline-flex items-center gap-0.5 text-xs text-muted-foreground">
        <Minus className="size-3" />
        0
      </span>
    )
  }
  if (diff > 0) {
    return (
      <span className="inline-flex items-center gap-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
        <TrendingUp className="size-3" />
        +{diff}
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-0.5 text-xs font-medium text-red-600 dark:text-red-400">
      <TrendingDown className="size-3" />
      {diff}
    </span>
  )
}

export function StocktakeForm({ items }: StocktakeFormProps) {
  const router = useRouter()
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const [entries, setEntries] = useState<StocktakeEntry[]>(() =>
    items.map((item) => ({
      id: item.id,
      name: item.name,
      category: item.category,
      unit: item.unit,
      currentStock: item.current_stock,
      newStock: item.current_stock.toString(),
      note: "",
    }))
  )

  // Group by category
  const grouped = useMemo(() => {
    const map = new Map<string, StocktakeEntry[]>()
    for (const entry of entries) {
      const group = map.get(entry.category) ?? []
      group.push(entry)
      map.set(entry.category, group)
    }
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]))
  }, [entries])

  // Summary
  const changedCount = useMemo(() => {
    return entries.filter((e) => {
      const parsed = parseFloat(e.newStock)
      return !isNaN(parsed) && parsed !== e.currentStock
    }).length
  }, [entries])

  function updateEntry(id: number, field: "newStock" | "note", value: string) {
    setEntries((prev) =>
      prev.map((e) => (e.id === id ? { ...e, [field]: value } : e))
    )
  }

  async function handleSubmit() {
    setLoading(true)
    setError(null)

    const payload = entries.map((e) => ({
      id: e.id,
      newStock: parseFloat(e.newStock) || 0,
      note: e.note || undefined,
    }))

    try {
      const result = await performStocktake(payload)
      if (result.success) {
        setSuccess(true)
        setConfirmOpen(false)
        // Redirect after brief delay
        setTimeout(() => {
          router.push("/inventory")
        }, 2000)
      } else {
        setError(result.error ?? "棚卸しの保存に失敗しました")
        setConfirmOpen(false)
      }
    } catch {
      setError("棚卸しの保存に失敗しました")
      setConfirmOpen(false)
    } finally {
      setLoading(false)
    }
  }

  // Empty state
  if (items.length === 0) {
    return (
      <EmptyState
        icon={Package}
        title="棚卸し対象がありません"
        description="まず在庫品目を登録してから棚卸しを実施してください。"
        action={
          <Link href="/inventory" className={buttonVariants({ variant: "outline" })}>
            在庫管理に戻る
          </Link>
        }
      />
    )
  }

  // Success state
  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="flex size-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30 mb-4">
          <Check className="size-8 text-emerald-600 dark:text-emerald-400" />
        </div>
        <h3 className="text-lg font-semibold">棚卸し完了</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          {changedCount > 0
            ? `${changedCount}品目の在庫数が更新されました。`
            : "在庫数の変更はありませんでした。"}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          在庫管理ページに移動します...
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 dark:border-red-800/50 dark:bg-red-950/20">
          <AlertTriangle className="size-4 text-red-600 shrink-0" />
          <span className="text-sm text-red-800 dark:text-red-300">{error}</span>
        </div>
      )}

      {/* Sticky header with actions */}
      <div className="sticky top-0 z-10 flex items-center justify-between rounded-xl border bg-background/95 backdrop-blur px-4 py-3">
        <div className="flex items-center gap-3">
          <Link
            href="/inventory"
            className={buttonVariants({ variant: "ghost", size: "sm" })}
          >
            <ArrowLeft className="size-4" />
            戻る
          </Link>
          <div className="hidden sm:block text-sm text-muted-foreground">
            変更あり:{" "}
            <span className="font-medium text-foreground tabular-nums">
              {changedCount}
            </span>{" "}
            / {entries.length} 品目
          </div>
        </div>
        <Button
          size="sm"
          onClick={() => setConfirmOpen(true)}
          disabled={loading}
        >
          <Check className="size-4" data-icon="inline-start" />
          棚卸し完了
        </Button>
      </div>

      {/* Desktop: Table layout */}
      <div className="hidden md:block">
        {grouped.map(([category, groupItems]) => (
          <div key={category} className="mb-6">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">
              {category}
              <span className="ml-2 text-xs font-normal">
                ({groupItems.length}品目)
              </span>
            </h3>
            <div className="rounded-xl border overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
                    <th className="text-left font-semibold px-4 py-2.5">品名</th>
                    <th className="text-right font-semibold px-4 py-2.5 w-[100px]">
                      現在庫
                    </th>
                    <th className="text-center font-semibold px-4 py-2.5 w-[140px]">
                      実在庫
                    </th>
                    <th className="text-center font-semibold px-4 py-2.5 w-[80px]">
                      差分
                    </th>
                    <th className="text-left font-semibold px-4 py-2.5 w-[200px]">
                      メモ
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {groupItems.map((entry, i) => {
                    const parsed = parseFloat(entry.newStock)
                    const hasChanged =
                      !isNaN(parsed) && parsed !== entry.currentStock
                    return (
                      <tr
                        key={entry.id}
                        className={`border-t ${i % 2 === 0 ? "bg-muted/20" : ""} ${hasChanged ? "bg-amber-50/50 dark:bg-amber-950/10" : ""}`}
                      >
                        <td className="px-4 py-2">
                          <span className="font-medium text-sm">
                            {entry.name}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-right">
                          <span className="tabular-nums text-sm">
                            {entry.currentStock}{" "}
                            <span className="text-xs text-muted-foreground">
                              {entry.unit}
                            </span>
                          </span>
                        </td>
                        <td className="px-4 py-2">
                          <div className="flex items-center justify-center gap-1">
                            <Input
                              type="number"
                              step="0.1"
                              min="0"
                              value={entry.newStock}
                              onChange={(e) =>
                                updateEntry(entry.id, "newStock", e.target.value)
                              }
                              className="w-20 text-center tabular-nums h-7"
                            />
                            <span className="text-xs text-muted-foreground">
                              {entry.unit}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-2 text-center">
                          <DiffBadge
                            current={entry.currentStock}
                            newVal={entry.newStock}
                          />
                        </td>
                        <td className="px-4 py-2">
                          <Input
                            value={entry.note}
                            onChange={(e) =>
                              updateEntry(entry.id, "note", e.target.value)
                            }
                            placeholder="メモ..."
                            className="h-7 text-xs"
                          />
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>

      {/* Mobile: Card layout */}
      <div className="md:hidden space-y-4">
        {grouped.map(([category, groupItems]) => (
          <div key={category}>
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-1">
              {category}
            </h3>
            <div className="space-y-2">
              {groupItems.map((entry) => {
                const parsed = parseFloat(entry.newStock)
                const hasChanged =
                  !isNaN(parsed) && parsed !== entry.currentStock
                return (
                  <div
                    key={entry.id}
                    className={`rounded-xl border p-3 space-y-2 ${hasChanged ? "border-amber-200 bg-amber-50/50 dark:border-amber-800/30 dark:bg-amber-950/10" : ""}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm">{entry.name}</span>
                      <DiffBadge
                        current={entry.currentStock}
                        newVal={entry.newStock}
                      />
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-xs text-muted-foreground">
                        現在:{" "}
                        <span className="tabular-nums font-medium text-foreground">
                          {entry.currentStock} {entry.unit}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 flex-1">
                        <span className="text-xs text-muted-foreground">
                          実在庫:
                        </span>
                        <Input
                          type="number"
                          step="0.1"
                          min="0"
                          value={entry.newStock}
                          onChange={(e) =>
                            updateEntry(entry.id, "newStock", e.target.value)
                          }
                          className="w-20 text-center tabular-nums h-7"
                        />
                        <span className="text-xs text-muted-foreground">
                          {entry.unit}
                        </span>
                      </div>
                    </div>
                    <Input
                      value={entry.note}
                      onChange={(e) =>
                        updateEntry(entry.id, "note", e.target.value)
                      }
                      placeholder="メモ..."
                      className="h-7 text-xs"
                    />
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Confirmation dialog */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>棚卸しを完了しますか？</DialogTitle>
            <DialogDescription>
              {entries.length}品目の棚卸し結果を保存します。
              {changedCount > 0
                ? `${changedCount}品目の在庫数が変更されます。`
                : "在庫数の変更はありません（カウント記録のみ保存）。"}
            </DialogDescription>
          </DialogHeader>

          {changedCount > 0 && (
            <div className="max-h-40 overflow-y-auto -mx-4 px-4">
              <div className="space-y-1">
                {entries
                  .filter((e) => {
                    const p = parseFloat(e.newStock)
                    return !isNaN(p) && p !== e.currentStock
                  })
                  .map((e) => {
                    const newVal = parseFloat(e.newStock)
                    const diff = newVal - e.currentStock
                    return (
                      <div
                        key={e.id}
                        className="flex items-center justify-between text-sm py-1"
                      >
                        <span className="truncate max-w-[180px]">{e.name}</span>
                        <span className="tabular-nums">
                          {e.currentStock} → {newVal}{" "}
                          <span
                            className={
                              diff > 0
                                ? "text-emerald-600"
                                : "text-red-600"
                            }
                          >
                            ({diff > 0 ? "+" : ""}
                            {diff})
                          </span>
                        </span>
                      </div>
                    )
                  })}
              </div>
            </div>
          )}

          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>
              キャンセル
            </DialogClose>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? "保存中..." : "棚卸し完了"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
