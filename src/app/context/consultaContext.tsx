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

const ConsultaContext = createContext<{ state: ConsultaState, setState: React.Dispatch<React.SetStateAction<ConsultaState>> } | undefined>(undefined);

export const ConsultaStateProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [state, setState] = useState<ConsultaState>(initialConsultaState);
    return (
        <ConsultaContext.Provider value={{ state, setState }}>
            {children}
        </ConsultaContext.Provider>
    );
};

export default ConsultaContext;
