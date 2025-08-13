import { useModalContext } from "@app/(global)/hooks/useModalContex.hook";
import { useRouter } from "next/navigation";
import { MODAL_ALERT_EDIT_ID } from "../../../constants/modal-alert.constant";
import { getAlertsClasses } from "../../../utils/AlertButton/get-alert-classes-for-time";
import { Alert } from "../../../types/alert.types";
import { decodeUserToken } from "@/src/app/(global)/utils/decode-user-token.util";

const AlertButtonEdit = ({
  alert,
  idSolicitud,
}: {
  alert: Alert;
  idSolicitud: string;
}) => {
  const { openModal } = useModalContext();
  const router = useRouter();

  const handleOpenModal = () => {
    router.push(
      `/dashboard/home?idSolicitud=${idSolicitud}&alertId=${alert.id}`
    );
    openModal(MODAL_ALERT_EDIT_ID);
  };

  const { email } = decodeUserToken();
  const isForCurrentUser = alert.email === email;

  // Función para obtener el texto a mostrar en el botón
  const getDisplayText = () => {
    if (alert.isOverdue) {
      return `⚠️ Vencida` + " " + (isForCurrentUser ? `🫵` : "");
    }
    return `${alert.timeRemainingValue} ${alert.timeRemainingUnit} ${
      isForCurrentUser ? `🫵` : ""
    }`;
  };

  // Función para obtener el texto del tooltip
  const getTooltipText = () => {
    const originalText =
      alert.reminderValue && alert.reminderUnit
        ? `Configurado: ${alert.reminderValue} ${alert.reminderUnit}`
        : "";

    if (alert.isOverdue) {
      return `Alerta vencida. ${originalText}`;
    }

    return `Faltan ${alert.timeRemainingValue} ${alert.timeRemainingUnit} para ejecutarse. ${originalText}`;
  };

  // Función para obtener las clases CSS
  const getButtonClasses = () => {
    if (alert.isOverdue) {
      return "px-2 py-1 rounded text-xs bg-red-500 text-white hover:bg-red-600";
    }

    // Para alertas activas, usar la función modificada que evalúa directamente tiempo y unidad
    return `px-2 py-1 rounded text-xs ${getAlertsClasses(
      alert.timeRemainingValue,
      alert.timeRemainingUnit
    )}`;
  };

  return (
    <>
      <button
        onClick={handleOpenModal}
        className={getButtonClasses()}
        title={getTooltipText()}
      >
        {getDisplayText()}
      </button>
    </>
  );
};

export default AlertButtonEdit;
