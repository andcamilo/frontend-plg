"use client";
import AlertForm from "./AlertForm";
import { useCreateAlertMutation } from "../../hooks/Alerts/useAlerts.query";
import { AlertsSchema } from "../../schemas/alerts.schema";
import swal from "sweetalert2";
import { useSearchParams } from "next/navigation";

const AlertFormCreate = () => {
  const searchParams = useSearchParams();
  const idSolicitud = searchParams?.get("idSolicitud") as string;
  const { mutateAsync: createAlert } = useCreateAlertMutation();

  const onSubmit = async (data: AlertsSchema) => {
    try {
      await createAlert({
        solicitudId: idSolicitud,
        reminderValue: data.reminderValue,
        reminderUnit: data.reminderUnit,
        reminderText: data.reminderText,
        isActive: data.isActive,
      });
      swal.fire({
        title: "Alerta creada",
        text: "La alerta ha sido creada correctamente",
        icon: "success",
      });
    } catch (error) {
      swal.fire({
        title: "Error",
        text: "Error al crear la alerta " + error,
        icon: "error",
      });
    }
  };

  return (
    <>
      <AlertForm onSubmit={onSubmit} />
    </>
  );
};

export default AlertFormCreate;
