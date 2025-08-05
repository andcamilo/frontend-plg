import { Bell } from "lucide-react";

const NotificationsButtonLoading = () => {
  return (
    <>
      <button className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-800 border border-gray-200 animate-pulse">
        <Bell className="w-6 h-6 animate-pulse" />
      </button>
    </>
  );
};

export default NotificationsButtonLoading;
