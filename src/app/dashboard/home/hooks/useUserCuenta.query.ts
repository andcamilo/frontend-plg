"use client";
import { useQuery } from "@tanstack/react-query";
import { fetchUser } from "../services/request-user-cuenta.service";
import { decodeUserToken } from "@app/(global)/utils/decode-user-token.util";
import { userCuentaAdapter } from "../adapters/user-cuenta.adapter";

export const useUserCuenta = () => {
  return useQuery({
    queryKey: ["userCuenta"],
    queryFn: async () => {
      const userData = decodeUserToken();
      if (!userData?.user_id) {
        throw new Error("User ID not found");
      }
      const user = await fetchUser(userData.user_id);
      return userCuentaAdapter(user);
    },
  });
};
