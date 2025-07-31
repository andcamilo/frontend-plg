export interface User {
  id: string;
  uid: string;
  cuenta: string;
  date: {
    _seconds: number;
    _nanoseconds: number;
  };
  email: string;
  nombre: string;
  cedulaPasaporte: string;
  rol: string | number;
  status: number;
  telefonoSolicita: string;
}
