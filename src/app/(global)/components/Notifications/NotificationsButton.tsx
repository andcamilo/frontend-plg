"use client";

import { Bell } from "lucide-react";
import { useState } from "react";
import { useNotifications } from "@app/(global)/hooks/Notifications/useNotifications.query";
import NotificationsButtonLoading from "./NotificationsButtonLoading";
import NotificationsDisplay from "./NotificationsDisplay";

const NotificationsButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { data: notifications, isLoading, isError } = useNotifications();

  if (isLoading) return <NotificationsButtonLoading />;
  if (isError) return <div>Error loading notifications</div>;

  const hasOverdue = notifications?.hasOverdueAlerts;

  return (
    <div className="relative">
      <button
        className="flex items-center justify-center w-10 h-10 rounded-full bg-gray-800 border border-gray-200 relative hover:bg-gray-700 transition"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Ver notificaciones"
      >
        <Bell className="w-6 h-6 text-white" />
        {hasOverdue && (
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
        )}
      </button>
      {isOpen && (
        <div className="absolute top-12 right-0 w-80 max-h-[28rem] bg-gray-800 rounded-lg shadow-2xl border border-gray-200 z-50 overflow-y-auto">
          <NotificationsDisplay notifications={notifications} />
        </div>
      )}
    </div>
  );
};

export default NotificationsButton;
