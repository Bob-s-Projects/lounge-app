"use client"

import { AlertTriangle } from "lucide-react"
import Link from "next/link"
import { Button, buttonVariants } from "@/components/ui/button"

export default function SeasonalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20">
      <div className="flex size-12 items-center justify-center rounded-full bg-destructive/10">
        <AlertTriangle className="size-6 text-destructive" />
      </div>
      <h2 className="text-lg font-semibold">季節メニューの読み込みに失敗しました</h2>
      <p className="max-w-sm text-center text-sm text-muted-foreground">
        {error.message || "予期しないエラーが発生しました。"}
      </p>
      <div className="flex gap-3">
        <Button variant="outline" onClick={reset}>
          再試行
        </Button>
        <Link href="/" className={buttonVariants()}>
          ダッシュボードに戻る
        </Link>
      </div>
    </div>
  )
}
