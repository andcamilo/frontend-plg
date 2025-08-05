export function decodeUserRol(input: number | string): string {
  const normalized =
    typeof input === "string" ? input.trim().toLowerCase() : input;

  switch (normalized) {
    case 99:
    case "99":
    case "súper administrador":
    case "super administrador":
      return "Súper Administrador";
    case 90:
    case "90":
    case "administrador":
      return "Administrador";
    case 80:
    case "80":
    case "auditor":
      return "Auditor";
    case 50:
    case "50":
    case "caja chica":
      return "Caja Chica";
    case 40:
    case "40":
    case "abogado":
      return "Abogado";
    case 35:
    case "35":
    case "asistente":
      return "Asistente";
    case 17:
    case "17":
    case "cliente recurrente":
      return "Cliente Recurrente";
    case 10:
    case "10":
    case "cliente":
      return "Cliente";
    default:
      return "Desconocido";
  }
}
