"use client"

import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import { Sun, Moon, Monitor } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip"

const themes = ["system", "light", "dark"] as const
const themeLabels: Record<string, string> = {
  system: "システム",
  light: "ライト",
  dark: "ダーク",
}
const themeIcons: Record<string, typeof Sun> = {
  system: Monitor,
  light: Sun,
  dark: Moon,
}

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="size-8" disabled>
        <Monitor className="size-4" />
      </Button>
    )
  }

  const current = theme ?? "system"
  const nextIndex = (themes.indexOf(current as (typeof themes)[number]) + 1) % themes.length
  const next = themes[nextIndex]
  const Icon = themeIcons[current] ?? Monitor

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            onClick={() => setTheme(next)}
          >
            <Icon className="size-4" />
            <span className="sr-only">テーマ切替</span>
          </Button>
        }
      />
      <TooltipContent side="top">
        {themeLabels[current]}
      </TooltipContent>
    </Tooltip>
  )
}
