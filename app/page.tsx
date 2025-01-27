"use client"

import { useEffect, useRef, useState } from "react";
import Chart from "chart.js/auto";

// Tipos para los datos
type PriceData = number[]; // Array de precios
type TimeLabels = string[]; // Array de etiquetas de tiempo

interface WebSocketMessage {
    p: string; // El precio de Bitcoin en formato string desde Binance
}
function calcularHoras(): string[] {
    const horas: string[] = [];
    let fecha: Date = new Date(); // Hora actual

    for (let i = 0; i < 6; i++) {
        horas.push(fecha.toLocaleTimeString()); // Añadir hora actual en formato local
        fecha = new Date(fecha.getTime() + 1000); // Sumar 1 milisegundo
    }

    return horas;
}

export default function Home() {
    const [priceData, setPriceData] = useState<PriceData>([35000, 37000, 39000, 42000, 41000, 40000]); // Precios iniciales
    const [timeLabels, setTimeLabels] = useState<TimeLabels>(calcularHoras()); // Inicializa con las horas calculadas
    const chartRef = useRef<HTMLCanvasElement | null>(null);
    const chartInstance = useRef<Chart | null>(null); // Ref para mantener la instancia del gráfico

    useEffect(() => {
        // Inicializa el gráfico de Bitcoin solo una vez
        const ctx = chartRef.current?.getContext("2d");
        if (!ctx) return;

        chartInstance.current = new Chart(ctx, {
            type: "line",
            data: {
                labels: timeLabels,
                datasets: [
                    {
                        label: "Precio de Bitcoin",
                        data: priceData,
                        borderColor: "#1E3A8A",
                        borderWidth: 2,
                        fill: false,
                        pointRadius: 5,
                        pointBackgroundColor: "#1E3A8A",
                        tension: 0.3, // Agrega suavidad a las líneas
                    },
                ],
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: false,
                        title: {
                            display: true,
                            text: "Precio en USD",
                        },
                        ticks: {
                            callback: function (value) {
                                return `$${value}`;
                            },
                        },
                    },
                    x: {
                        title: {
                            display: true,
                            text: "Hora",
                        },
                    },
                },
            },
        });

        // Conexión WebSocket a la API de Binance para obtener el precio de Bitcoin en tiempo real
        const socket = new WebSocket("wss://stream.binance.com:9443/ws/btcusdt@trade");

        socket.onmessage = (event: MessageEvent) => {
            const message: WebSocketMessage = JSON.parse(event.data); // El mensaje contiene el precio
            const newPrice = parseFloat(message.p); // Extraemos el precio de la respuesta
            const currentTime = new Date().toLocaleTimeString(); // Hora actual

            setPriceData((prevData) => {
                // Mantén los últimos 6 precios
                const newData = [...prevData.slice(1), newPrice];

                // Actualiza el gráfico solo si ya está inicializado
                if (chartInstance.current) {
                    chartInstance.current.data.datasets[0].data = newData;
                    chartInstance.current.update();
                }
                return newData;
            });

            setTimeLabels((prevLabels) => {
                // Mantén las últimas 6 etiquetas de tiempo
                const newLabels = [...prevLabels.slice(1), currentTime];

                if (chartInstance.current) {
                    chartInstance.current.data.labels = newLabels;
                    chartInstance.current.update();
                }
                return newLabels;
            });
        };

        // Limpiar WebSocket al desmontar el componente
        return () => {
            socket.close();
            if (chartInstance.current) {
                chartInstance.current.destroy(); // Destruye el gráfico cuando se desmonte el componente
            }
        };
    }, []); // Solo ejecutar este effect una vez al montar

    return (
        <div className="min-h-screen bg-gray-100 p-8 flex flex-col items-center">
            <h1 className="text-3xl font-bold text-gray-800 mb-8">Gráfico en tiempo real de Bitcoin</h1>

            {/* Contenedor del gráfico */}
            <div className="w-full max-w-4xl mb-8">
                <canvas ref={chartRef} id="bitcoinChart" className="w-full h-96" />
            </div>

            {/* Contenedor de las señales */}
            <div className="flex flex-wrap justify-center gap-6">
                <div className="bg-white shadow-lg rounded-lg p-6 w-72">
                    <h3 className="text-xl text-blue-700 mb-4">Señales Generadas por Coinalert</h3>
                    <p className="text-sm text-gray-600">Compra: 38,000 USD - 15/03/2024</p>
                    <p className="text-sm text-gray-600">Venta: 42,000 USD - 20/03/2024</p>
                    <p className="text-sm text-gray-600">Compra: 40,000 USD - 25/03/2024</p>
                </div>
                <div className="bg-white shadow-lg rounded-lg p-6 w-72">
                    <h3 className="text-xl text-blue-700 mb-4">Señales Operadas por el Usuario</h3>
                    <p className="text-sm text-gray-600">Compra: 39,000 USD - 17/03/2024</p>
                    <p className="text-sm text-gray-600">Venta: 41,500 USD - 21/03/2024</p>
                </div>
            </div>
        </div>
    );
}

