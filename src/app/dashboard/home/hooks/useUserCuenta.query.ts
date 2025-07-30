"use client";
import { useQuery } from "@tanstack/react-query";
import { fetchUser } from "../services/request-user-cuenta.service";
import { decodeUserToken } from "@app/(global)/utils/decode-user-token.util";

export const useUserCuenta = () => {
  return useQuery({
    queryKey: ["userCuenta"],
    queryFn: async () => {
      const userData = decodeUserToken();
      if (!userData?.user_id) {
        throw new Error("User ID not found");
      }
      return await fetchUser(userData.user_id);
    },
  });
};
