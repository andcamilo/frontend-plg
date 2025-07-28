"use client";
import AlertForm from "./AlertForm";
import { useCreateAlertMutation } from "../../hooks/Alerts/useAlerts.query";
import { AlertsSchema } from "../../schemas/alerts.schema";
import swal from "sweetalert2";

const AlertFormCreate = () => {
  const { mutate: createAlert } = useCreateAlertMutation();

  const onSubmit = (data: AlertsSchema) => {
    try {
      createAlert(data);
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
