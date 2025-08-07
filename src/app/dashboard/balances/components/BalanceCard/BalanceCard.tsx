"use client";

interface BalanceCardProps {
  balance: number;
  currency?: string;
  title?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export default function BalanceCard({
  balance,
  currency = "$",
  title = "Balance de Ingresos",
  trend,
}: BalanceCardProps) {
  const formatBalance = (amount: number) => {
    return new Intl.NumberFormat("es-ES", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <div className="bg-[rgb(21,21,33)] border border-gray-800 rounded-xl p-6 hover:border-purple-500/30 transition-all duration-300 group">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-gray-400 text-sm font-medium uppercase tracking-wide">
          {title}
        </h3>
        <div className="w-8 h-8 bg-[rgba(168,85,247,0.2)] rounded-lg flex items-center justify-center group-hover:bg-[rgba(168,85,247,0.3)] transition-colors">
          <svg
            className="w-4 h-4 text-purple-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
            />
          </svg>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-baseline space-x-2">
          <span className="text-3xl md:text-4xl font-bold text-white">
            {formatBalance(balance)}
          </span>
          <span className="text-xl text-purple-400 font-semibold">
            {currency}
          </span>
        </div>

        {trend && (
          <div className="flex items-center space-x-2">
            <div
              className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
                trend.isPositive
                  ? "bg-green-500/20 text-green-400"
                  : "bg-red-500/20 text-red-400"
              }`}
            >
              <svg
                className={`w-3 h-3 ${
                  trend.isPositive ? "rotate-0" : "rotate-180"
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 17l9.2-9.2M17 17V7H7"
                />
              </svg>
              <span>{Math.abs(trend.value)}%</span>
            </div>
            <span className="text-gray-500 text-xs">vs mes anterior</span>
          </div>
        )}
      </div>
    </div>
  );
}
