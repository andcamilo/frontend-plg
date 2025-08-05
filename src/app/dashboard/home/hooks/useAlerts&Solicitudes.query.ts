import { useAlerts } from "./useAlerts.query";
import { useAllSolicitudes } from "./useAllSolicitudes.query";

export const useAlertsAndSolicitudes = () => {
  const {
    data: alerts,
    isLoading: isLoadingAlerts,
    isError: isErrorAlerts,
  } = useAlerts();
  const {
    data: solicitudes,
    isLoading: isLoadingSolicitudes,
    isError: isErrorSolicitudes,
  } = useAllSolicitudes();

  const isLoading = isLoadingAlerts || isLoadingSolicitudes;
  const isError = isErrorAlerts || isErrorSolicitudes;

  return { alerts: alerts?.data, solicitudes, isLoading, isError };
};
