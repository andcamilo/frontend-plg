import { backendBaseUrl, backendEnv } from "@/src/app/utils/env";

export const getBalance = async (cuenta: string) => {
  return {
    paidRequests: [],
    pendingRequests: [],
    totalPaid: 0,
    totalPending: 0,
  };
};
