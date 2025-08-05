import { User } from "../types/user-cuenta.types";
import { decodeUserRol } from "@app/(global)/utils/decode-user-rol.util";

export const userCuentaAdapter = (response: any): User => {
  const solicitud = response?.solicitud ?? {};
  return {
    id: solicitud.id ?? "",
    uid: solicitud.uid ?? "",
    cuenta: solicitud.cuenta ?? "",
    date: {
      _seconds: solicitud.date?._seconds ?? 0,
      _nanoseconds: solicitud.date?._nanoseconds ?? 0,
    },
    email: solicitud.email ?? "",
    nombre: solicitud.nombre ?? "",
    cedulaPasaporte: solicitud.cedulaPasaporte ?? "",
    rol: decodeUserRol(solicitud.rol ?? ""),
    status: solicitud.status ?? 0,
    telefonoSolicita: solicitud.telefonoSolicita ?? "",
  };
};
