import { AlertsSchema } from "../../schemas/alerts.schema";
import { backendBaseUrl, backendEnv } from "@utils/env";

export const getAlertById = async (idSolicitud: string) => {
  const response = await fetch(
    `${backendBaseUrl}/${backendEnv}/get-alert/${idSolicitud}`
  );
  if (!response.ok) {
    throw new Error(`Error fetching alerts: ${response.statusText}`);
  }
  return response.json();
};

export const createAlert = async (alert: AlertsSchema) => {
  const response = await fetch(`${backendBaseUrl}/${backendEnv}/create-alert`, {
    method: "POST",
    body: JSON.stringify(alert),
  });
  if (!response.ok) {
    throw new Error(`Error creating alert: ${response.statusText}`);
  }
  return response.json();
};

export const updateAlert = async (id: string, alert: AlertsSchema) => {
  const response = await fetch(
    `${backendBaseUrl}/${backendEnv}/update-alert/${id}`,
    {
      method: "PUT",
      body: JSON.stringify(alert),
    }
  );
  if (!response.ok) {
    throw new Error(`Error updating alert: ${response.statusText}`);
  }
  return response.json();
};

export const deleteAlert = async (id: string) => {
  const response = await fetch(
    `${backendBaseUrl}/${backendEnv}/delete-alert/${id}`,
    {
      method: "DELETE",
    }
  );
  if (!response.ok) {
    throw new Error(`Error deleting alert: ${response.statusText}`);
  }
  return response.json();
};
