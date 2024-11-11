import React, { createContext, useState, ReactNode } from 'react';

type MenoresState = {
    nombre: string;
    email: string;
    mensaje: string;
};

const initialConsultaState: MenoresState = {
    nombre: '',
    email: '',
    mensaje: '',
};

const MenoresContext = createContext<{ state: MenoresState, setState: React.Dispatch<React.SetStateAction<MenoresState>> } | undefined>(undefined);

export const MenoresStateProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [state, setState] = useState<MenoresState>(initialConsultaState);
    return (
        <MenoresContext.Provider value={{ state, setState }}>
            {children}
        </MenoresContext.Provider>
    );
};

export default MenoresContext;