import React, { createContext, useState, ReactNode } from 'react';

// Define the shape of your context
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
  solicitudId: string;
}

export interface AppStateContextType {
  store: AppState;
  setStore: React.Dispatch<React.SetStateAction<AppState>>;
}

// Initial state for the context
const initialState: AppState = {
  bienvenido: true,
  solicitud: false,
  demandante: false,
  demandado: false,
  gastosPensionado: false,
  archivosAdjuntos: false,
  firmaYEntrega: false,
  solicitudAdicional: false,
  resumen: false,
  solicitudId: ""
};

// Create context
const AppStateContext = createContext<AppStateContextType | undefined>(undefined);

// Context Provider component
export const AppStateProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [store, setStore] = useState<AppState>(initialState);

  return (
    <AppStateContext.Provider value={{ store, setStore }}>
      {children}
    </AppStateContext.Provider>
  );
};

export default AppStateContext;
