import { useMutation, useQuery } from "@tanstack/react-query";
import {
  createAlert,
  deleteAlert,
  getAlertById,
  updateAlert,
} from "../../services/Alerts/alerts.service";
import { AlertsSchema } from "../../schemas/alerts.schema";

export const useAlertById = (id: string) => {
  return useQuery({
    queryKey: ["alerts", id],
    queryFn: () => getAlertById(id),
  });
};

export const useCreateAlertMutation = () => {
  return useMutation({
    mutationFn: createAlert,
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
