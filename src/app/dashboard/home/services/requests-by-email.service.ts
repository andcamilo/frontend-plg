import { backendBaseUrl, backendEnv } from "@utils/env";

export const getRequests = async (
  email,
  limit = 10,
  page = 1,
  role = 90,
  tipo = ""
) => {
  const params = { email, limit, page, role };

  if (tipo) {
    params["tipo"] = tipo;
  }

  const queryString = Object.entries(params)
    .map(
      ([key, value]) =>
        `${encodeURIComponent(key)}=${encodeURIComponent(value as string)}`
    )
    .join("&");

  const endpoint = `${backendBaseUrl}/${backendEnv}/get-requests-by-email?${queryString}`;

  const response = await fetch(endpoint, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();

  if (tipo && data?.ids) {
    return {
      ids: data.ids,
      message: data.message,
    };
  }

  const solicitudes =
    data &&
    typeof data === "object" &&
    "solicitudes" in data &&
    Array.isArray(data.solicitudes)
      ? data.solicitudes
      : [];
  const allSolicitudes =
    data &&
    typeof data === "object" &&
    "allSolicitudes" in data &&
    Array.isArray(data.allSolicitudes)
      ? data.allSolicitudes
      : [];
  const pagination =
    data &&
    typeof data === "object" &&
    "pagination" in data &&
    typeof data.pagination === "object" &&
    data.pagination !== null
      ? data.pagination
      : {};
  const tipoCounts =
    data &&
    typeof data === "object" &&
    "tipo" in data &&
    typeof data.tipo === "object" &&
    data.tipo !== null
      ? data.tipo
      : {};
  const statusCounts =
    data &&
    typeof data === "object" &&
    "status" in data &&
    typeof data.status === "object" &&
    data.status !== null
      ? data.status
      : {};
  const months =
    data &&
    typeof data === "object" &&
    "months" in data &&
    typeof data.months === "object" &&
    data.months !== null
      ? data.months
      : {};

  return {
    solicitudes,
    allSolicitudes,
    pagination,
    tipoCounts,
    statusCounts,
    months,
  };
};
