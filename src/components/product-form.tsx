"use client"

import { useState, useTransition, useMemo } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Loader2 } from "lucide-react"
import type { SupabaseProduct } from "@/app/products/actions"
import { createProduct, updateProduct } from "@/app/products/actions"

interface ProductFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  product?: SupabaseProduct | null
  categories: string[]
}

const CUSTOM_CATEGORY_VALUE = "__custom__"

export function ProductForm({
  open,
  onOpenChange,
  product,
  categories,
}: ProductFormProps) {
  const isEdit = !!product
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const [name, setName] = useState("")
  const [category, setCategory] = useState("")
  const [customCategory, setCustomCategory] = useState("")
  const [useCustomCategory, setUseCustomCategory] = useState(false)
  const [price, setPrice] = useState("0")
  const [cost, setCost] = useState("0")
  const [description, setDescription] = useState("")
  const [tags, setTags] = useState("")
  const [isActive, setIsActive] = useState(true)

  // Reset form when dialog opens with product data
  const resetForm = (p?: SupabaseProduct | null) => {
    setError(null)
    if (p) {
      setName(p.name)
      const isExistingCategory = categories.includes(p.category)
      setCategory(isExistingCategory ? p.category : CUSTOM_CATEGORY_VALUE)
      setCustomCategory(isExistingCategory ? "" : p.category)
      setUseCustomCategory(!isExistingCategory)
      setPrice(String(p.price))
      setCost(String(p.cost))
      setDescription(p.description ?? "")
      setTags(p.tags?.join(", ") ?? "")
      setIsActive(p.is_active)
    } else {
      setName("")
      setCategory(categories[0] ?? "未分類")
      setCustomCategory("")
      setUseCustomCategory(false)
      setPrice("0")
      setCost("0")
      setDescription("")
      setTags("")
      setIsActive(true)
    }
  }

  // Calculate cost ratio for display
  const costRatio = useMemo(() => {
    const p = Number(price) || 0
    const c = Number(cost) || 0
    if (p <= 0) return null
    return ((c / p) * 100).toFixed(1)
  }, [price, cost])

  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen) {
      resetForm(product)
    }
    onOpenChange(nextOpen)
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)

    const formData = new FormData()
    formData.set("name", name)
    formData.set(
      "category",
      useCustomCategory ? customCategory : category
    )
    formData.set("price", price)
    formData.set("cost", cost)
    formData.set("description", description)
    formData.set("tags", tags)
    formData.set("is_active", String(isActive))

    startTransition(async () => {
      const result = isEdit
        ? await updateProduct(product!.id, formData)
        : await createProduct(formData)

      if (result.success) {
        onOpenChange(false)
      } else {
        setError(result.error)
      }
    })
  }

  const handleCategoryChange = (value: string | null) => {
    if (!value) return
    if (value === CUSTOM_CATEGORY_VALUE) {
      setUseCustomCategory(true)
      setCategory(CUSTOM_CATEGORY_VALUE)
    } else {
      setUseCustomCategory(false)
      setCategory(value)
      setCustomCategory("")
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "商品を編集" : "新規商品"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "商品情報を変更します"
              : "新しい商品をマスタに追加します"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Smaregi sync info (read-only) */}
          {isEdit && product?.smaregi_product_id && (
            <div className="rounded-lg bg-muted/50 p-3 space-y-1">
              <p className="text-xs text-muted-foreground">
                スマレジ連携商品（コード変更不可）
              </p>
              {product.product_code && (
                <p className="text-xs font-mono">
                  商品コード: {product.product_code}
                </p>
              )}
              <p className="text-xs font-mono">
                スマレジID: {product.smaregi_product_id}
              </p>
            </div>
          )}

          {/* Name */}
          <div className="space-y-1.5">
            <Label htmlFor="product-name">
              商品名 <span className="text-destructive">*</span>
            </Label>
            <Input
              id="product-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="商品名を入力"
              required
            />
          </div>

          {/* Category */}
          <div className="space-y-1.5">
            <Label>カテゴリ</Label>
            <Select
              value={useCustomCategory ? CUSTOM_CATEGORY_VALUE : category}
              onValueChange={handleCategoryChange}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="カテゴリを選択" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
                <SelectItem value={CUSTOM_CATEGORY_VALUE}>
                  カスタム入力...
                </SelectItem>
              </SelectContent>
            </Select>
            {useCustomCategory && (
              <Input
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                placeholder="新しいカテゴリ名"
                className="mt-1.5"
              />
            )}
          </div>

          {/* Price & Cost */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="product-price">販売価格（税込）</Label>
              <Input
                id="product-price"
                type="number"
                min={0}
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="product-cost">原価</Label>
              <Input
                id="product-cost"
                type="number"
                min={0}
                value={cost}
                onChange={(e) => setCost(e.target.value)}
              />
            </div>
          </div>

          {/* Cost ratio display */}
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">原価率:</span>
            {costRatio !== null ? (
              <span
                className={
                  Number(costRatio) < 30
                    ? "font-medium text-emerald-600"
                    : Number(costRatio) <= 40
                      ? "font-medium text-amber-600"
                      : "font-medium text-red-600"
                }
              >
                {costRatio}%
              </span>
            ) : (
              <span className="text-muted-foreground">--</span>
            )}
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="product-description">説明</Label>
            <Textarea
              id="product-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="商品の説明（任意）"
              className="min-h-[60px]"
            />
          </div>

          {/* Tags */}
          <div className="space-y-1.5">
            <Label htmlFor="product-tags">タグ</Label>
            <Input
              id="product-tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="カンマ区切りで入力（例: 人気, 季節限定）"
            />
          </div>

          {/* Active toggle */}
          <div className="flex items-center justify-between">
            <Label htmlFor="product-active">有効</Label>
            <Switch
              id="product-active"
              checked={isActive}
              onCheckedChange={setIsActive}
            />
          </div>

          {/* Error */}
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          {/* Footer */}
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>
              キャンセル
            </DialogClose>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="size-4 animate-spin" />}
              {isEdit ? "更新" : "作成"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
