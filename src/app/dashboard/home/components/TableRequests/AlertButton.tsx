"use client";
import { useModalContext } from "@app/(global)/hooks/useModalContex.hook";
import { useRouter } from "next/navigation";
import { useAlertById } from "../../hooks/Alerts/useAlerts.query";

const AlertButton = ({ id }: { id: string }) => {
  const { openModal } = useModalContext();
  const { data: alert, isLoading, error } = useAlertById(id);
  const router = useRouter();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!alert) return <div>Alert not found</div>;
  
  const handleOpenModal = (id: string) => {
    router.push(`/dashboard/home/alerts/${id}`);
    openModal("alert-form-edit");
  };
  return (
    <>
      <button
        onClick={() => handleOpenModal(id)}
        className="px-2 py-1 rounded text-xs bg-purple-500/20 text-purple-300"
      >
        {alert.days} Día
      </button>
    </>
  );
};

export default AlertButton;
