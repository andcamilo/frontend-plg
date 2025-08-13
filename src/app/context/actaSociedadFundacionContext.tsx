import React, { createContext, useState, ReactNode } from 'react';

// Definir el tipo del estado para el nuevo menú
export interface AppState {
  bienvenido: boolean;
  solicitud: boolean;
  solicitudId: string;
  currentPosition: number;
  request: any;
  token: string;
  rol: number;
}

export interface actaSociedadFundacionTypes {
  store: AppState;
  setStore: React.Dispatch<React.SetStateAction<AppState>>;
}

// Estado inicial para el nuevo menú
const initialState: AppState = {
  bienvenido: true,
  solicitud: true,
  solicitudId: "",
  currentPosition: 1,
  request: {
    status: -1,
  },
  token: '',
  rol: -1,
};

// Crear el nuevo contexto
const ActasContext = createContext<actaSociedadFundacionTypes | undefined>(undefined);

// Create the provider
export const ActaSociedadFundacion: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [store, setStore] = useState<AppState>(initialState);

  return (
    <ActasContext.Provider value={{ store, setStore }}>
      {children}
    </ActasContext.Provider>
  );
};

export default ActasContext;
