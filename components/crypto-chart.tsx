"use client"

import { useEffect, useState } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { LineChart, Line, XAxis, YAxis, CartesianGrid } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

interface CryptoChartProps {
  data: any[]
  isLoading: boolean
  symbol: string
  timeframe: string
}

export default function CryptoChart({ data, isLoading, symbol, timeframe }: CryptoChartProps) {
  const [chartData, setChartData] = useState<any[]>([])

  useEffect(() => {
    if (data && data.length > 0) {
      // Format data for the chart
      const formattedData = data.map((item) => ({
        time: new Date(Number.parseInt(item.openTime)).toLocaleString(),
        price: Number.parseFloat(item.close),
        open: Number.parseFloat(item.open),
        high: Number.parseFloat(item.high),
        low: Number.parseFloat(item.low),
        volume: Number.parseFloat(item.volume),
      }))
      setChartData(formattedData)
    }
  }, [data])

  if (isLoading) {
    return (
      <div className="w-full h-[400px] flex items-center justify-center">
        <Skeleton className="w-full h-[400px]" />
      </div>
    )
  }

  if (!data || data.length === 0) {
    return (
      <div className="w-full h-[400px] flex items-center justify-center">
        <p className="text-muted-foreground">No data available</p>
      </div>
    )
  }

  // Find min and max values for better chart scaling
  const prices = chartData.map((item) => item.price)
  const minPrice = Math.min(...prices) * 0.995 // 0.5% lower
  const maxPrice = Math.max(...prices) * 1.005 // 0.5% higher

  return (
    <div className="w-full h-[400px]">
      <ChartContainer
        config={{
          price: {
            label: "Price",
            color: "hsl(var(--chart-1))",
          },
        }}
        className="h-full"
      >
        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="time"
            tickFormatter={(value) => {
              const date = new Date(value)
              return timeframe === "1d"
                ? date.toLocaleDateString()
                : date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
            }}
            tick={{ fontSize: 12 }}
            minTickGap={30}
          />
          <YAxis
            domain={[minPrice, maxPrice]}
            tickFormatter={(value) => value.toFixed(2)}
            tick={{ fontSize: 12 }}
            width={60}
          />
          <ChartTooltip
            content={<ChartTooltipContent formatValue={(value) => `$${Number.parseFloat(value).toFixed(2)}`} />}
          />
          <Line
            type="monotone"
            dataKey="price"
            stroke="var(--color-price)"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ChartContainer>
    </div>
  )
}

