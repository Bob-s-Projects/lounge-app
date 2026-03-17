"use client"

import { useState } from "react"
import Link from "next/link"
import { Star, Clock, UtensilsCrossed, Search } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { formatYen } from "@/lib/format"
import type { RecipeRow } from "./page"

type Props = {
  recipes: RecipeRow[]
  categories: string[]
  categoryColors: Record<string, string>
}

function DifficultyStars({ level }: { level: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`size-3.5 ${
            i <= level ? "fill-amber-400 text-amber-400" : "text-muted-foreground/20"
          }`}
        />
      ))}
    </div>
  )
}

export function RecipeListClient({ recipes, categories, categoryColors }: Props) {
  const [search, setSearch] = useState("")
  const [activeTab, setActiveTab] = useState("all")

  const filtered = recipes.filter((r) => {
    const matchesSearch =
      !search ||
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      (r.description && r.description.toLowerCase().includes(search.toLowerCase()))
    const matchesCategory = activeTab === "all" || r.category === activeTab
    return matchesSearch && matchesCategory
  })

  return (
    <div className="space-y-4">
      {/* Search + Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="レシピ名で検索..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">すべて</TabsTrigger>
            {categories.map((cat) => (
              <TabsTrigger key={cat} value={cat}>
                {cat}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {/* Recipe Grid */}
      {filtered.length === 0 ? (
        <div className="py-12 text-center text-muted-foreground">
          <p className="text-sm">条件に一致するレシピが見つかりません</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((recipe) => (
            <Link key={recipe.id} href={`/recipes/${recipe.id}`}>
              <Card className="h-full shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer">
                <CardContent className="pt-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-semibold text-base truncate">
                        {recipe.name}
                      </h3>
                      {recipe.description && (
                        <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">
                          {recipe.description}
                        </p>
                      )}
                    </div>
                    <Badge
                      className={
                        categoryColors[recipe.category] ?? categoryColors["その他"]
                      }
                    >
                      {recipe.category}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-xl font-bold tabular-nums text-primary">
                      {formatYen(recipe.estimated_cost)}
                    </div>
                    <DifficultyStars level={recipe.difficulty} />
                  </div>

                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1">
                      <UtensilsCrossed className="size-3.5" />
                      {recipe.ingredient_count}種の材料
                    </span>
                    {recipe.prep_time_min && (
                      <span className="inline-flex items-center gap-1">
                        <Clock className="size-3.5" />
                        {recipe.prep_time_min}分
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
