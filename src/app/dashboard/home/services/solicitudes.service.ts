import { backendEnv, backendBaseUrl } from "@utils/env";

export const getSolicitudes = async (userId: string) => {
  const endpoint = `${backendBaseUrl}/${backendEnv}/solicitudes?userId=${encodeURIComponent(
    userId
  )}`;
  const response = await fetch(endpoint, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Error fetching solicitudes: ${response.statusText}`);
  }

  const solicitudes = await response.json();

  return solicitudes;
};

export const updateSolicitud = async ({
  solicitudId,
  status,
  observation,
  fileUrl,
}: {
  solicitudId: string;
  status: number;
  observation?: string;
  fileUrl?: string;
}) => {
  const endpoint = `${backendBaseUrl}/${backendEnv}/update-solicitud `;
  const body: any = { status, solicitudId };

  if (observation) {
    body.observation = observation;
  }

  if (fileUrl) {
    body.fileUrl = fileUrl;
  }

  const response = await fetch(endpoint, {
    method: "PATCH",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`Error updating solicitud: ${response.statusText}`);
  }

  const result = await response.json();

  return result;
};
