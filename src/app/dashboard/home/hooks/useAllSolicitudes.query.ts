"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getSolicitudes,
  updateSolicitud,
} from "../services/solicitudes.service";
import { decodeUserToken } from "@app/(global)/utils/decode-user-token.util";

export const useAllSolicitudes = () => {
  return useQuery({
    queryKey: ["allSolicitudes"],
    queryFn: async () => {
      const userData = decodeUserToken();
      const solicitudesData = await getSolicitudes(userData?.user_id ?? "");
      return solicitudesData.solicitudes;
    },
  });
};

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
