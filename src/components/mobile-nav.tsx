"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  BookOpen,
  BarChart3,
  Warehouse,
  MoreHorizontal,
  ChefHat,
  IceCream,
  Package,
  TrendingUp,
  UtensilsCrossed,
  Receipt,
} from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
  SheetDescription,
} from "@/components/ui/sheet"
import { useState } from "react"

const primaryNav = [
  { title: "ホーム", href: "/", icon: LayoutDashboard },
  { title: "メニュー", href: "/grand-menu", icon: BookOpen },
  { title: "売上", href: "/sales", icon: BarChart3 },
  { title: "在庫", href: "/inventory", icon: Warehouse },
]

const moreNav = [
  { title: "レシピ管理", href: "/recipes", icon: ChefHat },
  { title: "季節メニュー", href: "/seasonal", icon: IceCream },
  { title: "商品マスタ", href: "/products", icon: Package },
  { title: "原価分析", href: "/analysis", icon: TrendingUp },
  { title: "改廃アドバイス", href: "/menu", icon: UtensilsCrossed },
  { title: "仕入れ価格", href: "/suppliers", icon: Receipt },
]

function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/"
  return pathname.startsWith(href)
}

export function MobileNav() {
  const pathname = usePathname()
  const [sheetOpen, setSheetOpen] = useState(false)

  // Check if "その他" should appear active (current page is in moreNav)
  const moreActive = moreNav.some((item) => isActive(pathname, item.href))

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden border-t bg-background/95 backdrop-blur-lg pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-center justify-around px-1 h-14">
        {primaryNav.map((item) => {
          const active = isActive(pathname, item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-0.5 flex-1 py-1 transition-colors duration-150 ${
                active ? "text-primary" : "text-muted-foreground"
              }`}
            >
              <div className="relative">
                {active && (
                  <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 size-1 rounded-full bg-primary" />
                )}
                <item.icon
                  className={`size-5 transition-transform duration-150 ${
                    active ? "scale-105" : ""
                  }`}
                />
              </div>
              <span className="text-[10px] leading-tight font-medium">
                {item.title}
              </span>
            </Link>
          )
        })}

        {/* その他ボタン */}
        <button
          type="button"
          onClick={() => setSheetOpen(true)}
          className={`flex flex-col items-center justify-center gap-0.5 flex-1 py-1 transition-colors duration-150 ${
            moreActive ? "text-primary" : "text-muted-foreground"
          }`}
        >
          <div className="relative">
            {moreActive && (
              <span className="absolute -top-1.5 left-1/2 -translate-x-1/2 size-1 rounded-full bg-primary" />
            )}
            <MoreHorizontal
              className={`size-5 transition-transform duration-150 ${
                moreActive ? "scale-105" : ""
              }`}
            />
          </div>
          <span className="text-[10px] leading-tight font-medium">その他</span>
        </button>
      </div>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="bottom" className="rounded-t-2xl px-0 pb-[env(safe-area-inset-bottom)]">
          <SheetHeader className="px-5 pb-0">
            <SheetTitle>その他のメニュー</SheetTitle>
            <SheetDescription className="sr-only">
              その他のナビゲーション項目
            </SheetDescription>
          </SheetHeader>
          <div className="grid grid-cols-3 gap-1 px-4 pb-4 pt-2">
            {moreNav.map((item) => {
              const active = isActive(pathname, item.href)
              return (
                <SheetClose key={item.href} render={<div />}>
                  <Link
                    href={item.href}
                    onClick={() => setSheetOpen(false)}
                    className={`flex flex-col items-center gap-1.5 rounded-xl p-3 transition-colors duration-150 ${
                      active
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <item.icon className="size-5" />
                    <span className="text-xs font-medium text-center leading-tight">
                      {item.title}
                    </span>
                  </Link>
                </SheetClose>
              )
            })}
          </div>
        </SheetContent>
      </Sheet>
    </nav>
  )
}
