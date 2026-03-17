"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog"
import { Plus, Link as LinkIcon } from "lucide-react"
import type { InventoryItem, SupplierItemOption } from "@/app/inventory/actions"
import {
  createInventoryItem,
  updateInventoryItem,
  getSupplierItemsForLinking,
} from "@/app/inventory/actions"

const UNIT_OPTIONS = ["本", "箱", "袋", "パック", "kg", "L", "個", "枚", "缶"]

const CATEGORY_OPTIONS = [
  "酒類",
  "ソフトドリンク",
  "食材",
  "調味料",
  "冷凍品",
  "乳製品",
  "消耗品",
  "その他",
]

interface InventoryFormProps {
  item?: InventoryItem | null
  onSuccess?: () => void
  trigger?: React.ReactElement
}

export function InventoryForm({ item, onSuccess, trigger }: InventoryFormProps) {
  const isEdit = !!item
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [supplierItems, setSupplierItems] = useState<SupplierItemOption[]>([])
  const [loadingSuppliers, setLoadingSuppliers] = useState(false)

  // Form state
  const [name, setName] = useState(item?.name ?? "")
  const [category, setCategory] = useState(item?.category ?? "")
  const [unit, setUnit] = useState(item?.unit ?? "本")
  const [parLevel, setParLevel] = useState(item?.par_level?.toString() ?? "")
  const [location, setLocation] = useState(item?.location ?? "")
  const [supplierItemId, setSupplierItemId] = useState<string>(
    item?.supplier_item_id?.toString() ?? "__none__"
  )
  const [note, setNote] = useState(item?.note ?? "")
  const [currentStock, setCurrentStock] = useState("0")

  // Load supplier items when dialog opens
  useEffect(() => {
    if (open && supplierItems.length === 0) {
      setLoadingSuppliers(true)
      getSupplierItemsForLinking()
        .then(setSupplierItems)
        .catch(() => {})
        .finally(() => setLoadingSuppliers(false))
    }
  }, [open, supplierItems.length])

  // Reset form when editing a different item
  useEffect(() => {
    if (item) {
      setName(item.name)
      setCategory(item.category)
      setUnit(item.unit)
      setParLevel(item.par_level?.toString() ?? "")
      setLocation(item.location ?? "")
      setSupplierItemId(item.supplier_item_id?.toString() ?? "__none__")
      setNote(item.note ?? "")
    }
  }, [item])

  function handleSupplierChange(value: string | null) {
    const v = value ?? "__none__"
    setSupplierItemId(v)
    if (v !== "__none__") {
      const si = supplierItems.find((s) => s.id.toString() === v)
      if (si) {
        setName(si.name)
        setCategory(si.category)
      }
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = {
      name: name.trim(),
      category: category.trim(),
      unit,
      par_level: parLevel ? Number(parLevel) : null,
      location: location.trim() || null,
      supplier_item_id:
        supplierItemId !== "__none__" ? Number(supplierItemId) : null,
      note: note.trim() || null,
    }

    if (!formData.name || !formData.category) {
      setError("品名とカテゴリは必須です")
      setLoading(false)
      return
    }

    try {
      const result = isEdit
        ? await updateInventoryItem(item!.id, formData)
        : await createInventoryItem({
            ...formData,
            current_stock: Number(currentStock) || 0,
          })

      if (result.success) {
        setOpen(false)
        resetForm()
        onSuccess?.()
      } else {
        setError(result.error ?? "保存に失敗しました")
      }
    } catch {
      setError("保存に失敗しました")
    } finally {
      setLoading(false)
    }
  }

  function resetForm() {
    if (!isEdit) {
      setName("")
      setCategory("")
      setUnit("本")
      setParLevel("")
      setLocation("")
      setSupplierItemId("__none__")
      setNote("")
      setCurrentStock("0")
    }
    setError(null)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        setOpen(val)
        if (!val) resetForm()
      }}
    >
      <DialogTrigger
        render={
          trigger ?? (
            <Button size="sm">
              <Plus className="size-4" data-icon="inline-start" />
              在庫品目追加
            </Button>
          )
        }
      />
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "在庫品目を編集" : "在庫品目を追加"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "在庫品目の情報を更新します。"
              : "新しい在庫品目を登録します。仕入品目をリンクすると自動入力されます。"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Supplier item linking */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">
              <LinkIcon className="size-3" />
              仕入品目リンク（任意）
            </Label>
            <Select
              value={supplierItemId}
              onValueChange={handleSupplierChange}
            >
              <SelectTrigger className="w-full">
                <SelectValue
                  placeholder={
                    loadingSuppliers ? "読み込み中..." : "仕入品目を選択..."
                  }
                />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">リンクしない</SelectItem>
                {supplierItems.map((si) => (
                  <SelectItem key={si.id} value={si.id.toString()}>
                    {si.name}
                    {si.spec ? ` (${si.spec})` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Name */}
          <div className="space-y-1.5">
            <Label htmlFor="inv-name">品名 *</Label>
            <Input
              id="inv-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例: プレミアムモルツ"
              required
            />
          </div>

          {/* Category + Unit row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="inv-category">カテゴリ *</Label>
              <Select value={category} onValueChange={(v) => setCategory(v ?? "")}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="カテゴリ選択" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORY_OPTIONS.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="inv-unit">単位</Label>
              <Select value={unit} onValueChange={(v) => setUnit(v ?? "本")}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {UNIT_OPTIONS.map((u) => (
                    <SelectItem key={u} value={u}>
                      {u}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Par level + Initial stock */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="inv-par">発注点</Label>
              <Input
                id="inv-par"
                type="number"
                step="0.1"
                min="0"
                value={parLevel}
                onChange={(e) => setParLevel(e.target.value)}
                placeholder="例: 5"
              />
            </div>
            {!isEdit && (
              <div className="space-y-1.5">
                <Label htmlFor="inv-stock">初期在庫数</Label>
                <Input
                  id="inv-stock"
                  type="number"
                  step="0.1"
                  min="0"
                  value={currentStock}
                  onChange={(e) => setCurrentStock(e.target.value)}
                  placeholder="0"
                />
              </div>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="inv-location">保管場所</Label>
              <Input
                id="inv-location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="例: 冷蔵庫A"
              />
            </div>
          </div>

          {/* Note */}
          <div className="space-y-1.5">
            <Label htmlFor="inv-note">メモ</Label>
            <Textarea
              id="inv-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="備考など..."
              className="min-h-12"
            />
          </div>

          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>
              キャンセル
            </DialogClose>
            <Button type="submit" disabled={loading}>
              {loading ? "保存中..." : isEdit ? "更新" : "追加"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
