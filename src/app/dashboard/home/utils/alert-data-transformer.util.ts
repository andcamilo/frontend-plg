import { AlertsSchema, ReminderUnit } from "../schemas/alerts.schema";
import { getBestTimeUnit } from "./time-converter.util";

/**
 * Tipo para la respuesta del backend que puede tener estructura antigua o nueva
 */
export interface BackendAlert {
  id: string;
  solicitudId: string;
  // Campos nuevos (si existen) - coinciden con la documentación del backend
  reminderValue?: number;
  reminderUnit?: ReminderUnit;
  reminderText?: string;
  isActive?: boolean;
  reminderMinutes?: number;
  // Campo legacy
  reminderDays?: number;
}

/**
 * Transforma los datos de alerta del backend al formato esperado por el formulario
 * @param backendAlert - Los datos de la alerta desde el backend
 * @returns Los datos transformados para el formulario
 */
export const transformBackendAlertToFormData = (
  backendAlert: BackendAlert
): AlertsSchema => {
  // Si tenemos los campos nuevos, usarlos directamente
  if (backendAlert.reminderValue && backendAlert.reminderUnit) {
    return {
      id: backendAlert.id,
      reminderValue: backendAlert.reminderValue,
      reminderUnit: backendAlert.reminderUnit,
      reminderText: backendAlert.reminderText,
      isActive: backendAlert.isActive ?? true,
    };
  }

  // Si tenemos reminderMinutes, convertir a la mejor unidad
  if (backendAlert.reminderMinutes) {
    const { value, unit } = getBestTimeUnit(backendAlert.reminderMinutes);
    return {
      id: backendAlert.id,
      reminderValue: value,
      reminderUnit: unit,
      reminderText: backendAlert.reminderText,
      isActive: backendAlert.isActive ?? true,
    };
  }

  // Fallback: usar reminderDays (compatibilidad con estructura antigua)
  if (backendAlert.reminderDays) {
    return {
      id: backendAlert.id,
      reminderValue: backendAlert.reminderDays,
      reminderUnit: "days" as ReminderUnit,
      reminderText: backendAlert.reminderText,
      isActive: backendAlert.isActive ?? true,
    };
  }

  // Fallback final: valores por defecto
  return {
    id: backendAlert.id,
    reminderValue: 1,
    reminderUnit: "days" as ReminderUnit,
    reminderText: "",
    isActive: true,
  };
};
