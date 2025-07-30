import { useMutation, useQuery } from "@tanstack/react-query";
import {
  createAlert,
  deleteAlert,
  getAlerts,
  updateAlert,
} from "../../services/Alerts/alerts.service";
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
    mutationKey: ["create-alert"],
    mutationFn: (alert: {
      solicitudId: string;
      reminderValue: number;
      reminderUnit: import("../../schemas/alerts.schema").ReminderUnit;
      reminderText?: string;
      isActive?: boolean;
    }) => createAlert({ ...alert, cuenta, email }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alerts", cuenta] });
    },
  });
};

export const useUpdateAlertMutation = () => {
  const { user_id: cuenta } = decodeUserToken();
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["update-alert"],
    mutationFn: ({
      alertId,
      solicitudId,
      reminderValue,
      reminderUnit,
      reminderText,
      isActive,
    }: {
      alertId: string;
      solicitudId: string;
      reminderValue: number;
      reminderUnit: import("../../schemas/alerts.schema").ReminderUnit;
      reminderText?: string;
      isActive?: boolean;
    }) =>
      updateAlert({
        alertId,
        solicitudId,
        reminderValue,
        reminderUnit,
        reminderText,
        isActive,
        cuenta,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alerts", cuenta] });
    },
  });
};

export const useDeleteAlertMutation = () => {
  const { user_id: cuenta } = decodeUserToken();
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["delete-alert"],
    mutationFn: ({
      alertId,
      solicitudId,
    }: {
      alertId: string;
      solicitudId: string;
    }) => deleteAlert({ alertId, cuenta, solicitudId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alerts", cuenta] });
    },
  });
};
