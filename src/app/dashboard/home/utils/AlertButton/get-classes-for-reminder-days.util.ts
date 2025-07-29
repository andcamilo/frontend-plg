export function getAlertButtonClasses(reminderDays: number) {
  if (reminderDays >= 3) {
    return "bg-green-500/20 text-green-600";
  } else if (reminderDays === 2) {
    return "bg-yellow-400/20 text-yellow-600";
  } else if (reminderDays === 1) {
    return "bg-red-500/20 text-red-500";
  } else {
    return "bg-gray-300/20 text-gray-500";
  }
}
