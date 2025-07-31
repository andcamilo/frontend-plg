const NotificationsDisplay = ({ notifications }: { notifications: any }) => {
  if (!notifications)
    return <div className="p-4 text-gray-500">No hay notificaciones</div>;
  if (!notifications.hasOverdueAlerts)
    return (
      <div className="p-4 text-green-600">No tienes alertas vencidas 🎉</div>
    );

  const { overdueAlerts } = notifications;

  return (
    <div className="p-4">
      <div className="sticky top-0 z-10 pb-2 mb-2 border-b">
        <h3 className="font-bold text-lg text-white">
          Tienes {notifications.overdueAlertsCount} alertas vencidas
        </h3>
        <span className="text-xs text-gray-200">
          {overdueAlerts.length} alerta(s) listada(s)
        </span>
      </div>
      <div className="space-y-4">
        {overdueAlerts.map((alert: any) => (
          <div
            key={alert.id}
            className="rounded-md border border-gray-200 bg-gray-800 p-3 shadow-sm"
          >
            <div className="font-semibold text-white mb-1">
              Expediente: {alert.expediente || alert.solicitudId}
            </div>
            <div className="text-xs text-white mb-2">
              Solicitante: {alert.nombreSolicita || alert.email}
            </div>
            <div className="bg-red-50 border-l-4 border-red-400 px-2 py-1 text-xs text-red-800">
              <span className="font-bold">
                {alert.reminderText || alert.title || "Alerta vencida"}
              </span>
              <br />
              <span>
                <span className="font-semibold">Vencida:</span>{" "}
                {new Date(alert.reminderDateTime).toLocaleString()}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotificationsDisplay;
