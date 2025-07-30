"use client";
import AlertButtonEdit from "./AlertButtonEdit";
import AlertButtonCreate from "./AlertButtonCreate";
import { useAlertBySolicitudID } from "../../../hooks/useAlerts.query";

const AlertButton = ({ idSolicitud }: { idSolicitud: string }) => {
  const { data: alert, isLoading, error } = useAlertBySolicitudID(idSolicitud);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!alert) return <AlertButtonCreate idSolicitud={idSolicitud} />;

  return (
    <>
      <AlertButtonEdit
        timeRemainingValue={alert.timeRemainingValue}
        timeRemainingUnit={alert.timeRemainingUnit}
        isOverdue={alert.isOverdue}
        idSolicitud={idSolicitud}
        // Mantener valores originales para referencia si es necesario
        originalReminderValue={alert.reminderValue}
        originalReminderUnit={alert.reminderUnit}
      />
    </>
  );
};

export default AlertButton;
