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
  const { mutateAsync: updateAlert, isPending } = useUpdateAlertMutation();

  if (isLoading) return <div>Loading...</div>;

  if (!alert) return <div>Alert not found</div>;

  if (error) return <div>Error: {error.message}</div>;

  const formData = transformBackendAlertToFormData(alert);

  const onSubmit = async (data: AlertsSchema) => {
    try {
      await updateAlert({
        solicitudId: idSolicitud,
        alertId: alert.id,
        reminderValue: data.reminderValue,
        reminderUnit: data.reminderUnit,
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
      <AlertForm
        onSubmit={onSubmit}
        defaultValues={formData}
        isSubmitting={isPending}
      />
    </>
  );
};

export default AlertFormEdit;
