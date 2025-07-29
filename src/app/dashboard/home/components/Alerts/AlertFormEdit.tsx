"use client";
import AlertForm from "./AlertForm";
import {
  useAlertBySolicitudID,
  useUpdateAlertMutation,
} from "../../hooks/Alerts/useAlerts.query";
import { AlertsSchema } from "../../schemas/alerts.schema";
import swal from "sweetalert2";
import { useSearchParams } from "next/navigation";

const AlertFormEdit = () => {
  const searchParams = useSearchParams();
  const idSolicitud = searchParams?.get("idSolicitud") as string;

  const { data: alert, isLoading, error } = useAlertBySolicitudID(idSolicitud);
  const { mutateAsync: updateAlert } = useUpdateAlertMutation(idSolicitud);

  if (isLoading) return <div>Loading...</div>;

  if (!alert) return <div>Alert not found</div>;

  if (error) return <div>Error: {error.message}</div>;

  const onSubmit = async (data: AlertsSchema) => {
    try {
      await updateAlert(data);
      swal.fire({
        title: "Alerta actualizada",
        text: "La alerta ha sido actualizada correctamente",
        icon: "success",
      });
    } catch (error) {
      swal.fire({
        title: "Error",
        text: "Error al actualizar la alerta " + error,
        icon: "error",
      });
    }
  };
  return (
    <>
      <AlertForm onSubmit={onSubmit} defaultValues={alert} />
    </>
  );
};

export default AlertFormEdit;
