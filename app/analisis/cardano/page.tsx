"use client"

import { useEffect, useState } from "react";
import {
    fetchHistoricalData,
    fetchCurrentPrice,
    calculateIndicators,
    determineSignal,
    CurrentPriceDisplay, HistoricalDataTable
} from "@/app/lib/utils";
import { HistoricalData, Indicators } from "@/app/lib/definitions";

export default function MarketAnalysis() {
    const [historicalData, setHistoricalData] = useState<HistoricalData[]>([]);
    const [currentPrice, setCurrentPrice] = useState<number | null>(null);
    const [indicators, setIndicators] = useState<Indicators | null>(null);
    const [signal, setSignal] = useState<string>("mantener");

    // Fetch de datos históricos e indicadores
    useEffect(() => {
        const fetchMarketData = async () => {
            const data = await fetchHistoricalData("ADAUSDT");
            setHistoricalData(data);
            setIndicators(calculateIndicators(data));
        };
        fetchMarketData();
    }, []);

    // Actualización periódica del precio actual y señal
    useEffect(() => {
        const interval = setInterval(async () => {
            const price = await fetchCurrentPrice("ADAUSDT");
            setCurrentPrice(price);

            if (indicators) {
                setSignal(determineSignal(price, indicators));
            }
        }, 10000);

        return () => clearInterval(interval);
    }, [indicators]);

    return (
        <div className="p-4">
            <h1 className="text-xl font-bold">Análisis del Mercado de Cardano</h1>

            {currentPrice !== null && <CurrentPriceDisplay price={currentPrice} signal={signal} />}

            {indicators && (
                <div className="mt-4">
                    <p>RSI: {indicators.rsi.toFixed(2)}</p>
                    <p>Banda superior: ${indicators.upperBand.toFixed(2)}</p>
                    <p>Banda inferior: ${indicators.lowerBand.toFixed(2)}</p>
                </div>
            )}

            <h2 className="text-lg font-semibold mt-6">Datos históricos</h2>
            <HistoricalDataTable data={historicalData} />
        </div>
    );
}