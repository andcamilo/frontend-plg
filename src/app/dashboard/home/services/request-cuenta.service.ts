import { backendBaseUrl, backendEnv } from "@utils/env";
import { requestCuentaAdapter } from "../adapters/request-cuenta.adapter";

function buildQueryString(params: Record<string, any>) {
  const esc = encodeURIComponent;
  return Object.keys(params)
    .filter((k) => params[k] !== undefined && params[k] !== null)
    .map((k) => esc(k) + "=" + esc(params[k]))
    .join("&");
}

export const getRequestsCuenta = async (
  limit = 10,
  cuenta: string,
  lastVisibleCursor: string | null = null
) => {
  const params = {
    limit,
    cuenta,
    lastVisible: lastVisibleCursor,
  };
  const queryString = buildQueryString(params);
  const endpoint = `${backendBaseUrl}/${backendEnv}/get-requests-cuenta?${queryString}`;

  const response = await fetch(endpoint, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Error fetching requests cuenta: ${response.statusText}`);
  }

  const data = await response.json();

  return requestCuentaAdapter(data);
};
