// Technical analysis indicators

// Calculate Relative Strength Index (RSI)
export function calculateRSI(prices: number[], period = 14): number {
  if (prices.length < period + 1) {
    return 50 // Not enough data, return neutral
  }

  let gains = 0
  let losses = 0

  // Calculate initial average gain and loss
  for (let i = 1; i <= period; i++) {
    const change = prices[i] - prices[i - 1]
    if (change >= 0) {
      gains += change
    } else {
      losses -= change
    }
  }

  let avgGain = gains / period
  let avgLoss = losses / period

  // Calculate RSI using Wilder's smoothing method
  for (let i = period + 1; i < prices.length; i++) {
    const change = prices[i] - prices[i - 1]
    let currentGain = 0
    let currentLoss = 0

    if (change >= 0) {
      currentGain = change
    } else {
      currentLoss = -change
    }

    avgGain = (avgGain * (period - 1) + currentGain) / period
    avgLoss = (avgLoss * (period - 1) + currentLoss) / period
  }

  if (avgLoss === 0) {
    return 100 // No losses, RSI is 100
  }

  const rs = avgGain / avgLoss
  return 100 - 100 / (1 + rs)
}

// Calculate Moving Average Convergence Divergence (MACD)
export function calculateMACD(
  prices: number[],
  fastPeriod = 12,
  slowPeriod = 26,
  signalPeriod = 9,
): { macd: number; signal: number; histogram: number; previousHistogram: number } {
  if (prices.length < slowPeriod + signalPeriod) {
    return { macd: 0, signal: 0, histogram: 0, previousHistogram: 0 } // Not enough data
  }

  // Calculate EMAs
  const fastEMA = calculateEMA(prices, fastPeriod)
  const slowEMA = calculateEMA(prices, slowPeriod)

  // Calculate MACD line
  const macdLine = fastEMA - slowEMA

  // Calculate previous MACD values for signal line
  const macdValues: number[] = []
  for (let i = 0; i < prices.length; i++) {
    const fastEMAValue = calculateEMA(prices.slice(0, i + 1), fastPeriod)
    const slowEMAValue = calculateEMA(prices.slice(0, i + 1), slowPeriod)
    macdValues.push(fastEMAValue - slowEMAValue)
  }

  // Calculate signal line (EMA of MACD)
  const signalLine = calculateEMA(macdValues.slice(-signalPeriod - 10), signalPeriod)

  // Calculate histogram
  const histogram = macdLine - signalLine

  // Calculate previous histogram for trend comparison
  const previousMacdLine = macdValues[macdValues.length - 2]
  const previousSignalLine = calculateEMA(macdValues.slice(-signalPeriod - 11, -1), signalPeriod)
  const previousHistogram = previousMacdLine - previousSignalLine

  return {
    macd: macdLine,
    signal: signalLine,
    histogram,
    previousHistogram,
  }
}

// Calculate Bollinger Bands
export function calculateBollingerBands(
  prices: number[],
  period = 20,
  multiplier = 2,
): { upper: number; middle: number; lower: number } {
  if (prices.length < period) {
    const avg = prices.reduce((sum, price) => sum + price, 0) / prices.length
    return { upper: avg * 1.1, middle: avg, lower: avg * 0.9 } // Not enough data
  }

  // Calculate SMA (middle band)
  const sma = calculateSMA(prices, period)

  // Calculate standard deviation
  let sumSquaredDiff = 0
  for (let i = prices.length - period; i < prices.length; i++) {
    sumSquaredDiff += Math.pow(prices[i] - sma, 2)
  }
  const stdDev = Math.sqrt(sumSquaredDiff / period)

  // Calculate upper and lower bands
  const upperBand = sma + multiplier * stdDev
  const lowerBand = sma - multiplier * stdDev

  return {
    upper: upperBand,
    middle: sma,
    lower: lowerBand,
  }
}

// Calculate Moving Average
export function calculateMovingAverage(prices: number[], period = 200): number {
  if (prices.length < period) {
    return prices.reduce((sum, price) => sum + price, 0) / prices.length // Not enough data
  }

  return calculateSMA(prices, period)
}

// Helper: Calculate Simple Moving Average (SMA)
function calculateSMA(prices: number[], period: number): number {
  const slicedPrices = prices.slice(-period)
  return slicedPrices.reduce((sum, price) => sum + price, 0) / period
}

// Helper: Calculate Exponential Moving Average (EMA)
function calculateEMA(prices: number[], period: number): number {
  if (prices.length < period) {
    return calculateSMA(prices, prices.length) // Not enough data, use SMA
  }

  // Start with SMA for the first EMA value
  let ema = calculateSMA(prices.slice(0, period), period)

  // Multiplier: 2 / (period + 1)
  const multiplier = 2 / (period + 1)

  // Calculate EMA for remaining prices
  for (let i = period; i < prices.length; i++) {
    ema = (prices[i] - ema) * multiplier + ema
  }

  return ema
}

