"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import {
  LayoutDashboard,
  BookOpen,
  IceCream,
  Package,
  BarChart3,
  TrendingUp,
  UtensilsCrossed,
  Receipt,
  SunMoon,
  ChefHat,
  Warehouse,
  ClipboardCheck,
} from "lucide-react"

import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"

const pages = [
  { title: "ダッシュボード", href: "/", icon: LayoutDashboard },
  { title: "グランドメニュー", href: "/grand-menu", icon: BookOpen },
  { title: "季節メニュー", href: "/seasonal", icon: IceCream },
  { title: "商品マスタ", href: "/products", icon: Package },
  { title: "売上分析", href: "/sales", icon: BarChart3 },
  { title: "原価分析", href: "/analysis", icon: TrendingUp },
  { title: "メニュー改廃アドバイス", href: "/menu", icon: UtensilsCrossed },
  { title: "仕入れ価格", href: "/suppliers", icon: Receipt },
  { title: "レシピ管理", href: "/recipes", icon: ChefHat },
  { title: "在庫管理", href: "/inventory", icon: Warehouse },
  { title: "棚卸し", href: "/inventory/stocktake", icon: ClipboardCheck },
]

/** Dispatch this custom event to open the command menu from anywhere */
export function openCommandMenu() {
  document.dispatchEvent(new CustomEvent("open-command-menu"))
}

export function CommandMenu() {
  const [open, setOpen] = React.useState(false)
  const router = useRouter()
  const { setTheme, resolvedTheme } = useTheme()

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((prev) => !prev)
      }
    }
    const handleCustomOpen = () => setOpen(true)

    document.addEventListener("keydown", handleKeyDown)
    document.addEventListener("open-command-menu", handleCustomOpen)
    return () => {
      document.removeEventListener("keydown", handleKeyDown)
      document.removeEventListener("open-command-menu", handleCustomOpen)
    }
  }, [])

  const runCommand = React.useCallback((command: () => void) => {
    setOpen(false)
    command()
  }, [])

  return (
    <CommandDialog
      open={open}
      onOpenChange={setOpen}
      title="コマンドパレット"
      description="ページ検索・移動"
    >
      <Command className="rounded-lg border-none shadow-none">
        <CommandInput placeholder="ページ検索・移動..." />
        <CommandList>
          <CommandEmpty>該当する項目がありません</CommandEmpty>
          <CommandGroup heading="ページ移動">
            {pages.map((page) => (
              <CommandItem
                key={page.href}
                value={page.title}
                onSelect={() => runCommand(() => router.push(page.href))}
              >
                <page.icon className="size-4" />
                <span>{page.title}</span>
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="クイックアクション">
            <CommandItem
              value="テーマ切替"
              onSelect={() =>
                runCommand(() =>
                  setTheme(resolvedTheme === "dark" ? "light" : "dark")
                )
              }
            >
              <SunMoon className="size-4" />
              <span>テーマ切替（ダーク / ライト）</span>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    </CommandDialog>
  )
}
