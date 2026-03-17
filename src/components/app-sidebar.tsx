"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Package,
  Receipt,
  UtensilsCrossed,
  TrendingUp,
  BookOpen,
  IceCream,
  BarChart3,
  Vote,
  ChefHat,
  Kanban,
  ExternalLink,
  Search,
  Sparkles,
  Warehouse,
} from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { openCommandMenu } from "@/components/command-menu"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
} from "@/components/ui/sidebar"

const menuNav = [
  { title: "グランドメニュー", href: "/grand-menu", icon: BookOpen },
  { title: "季節メニュー", href: "/seasonal", icon: IceCream },
  { title: "商品マスタ", href: "/products", icon: Package },
  { title: "レシピ管理", href: "/recipes", icon: ChefHat },
]

const inventoryNav = [
  { title: "在庫管理", href: "/inventory", icon: Warehouse },
]

const planNav = [
  {
    title: "メニュー投票",
    href: "https://ledian-menu-dashboard.pages.dev",
    icon: Vote,
    external: true,
  },
  {
    title: "レシピ集",
    href: "https://ledian-menu-dashboard.pages.dev/recipes.html",
    icon: ChefHat,
    external: true,
  },
  {
    title: "発売計画",
    href: "https://ledian-menu-dashboard.pages.dev/#plan",
    icon: Kanban,
    external: true,
  },
]

const analysisNav = [
  { title: "売上分析", href: "/sales", icon: BarChart3 },
  {
    title: "原価分析",
    href: "/analysis",
    icon: TrendingUp,
    badge: "12",
    badgeClass: "bg-red-500/15 text-red-600 dark:bg-red-500/25 dark:text-red-400",
  },
  {
    title: "改廃アドバイス",
    href: "/menu",
    icon: UtensilsCrossed,
    badge: "95",
    badgeClass: "bg-amber-500/15 text-amber-600 dark:bg-amber-500/25 dark:text-amber-400",
  },
  { title: "仕入れ価格", href: "/suppliers", icon: Receipt },
]

export function AppSidebar() {
  const pathname = usePathname()
  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="flex size-8 items-center justify-center rounded-lg bg-sidebar-primary/20">
            <Sparkles className="size-4 text-sidebar-primary" />
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-base font-semibold tracking-tight text-sidebar-foreground">
              LEDIAN Lounge
            </span>
            <span className="text-[11px] text-sidebar-foreground/50">メニューマネージャー</span>
          </div>
        </div>
        <div className="mt-3 h-px bg-gradient-to-r from-sidebar-primary/40 via-sidebar-primary/10 to-transparent" />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={pathname === "/"}
                  tooltip="ダッシュボード"
                  className="transition-colors duration-150"
                >
                  <Link href="/" className="flex items-center gap-2 w-full">
                    <LayoutDashboard className="size-4" />
                    <span>ダッシュボード</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarSeparator className="bg-sidebar-border" />
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] uppercase tracking-wider text-sidebar-foreground/40 font-medium">
            メニュー運用
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuNav.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    isActive={pathname.startsWith(item.href)}
                    tooltip={item.title}
                    className="transition-colors duration-150"
                  >
                    <Link href={item.href} className="flex items-center gap-2 w-full">
                      <item.icon className="size-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarSeparator className="bg-sidebar-border" />
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] uppercase tracking-wider text-sidebar-foreground/40 font-medium">
            分析・コスト
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {analysisNav.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    isActive={pathname.startsWith(item.href)}
                    tooltip={item.title}
                    className="transition-colors duration-150"
                  >
                    <Link href={item.href} className="flex items-center gap-2 w-full">
                      <item.icon className="size-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                  {"badge" in item && item.badge && (
                    <SidebarMenuBadge
                      className={`text-[10px] px-1.5 py-0 h-5 min-w-5 rounded-full font-semibold ${item.badgeClass}`}
                    >
                      {item.badge}
                    </SidebarMenuBadge>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarSeparator className="bg-sidebar-border" />
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] uppercase tracking-wider text-sidebar-foreground/40 font-medium">
            在庫・オペレーション
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {inventoryNav.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    isActive={pathname.startsWith(item.href)}
                    tooltip={item.title}
                    className="transition-colors duration-150"
                  >
                    <Link href={item.href} className="flex items-center gap-2 w-full">
                      <item.icon className="size-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarSeparator className="bg-sidebar-border" />
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] uppercase tracking-wider text-sidebar-foreground/40 font-medium">
            企画・投票
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {planNav.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    tooltip={item.title}
                    className="transition-colors duration-150"
                  >
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 w-full"
                    >
                      <item.icon className="size-4" />
                      <span>{item.title}</span>
                      <ExternalLink className="size-3 ml-auto opacity-40" />
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border px-3 py-3">
        <button
          type="button"
          onClick={openCommandMenu}
          className="flex items-center gap-2 rounded-md border border-sidebar-border bg-sidebar-accent px-3 py-1.5 text-xs text-sidebar-foreground/60 transition-colors duration-150 hover:bg-sidebar-primary/15 hover:text-sidebar-foreground"
        >
          <Search className="size-3.5" />
          <span className="flex-1 text-left">検索...</span>
          <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-0.5 rounded border border-sidebar-border bg-sidebar/80 px-1.5 font-mono text-[10px] font-medium text-sidebar-foreground/50">
            <span className="text-xs">&#8984;</span>K
          </kbd>
        </button>
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-sidebar-foreground/40">v1.0</span>
          <ThemeToggle />
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
