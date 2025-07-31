export function formatDate(dateObj: any) {
  if (!dateObj || typeof dateObj !== "object") return "-";
  try {
    const d = new Date(dateObj._seconds * 1000);
    return d.toLocaleDateString("es-PA", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return "-";
  }
}
