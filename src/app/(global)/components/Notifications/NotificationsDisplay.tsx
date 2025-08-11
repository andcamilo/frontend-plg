import Link from "next/link";
import type { NotificationsType } from "@app/(global)/types/notifications.type";

const NotificationsDisplay = ({
  notifications,
}: {
  notifications: NotificationsType;
}) => {
  if (!notifications)
    return <div className="p-4 text-gray-500">No hay notificaciones</div>;
  const { overdueAlerts, unassignedSolicitudes } = notifications;

  if (
    (notifications.overdueAlertsCount ?? 0) === 0 &&
    (notifications.unassignedSolicitudesCount ?? 0) === 0
  ) {
    return <div className="p-4 text-gray-500">No hay notificaciones</div>;
  }

  const totalAlerts = overdueAlerts.length + unassignedSolicitudes.length;

  return (
    <div className="p-4">
      {notifications.overdueAlertsCount > 0 && (
        <div className="sticky top-0 z-10 pb-2 mb-2 border-b">
          <h3 className="font-bold text-lg text-white">
            Tienes {notifications.overdueAlertsCount} alertas vencidas
          </h3>
          <h3 className="font-bold text-lg text-white">
            Tienes {notifications.unassignedSolicitudesCount} solicitudes sin
            abogado
          </h3>
          <span className="text-xs text-gray-200">
            {totalAlerts} alerta(s) listada(s)
          </span>
        </div>
      )}
      <div className="space-y-4 gap-2 mt-2 flex flex-col">
        {overdueAlerts.map((alert) => (
          <Link href={`/dashboard/request/${alert.solicitudId}`} key={alert.id}>
            <div className="rounded-md border border-gray-200 bg-gray-800 p-3 shadow-sm">
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
          </Link>
        ))}
        {unassignedSolicitudes.map((solicitud) => (
          <Link href={`/dashboard/request/${solicitud.id}`} key={solicitud.id}>
            <div className="rounded-md border border-gray-200 bg-gray-800 p-3 shadow-sm">
              <div className="font-semibold text-white mb-1">
                Expediente: {solicitud.id}
              </div>
              <div className="text-xs text-white mb-2">{solicitud.title}</div>
              <div className="text-xs text-gray-300">
                {solicitud.description}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default NotificationsDisplay;
