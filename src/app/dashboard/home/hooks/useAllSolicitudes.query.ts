"use client";
import { useQuery } from "@tanstack/react-query";
import { getRequestsCuenta } from "../services/request-cuenta.service";
import { getRequests } from "../services/requests-by-email.service";
import { useUserCuenta } from "./useUserCuenta.query";

export const useAllSolicitudes = (pagination: any) => {
  const { data: userCuenta } = useUserCuenta();

  return useQuery({
    queryKey: ["allSolicitudes"],
    queryFn: async () => {
      const rol = userCuenta?.rol;
      const rowsPerPage = 10;
      const currentPage = 1;
      const lastVisibleCursor = pagination.nextCursor || null;

      let solicitudesData;
      if (
        (typeof rol === "number" && rol < 20) ||
        (typeof rol === "string" &&
          (rol === "Cliente" || rol === "Cliente recurrente"))
      ) {
        solicitudesData = await getRequestsCuenta(
          rowsPerPage,
          userCuenta?.id ?? "",
          lastVisibleCursor
        );
      } else {
        solicitudesData = await getRequests(
          userCuenta?.email ?? "",
          rowsPerPage,
          currentPage
        );
      }
      const { allSolicitudes = [], statusCounts, months } = solicitudesData;
      return {
        allSolicitudes,
        statusCounts,
        months,
      };
    },
  });
};
