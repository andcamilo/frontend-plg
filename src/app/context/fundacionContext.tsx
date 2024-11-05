import React, { createContext, useState, ReactNode } from 'react';
import { FundacionState, FundacionContextType } from './fundacionTypes'; 

// Estado inicial para el nuevo menú de Fundación
const initialFundacionState: FundacionState = {
  bienvenido: true,
  solicitante: true,
  fundacion: false,
  personas: false,
  fundadores: false,
  dignatarios: false,
  miembros: false,
  protector: false,
  beneficiarios: false,
  patrimonio: false,
  poder: false,
  objetivos: false,
  ingresos: false,
  activos: false,
  solicitudAdicional: false,
  resumen: true,
  solicitudId: "",
  currentPosition: 1,
  request: "",
};

// Crear el nuevo contexto
const FundacionContext = createContext<FundacionContextType | undefined>(undefined);

// Crear el proveedor del contexto
export const FundacionStateProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [store, setStore] = useState<FundacionState>(initialFundacionState);

  return (
    <FundacionContext.Provider value={{ store, setStore }}>
      {children}
    </FundacionContext.Provider>
  );
};

export default FundacionContext;
