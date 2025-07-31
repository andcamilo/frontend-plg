import { useQuery } from "@tanstack/react-query";
import { getNotifications } from "@app/(global)/services/notifications.service";
import { decodeUserToken } from "@app/(global)/utils/decode-user-token.util";

export const useNotifications = () => {
  const { user_id: cuenta } = decodeUserToken();
  return useQuery({
    queryKey: ["notifications", cuenta],
    queryFn: () => getNotifications(cuenta).then((res) => res.data),
  });
};
