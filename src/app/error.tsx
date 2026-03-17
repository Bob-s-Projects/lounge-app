"use client"

import { AlertTriangle } from "lucide-react"
import Link from "next/link"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button, buttonVariants } from "@/components/ui/button"

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="size-6 text-destructive" />
          </div>
          <CardTitle className="text-xl">エラーが発生しました</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-sm text-muted-foreground">
            {error.message || "予期しないエラーが発生しました。"}
          </p>
        </CardContent>
        <CardFooter className="flex justify-center gap-3">
          <Button variant="outline" onClick={reset}>
            再試行
          </Button>
          <Link href="/" className={buttonVariants()}>
            ダッシュボードに戻る
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}
