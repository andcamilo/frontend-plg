import React, { createContext, useState, ReactNode } from 'react';

export interface MenoresState {
  nombre: string;
  email: string;
  mensaje: string;
  solicitudId: string;
  token: string;
  rol: number;
  request: any;
};

// Estado inicial para el nuevo menú
const initialState: MenoresState = {
  nombre: '',
  email: '',
  mensaje: '',
  solicitudId: '',
  token: '',
  rol: -1,
  request: {
    status: -1
  },
};

export interface MenoresContextType {
  store: MenoresState;
  setStore: React.Dispatch<React.SetStateAction<MenoresState>>;
}

const MenoresContext = createContext<MenoresContextType | undefined>(undefined);

// Create the provider
export const MenoresStateProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [store, setStore] = useState<MenoresState>(initialState);

  return (
    <MenoresContext.Provider value={{ store, setStore }}>
      {children}
    </MenoresContext.Provider>
  );
};

export default MenoresContext;