export interface AppState {
  bienvenido: boolean;
  solicitante: boolean;
  empresa: boolean;
  personas: boolean;
  directores: boolean;
  dignatarios: boolean;
  accionistas: boolean;
  capital: boolean;
  poder: boolean;
  actividades: boolean;
  ingresos: boolean;
  resumen: boolean;
  solicitudAdicional: boolean;
}

export interface SociedadesContextType {
  store: AppState;
  setStore: React.Dispatch<React.SetStateAction<AppState>>;
}
