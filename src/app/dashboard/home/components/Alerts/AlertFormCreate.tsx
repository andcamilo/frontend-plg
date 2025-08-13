"use client";
import AlertForm from "./AlertForm";
import { useCreateAlertMutation } from "../../hooks/useAlerts.query";
import { AlertsSchema } from "../../schemas/alerts.schema";
import swal from "sweetalert2";
import { useSearchParams } from "next/navigation";
import { useModalContext } from "@app/(global)/hooks/useModalContex.hook";

const AlertFormCreate = () => {
  const searchParams = useSearchParams();
  const idSolicitud = searchParams?.get("idSolicitud") as string;
  const { mutateAsync: createAlert, isPending } = useCreateAlertMutation();
  const { closeModal } = useModalContext();

  const onSubmit = async (data: AlertsSchema) => {
    try {
      await createAlert({
        solicitudId: idSolicitud,
        reminderValue: data.reminderValue,
        reminderUnit: data.reminderUnit,
      });
      swal.fire({
        title: "Alerta creada",
        text: "La alerta ha sido creada correctamente",
        icon: "success",
      });
      closeModal();
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
      <AlertForm onSubmit={onSubmit} isSubmitting={isPending} />
    </>
  );
};

export default AlertFormCreate;
