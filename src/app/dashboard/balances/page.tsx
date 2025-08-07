import BalanceCard from "./components/BalanceCard/BalanceCard";
import RequestsOverview from "./components/RequestsOverview/RequestsOverview";
import BalanceCardSkeleton from "./components/BalanceCard/BalanceCardSkeleton";
import BalanceCardContainer from "./components/BalanceCard/BalanceCardContainer";

export default function FinancialDashboard() {
  const mockPaidRequests = [
    {
      id: "1",
      title: "Desarrollo Web Corporativo",
      amount: 2500.0,
      date: "2024-01-15",
      client: "Empresa ABC",
    },
    {
      id: "2",
      title: "Consultoría IT",
      amount: 1200.0,
      date: "2024-01-10",
      client: "StartupXYZ",
    },
    {
      id: "3",
      title: "Mantenimiento Sistema",
      amount: 800.0,
      date: "2024-01-08",
      client: "TechCorp",
    },
  ];

  const mockPendingRequests = [
    {
      id: "4",
      title: "Diseño UX/UI",
      amount: 1800.0,
      date: "2024-01-20",
      client: "Creative Agency",
    },
    {
      id: "5",
      title: "Integración API",
      amount: 950.0,
      date: "2024-01-18",
      client: "FinTech Solutions",
    },
  ];

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
            <RequestsOverview
              paidRequests={mockPaidRequests}
              pendingRequests={mockPendingRequests}
              currency="€"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
