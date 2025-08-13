import { STATUS_MAPPING } from "../../../(global)/constants/status-mapping.constant";

export const getStatusInfo = (status: number) => {
  const label = STATUS_MAPPING[status] || "Desconocido";
  let color = "gray";
  switch (status) {
    case 0:
      color = "red";
      break;
    case 1:
      color = "gray";
      break;
    case 10:
    case 19:
      color = "yellow";
      break;
    case 12:
      color = "blue";
      break;
    case 20:
    case 70:
      color = "green";
      break;
    case 30:
      color = "purple";
      break;
    default:
      color = "gray";
  }
  return { label, color };
};
