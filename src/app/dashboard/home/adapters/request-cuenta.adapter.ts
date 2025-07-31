import { RequestsCuenta, Solicitud } from "../types/request-cuenta.types";

export const requestCuentaAdapter = (response: any): RequestsCuenta => {
  const solicitudes: Solicitud[] = response?.solicitudes || [];

  return {
    solicitudes,
    pagination: response?.pagination || {},
    tipoCounts: response?.tipo || {},
    statusCounts: response?.status || {},
    months: response?.months || {},
  };
};
