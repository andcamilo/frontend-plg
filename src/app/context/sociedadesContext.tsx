import React, { createContext, useState, ReactNode } from 'react';

// Definir el tipo del estado para el nuevo menú
export interface AppState {
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
  solicitudId: string;
}

export interface SociedadesContextType {
  store: AppState;
  setStore: React.Dispatch<React.SetStateAction<AppState>>;
}

// Estado inicial para el nuevo menú
const initialState: AppState = {
  solicitante: false,
  empresa: false,
  personas: false,
  directores: false,
  dignatarios: false,
  accionistas: false,
  capital: false,
  poder: false,
  actividades: false,
  ingresos: false,
  resumen: false,
  solicitudAdicional: false,
  solicitudId: "",
};

// Crear el nuevo contexto
const SociedadesContext = createContext<SociedadesContextType | undefined>(undefined);

// Create the provider
export const SociedadesStateProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [store, setStore] = useState<AppState>(initialState);

  return (
    <SociedadesContext.Provider value={{ store, setStore }}>
      {children}
    </SociedadesContext.Provider>
  );
};

export default SociedadesContext;
