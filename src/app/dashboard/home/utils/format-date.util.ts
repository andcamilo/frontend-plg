export const formatDate = (timestamp?: {
  _seconds: number;
  _nanoseconds: number;
}): string => {
  if (!timestamp || typeof timestamp._seconds !== "number") {
    console.error("Invalid or missing timestamp:", timestamp);
    return "Invalid date"; // Return a fallback message if the timestamp is invalid
  }

  const date = new Date(timestamp._seconds * 1000);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
};