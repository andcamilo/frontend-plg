import { Rol } from '@constants/roles';

export const getSolicitudesFiltradasPorRol = (
  solicitudes: any[],
  formData: any
) => {
  return solicitudes.filter((solicitud) => {
    const rol = formData.rol;
    const cuenta = formData.cuenta;

    const esCliente =
      (typeof rol === "number" && rol < 20) ||
      rol === Rol.CLIENTE ||
      rol === Rol.CLIENTE_RECURRENTE;

    const esAbogadoOAsistente =
      rol === Rol.ABOGADOS || rol === Rol.ASISTENTE || rol === 40 || rol === 35;

    if (esCliente) {
      return solicitud.cuenta === cuenta;
    }

    if (esAbogadoOAsistente) {
      const abogadoAsignado = (solicitud.abogados || []).some(
        (abogado: any) => abogado?.id === cuenta || abogado?._id === cuenta
      );
      return solicitud.cuenta === cuenta || abogadoAsignado;
    }

    // Otros roles (admin, etc.) ven todo
    return true;
  });
};
