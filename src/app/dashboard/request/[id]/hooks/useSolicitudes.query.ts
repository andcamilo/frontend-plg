"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { updateSolicitud } from "../services/solicitudes.service";

export const useUpdateSolicitud = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["updateSolicitud"],
    mutationFn: (updateData: {
      solicitudId: string;
      status: number;
      observation?: string;
      fileUrl?: string;
    }) => updateSolicitud(updateData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allSolicitudes"] });
    },
  });
};
