"use client";

import { useState, useRef, useEffect } from "react";

interface MonthData {
  month: string;
  solicitudes: number;
  color?: string;
}

interface BarChartProps {
  data: MonthData[];
  title?: string;
  subtitle?: string;
}

interface TooltipData {
  show: boolean;
  x: number;
  y: number;
  month: string;
  solicitudes: number;
}

export default function BarChart({
  data,
  title = "Solicitudes por Mes",
  subtitle = "Evolución mensual de solicitudes recibidas",
}: BarChartProps) {
  const [tooltip, setTooltip] = useState<TooltipData>({
    show: false,
    x: 0,
    y: 0,
    month: "",
    solicitudes: 0,
  });

  const [animationStarted, setAnimationStarted] = useState(false);
  const chartRef = useRef<HTMLDivElement>(null);

  // Calcular valores para mejor visualización proporcional
  const maxValue = Math.max(...data.map((item) => item.solicitudes));
  const minValue = Math.min(...data.map((item) => item.solicitudes));
  const range = maxValue - minValue;

  // Altura mínima para barras (para que siempre sean visibles)
  const MIN_BAR_HEIGHT = 8; // 8px mínimo
  const MAX_BAR_HEIGHT = 240; // 240px máximo

  // Colores predefinidos para las barras con mejor contraste
  const defaultColors = [
    "from-purple-400 to-purple-600",
    "from-blue-400 to-blue-600",
    "from-indigo-400 to-indigo-600",
    "from-violet-400 to-violet-600",
    "from-cyan-400 to-cyan-600",
    "from-teal-400 to-teal-600",
    "from-emerald-400 to-emerald-600",
    "from-green-400 to-green-600",
    "from-lime-400 to-lime-600",
    "from-yellow-400 to-yellow-600",
    "from-orange-400 to-orange-600",
    "from-red-400 to-red-600",
  ];

  // Función para calcular altura proporcional mejorada
  const calculateBarHeight = (value: number): number => {
    if (maxValue === 0) return MIN_BAR_HEIGHT;

    if (range === 0) {
      // Si todos los valores son iguales, usar altura media
      return MAX_BAR_HEIGHT * 0.5;
    }

    // Calcular proporción con altura mínima garantizada
    const proportion = (value - minValue) / range;
    const calculatedHeight =
      MIN_BAR_HEIGHT + proportion * (MAX_BAR_HEIGHT - MIN_BAR_HEIGHT);

    return Math.max(MIN_BAR_HEIGHT, calculatedHeight);
  };

  // Generar etiquetas del eje Y más inteligentes
  const generateYAxisLabels = () => {
    const labels: number[] = [];
    const step = Math.ceil(maxValue / 5);

    for (let i = 5; i >= 0; i--) {
      const value = Math.min(step * i, maxValue);
      labels.push(value);
    }

    return labels;
  };

  const yAxisLabels = generateYAxisLabels();

  // Iniciar animación cuando el componente se monta
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimationStarted(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const handleMouseEnter = (
    event: React.MouseEvent,
    month: string,
    solicitudes: number
  ) => {
    if (chartRef.current) {
      const rect = chartRef.current.getBoundingClientRect();
      const barRect = (event.target as HTMLElement).getBoundingClientRect();

      setTooltip({
        show: true,
        x: barRect.left - rect.left + barRect.width / 2,
        y: barRect.top - rect.top,
        month,
        solicitudes,
      });
    }
  };

  const handleMouseLeave = () => {
    setTooltip((prev) => ({ ...prev, show: false }));
  };

  return (
    <div className="w-full">
      <div className="bg-gray-900 rounded-2xl shadow-lg p-6 border border-gray-700">
        {/* Header */}
        <div className="mb-8">
          <h3 className="text-2xl font-semibold text-white mb-2">{title}</h3>
          <p className="text-sm text-gray-400">{subtitle}</p>
          <div className="mt-2 text-xs text-gray-500">
            Rango: {minValue} - {maxValue} solicitudes
          </div>
        </div>

        {/* Chart Container */}
        <div ref={chartRef} className="relative">
          {/* Y-axis labels */}
          <div className="flex items-end mb-4">
            <div
              className="w-16 flex flex-col justify-between text-xs text-gray-400 pr-3"
              style={{ height: `${MAX_BAR_HEIGHT + 20}px` }}
            >
              {yAxisLabels.map((value, i) => (
                <div key={i} className="text-right leading-none">
                  {value}
                </div>
              ))}
            </div>

            {/* Chart area */}
            <div className="flex-1 relative">
              {/* Grid lines */}
              <div
                className="absolute inset-0 flex flex-col justify-between"
                style={{ height: `${MAX_BAR_HEIGHT}px` }}
              >
                {yAxisLabels.map((_, i) => (
                  <div
                    key={i}
                    className="border-t border-gray-700 opacity-30"
                  />
                ))}
              </div>

              {/* Bars container */}
              <div
                className="relative flex items-end justify-between gap-1 sm:gap-2 px-2"
                style={{ height: `${MAX_BAR_HEIGHT}px` }}
              >
                {data.map((item, index) => {
                  const barHeight = calculateBarHeight(item.solicitudes);
                  const colorClass =
                    item.color || defaultColors[index % defaultColors.length];

                  return (
                    <div
                      key={`${item.month}-${index}`}
                      className="flex-1 flex flex-col items-center group cursor-pointer max-w-20"
                      onMouseEnter={(e) =>
                        handleMouseEnter(e, item.month, item.solicitudes)
                      }
                      onMouseLeave={handleMouseLeave}
                    >
                      {/* Bar */}
                      <div className="w-full relative flex justify-center">
                        <div
                          className={`bg-gradient-to-t ${colorClass} rounded-t-lg transition-all duration-1000 ease-out hover:scale-105 hover:shadow-lg group-hover:brightness-110 relative`}
                          style={{
                            height: animationStarted ? `${barHeight}px` : "0px",
                            width: "100%",
                            maxWidth: "60px",
                            minWidth: "20px",
                          }}
                        >
                          {/* Valor en la parte superior de la barra */}
                          <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap bg-gray-800 px-2 py-1 rounded">
                            {item.solicitudes}
                          </div>
                        </div>
                      </div>

                      {/* Month label */}
                      <div className="mt-3 text-xs text-gray-400 text-center font-medium">
                        {item.month}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Tooltip */}
          {tooltip.show && (
            <div
              className="absolute z-10 bg-gray-800 text-white px-3 py-2 rounded-lg shadow-lg pointer-events-none transform -translate-x-1/2 -translate-y-full border border-gray-600"
              style={{
                left: tooltip.x,
                top: tooltip.y - 10,
              }}
            >
              <div className="text-sm font-medium">{tooltip.month}</div>
              <div className="text-xs opacity-90">
                Solicitudes:{" "}
                <span className="font-semibold">{tooltip.solicitudes}</span>
              </div>
              {/* Tooltip arrow */}
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800" />
            </div>
          )}
        </div>

        {/* Statistics */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-gray-800 rounded-lg p-4 text-center hover:bg-gray-750 transition-colors">
            <div className="text-2xl font-bold text-white">
              {data.reduce((sum, item) => sum + item.solicitudes, 0)}
            </div>
            <div className="text-xs text-gray-400">Total</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 text-center hover:bg-gray-750 transition-colors">
            <div className="text-2xl font-bold text-green-400">{maxValue}</div>
            <div className="text-xs text-gray-400">Máximo</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 text-center hover:bg-gray-750 transition-colors">
            <div className="text-2xl font-bold text-red-400">{minValue}</div>
            <div className="text-xs text-gray-400">Mínimo</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 text-center hover:bg-gray-750 transition-colors">
            <div className="text-2xl font-bold text-blue-400">
              {data.length > 0
                ? Math.round(
                    data.reduce((sum, item) => sum + item.solicitudes, 0) /
                      data.length
                  )
                : 0}
            </div>
            <div className="text-xs text-gray-400">Promedio</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-4 text-center hover:bg-gray-750 transition-colors">
            <div className="text-2xl font-bold text-purple-400">
              {data.length}
            </div>
            <div className="text-xs text-gray-400">Meses</div>
          </div>
        </div>
      </div>
    </div>
  );
}
