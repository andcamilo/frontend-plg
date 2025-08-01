export interface Alert {
  id: string;
  cuenta: string;
  email: string;
  solicitudId: string;
  expediente: string;
  nombreSolicita: string;
  reminderDateTime: string; // ISO string
  reminderValue: number;
  reminderUnit: string;
  reminderText: string;
  isActive: boolean;
  isSent: boolean;
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
  timeRemainingValue: number;
  timeRemainingUnit: string;
  isOverdue: boolean;
  totalMillisecondsRemaining: number;
  isCreatedByCurrentUser: boolean;
  createdByUser: string;
  viewerIsAdmin: boolean;
  viewingMode: string;
}
