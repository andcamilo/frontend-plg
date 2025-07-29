import { AlertsSchema } from "../../schemas/alerts.schema";
import { backendEnv } from "@utils/env";

const backendBaseUrl = "http://localhost:4000";

export const getAlerts = async (cuenta: string) => {
  const response = await fetch(
    `${backendBaseUrl}/${backendEnv}/alerts?cuenta=${cuenta}`
  );
  if (!response.ok) {
    throw new Error(`Error fetching alerts: ${response.statusText}`);
  }
  return response.json();
};

export const createAlert = async ({
  cuenta,
  email,
  solicitudId,
  reminderDays,
}: {
  cuenta: string;
  email: string;
  solicitudId: string;
  reminderDays: number;
}) => {
  const body = {
    cuenta,
    email,
    solicitudId,
    reminderDays,
  };

  const response = await fetch(`${backendBaseUrl}/${backendEnv}/alerts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
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
