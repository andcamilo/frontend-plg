import React, { createContext, useState, ReactNode } from 'react';

// Definir el tipo del estado para el nuevo menú
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
  solicitudId: string;
  currentPosition: number;
  request: any;
  token: string;
  rol: number;
}

export interface SociedadesContextType {
  store: AppState;
  setStore: React.Dispatch<React.SetStateAction<AppState>>;
}

// Estado inicial para el nuevo menú
const initialState: AppState = {
  bienvenido: true,
  solicitante: true,
  empresa: false,
  personas: false,
  directores: false,
  dignatarios: false,
  accionistas: false,
  capital: false,
  poder: false,
  actividades: false,
  ingresos: false,
  resumen: true,
  solicitudAdicional: false,
  solicitudId: "",
  currentPosition: 1,
  request: {
    status: -1,
  },
  token: '',
  rol: -1,
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
