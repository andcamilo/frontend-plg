"use client";
import { useQuery } from "@tanstack/react-query";
import { fetchUser } from "../services/request-user-cuenta.service";
import { checkAuthToken } from "@/src/app/utils/checkAuthToken";
import { getRequestsCuenta } from "../services/request-cuenta.service";
import { getRequests } from "../services/requests-by-email.service";
import { Rol } from '@constants/roles';

export const usePaginatedSolicitudes = () => {
  return useQuery({
    queryKey: ["paginatedSolicitudes"],
    queryFn: async () => {
      const userData = checkAuthToken();
      if (!userData?.user_id) {
        throw new Error("User ID not found");
      }
      const userCuenta = await fetchUser(userData.user_id);
      const rol = userCuenta.rol;
      const rowsPerPage = 10;
      const currentPage = 1;
      const lastVisibleCursor = null;

      let solicitudesData;
      if (
        (typeof rol === "number" && rol < 20) ||
        (typeof rol === "string" &&
          (rol === Rol.CLIENTE || rol === Rol.CLIENTE_RECURRENTE))
      ) {
        solicitudesData = await getRequestsCuenta(
          rowsPerPage,
          userData.user_id,
          lastVisibleCursor
        );
      } else {
        solicitudesData = await getRequests(
          userData.email,
          rowsPerPage,
          currentPage
        );
      }
      const { pagination } = solicitudesData;
      return {
        pagination,
      };
    },
  });
};
