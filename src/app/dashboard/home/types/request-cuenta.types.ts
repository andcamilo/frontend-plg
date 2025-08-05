export interface Solicitud {
  id: string;
  //TODO: Add other properties from the solicitud object
}

export interface RequestsCuenta {
  solicitudes: Solicitud[];
  pagination: any; //TODO: Define pagination type
  tipoCounts: Record<string, number>;
  statusCounts: Record<string, number>;
  months: Record<string, number>;
}
