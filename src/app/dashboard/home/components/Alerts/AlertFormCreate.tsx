"use client";
import AlertForm from "./AlertForm";
import { useCreateAlertMutation } from "../../hooks/Alerts/useAlerts.query";
import { AlertsSchema } from "../../schemas/alerts.schema";

const AlertFormCreate = () => {
  const { mutate: createAlert } = useCreateAlertMutation();

  const onSubmit = (data: AlertsSchema) => {
    createAlert(data);
  };

  return (
    <>
      <AlertForm onSubmit={onSubmit} />
    </>
  );
};

export default AlertFormCreate;
