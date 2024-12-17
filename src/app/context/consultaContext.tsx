// consultaContext.tsx
import React, { createContext, useState, ReactNode } from 'react';


export interface ConsultaState {
    nombre: string;
    email: string;
    mensaje: string;
    solicitudId: string;
    token: string;
};

export interface ConsultaContextType {
  store: ConsultaState;
  setStore: React.Dispatch<React.SetStateAction<ConsultaState>>;
}

const initialState: ConsultaState = {
    nombre: '',
    email: '',
    mensaje: '',
    solicitudId: '',
    token: '',
};

const ConsultaContext = createContext<ConsultaContextType | undefined>(undefined);

// Create the provider
export const ConsultaStateProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [store, setStore] = useState<ConsultaState>(initialState);

  return (
    <ConsultaContext.Provider value={{ store, setStore }}>
      {children}
    </ConsultaContext.Provider>
  );
};

export default ConsultaContext;
