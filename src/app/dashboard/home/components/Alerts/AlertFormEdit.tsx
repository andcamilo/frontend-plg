"use client";
import AlertForm from "./AlertForm";
import {
  useAlertBySolicitudID,
  useUpdateAlertMutation,
} from "../../hooks/useAlerts.query";
import { AlertsSchema } from "../../schemas/alerts.schema";
import swal from "sweetalert2";
import { useSearchParams } from "next/navigation";
import { transformBackendAlertToFormData } from "../../utils/alert-data-transformer.util";

const AlertFormEdit = () => {
  const searchParams = useSearchParams();
  const idSolicitud = searchParams?.get("idSolicitud") as string;

  const { data: alert, isLoading, error } = useAlertBySolicitudID(idSolicitud);
  const { mutateAsync: updateAlert } = useUpdateAlertMutation();

  if (isLoading) return <div>Loading...</div>;

  if (!alert) return <div>Alert not found</div>;

  if (error) return <div>Error: {error.message}</div>;

  // Transformar los datos del backend al formato del formulario
  const formData = transformBackendAlertToFormData(alert);

  const onSubmit = async (data: AlertsSchema) => {
    try {
      await updateAlert({
        solicitudId: idSolicitud,
        alertId: alert.id,
        reminderValue: data.reminderValue,
        reminderUnit: data.reminderUnit,
        reminderText: data.reminderText,
        isActive: data.isActive,
      });
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
      <AlertForm onSubmit={onSubmit} defaultValues={formData} />
    </>
  );
};

export default AlertFormEdit;
