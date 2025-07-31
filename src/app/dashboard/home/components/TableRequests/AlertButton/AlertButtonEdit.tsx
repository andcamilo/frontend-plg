import { useModalContext } from "@app/(global)/hooks/useModalContex.hook";
import { useRouter } from "next/navigation";
import { MODAL_ALERT_EDIT_ID } from "../../../constants/modal-alert.constant";
import { getAlertsClasses } from "../../../utils/AlertButton/get-alert-classes-for-time";

const AlertButtonEdit = ({
  timeRemainingValue,
  timeRemainingUnit,
  isOverdue,
  idSolicitud,
  originalReminderValue,
  originalReminderUnit,
}: {
  timeRemainingValue: number;
  timeRemainingUnit: string;
  isOverdue: boolean;
  idSolicitud: string;
  originalReminderValue?: number;
  originalReminderUnit?: string;
}) => {
  const { openModal } = useModalContext();
  const router = useRouter();

  const handleOpenModal = () => {
    router.push(`/dashboard/home?idSolicitud=${idSolicitud}`);
    openModal(MODAL_ALERT_EDIT_ID);
  };

  // Función para obtener el texto a mostrar en el botón
  const getDisplayText = () => {
    if (isOverdue) {
      return `⚠️ Vencida`;
    }
    return `${timeRemainingValue} ${timeRemainingUnit}`;
  };

  // Función para obtener el texto del tooltip
  const getTooltipText = () => {
    const originalText =
      originalReminderValue && originalReminderUnit
        ? `Configurado: ${originalReminderValue} ${originalReminderUnit}`
        : "";

    if (isOverdue) {
      return `Alerta vencida. ${originalText}`;
    }

    return `Faltan ${timeRemainingValue} ${timeRemainingUnit} para ejecutarse. ${originalText}`;
  };

  // Función para obtener las clases CSS
  const getButtonClasses = () => {
    if (isOverdue) {
      return "px-2 py-1 rounded text-xs bg-red-500 text-white hover:bg-red-600";
    }

    // Para alertas activas, usar la función modificada que evalúa directamente tiempo y unidad
    return `px-2 py-1 rounded text-xs ${getAlertsClasses(
      timeRemainingValue,
      timeRemainingUnit
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
