export function formatIsoDateToDMY(isoDateString: string) {
  if (!isoDateString) return "Fecha desconocida";
  const date = new Date(isoDateString);
  if (isNaN(date.getTime())) return "Fecha inválida";
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${day}/${month}/${year} ${hours}:${minutes}`;
}
