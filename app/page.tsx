"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs,TabsList, TabsTrigger } from "@/components/ui/tabs"
import CryptoChart from "@/components/crypto-chart"
import CryptoSelector from "@/components/crypto-selector"
import TechnicalAnalysis from "@/components/technical-analysis"
import AlertSettings from "@/components/alert-settings"
import { useToast } from "@/components/ui/use-toast"

export default function Home() {
  const [selectedCrypto, setSelectedCrypto] = useState("BTCUSDT")
  const [timeframe, setTimeframe] = useState("1h")
  const [cryptoData, setCryptoData] = useState([])
  const [availablePairs, setAvailablePairs] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        // Fetch available pairs
        const pairsResponse = await fetch("/api/binance?action=getPairs")
        if (!pairsResponse.ok) {
          throw new Error("Failed to fetch available pairs")
        }
        const pairsData = await pairsResponse.json()
        if (pairsData.success) {
          setAvailablePairs(pairsData.data)
        } else {
          throw new Error(pairsData.error || "Failed to fetch available pairs")
        }

        // Fetch initial crypto data
        const dataResponse = await fetch(
          `/api/binance?action=getKlines&symbol=${selectedCrypto}&timeframe=${timeframe}`,
        )
        if (!dataResponse.ok) {
          throw new Error("Failed to fetch crypto data")
        }
        const data = await dataResponse.json()
        if (data.success) {
          setCryptoData(data.data)
        } else {
          throw new Error(data.error || "Failed to fetch crypto data")
        }
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to load cryptocurrency data",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadInitialData()
  }, [toast])

  useEffect(() => {
    const loadCryptoData = async () => {
      setIsLoading(true)
      try {
        const response = await fetch(`/api/binance?action=getKlines&symbol=${selectedCrypto}&timeframe=${timeframe}`)
        if (!response.ok) {
          throw new Error("Failed to fetch crypto data")
        }
        const data = await response.json()
        if (data.success) {
          setCryptoData(data.data)
        } else {
          throw new Error(data.error || "Failed to fetch crypto data")
        }
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message || "Failed to load cryptocurrency data",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    loadCryptoData()
  }, [selectedCrypto, timeframe, toast])

  const handleCryptoChange = (crypto: string) => {
    setSelectedCrypto(crypto)
  }

  const handleTimeframeChange = (tf: string) => {
    setTimeframe(tf)
  }

  return (
    <main className="container mx-auto py-6 px-4">
      <h1 className="text-3xl font-bold mb-6">Coinalert</h1>
      <p className="text-muted-foreground mb-8">Automated cryptocurrency trading platform for beginners</p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="mb-6">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle>Market Chart</CardTitle>
                <div className="flex gap-2">
                  <Tabs>
                  <TabsList>
                    <TabsTrigger
                      value="15m"
                      onClick={() => handleTimeframeChange("15m")}
                      className={timeframe === "15m" ? "bg-primary text-primary-foreground" : ""}
                    >
                      15m
                    </TabsTrigger>
                    <TabsTrigger
                      value="1h"
                      onClick={() => handleTimeframeChange("1h")}
                      className={timeframe === "1h" ? "bg-primary text-primary-foreground" : ""}
                    >
                      1h
                    </TabsTrigger>
                    <TabsTrigger
                      value="4h"
                      onClick={() => handleTimeframeChange("4h")}
                      className={timeframe === "4h" ? "bg-primary text-primary-foreground" : ""}
                    >
                      4h
                    </TabsTrigger>
                    <TabsTrigger
                      value="1d"
                      onClick={() => handleTimeframeChange("1d")}
                      className={timeframe === "1d" ? "bg-primary text-primary-foreground" : ""}
                    >
                      1d
                    </TabsTrigger>
                  </TabsList>
                  </Tabs>
                </div>
              </div>
              <CardDescription>{selectedCrypto} price chart</CardDescription>
            </CardHeader>
            <CardContent>
              <CryptoChart data={cryptoData} isLoading={isLoading} symbol={selectedCrypto} timeframe={timeframe} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Technical Analysis</CardTitle>
              <CardDescription>Automated analysis based on multiple indicators</CardDescription>
            </CardHeader>
            <CardContent>
              <TechnicalAnalysis data={cryptoData} isLoading={isLoading} symbol={selectedCrypto} />
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Select Cryptocurrency</CardTitle>
              <CardDescription>Choose from available trading pairs</CardDescription>
            </CardHeader>
            <CardContent>
              <CryptoSelector
                availablePairs={availablePairs}
                selectedCrypto={selectedCrypto}
                onCryptoChange={handleCryptoChange}
                isLoading={isLoading}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Alert Settings</CardTitle>
              <CardDescription>Configure your trading parameters</CardDescription>
            </CardHeader>
            <CardContent>
              <AlertSettings symbol={selectedCrypto} />
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}

