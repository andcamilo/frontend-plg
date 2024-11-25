// consultaContext.tsx
import React, { createContext, useState, ReactNode } from 'react';

type ConsultaState = {
    nombre: string;
    email: string;
    mensaje: string;
};

const initialConsultaState: ConsultaState = {
    nombre: '',
    email: '',
    mensaje: '',
};

const TramiteContext = createContext<{ state: ConsultaState, setState: React.Dispatch<React.SetStateAction<ConsultaState>> } | undefined>(undefined);

export const TramiteStateProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [state, setState] = useState<ConsultaState>(initialConsultaState);
    return (
        <TramiteContext.Provider value={{ state, setState }}>
            {children}
        </TramiteContext.Provider>
    );
};

export default TramiteContext;