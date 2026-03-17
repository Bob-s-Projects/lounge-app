"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronRight, Home } from "lucide-react"

const pathNames: Record<string, string> = {
  "/grand-menu": "グランドメニュー",
  "/seasonal": "季節メニュー",
  "/products": "商品マスタ",
  "/sales": "売上分析",
  "/analysis": "原価分析",
  "/menu": "メニュー改廃アドバイス",
  "/suppliers": "仕入れ価格",
  "/recipes": "レシピ管理",
  "/recipes/new": "新規レシピ",
  "/inventory": "在庫管理",
  "/inventory/stocktake": "棚卸し",
  "/menu/report": "提案レポート",
  "/menu/report/feedback": "フィードバック入力",
  "/menu/draft": "メニュー表ドラフト",
}

// 動的ルートの親パスマッピング
const dynamicParents: { pattern: RegExp; parent: string; label: string }[] = [
  { pattern: /^\/recipes\/\d+$/, parent: "/recipes", label: "レシピ編集" },
]

export function BreadcrumbNav() {
  const pathname = usePathname()

  // ダッシュボード（/）では表示しない
  if (pathname === "/") return null

  // 静的パスをチェック
  const currentName = pathNames[pathname]
  if (currentName) {
    // 親パスがある場合は階層表示
    const parentPath = Object.keys(pathNames).find(
      (p) => p !== pathname && pathname.startsWith(p + "/")
    )

    return (
      <nav aria-label="パンくずリスト" className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link
          href="/"
          className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
        >
          <Home className="size-3.5" />
          <span>ホーム</span>
        </Link>
        {parentPath && (
          <>
            <ChevronRight className="size-3.5" />
            <Link
              href={parentPath}
              className="hover:text-foreground transition-colors"
            >
              {pathNames[parentPath]}
            </Link>
          </>
        )}
        <ChevronRight className="size-3.5" />
        <span className="text-foreground/60">{currentName}</span>
      </nav>
    )
  }

  // 動的ルートをチェック
  for (const { pattern, parent, label } of dynamicParents) {
    if (pattern.test(pathname)) {
      return (
        <nav aria-label="パンくずリスト" className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Link
            href="/"
            className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
          >
            <Home className="size-3.5" />
            <span>ホーム</span>
          </Link>
          <ChevronRight className="size-3.5" />
          <Link
            href={parent}
            className="hover:text-foreground transition-colors"
          >
            {pathNames[parent]}
          </Link>
          <ChevronRight className="size-3.5" />
          <span className="text-foreground/60">{label}</span>
        </nav>
      )
    }
  }

  return null
}
