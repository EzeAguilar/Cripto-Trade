"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { calculateRSI, calculateMACD, calculateBollingerBands, calculateMovingAverage } from "@/lib/indicators"
import { ArrowUpCircle, ArrowDownCircle, AlertCircle } from "lucide-react"

interface TechnicalAnalysisProps {
  data: any[]
  isLoading: boolean
  symbol: string
}

export default function TechnicalAnalysis({ data, isLoading, symbol }: TechnicalAnalysisProps) {
  const [analysis, setAnalysis] = useState({
    rsi: { value: 0, signal: "neutral" },
    macd: { value: 0, signal: "neutral", histogram: 0 },
    bollingerBands: { upper: 0, middle: 0, lower: 0, signal: "neutral" },
    ma200: { value: 0, signal: "neutral" },
    overallSignal: "neutral",
  })

  useEffect(() => {
    if (data && data.length > 0) {
      // Extract close prices
      const prices = data.map((candle) => Number.parseFloat(candle.close))

      // Calculate indicators
      const rsi = calculateRSI(prices, 14)
      const macd = calculateMACD(prices, 12, 26, 9)
      const bollingerBands = calculateBollingerBands(prices, 20, 2)
      const ma200 = calculateMovingAverage(prices, 200)

      // Determine signals
      const rsiSignal = rsi > 70 ? "sell" : rsi < 30 ? "buy" : "neutral"

      const macdSignal =
        macd.histogram > 0
          ? macd.histogram > macd.previousHistogram
            ? "strong_buy"
            : "buy"
          : macd.histogram < 0
            ? macd.histogram < macd.previousHistogram
              ? "strong_sell"
              : "sell"
            : "neutral"

      const lastPrice = prices[prices.length - 1]
      const bbSignal = lastPrice > bollingerBands.upper ? "sell" : lastPrice < bollingerBands.lower ? "buy" : "neutral"

      const ma200Signal = lastPrice > ma200 ? "buy" : lastPrice < ma200 ? "sell" : "neutral"

      // Determine overall signal
      let buySignals = 0
      let sellSignals = 0

      if (rsiSignal === "buy") buySignals++
      if (rsiSignal === "sell") sellSignals++

      if (macdSignal === "buy" || macdSignal === "strong_buy") buySignals++
      if (macdSignal === "sell" || macdSignal === "strong_sell") sellSignals++

      if (bbSignal === "buy") buySignals++
      if (bbSignal === "sell") sellSignals++

      if (ma200Signal === "buy") buySignals++
      if (ma200Signal === "sell") sellSignals++

      let overallSignal = "neutral"
      if (buySignals > sellSignals && buySignals >= 2) {
        overallSignal = buySignals >= 3 ? "strong_buy" : "buy"
      } else if (sellSignals > buySignals && sellSignals >= 2) {
        overallSignal = sellSignals >= 3 ? "strong_sell" : "sell"
      }

      setAnalysis({
        rsi: { value: rsi, signal: rsiSignal },
        macd: { value: macd.macd, signal: macdSignal, histogram: macd.histogram },
        bollingerBands: {
          upper: bollingerBands.upper,
          middle: bollingerBands.middle,
          lower: bollingerBands.lower,
          signal: bbSignal,
        },
        ma200: { value: ma200, signal: ma200Signal },
        overallSignal,
      })
    }
  }, [data])

  const getSignalColor = (signal) => {
    switch (signal) {
      case "buy":
        return "bg-green-100 text-green-800 hover:bg-green-100"
      case "strong_buy":
        return "bg-green-500 text-white hover:bg-green-500"
      case "sell":
        return "bg-red-100 text-red-800 hover:bg-red-100"
      case "strong_sell":
        return "bg-red-500 text-white hover:bg-red-500"
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100"
    }
  }

  const getSignalIcon = (signal) => {
    switch (signal) {
      case "buy":
      case "strong_buy":
        return <ArrowUpCircle className="h-4 w-4 text-green-500" />
      case "sell":
      case "strong_sell":
        return <ArrowDownCircle className="h-4 w-4 text-red-500" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />
    }
  }

  const formatSignal = (signal) => {
    switch (signal) {
      case "buy":
        return "Buy"
      case "strong_buy":
        return "Strong Buy"
      case "sell":
        return "Sell"
      case "strong_sell":
        return "Strong Sell"
      default:
        return "Neutral"
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-20 w-full" />
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Signal Summary</h3>
        <Badge className={getSignalColor(analysis.overallSignal)}>
          {getSignalIcon(analysis.overallSignal)}
          <span className="ml-1">{formatSignal(analysis.overallSignal)}</span>
        </Badge>
      </div>

      <Tabs defaultValue="summary">
        <TabsList className="grid grid-cols-2 mb-4">
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
        </TabsList>

        <TabsContent value="summary">
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-col">
                  <span className="text-sm text-muted-foreground">RSI (14)</span>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-lg font-medium">{analysis.rsi.value.toFixed(2)}</span>
                    <Badge className={getSignalColor(analysis.rsi.signal)}>{formatSignal(analysis.rsi.signal)}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex flex-col">
                  <span className="text-sm text-muted-foreground">MACD</span>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-lg font-medium">{analysis.macd.value.toFixed(2)}</span>
                    <Badge className={getSignalColor(analysis.macd.signal)}>{formatSignal(analysis.macd.signal)}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex flex-col">
                  <span className="text-sm text-muted-foreground">Bollinger Bands</span>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex flex-col">
                      <span className="text-xs text-muted-foreground">
                        Upper: {analysis.bollingerBands.upper.toFixed(2)}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Middle: {analysis.bollingerBands.middle.toFixed(2)}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Lower: {analysis.bollingerBands.lower.toFixed(2)}
                      </span>
                    </div>
                    <Badge className={getSignalColor(analysis.bollingerBands.signal)}>
                      {formatSignal(analysis.bollingerBands.signal)}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex flex-col">
                  <span className="text-sm text-muted-foreground">MA (200)</span>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-lg font-medium">{analysis.ma200.value.toFixed(2)}</span>
                    <Badge className={getSignalColor(analysis.ma200.signal)}>
                      {formatSignal(analysis.ma200.signal)}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="details">
          <div className="space-y-4">
            <Card>
              <CardContent className="p-4">
                <h4 className="font-medium mb-2">RSI (Relative Strength Index)</h4>
                <p className="text-sm text-muted-foreground mb-2">Current value: {analysis.rsi.value.toFixed(2)}</p>
                <p className="text-sm text-muted-foreground">
                  RSI above 70 indicates overbought conditions (sell signal), while RSI below 30 indicates oversold
                  conditions (buy signal).
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <h4 className="font-medium mb-2">MACD (Moving Average Convergence Divergence)</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  MACD Line: {analysis.macd.value.toFixed(2)}, Histogram: {analysis.macd.histogram.toFixed(2)}
                </p>
                <p className="text-sm text-muted-foreground">
                  MACD crossing above the signal line is bullish, while crossing below is bearish. The histogram shows
                  the difference between MACD and its signal line.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <h4 className="font-medium mb-2">Bollinger Bands</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  Upper: {analysis.bollingerBands.upper.toFixed(2)}, Middle: {analysis.bollingerBands.middle.toFixed(2)}
                  , Lower: {analysis.bollingerBands.lower.toFixed(2)}
                </p>
                <p className="text-sm text-muted-foreground">
                  Price touching the upper band may indicate overbought conditions, while touching the lower band may
                  indicate oversold conditions.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <h4 className="font-medium mb-2">MA200 (200-day Moving Average)</h4>
                <p className="text-sm text-muted-foreground mb-2">Current value: {analysis.ma200.value.toFixed(2)}</p>
                <p className="text-sm text-muted-foreground">
                  Price above MA200 indicates a bullish trend, while price below MA200 indicates a bearish trend.
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

