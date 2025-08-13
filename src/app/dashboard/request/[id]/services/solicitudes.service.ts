import { backendEnv, backendBaseUrl } from "@utils/env";

export const updateSolicitud = async ({
  solicitudId,
  status,
  observation,
  adjuntoDocumentoBitacora,
  statusText,
}: {
  solicitudId: string;
  status: number;
  observation?: string;
  adjuntoDocumentoBitacora?: string;
  statusText?: string;
}) => {
  const endpoint = `${backendBaseUrl}/${backendEnv}/update-solicitud`;
  const body: any = { status, solicitudId };

  if (observation) {
    body.observation = observation;
  }

  if (adjuntoDocumentoBitacora) {
    body.adjuntoDocumentoBitacora = adjuntoDocumentoBitacora;
  }
  if (statusText) {
    body.statusText = statusText;
  }

  const response = await fetch(endpoint, {
    method: "PATCH",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  const payload = await response.json();

  if (!response.ok) {
    const apiMessage =
      payload?.message || payload?.error || response.statusText;
    throw new Error(apiMessage || "Error updating solicitud");
  }

  return payload;
};

export const getSolicitudByID = async (solicitudId: string, userId: string) => {
  const endpoint = `${backendBaseUrl}/${backendEnv}/solicitudes/${solicitudId}?userId=${userId}`;
  const response = await fetch(endpoint, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Error fetching solicitud: ${response.statusText}`);
  }

  const solicitud = await response.json();

  return solicitud;
};
