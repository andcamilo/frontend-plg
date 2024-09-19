export interface AppState {
    bienvenido: boolean;
    solicitud: boolean;
    demandante: boolean;
    demandado: boolean;
    gastosPensionado: boolean;
    archivosAdjuntos: boolean;
    firmaYEntrega: boolean;
    solicitudAdicional: boolean;
    resumen: boolean;
  }
  
  // Define the structure for the context type
 export interface AppStateContextType {
    store: AppState;
    setStore: React.Dispatch<React.SetStateAction<AppState>>;
  }