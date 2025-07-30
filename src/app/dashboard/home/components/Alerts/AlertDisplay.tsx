import { AlertsSchema } from "../../schemas/alerts.schema";
import {
  formatAlertTime,
  getAlertDescription,
  getAlertColorClass,
} from "../../utils/alert-display.util";

interface AlertDisplayProps {
  alert: AlertsSchema;
  showDescription?: boolean;
  variant?: "compact" | "full";
  className?: string;
}

/**
 * Componente para mostrar una alerta con el nuevo formato de tiempo
 */
const AlertDisplay = ({
  alert,
  showDescription = true,
  variant = "full",
  className = "",
}: AlertDisplayProps) => {
  const colorClass = getAlertColorClass(
    alert.reminderValue,
    alert.reminderUnit
  );

  if (variant === "compact") {
    return (
      <span
        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${colorClass} ${className}`}
      >
        {formatAlertTime(alert.reminderValue, alert.reminderUnit)}
      </span>
    );
  }

  return (
    <div
      className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border ${colorClass} ${className}`}
    >
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
          clipRule="evenodd"
        />
      </svg>
      <div className="flex flex-col">
        <span className="text-sm font-medium">
          {showDescription
            ? getAlertDescription(alert.reminderValue, alert.reminderUnit)
            : formatAlertTime(alert.reminderValue, alert.reminderUnit)}
        </span>
        {alert.reminderText && (
          <span className="text-xs text-gray-500 mt-1">
            {alert.reminderText}
          </span>
        )}
      </div>
    </div>
  );
};

export default AlertDisplay;
