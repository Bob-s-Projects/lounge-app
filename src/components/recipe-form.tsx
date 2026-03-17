"use client"

import { useState, useTransition, useCallback } from "react"
import { useRouter } from "next/navigation"
import {
  Star,
  Plus,
  Trash2,
  GripVertical,
  ChevronUp,
  ChevronDown,
  Loader2,
  Save,
  ArrowLeft,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog"
import {
  createRecipe,
  updateRecipe,
  deleteRecipe,
  type RecipeInput,
  type SupplierItemOption,
} from "@/app/recipes/actions"
import { formatYen } from "@/lib/format"

// ── Types ──

type IngredientRow = {
  key: string
  name: string
  amount: string
  unit: string
  supplier_item_id: string
  cost: string
}

type StepRow = {
  key: string
  text: string
}

type RecipeData = {
  id: number
  name: string
  category: string
  description: string | null
  difficulty: number
  prep_time_min: number | null
  steps: string[] | null
  ingredients: {
    name: string
    amount: number
    unit: string
    supplier_item_id: number | null
    cost: number
    sort_order: number
  }[]
}

type Props = {
  mode: "create" | "edit"
  recipe?: RecipeData
  supplierItems: SupplierItemOption[]
}

// ── Constants ──

const CATEGORIES = ["ドリンク", "カクテル", "フード", "デザート", "その他"]
const UNITS = ["ml", "g", "個", "本", "枚", "杯", "cc", "L", "kg", "適量"]

let keyCounter = 0
function nextKey() {
  return `k_${++keyCounter}_${Date.now()}`
}

// ── Component ──

export function RecipeForm({ mode, recipe, supplierItems }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [deleteOpen, setDeleteOpen] = useState(false)

  // Form state
  const [name, setName] = useState(recipe?.name ?? "")
  const [category, setCategory] = useState(recipe?.category ?? "ドリンク")
  const [description, setDescription] = useState(recipe?.description ?? "")
  const [difficulty, setDifficulty] = useState(recipe?.difficulty ?? 3)
  const [prepTime, setPrepTime] = useState(recipe?.prep_time_min?.toString() ?? "")

  const [ingredients, setIngredients] = useState<IngredientRow[]>(() => {
    if (recipe?.ingredients && recipe.ingredients.length > 0) {
      return recipe.ingredients.map((ing) => ({
        key: nextKey(),
        name: ing.name,
        amount: ing.amount.toString(),
        unit: ing.unit,
        supplier_item_id: ing.supplier_item_id?.toString() ?? "",
        cost: ing.cost.toString(),
      }))
    }
    return [{ key: nextKey(), name: "", amount: "", unit: "ml", supplier_item_id: "", cost: "0" }]
  })

  const [steps, setSteps] = useState<StepRow[]>(() => {
    if (recipe?.steps && recipe.steps.length > 0) {
      return recipe.steps.map((text) => ({ key: nextKey(), text }))
    }
    return [{ key: nextKey(), text: "" }]
  })

  // ── Ingredient helpers ──

  const addIngredient = useCallback(() => {
    setIngredients((prev) => [
      ...prev,
      { key: nextKey(), name: "", amount: "", unit: "ml", supplier_item_id: "", cost: "0" },
    ])
  }, [])

  const removeIngredient = useCallback((key: string) => {
    setIngredients((prev) => (prev.length <= 1 ? prev : prev.filter((i) => i.key !== key)))
  }, [])

  const updateIngredient = useCallback(
    (key: string, field: keyof IngredientRow, value: string) => {
      setIngredients((prev) =>
        prev.map((ing) => {
          if (ing.key !== key) return ing
          const updated = { ...ing, [field]: value }

          // supplier_item選択時にコスト自動計算
          if (field === "supplier_item_id" && value) {
            const item = supplierItems.find((si) => si.id.toString() === value)
            if (item) {
              const amount = parseFloat(updated.amount) || 0
              // unit_price をそのまま使い、使用量で按分
              // 簡易計算: (unit_price / 1000) * amount (仕入単価÷1000ml * 使用量ml)
              // ただし正確な計算は仕入れ単位によるため手動調整も可能
              if (amount > 0) {
                const cost = Math.round((item.unit_price / 1000) * amount)
                updated.cost = cost.toString()
              }
              if (!updated.name) {
                updated.name = item.name
              }
            }
          }

          // 数量変更時にコスト再計算（仕入れ品紐付きの場合）
          if (field === "amount" && updated.supplier_item_id) {
            const item = supplierItems.find(
              (si) => si.id.toString() === updated.supplier_item_id
            )
            if (item) {
              const amount = parseFloat(value) || 0
              if (amount > 0) {
                const cost = Math.round((item.unit_price / 1000) * amount)
                updated.cost = cost.toString()
              }
            }
          }

          return updated
        })
      )
    },
    [supplierItems]
  )

  // ── Step helpers ──

  const addStep = useCallback(() => {
    setSteps((prev) => [...prev, { key: nextKey(), text: "" }])
  }, [])

  const removeStep = useCallback((key: string) => {
    setSteps((prev) => (prev.length <= 1 ? prev : prev.filter((s) => s.key !== key)))
  }, [])

  const updateStep = useCallback((key: string, text: string) => {
    setSteps((prev) => prev.map((s) => (s.key === key ? { ...s, text } : s)))
  }, [])

  const moveStep = useCallback((key: string, direction: "up" | "down") => {
    setSteps((prev) => {
      const idx = prev.findIndex((s) => s.key === key)
      if (idx < 0) return prev
      const target = direction === "up" ? idx - 1 : idx + 1
      if (target < 0 || target >= prev.length) return prev
      const next = [...prev]
      ;[next[idx], next[target]] = [next[target], next[idx]]
      return next
    })
  }, [])

  // ── Total cost ──

  const totalCost = ingredients.reduce((sum, ing) => sum + (parseInt(ing.cost) || 0), 0)

  // ── Submit ──

  const handleSubmit = () => {
    if (!name.trim()) return

    const input: RecipeInput = {
      name: name.trim(),
      category,
      description: description.trim(),
      difficulty,
      prep_time_min: prepTime ? parseInt(prepTime) : null,
      steps: steps.map((s) => s.text).filter((t) => t.trim() !== ""),
      ingredients: ingredients
        .filter((i) => i.name.trim() !== "")
        .map((i, idx) => ({
          name: i.name.trim(),
          amount: parseFloat(i.amount) || 0,
          unit: i.unit,
          supplier_item_id: i.supplier_item_id ? parseInt(i.supplier_item_id) : null,
          cost: parseInt(i.cost) || 0,
          sort_order: idx,
        })),
    }

    startTransition(async () => {
      try {
        if (mode === "create") {
          await createRecipe(input)
        } else if (recipe) {
          await updateRecipe(recipe.id, input)
        }
        router.push("/recipes")
      } catch (err) {
        console.error(err)
        alert(err instanceof Error ? err.message : "保存に失敗しました")
      }
    })
  }

  const handleDelete = () => {
    if (!recipe) return
    startTransition(async () => {
      try {
        await deleteRecipe(recipe.id)
        router.push("/recipes")
      } catch (err) {
        console.error(err)
        alert(err instanceof Error ? err.message : "削除に失敗しました")
      }
    })
  }

  return (
    <div className="space-y-6">
      {/* Basic info */}
      <Card>
        <CardHeader>
          <CardTitle>基本情報</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">レシピ名 *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="例: モスコミュール"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>カテゴリ</Label>
              <Select value={category} onValueChange={(v) => v && setCategory(v)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">説明</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="レシピの説明やポイントを入力..."
              rows={3}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>難易度</Label>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setDifficulty(level)}
                    className="rounded-md p-0.5 transition-colors hover:bg-muted"
                  >
                    <Star
                      className={`size-6 ${
                        level <= difficulty
                          ? "fill-amber-400 text-amber-400"
                          : "text-muted-foreground/30"
                      }`}
                    />
                  </button>
                ))}
                <span className="ml-2 text-sm text-muted-foreground">{difficulty}/5</span>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="prep_time">調理時間（分）</Label>
              <Input
                id="prep_time"
                type="number"
                min={0}
                value={prepTime}
                onChange={(e) => setPrepTime(e.target.value)}
                placeholder="例: 5"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ingredients */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>材料</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              仕入れ品目をリンクするとコストが自動計算されます
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm text-muted-foreground">合計原価</div>
            <div className="text-xl font-bold tabular-nums">{formatYen(totalCost)}</div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Header row (desktop) */}
          <div className="hidden sm:grid sm:grid-cols-[1fr_80px_80px_1fr_80px_36px] gap-2 text-xs font-medium text-muted-foreground px-1">
            <span>材料名</span>
            <span>数量</span>
            <span>単位</span>
            <span>仕入れ品目</span>
            <span>コスト</span>
            <span />
          </div>

          {ingredients.map((ing) => (
            <div
              key={ing.key}
              className="grid gap-2 sm:grid-cols-[1fr_80px_80px_1fr_80px_36px] items-start rounded-lg border p-3 sm:border-0 sm:p-0"
            >
              <Input
                value={ing.name}
                onChange={(e) => updateIngredient(ing.key, "name", e.target.value)}
                placeholder="材料名"
              />
              <Input
                type="number"
                min={0}
                step="0.1"
                value={ing.amount}
                onChange={(e) => updateIngredient(ing.key, "amount", e.target.value)}
                placeholder="数量"
              />
              <Select
                value={ing.unit}
                onValueChange={(v) => v && updateIngredient(ing.key, "unit", v)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {UNITS.map((u) => (
                    <SelectItem key={u} value={u}>
                      {u}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={ing.supplier_item_id || "__none__"}
                onValueChange={(v) =>
                  v && updateIngredient(ing.key, "supplier_item_id", v === "__none__" ? "" : v)
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="未リンク" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">未リンク</SelectItem>
                  {supplierItems.map((si) => (
                    <SelectItem key={si.id} value={si.id.toString()}>
                      {si.name}（{formatYen(si.unit_price)}）
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                type="number"
                min={0}
                value={ing.cost}
                onChange={(e) => updateIngredient(ing.key, "cost", e.target.value)}
                placeholder="¥"
              />
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => removeIngredient(ing.key)}
                disabled={ingredients.length <= 1}
                className="text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          ))}

          <Button variant="outline" size="sm" onClick={addIngredient} className="mt-2">
            <Plus className="size-4" data-icon="inline-start" />
            材料を追加
          </Button>
        </CardContent>
      </Card>

      {/* Steps */}
      <Card>
        <CardHeader>
          <CardTitle>手順</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {steps.map((step, idx) => (
            <div key={step.key} className="flex items-start gap-2">
              <div className="flex flex-col items-center gap-0.5 pt-1">
                <GripVertical className="size-4 text-muted-foreground/40" />
                <span className="flex size-6 items-center justify-center rounded-full bg-muted text-xs font-medium">
                  {idx + 1}
                </span>
                <div className="flex flex-col">
                  <button
                    type="button"
                    onClick={() => moveStep(step.key, "up")}
                    disabled={idx === 0}
                    className="rounded p-0.5 hover:bg-muted disabled:opacity-30"
                  >
                    <ChevronUp className="size-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveStep(step.key, "down")}
                    disabled={idx === steps.length - 1}
                    className="rounded p-0.5 hover:bg-muted disabled:opacity-30"
                  >
                    <ChevronDown className="size-3.5" />
                  </button>
                </div>
              </div>
              <Textarea
                value={step.text}
                onChange={(e) => updateStep(step.key, e.target.value)}
                placeholder={`ステップ ${idx + 1} の内容...`}
                rows={2}
                className="flex-1"
              />
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => removeStep(step.key)}
                disabled={steps.length <= 1}
                className="mt-1 text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          ))}

          <Button variant="outline" size="sm" onClick={addStep} className="mt-2">
            <Plus className="size-4" data-icon="inline-start" />
            手順を追加
          </Button>
        </CardContent>
      </Card>

      {/* Actions */}
      <Separator />
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => router.push("/recipes")}>
            <ArrowLeft className="size-4" data-icon="inline-start" />
            キャンセル
          </Button>
          {mode === "edit" && recipe && (
            <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
              <DialogTrigger
                render={
                  <Button variant="destructive" disabled={isPending} />
                }
              >
                <Trash2 className="size-4" data-icon="inline-start" />
                削除
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>レシピを削除しますか？</DialogTitle>
                  <DialogDescription>
                    「{recipe.name}」を削除すると元に戻せません。材料データも同時に削除されます。
                  </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <DialogClose render={<Button variant="outline" />}>
                    キャンセル
                  </DialogClose>
                  <Button
                    variant="destructive"
                    onClick={handleDelete}
                    disabled={isPending}
                  >
                    {isPending ? (
                      <Loader2 className="size-4 animate-spin" data-icon="inline-start" />
                    ) : (
                      <Trash2 className="size-4" data-icon="inline-start" />
                    )}
                    削除する
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
        <Button
          onClick={handleSubmit}
          disabled={isPending || !name.trim()}
          size="lg"
        >
          {isPending ? (
            <Loader2 className="size-4 animate-spin" data-icon="inline-start" />
          ) : (
            <Save className="size-4" data-icon="inline-start" />
          )}
          {mode === "create" ? "レシピを作成" : "変更を保存"}
        </Button>
      </div>
    </div>
  )
}
