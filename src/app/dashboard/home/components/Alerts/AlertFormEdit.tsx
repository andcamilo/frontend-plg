"use client";
import AlertForm from "./AlertForm";
import { useAlerts, useUpdateAlertMutation } from "../../hooks/useAlerts.query";
import { AlertsSchema } from "../../schemas/alerts.schema";
import swal from "sweetalert2";
import { useSearchParams } from "next/navigation";
import { transformBackendAlertToFormData } from "../../utils/alert-data-transformer.util";
import { useModalContext } from "@app/(global)/hooks/useModalContex.hook";
import { formatIsoDateToDMY } from "../../utils/format-iso-date-to-dmy.util";

const AlertFormEdit = () => {
  const { closeModal } = useModalContext();
  const searchParams = useSearchParams();
  const idSolicitud = searchParams?.get("idSolicitud") as string;
  const alertId = searchParams?.get("alertId") as string;

  const { data: alerts, isLoading, error } = useAlerts();

  const { mutateAsync: updateAlert, isPending } = useUpdateAlertMutation();

  if (isLoading) return <div>Loading...</div>;

  if (error) return <div>Error: {error.message}</div>;

  const alert = alerts?.data.find((alert) => alert.id === alertId);

  if (!alert) return <div>Alert not found</div>;

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
      closeModal();
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
        key={alert.id}
        onSubmit={onSubmit}
        defaultValues={formData}
        isSubmitting={isPending}
      />
      <div className="flex flex-col gap-2 px-6">
        <span className="text-sm text-gray-200">
          Esta alerta esta asignada a: {alert.email}
        </span>
        <span className="text-sm text-gray-200">
          Esta alerta ha sido creado el dia{" "}
          {formatIsoDateToDMY(alert.createdAt)}
        </span>
      </div>
    </>
  );
};

export default AlertFormEdit;
