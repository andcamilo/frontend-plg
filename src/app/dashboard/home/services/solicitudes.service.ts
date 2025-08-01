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
