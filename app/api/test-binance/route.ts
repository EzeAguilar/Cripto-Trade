import { NextResponse } from "next/server"
import { getCurrentPrice } from "@/lib/binance-api"

export async function GET() {
  try {
    // Test the Binance API by getting the current BTC price
    const btcPrice = await getCurrentPrice("BTCUSDT")

    return NextResponse.json({
      success: true,
      message: "Binance API connection successful",
      btcPrice,
    })
  } catch (error: any) {
    console.error("Binance API test failed:", error)

    return NextResponse.json(
      {
        success: false,
        message: "Binance API connection failed",
        error: error.message || "Unknown error",
      },
      { status: 500 },
    )
  }
}

