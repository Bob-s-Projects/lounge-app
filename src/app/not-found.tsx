import Link from "next/link"
import { FileQuestion } from "lucide-react"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-full bg-muted">
            <FileQuestion className="size-6 text-muted-foreground" />
          </div>
          <CardTitle className="text-xl">ページが見つかりません</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-sm text-muted-foreground">
            お探しのページは存在しないか、移動した可能性があります。
          </p>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Link
            href="/"
            className="inline-flex h-8 items-center justify-center rounded-lg bg-primary px-2.5 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/80"
          >
            ダッシュボードに戻る
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}
