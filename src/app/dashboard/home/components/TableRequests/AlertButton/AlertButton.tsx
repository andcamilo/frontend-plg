"use client";
import { useAlerts } from "../../../hooks/Alerts/useAlerts.query";
import AlertButtonEdit from "./AlertButtonEdit";
import AlertButtonCreate from "./AlertButtonCreate";

const AlertButton = ({ idSolicitud }: { idSolicitud: string }) => {
  const { data: alert, isLoading, error } = useAlerts();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!alert) return <AlertButtonCreate idSolicitud={idSolicitud} />;

  return (
    <>
      <AlertButtonEdit idSolicitud={idSolicitud} />
    </>
  );
};

export default AlertButton;
