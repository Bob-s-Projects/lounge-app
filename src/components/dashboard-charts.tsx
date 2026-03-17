"use client"

import { Bar, BarChart, XAxis, YAxis, CartesianGrid } from "recharts"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

type CategoryChartData = {
  name: string
  count: number
}

const productChartConfig = {
  count: {
    label: "商品数",
    color: "hsl(239, 84%, 67%)",
  },
} satisfies ChartConfig

const supplierChartConfig = {
  count: {
    label: "品目数",
    color: "hsl(45, 93%, 47%)",
  },
} satisfies ChartConfig

export function ProductCategoryChart({
  data,
}: {
  data: CategoryChartData[]
}) {
  return (
    <Card className="shadow-sm hover:shadow-md transition-all duration-200 rounded-xl">
      <CardHeader>
        <CardTitle>カテゴリ別商品数</CardTitle>
        <CardDescription>POS登録商品の上位10カテゴリ</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={productChartConfig} className="h-[350px] w-full">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ left: 0, right: 16, top: 0, bottom: 0 }}
          >
            <CartesianGrid horizontal={false} strokeOpacity={0.3} />
            <YAxis
              dataKey="name"
              type="category"
              width={140}
              tickLine={false}
              axisLine={false}
              fontSize={12}
            />
            <XAxis type="number" tickLine={false} axisLine={false} />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Bar
              dataKey="count"
              fill="var(--color-count)"
              radius={[0, 6, 6, 0]}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

export function SupplierCategoryChart({
  data,
}: {
  data: CategoryChartData[]
}) {
  return (
    <Card className="shadow-sm hover:shadow-md transition-all duration-200 rounded-xl">
      <CardHeader>
        <CardTitle>仕入れカテゴリ別品目数</CardTitle>
        <CardDescription>仕入れ先の上位10カテゴリ</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={supplierChartConfig}
          className="h-[350px] w-full"
        >
          <BarChart
            data={data}
            layout="vertical"
            margin={{ left: 0, right: 16, top: 0, bottom: 0 }}
          >
            <CartesianGrid horizontal={false} strokeOpacity={0.3} />
            <YAxis
              dataKey="name"
              type="category"
              width={160}
              tickLine={false}
              axisLine={false}
              fontSize={12}
            />
            <XAxis type="number" tickLine={false} axisLine={false} />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Bar
              dataKey="count"
              fill="var(--color-count)"
              radius={[0, 6, 6, 0]}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
