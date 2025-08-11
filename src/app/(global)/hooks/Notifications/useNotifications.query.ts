import { useQuery } from "@tanstack/react-query";
import { getNotifications } from "@app/(global)/services/notifications.service";
import { decodeUserToken } from "@app/(global)/utils/decode-user-token.util";
import type { NotificationsType } from "@app/(global)/types/notifications.type";

export const useNotifications = () => {
  const { user_id: cuenta } = decodeUserToken();
  return useQuery<NotificationsType>({
    queryKey: ["notifications", cuenta],
    queryFn: () =>
      getNotifications(cuenta).then((res) => res.data as NotificationsType),
    enabled: Boolean(cuenta),
  });
};
