import { useMutation, useQuery } from "@tanstack/react-query";
import {
  createAlert,
  deleteAlert,
  getAlerts,
  updateAlert,
} from "../services/alerts.service";
import { decodeUserToken } from "@app/(global)/utils/decode-user-token.util";
import { useQueryClient } from "@tanstack/react-query";

export const useAlerts = (solicitudId?: string) => {
  const { user_id: cuenta } = decodeUserToken();
  return useQuery({
    queryKey: ["alerts", cuenta, solicitudId],
    queryFn: () => getAlerts(cuenta, solicitudId),
  });
};

export const useAlertBySolicitudID = (solicitudId: string) => {
  const { user_id: cuenta } = decodeUserToken();

  const { data: alertsResponse, ...rest } = useQuery({
    queryKey: ["alerts", cuenta, "solicitud", solicitudId],
    queryFn: () => getAlerts(cuenta, solicitudId),
    enabled: !!cuenta && !!solicitudId,
  });

  const alertBySolicitudID = alertsResponse?.data?.[0] || null;

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
      reminderUnit: import("../schemas/alerts.schema").ReminderUnit;
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
      reminderUnit: import("../schemas/alerts.schema").ReminderUnit;
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
