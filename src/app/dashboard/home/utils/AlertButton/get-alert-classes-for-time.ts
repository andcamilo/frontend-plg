export function getAlertsClasses(
  timeRemainingValue: number,
  timeRemainingUnit: string
) {
  // Convertir todo a días para hacer la comparación
  let equivalentDays = timeRemainingValue;

  switch (timeRemainingUnit) {
    case "minutes":
      equivalentDays = timeRemainingValue / (60 * 24); // minutos a días
      break;
    case "hours":
      equivalentDays = timeRemainingValue / 24; // horas a días
      break;
    case "days":
      equivalentDays = timeRemainingValue;
      break;
    case "weeks":
      equivalentDays = timeRemainingValue * 7; // semanas a días
      break;
    case "months":
      equivalentDays = timeRemainingValue * 30; // meses a días (aproximado)
      break;
    case "years":
      equivalentDays = timeRemainingValue * 365; // años a días (aproximado)
      break;
    default:
      equivalentDays = timeRemainingValue;
  }

  // Aplicar la nueva lógica de colores
  if (equivalentDays <= 1) {
    return "bg-red-500/20 text-red-500"; // Menor o igual a 1 día: rojo
  } else if (equivalentDays > 1 && equivalentDays < 3) {
    return "bg-yellow-400/20 text-yellow-600"; // Mayor a 1 día y menor a 3: amarillo
  } else {
    return "bg-green-500/20 text-green-600"; // Mayor o igual a 3 días: verde
  }
}
