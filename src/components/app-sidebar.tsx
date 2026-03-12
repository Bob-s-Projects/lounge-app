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
  SidebarSeparator,
} from "@/components/ui/sidebar"

const menuNav = [
  { title: "グランドメニュー", href: "/grand-menu", icon: BookOpen },
  { title: "季節メニュー", href: "/seasonal", icon: IceCream },
  { title: "商品マスタ", href: "/products", icon: Package },
]

const analysisNav = [
  { title: "売上分析", href: "/sales", icon: BarChart3 },
  { title: "原価分析", href: "/analysis", icon: TrendingUp },
  { title: "改廃アドバイス", href: "/menu", icon: UtensilsCrossed },
  { title: "仕入れ価格", href: "/suppliers", icon: Receipt },
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
          <span className="text-xs text-muted-foreground">メニューマネージャー</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={pathname === "/"}
                  tooltip="ダッシュボード"
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
        <SidebarSeparator />
        <SidebarGroup>
          <SidebarGroupLabel>メニュー運用</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuNav.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    isActive={pathname.startsWith(item.href)}
                    tooltip={item.title}
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
        <SidebarSeparator />
        <SidebarGroup>
          <SidebarGroupLabel>分析・コスト</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {analysisNav.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton
                    isActive={pathname.startsWith(item.href)}
                    tooltip={item.title}
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
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}
