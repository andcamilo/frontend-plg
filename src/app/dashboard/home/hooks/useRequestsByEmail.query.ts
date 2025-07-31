"use client";
import { useQuery } from "@tanstack/react-query";
import { getRequests } from "../services/requests-by-email.service";
import { checkAuthToken } from "@app/utils/checkAuthToken";
import { CURRENT_PAGE } from "../constants/current-page.constant";

export const useRequestsByEmail = () => {
  return useQuery({
    queryKey: ["requestsByEmail"],
    queryFn: async () => {
      const rowsPerPage = 10;
      const userData = checkAuthToken();

      return await getRequests(
        userData?.email,
        rowsPerPage,
        CURRENT_PAGE
      );
    },
  });
};
