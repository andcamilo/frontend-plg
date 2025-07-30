"use client";
import { useQuery } from "@tanstack/react-query";
import { getSolicitudes } from "../services/solicitudes.service";
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
