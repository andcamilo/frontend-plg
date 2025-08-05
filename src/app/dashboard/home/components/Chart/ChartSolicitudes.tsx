"use client";

import type React from "react";

import { useState, useRef } from "react";

interface CircularChartProps {
  solicitudesEnProgreso: number;
  solicitudesFinalizadas: number;
}

interface TooltipData {
  show: boolean;
  x: number;
  y: number;
  label: string;
  value: number;
  percentage: number;
}

export default function CircularChart({
  solicitudesEnProgreso,
  solicitudesFinalizadas,
}: CircularChartProps) {
  const [tooltip, setTooltip] = useState<TooltipData>({
    show: false,
    x: 0,
    y: 0,
    label: "",
    value: 0,
    percentage: 0,
  });

  const svgRef = useRef<SVGSVGElement>(null);
  const total = solicitudesEnProgreso + solicitudesFinalizadas;

  // Calcular porcentajes
  const progresoPercentage =
    total > 0 ? (solicitudesEnProgreso / total) * 100 : 0;
  const finalizadasPercentage =
    total > 0 ? (solicitudesFinalizadas / total) * 100 : 0;

  // Configuración del círculo
  const radius = 80;
  const strokeWidth = 20;
  const normalizedRadius = radius - strokeWidth * 0.5;
  const circumference = normalizedRadius * 2 * Math.PI;

  // Calcular longitudes de los arcos
  const progresoStrokeDasharray = `${
    (progresoPercentage / 100) * circumference
  } ${circumference}`;
  const finalizadasStrokeDasharray = `${
    (finalizadasPercentage / 100) * circumference
  } ${circumference}`;

  // Calcular offset para el segundo segmento
  const finalizadasStrokeDashoffset = -(
    (progresoPercentage / 100) *
    circumference
  );

  const handleMouseMove = (
    event: React.MouseEvent,
    label: string,
    value: number,
    percentage: number
  ) => {
    if (svgRef.current) {
      const rect = svgRef.current.getBoundingClientRect();
      setTooltip({
        show: true,
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
        label,
        value,
        percentage: Math.round(percentage),
      });
    }
  };

  const handleMouseLeave = () => {
    setTooltip((prev) => ({ ...prev, show: false }));
  };

  return (
    <div className="w-full max-w-sm">
      {/* Contenedor del gráfico */}
      <div className="relative bg-gray-900 rounded-2xl shadow-lg p-6 border border-gray-700">
        {/* Título */}
        <div className="text-center mb-6">
          <h3 className="text-xl font-semibold text-white mb-1">
            Estado de Solicitudes
          </h3>
          <p className="text-sm text-gray-400">Distribución actual</p>
        </div>

        {/* SVG del gráfico circular */}
        <div className="relative flex justify-center">
          <svg
            ref={svgRef}
            width="200"
            height="200"
            viewBox="0 0 200 200"
            className="transform -rotate-90"
          >
            {/* Círculo de fondo */}
            <circle
              cx="100"
              cy="100"
              r={normalizedRadius}
              fill="transparent"
              stroke="#374151"
              strokeWidth={strokeWidth}
              className="opacity-30"
            />

            {/* Segmento de solicitudes finalizadas */}
            {finalizadasPercentage > 0 && (
              <circle
                cx="100"
                cy="100"
                r={normalizedRadius}
                fill="transparent"
                stroke="rgb(21, 21, 33)"
                strokeWidth={strokeWidth}
                strokeDasharray={finalizadasStrokeDasharray}
                strokeDashoffset={finalizadasStrokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-500 ease-in-out cursor-pointer hover:stroke-opacity-80"
                onMouseMove={(e) =>
                  handleMouseMove(
                    e,
                    "Finalizadas",
                    solicitudesFinalizadas,
                    finalizadasPercentage
                  )
                }
                onMouseLeave={handleMouseLeave}
              />
            )}

            {/* Segmento de solicitudes en progreso */}
            {progresoPercentage > 0 && (
              <circle
                cx="100"
                cy="100"
                r={normalizedRadius}
                fill="transparent"
                stroke="rgba(168, 85, 247, 0.2)"
                strokeWidth={strokeWidth}
                strokeDasharray={progresoStrokeDasharray}
                strokeDashoffset="0"
                strokeLinecap="round"
                className="transition-all duration-500 ease-in-out cursor-pointer hover:stroke-opacity-60"
                onMouseMove={(e) =>
                  handleMouseMove(
                    e,
                    "En Progreso",
                    solicitudesEnProgreso,
                    progresoPercentage
                  )
                }
                onMouseLeave={handleMouseLeave}
              />
            )}
          </svg>

          {/* Contenido central */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-3xl font-bold text-white">{total}</div>
              <div className="text-sm text-gray-400 font-medium">Total</div>
            </div>
          </div>
        </div>

        {/* Leyenda */}
        <div className="mt-8 space-y-4">
          <div className="flex items-center justify-between p-3 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors duration-200">
            <div className="flex items-center space-x-3">
              <div
                className="w-4 h-4 rounded-full border-2"
                style={{
                  backgroundColor: "rgba(168, 85, 247, 0.2)",
                  borderColor: "rgba(168, 85, 247, 0.4)",
                }}
              />
              <span className="text-sm font-medium text-gray-200">
                En Progreso
              </span>
            </div>
            <div className="text-right">
              <div className="text-sm font-semibold text-white">
                {solicitudesEnProgreso}
              </div>
              <div className="text-xs text-gray-400">
                {Math.round(progresoPercentage)}%
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors duration-200">
            <div className="flex items-center space-x-3">
              <div
                className="w-4 h-4 rounded-full border-2"
                style={{
                  backgroundColor: "rgb(21, 21, 33)",
                  borderColor: "rgb(21, 21, 33)",
                }}
              />
              <span className="text-sm font-medium text-gray-200">
                Finalizadas
              </span>
            </div>
            <div className="text-right">
              <div className="text-sm font-semibold text-white">
                {solicitudesFinalizadas}
              </div>
              <div className="text-xs text-gray-400">
                {Math.round(finalizadasPercentage)}%
              </div>
            </div>
          </div>
        </div>

        {/* Tooltip personalizado */}
        {tooltip.show && (
          <div
            className="absolute z-10 bg-gray-800 text-white px-3 py-2 rounded-lg shadow-lg pointer-events-none transform -translate-x-1/2 -translate-y-full"
            style={{
              left: tooltip.x,
              top: tooltip.y - 10,
            }}
          >
            <div className="text-sm font-medium">{tooltip.label}</div>
            <div className="text-xs opacity-90">
              Cantidad: {tooltip.value} ({tooltip.percentage}%)
            </div>
            {/* Flecha del tooltip */}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800" />
          </div>
        )}
      </div>
    </div>
  );
}
