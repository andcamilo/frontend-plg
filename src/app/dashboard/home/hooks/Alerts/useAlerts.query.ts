import { useMutation, useQuery } from "@tanstack/react-query";
import {
  createAlert,
  deleteAlert,
  getAlerts,
  updateAlert,
} from "../../services/Alerts/alerts.service";
import { AlertsSchema } from "../../schemas/alerts.schema";
import { decodeUserToken } from "@/src/app/(global)/utils/decode-user-token.util";
import { useQueryClient } from "@tanstack/react-query";

export const useAlerts = () => {
  const { user_id: cuenta } = decodeUserToken();
  return useQuery({
    queryKey: ["alerts", cuenta],
    queryFn: () => getAlerts(cuenta),
  });
};

export const useAlertBySolicitudID = (solicitudId: string) => {
  const { data: alertsResponse, ...rest } = useAlerts();
  const alertBySolicitudID = alertsResponse?.data?.find(
    (alert: { solicitudId: string }) => alert.solicitudId === solicitudId
  );
  return {
    data: alertBySolicitudID,
    ...rest,
  };
};

export const useCreateAlertMutation = () => {
  const { email, user_id: cuenta } = decodeUserToken();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (alert: { solicitudId: string; reminderDays: number }) =>
      createAlert({ ...alert, cuenta, email }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alerts", cuenta] });
    },
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
