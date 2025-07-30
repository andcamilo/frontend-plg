import { useModalContext } from "@app/(global)/hooks/useModalContex.hook";
import { useRouter } from "next/navigation";
import { MODAL_ALERT_EDIT_ID } from "../../../constants/modal-alert.constant";
import { getAlertsClasses } from "../../../utils/AlertButton/get-classes-for-reminder-days.util";

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

    // Para alertas activas, usar la función existente basada en el tiempo faltante
    // Convertir a "días equivalentes" para usar la función existente
    let equivalentDays = timeRemainingValue;

    switch (timeRemainingUnit) {
      case "minutes":
        equivalentDays = timeRemainingValue / (60 * 24); // minutos a días
        break;
      case "hours":
        equivalentDays = timeRemainingValue / 24; // horas a días
        break;
      case "days":
        equivalentDays = timeRemainingValue;
        break;
      case "weeks":
        equivalentDays = timeRemainingValue * 7; // semanas a días
        break;
      default:
        equivalentDays = timeRemainingValue;
    }

    return `px-2 py-1 rounded text-xs ${getAlertsClasses(equivalentDays)}`;
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
