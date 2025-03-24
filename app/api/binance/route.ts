import { NextResponse } from "next/server"
import { fetchCryptoData, fetchAvailablePairs, getCurrentPrice, getAccountInfo, getOpenOrders } from "@/lib/binance-api"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const action = searchParams.get("action")
  const symbol = searchParams.get("symbol") || "BTCUSDT"
  const timeframe = searchParams.get("timeframe") || "1h"

  try {
    switch (action) {
      case "getPairs":
        const pairs = await fetchAvailablePairs()
        return NextResponse.json({ success: true, data: pairs })

      case "getKlines":
        const data = await fetchCryptoData(symbol, timeframe)
        return NextResponse.json({ success: true, data })

      case "getCurrentPrice":
        const price = await getCurrentPrice(symbol)
        return NextResponse.json({ success: true, data: price })

      case "getAccountInfo":
        const accountInfo = await getAccountInfo()
        return NextResponse.json({ success: true, data: accountInfo })

      case "getOpenOrders":
        const orders = await getOpenOrders(symbol || undefined)
        return NextResponse.json({ success: true, data: orders })

      default:
        return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 })
    }
  } catch (error: any) {
    console.error("API error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Internal server error",
        details: error.toString(),
      },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { action, symbol, side, quantity, orderId } = body

    // Implement order placement and cancellation
    // This would require additional functions from binance-api.ts

    return NextResponse.json({ success: true, message: "Not implemented yet" })
  } catch (error: any) {
    console.error("API error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Internal server error",
      },
      { status: 500 },
    )
  }
}

