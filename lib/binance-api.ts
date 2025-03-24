// Real implementation of the Binance API
import { createHmac } from 'crypto';

// API base URLs
const API_BASE_URL = 'https://api.binance.com';
const API_KEY = process.env.BINANCE_API_KEY;
const API_SECRET = process.env.BINANCE_API_SECRET;

// Helper function to create signature for authenticated requests
function createSignature(queryString: string): string {
  return createHmac('sha256', API_SECRET as string)
    .update(queryString)
    .digest('hex');
}

// Helper function to make API requests
async function makeRequest(endpoint: string, params: Record<string, any> = {}, secured: boolean = false): Promise<any> {
  try {
    // Build query string
    const queryString = Object.entries(params)
      .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
      .join('&');
    
    // Add timestamp for secured requests
    let fullQueryString = queryString;
    if (secured) {
      const timestamp = Date.now();
      fullQueryString = queryString ? `${queryString}&timestamp=${timestamp}` : `timestamp=${timestamp}`;
      const signature = createSignature(fullQueryString);
      fullQueryString = `${fullQueryString}&signature=${signature}`;
    }
    
    // Build URL
    const url = `${API_BASE_URL}${endpoint}${fullQueryString ? `?${fullQueryString}` : ''}`;
    
    // Set headers
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (API_KEY) {
      headers['X-MBX-APIKEY'] = API_KEY;
    }
    
    // Make request
    const response = await fetch(url, { headers });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Binance API error: ${errorData.msg || 'Unknown error'}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Binance API request failed:', error);
    throw error;
  }
}

// Fetch available trading pairs
export async function fetchAvailablePairs(): Promise<string[]> {
  try {
    const exchangeInfo = await makeRequest('/api/v3/exchangeInfo');
    
    // Filter for USDT pairs as they're most common for trading
    return exchangeInfo.symbols
      .filter((symbol: any) => 
        symbol.status === 'TRADING' && 
        symbol.quoteAsset === 'USDT' &&
        symbol.isSpotTradingAllowed
      )
      .map((symbol: any) => symbol.symbol)
      .sort();
  } catch (error) {
    console.error('Failed to fetch available pairs:', error);
    throw error;
  }
}

// Convert Binance timeframe to interval parameter
function timeframeToInterval(timeframe: string): string {
  switch (timeframe) {
    case '15m': return '15m';
    case '1h': return '1h';
    case '4h': return '4h';
    case '1d': return '1d';
    default: return '1h';
  }
}

// Fetch klines (candlestick) data
export async function fetchCryptoData(symbol: string, timeframe: string): Promise<any[]> {
  try {
    const interval = timeframeToInterval(timeframe);
    const limit = 100; // Number of candles to fetch
    
    const klines = await makeRequest('/api/v3/klines', {
      symbol,
      interval,
      limit
    });
    
    // Transform Binance klines data to our format
    return klines.map((kline: any[]) => ({
      openTime: kline[0],
      open: kline[1],
      high: kline[2],
      low: kline[3],
      close: kline[4],
      volume: kline[5],
      closeTime: kline[6],
      quoteAssetVolume: kline[7],
      trades: kline[8],
      takerBuyBaseAssetVolume: kline[9],
      takerBuyQuoteAssetVolume: kline[10]
    }));
  } catch (error) {
    console.error(`Failed to fetch crypto data for ${symbol}:`, error);
    throw error;
  }
}

// Get account information (requires API key with permissions)
export async function getAccountInfo() {
  try {
    return await makeRequest('/api/v3/account', {}, true);
  } catch (error) {
    console.error('Failed to fetch account info:', error);
    throw error;
  }
}

// Get current price for a symbol
export async function getCurrentPrice(symbol: string): Promise<number> {
  try {
    const tickerData = await makeRequest('/api/v3/ticker/price', { symbol });
    return parseFloat(tickerData.price);
  } catch (error) {
    console.error(`Failed to fetch current price for ${symbol}:`, error);
    throw error;
  }
}

// Place a market order
export async function placeMarketOrder(
  symbol: string, 
  side: 'BUY' | 'SELL', 
  quantity: number
): Promise<any> {
  try {
    return await makeRequest('/api/v3/order', {
      symbol,
      side,
      type: 'MARKET',
      quantity,
    }, true);
  } catch (error) {
    console.error(`Failed to place ${side} order for ${symbol}:`, error);
    throw error;
  }
}

// Get open orders
export async function getOpenOrders(symbol?: string): Promise<any[]> {
  try {
    const params: Record<string, any> = {};
    if (symbol) {
      params.symbol = symbol;
    }
    
    return await makeRequest('/api/v3/openOrders', params, true);
  } catch (error) {
    console.error('Failed to fetch open orders:', error);
    throw error;
  }
}

// Cancel an order
export async function cancelOrder(symbol: string, orderId: number): Promise<any> {
  try {
    return await makeRequest('/api/v3/order', {
      symbol,
      orderId,
    }, true);
  } catch (error) {
    console.error(`Failed to cancel order ${orderId} for ${symbol}:`, error);
    throw error;
  }
}
