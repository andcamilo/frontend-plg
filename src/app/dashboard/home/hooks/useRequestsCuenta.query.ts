"use client";
import { useQuery } from "@tanstack/react-query";
import { getRequestsCuenta } from "../services/request-cuenta.service";
import { checkAuthToken } from "@app/utils/checkAuthToken";

export const useRequestsCuenta = () => {
  return useQuery({
    queryKey: ["requestsCuenta"],
    queryFn: async () => {
      const rowsPerPage = 10;
      const userData = checkAuthToken();
      const lastVisibleCursor = null;

      return await getRequestsCuenta(
        rowsPerPage,
        userData?.user_id || "",
        lastVisibleCursor
      );
    },
  });
};
