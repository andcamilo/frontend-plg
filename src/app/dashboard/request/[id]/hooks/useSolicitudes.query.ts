"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getSolicitudByID,
  updateSolicitud,
} from "../services/solicitudes.service";
import { decodeUserToken } from "@/src/app/(global)/utils/decode-user-token.util";

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
      queryClient.invalidateQueries({ queryKey: ["solicitudByID"] });
    },
  });
};

export const useSolicitudByID = (solicitudId: string) => {
  return useQuery({
    queryKey: ["solicitudByID", solicitudId],
    queryFn: async () => {
      const userData = decodeUserToken();
      const solicitudData = await getSolicitudByID(
        solicitudId,
        userData?.user_id ?? ""
      );
      return solicitudData.solicitud;
    },
  });
};
