"use client";
import AlertForm from "./AlertForm";
import { useCreateAlertMutation } from "../../hooks/Alerts/useAlerts.query";
import { AlertsSchema } from "../../schemas/alerts.schema";
import swal from "sweetalert2";

const AlertFormCreate = () => {
  const { mutateAsync: createAlert } = useCreateAlertMutation();

  const onSubmit = async (data: AlertsSchema) => {
    try {
      await createAlert({
        cuenta: "dtCDAz5Fj3Nk0SU7Kl52iw3Tydh2",
        email: "felipeftdev@gmail.com",
        solicitudId: "FXa99wpdWzbeYY3dnZQn",
        reminderDays: data.reminderDays,
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
