import { backendEnv, backendBaseUrl } from "@utils/env";
import { ReminderUnit } from "../schemas/alerts.schema";

export const getAlerts = async (cuenta: string, solicitudId?: string) => {
  let endpoint = `${backendBaseUrl}/${backendEnv}/alerts?cuenta=${cuenta}`;

  if (solicitudId) {
    endpoint += `&solicitudId=${solicitudId}`;
  }

  const response = await fetch(endpoint);
  if (!response.ok) {
    throw new Error(`Error fetching alerts: ${response.statusText}`);
  }
  return response.json();
};

export const createAlert = async ({
  cuenta,
  email,
  solicitudId,
  reminderValue,
  reminderUnit,
}: {
  cuenta: string;
  email: string;
  solicitudId: string;
  reminderValue: number;
  reminderUnit: ReminderUnit;
}) => {
  const body: any = {
    cuenta,
    email,
    solicitudId,
    reminderValue,
    reminderUnit,
  };

  if (reminderUnit === "days") {
    body.reminderDays = reminderValue;
  }

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

export const updateAlert = async ({
  solicitudId,
  reminderValue,
  reminderUnit,
  cuenta,
  alertId,
  reminderText,
  isActive,
}: {
  solicitudId: string;
  cuenta: string;
  reminderValue: number;
  reminderUnit: ReminderUnit;
  alertId: string;
  reminderText?: string;
  isActive?: boolean;
}) => {
  // Preparar el cuerpo de la petición según la documentación del backend
  const body: any = {
    alertId,
    solicitudId,
    cuenta,
    reminderValue,
    reminderUnit,
  };

  // Agregar campos opcionales solo si se proporcionan
  if (reminderText !== undefined) {
    body.reminderText = reminderText.trim();
  }

  if (isActive !== undefined) {
    body.isActive = isActive;
  }

  // Mantener compatibilidad con backend legacy enviando reminderDays cuando sea "days"
  if (reminderUnit === "days") {
    body.reminderDays = reminderValue;
  }

  const response = await fetch(`${backendBaseUrl}/${backendEnv}/alerts`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    throw new Error(`Error updating alert: ${response.statusText}`);
  }
  return response.json();
};

export const deleteAlert = async ({
  alertId,
  cuenta,
  solicitudId,
}: {
  alertId: string;
  cuenta: string;
  solicitudId: string;
}) => {
  const body = {
    alertId,
    cuenta,
    solicitudId,
  };
  const response = await fetch(`${backendBaseUrl}/${backendEnv}/alerts`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    throw new Error(`Error deleting alert: ${response.statusText}`);
  }
  return response.json();
};
