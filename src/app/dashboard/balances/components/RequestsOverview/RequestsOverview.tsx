"use client";

interface Request {
  id: string;
  title: string;
  amount: number;
  date: string;
  client?: string;
}

interface RequestsOverviewProps {
  paidRequests: Request[];
  pendingRequests: Request[];
  currency?: string;
}

function RequestsOverview({
  paidRequests,
  pendingRequests,
  currency = "$",
}: RequestsOverviewProps) {
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("es-ES", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "short",
    });
  };

  const totalPaid = paidRequests.reduce(
    (sum, request) => sum + request.amount,
    0
  );
  const totalPending = pendingRequests.reduce(
    (sum, request) => sum + request.amount,
    0
  );

  const RequestItem = ({
    request,
    isPaid,
  }: {
    request: Request;
    isPaid: boolean;
  }) => (
    <div className="flex items-center justify-between p-3 rounded-lg bg-gray-800/50 hover:bg-gray-800/70 transition-colors group">
      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-3">
          <div
            className={`w-2 h-2 rounded-full flex-shrink-0 ${
              isPaid ? "bg-green-400" : "bg-yellow-400"
            }`}
          />
          <div className="min-w-0 flex-1">
            <p className="text-white text-sm font-medium truncate">
              {request.title}
            </p>
            {request.client && (
              <p className="text-gray-400 text-xs truncate">{request.client}</p>
            )}
          </div>
        </div>
      </div>
      <div className="flex items-center space-x-3 flex-shrink-0">
        <span className="text-gray-400 text-xs">
          {formatDate(request.date)}
        </span>
        <span className="text-white font-semibold">
          {formatAmount(request.amount)}
          {currency}
        </span>
      </div>
    </div>
  );

  return (
    <div className="bg-[rgb(21,21,33)] border border-gray-800 rounded-xl p-6 hover:border-purple-500/30 transition-all duration-300">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-white text-lg font-semibold">
          Solicitudes de Pago
        </h3>
        <div className="flex items-center space-x-4 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full" />
            <span className="text-gray-400">Pagadas</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-yellow-400 rounded-full" />
            <span className="text-gray-400">Pendientes</span>
          </div>
        </div>
      </div>

      {/* Resumen de totales */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-[rgba(168,85,247,0.2)] rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-300 text-sm">Total Pagado</span>
            <span className="text-green-400 font-semibold">
              {formatAmount(totalPaid)}
              {currency}
            </span>
          </div>
        </div>
        <div className="bg-[rgba(168,85,247,0.2)] rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-300 text-sm">Total Pendiente</span>
            <span className="text-yellow-400 font-semibold">
              {formatAmount(totalPending)}
              {currency}
            </span>
          </div>
        </div>
      </div>

      {/* Lista de solicitudes */}
      <div className="space-y-4">
        {/* Solicitudes pagadas */}
        {paidRequests.length > 0 && (
          <div>
            <h4 className="text-green-400 text-sm font-medium mb-3 flex items-center">
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              Solicitudes Pagadas ({paidRequests.length})
            </h4>
            <div className="space-y-2 max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent">
              {paidRequests.map((request) => (
                <RequestItem key={request.id} request={request} isPaid={true} />
              ))}
            </div>
          </div>
        )}

        {/* Solicitudes pendientes */}
        {pendingRequests.length > 0 && (
          <div>
            <h4 className="text-yellow-400 text-sm font-medium mb-3 flex items-center">
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Solicitudes Pendientes ({pendingRequests.length})
            </h4>
            <div className="space-y-2 max-h-48 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent">
              {pendingRequests.map((request) => (
                <RequestItem
                  key={request.id}
                  request={request}
                  isPaid={false}
                />
              ))}
            </div>
          </div>
        )}

        {/* Estado vacío */}
        {paidRequests.length === 0 && pendingRequests.length === 0 && (
          <div className="text-center py-8">
            <svg
              className="w-12 h-12 text-gray-600 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <p className="text-gray-400 text-sm">
              No hay solicitudes disponibles
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default RequestsOverview;
