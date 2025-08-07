import { decodeUserToken } from "@/src/app/(global)/utils/decode-user-token.util";
import { useQuery } from "@tanstack/react-query";
import { getBalance } from "../services/balances.service";

export const useBalance = () => {
  const { user_id: cuenta } = decodeUserToken();
  return useQuery({
    queryKey: ["balance", cuenta],
    queryFn: () => getBalance(cuenta),
  });
};
