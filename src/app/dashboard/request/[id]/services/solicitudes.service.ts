import { backendEnv, backendBaseUrl } from "@utils/env";

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
