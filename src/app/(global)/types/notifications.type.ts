export type OverdueAlert = {
  id: string;
  solicitudId: string;
  reminderDateTime: string;
  cuenta?: string;
  email?: string;
  expediente?: string;
  nombreSolicita?: string;
  reminderValue?: number;
  reminderUnit?: string;
  reminderText?: string;
  title?: string;
  description?: string;
  isActive?: boolean;
  isSent?: boolean;
  createdAt?: string;
  sentAt?: {
    _seconds: number;
    _nanoseconds: number;
  };
  updatedAt?: {
    _seconds: number;
    _nanoseconds: number;
  };
  reminderDays?: number;
};

export type AffectedSolicitud = {
  id: string;
  tipoSolicitud?: any;
  nombreEmpresa?: any;
  estado?: any;
  createdAt?: string;
  overdueAlertsCount: number;
  overdueAlerts: {
    id: string;
    title?: string;
    description?: string;
    reminderDateTime: string;
    reminderValue?: number;
    reminderUnit?: string;
  }[];
};

export type UnassignedSolicitud = {
  id: string;
  title: string;
  description: string;
  tipoSolicitud?: any;
  nombreEmpresa?: any;
  status?: any;
  date?: string;
};

export type NotificationsType = {
  hasOverdueAlerts: boolean;
  overdueAlertsCount: number;
  affectedSolicitudesCount: number;
  affectedSolicitudes: AffectedSolicitud[];
  overdueAlerts: OverdueAlert[];
  hasUnassignedSolicitudes: boolean;
  unassignedSolicitudesCount: number;
  unassignedSolicitudes: UnassignedSolicitud[];
};
