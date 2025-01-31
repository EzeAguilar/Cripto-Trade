import axios from "axios";
import {CryptoSymbol, HistoricalData, BollingerBands, Indicators, BinanceCandle} from "./definitions";

const BinanceAPI = {
    historicalData: "https://api.binance.com/api/v3/klines",
    currentPrice: "https://api.binance.com/api/v3/ticker/price",
};

export const fetchHistoricalData = async (symbol: CryptoSymbol): Promise<HistoricalData[]> => {
    const params = { symbol, interval: "1d", limit: 60 };
    const response = await axios.get(BinanceAPI.historicalData, { params });
    return response.data.map(([time, open, high, low, close]: BinanceCandle) => ({
        time: new Date(time),
        open: parseFloat(open),
        high: parseFloat(high),
        low: parseFloat(low),
        close: parseFloat(close),
    }));
};

export const fetchCurrentPrice = async (symbol: CryptoSymbol): Promise<number> => {
    const response = await axios.get(BinanceAPI.currentPrice, { params: { symbol } });
    return parseFloat(response.data.price);
};

export const calculateRSI = (data: number[], period: number = 14): number => {
    let gains = 0, losses = 0;
    for (let i = 1; i <= period; i++) {
        const delta = data[i] - data[i - 1];
        if (delta > 0) gains += delta;
        else losses -= delta;
    }
    let avgGain = gains / period;
    let avgLoss = losses / period;
    for (let i = period + 1; i < data.length; i++) {
        const delta = data[i] - data[i - 1];
        avgGain = (avgGain * (period - 1) + (delta > 0 ? delta : 0)) / period;
        avgLoss = (avgLoss * (period - 1) + (delta < 0 ? -delta : 0)) / period;
    }
    const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    return 100 - 100 / (1 + rs);
};

export const calculateBollingerBands = (data: number[], period: number = 20): BollingerBands => {
    const mean = data.slice(-period).reduce((sum, val) => sum + val, 0) / period;
    const variance = data.slice(-period).reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / period;
    const standardDeviation = Math.sqrt(variance);
    return {
        upperBand: mean + 2 * standardDeviation,
        lowerBand: mean - 2 * standardDeviation,
    };
};

export function calculateIndicators(data: HistoricalData[]): Indicators {
    const closePrices = data.map((dia) => dia.close);
    const rsi = calculateRSI(closePrices);
    const { upperBand, lowerBand } = calculateBollingerBands(closePrices);
    return { rsi, upperBand, lowerBand };
}

export function determineSignal(price: number, indicators: Indicators): string {
    if (indicators.rsi < 30 && price < indicators.lowerBand) return "compra";
    if (indicators.rsi > 70 && price > indicators.upperBand) return "venta";
    return "mantener";
}

export function CurrentPriceDisplay({ price, signal }: { price: number; signal: string }) {
    return (
        <div className="mt-4">
            <p>Precio actual: {`$${price.toFixed(2)}`}</p>
            <p>Señal: {signal}</p>
        </div>
    );
}

export function HistoricalDataTable({ data }: { data: HistoricalData[] }) {
    return (
        <div className="overflow-auto max-h-64">
            <table className="w-full mt-2 text-sm border-collapse border border-gray-200">
                <thead>
                <tr>
                    <th className="border border-gray-200 p-2">Fecha</th>
                    <th className="border border-gray-200 p-2">Apertura</th>
                    <th className="border border-gray-200 p-2">Máximo</th>
                    <th className="border border-gray-200 p-2">Mínimo</th>
                    <th className="border border-gray-200 p-2">Cierre</th>
                </tr>
                </thead>
                <tbody>
                {data.map((row, index) => (
                    <tr key={index}>
                        <td className="border border-gray-200 p-2">{new Date(row.time).toLocaleDateString()}</td>
                        <td className="border border-gray-200 p-2">{`$${row.open.toFixed(2)}`}</td>
                        <td className="border border-gray-200 p-2">{`$${row.high.toFixed(2)}`}</td>
                        <td className="border border-gray-200 p-2">{`$${row.low.toFixed(2)}`}</td>
                        <td className="border border-gray-200 p-2">{`$${row.close.toFixed(2)}`}</td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}

