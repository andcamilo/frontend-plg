import RequestsOverviewContainer from "./components/RequestsOverview/RequestsOverviewContainer";
import BalanceCardContainer from "./components/BalanceCard/BalanceCardContainer";

export const dynamic = "force-dynamic";

export default function FinancialDashboard() {
  return (
    <div className="min-h-screen w-full bg-[rgb(21,21,33)] p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Dashboard Financiero
          </h1>
          <p className="text-gray-400">
            Resumen de ingresos y solicitudes de pago
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <BalanceCardContainer />
          <div className="lg:col-span-2">
            <RequestsOverviewContainer />
          </div>
        </div>
      </div>
    </div>
  );
}
