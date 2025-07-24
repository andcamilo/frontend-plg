"use client";
import { useQuery } from "@tanstack/react-query";
import { fetchUser } from "../services/request-user-cuenta.service";
import { checkAuthToken } from "@app/utils/checkAuthToken";

export const useUserCuentaQuery = () => {
  return useQuery({
    queryKey: ["userCuenta"],
    queryFn: async () => {
      const userData = checkAuthToken();
      if (!userData?.user_id) {
        throw new Error("User ID not found");
      }
      return await fetchUser(userData.user_id);
    },
  });
};
