export interface Solicitud {
  id: string;
  actualizarPorCorreo: boolean;
  tipo: string;
  emailSolicita: string;
  nombreSolicita: string;
  telefonoSolicita: string;
  cedulaPasaporte: string;
  precio: number;
  subtotal: number;
  total: number;
  accion: string;
  item: string;
  abogados: {
    id: string;
    nombre: string;
    timeStamp: {
      _seconds: number;
      _nanoseconds: number;
    };
  }[];
  cuenta: string;
  date: {
    _seconds: number;
    _nanoseconds: number;
  };
  bitacora: {
    accion: string;
    date: {
      _seconds: number;
      _nanoseconds: number;
    };
  }[];
  canasta: {
    items: {
      item: string;
      precio: number;
    }[];
    subtotal: number;
    total: number;
  };
  expediente: string;
  status: number;
  nombre: string;
}

// Tipo para el abogado en el filtro
export interface AbogadoFilter {
  id: string;
  nombre: string;
}

// Tipo específico para actualización de status (formulario)
export interface SolicitudStatusUpdateForm {
  id?: string;
  status: string; // El form maneja strings
  observation?: string;
  file?: FileList | null;
}

// Tipo para la data procesada que se envía al backend
export interface SolicitudStatusUpdate {
  id?: string;
  status: number; // Se convierte a número
  observation?: string;
  fileUrl?: string; // Se añade la URL del archivo
  statusText?: string; // Si el usuario eligió un estado string, lo enviamos aquí
}
