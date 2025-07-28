"use client";
import { useAlertById } from "../../../hooks/Alerts/useAlerts.query";
import AlertButtonEdit from "./AlertButtonEdit";
import AlertButtonCreate from "./AlertButtonCreate";

const AlertButton = ({ idSolicitud }: { idSolicitud: string }) => {
  const { data: alert, isLoading, error } = useAlertById(idSolicitud);

  if (isLoading) return <div>Loading...</div>;
  if (!alert) return <AlertButtonCreate idSolicitud={idSolicitud} />;

  return (
    <>
      <AlertButtonEdit idSolicitud={idSolicitud} />
    </>
  );
};

export default AlertButton;
