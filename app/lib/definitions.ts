export type HistoricalData = {
    time: Date;
    open: number;
    high: number;
    low: number;
    close: number;
};

export type Indicators = {
    rsi: number;
    upperBand: number;
    lowerBand: number;
};

export type CryptoSymbol = "BTCUSDT" | "ETHUSDT" | "BNBUSDT" | "ADAUSDT";

export type BollingerBands = {
    upperBand: number;
    lowerBand: number;
};

export type BinanceCandle = [number, string, string, string, string] //tipo para los datos históricos de binance
