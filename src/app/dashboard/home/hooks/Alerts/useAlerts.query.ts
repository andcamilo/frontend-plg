import { useMutation, useQuery } from "@tanstack/react-query";
import {
  createAlert,
  deleteAlert,
  getAlerts,
  updateAlert,
} from "../../services/Alerts/alerts.service";
import { AlertsSchema } from "../../schemas/alerts.schema";
import { decodeUserToken } from "@/src/app/(global)/utils/decode-user-token.util";

export const useAlerts = () => {
  const { user_id: cuenta } = decodeUserToken();
  return useQuery({
    queryKey: ["alerts", cuenta],
    queryFn: () => getAlerts(cuenta),
  });
};

export const useCreateAlertMutation = () => {
  return useMutation({
    mutationFn: (alert: AlertsSchema) => createAlert(alert),
  });
};

export const useUpdateAlertMutation = (id: string) => {
  return useMutation({
    mutationFn: (alert: AlertsSchema) => updateAlert(id, alert),
  });
};

export const useDeleteAlertMutation = (id: string) => {
  return useMutation({
    mutationFn: deleteAlert,
  });
};
