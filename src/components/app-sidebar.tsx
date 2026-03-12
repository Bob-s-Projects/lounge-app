"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Package,
  Receipt,
  UtensilsCrossed,
  TrendingUp,
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"

const navItems = [
  { title: "ダッシュボード", href: "/", icon: LayoutDashboard },
  { title: "商品一覧", href: "/products", icon: Package },
  { title: "仕入れ価格", href: "/suppliers", icon: Receipt },
  { title: "メニュー管理", href: "/menu", icon: UtensilsCrossed },
  { title: "原価分析", href: "/analysis", icon: TrendingUp },
]

export function AppSidebar() {
  const pathname = usePathname()

  return (
    <Sidebar>
      <SidebarHeader className="border-b px-4 py-4">
        <div className="flex flex-col gap-0.5">
          <span className="text-base font-semibold tracking-tight">
            LEDIAN Lounge
          </span>
          <span className="text-xs text-muted-foreground">原価管理システム</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>メニュー</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const isActive =
                  item.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(item.href)

                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      isActive={isActive}
                      tooltip={item.title}
                    >
                      <Link href={item.href} className="flex items-center gap-2 w-full">
                        <item.icon className="size-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
