"use client";
import AlertForm from "./AlertForm";
import {
  useAlertById,
  useUpdateAlertMutation,
} from "../../hooks/Alerts/useAlerts.query";
import { useParams } from "next/navigation";
import { AlertsSchema } from "../../schemas/alerts.schema";

const AlertFormEdit = () => {
  const params = useParams();
  const id = params?.id as string;

  const { data: alert, isLoading, error } = useAlertById(id);
  const { mutate: updateAlert } = useUpdateAlertMutation(id);

  if (isLoading) return <div>Loading...</div>;

  if (!alert) return <div>Alert not found</div>;

  if (error) return <div>Error: {error.message}</div>;

  const onSubmit = (data: AlertsSchema) => {
    updateAlert(data);
  };
  return (
    <>
      <AlertForm onSubmit={onSubmit} defaultValues={alert} />
    </>
  );
};

export default AlertFormEdit;
