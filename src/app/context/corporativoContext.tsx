// consultaContext.tsx
import React, { createContext, useState, ReactNode } from 'react';

type CorporativoState = {
    nombre: string;
    email: string;
    mensaje: string;
};

const initialConsultaState: CorporativoState = {
    nombre: '',
    email: '',
    mensaje: '',
};

const CorporativoContext = createContext<{ state: CorporativoState, setState: React.Dispatch<React.SetStateAction<CorporativoState>> } | undefined>(undefined);

export const CorporativoStateProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [state, setState] = useState<CorporativoState>(initialConsultaState);
    return (
        <CorporativoContext.Provider value={{ state, setState }}>
            {children}
        </CorporativoContext.Provider>
    );
};

export default CorporativoContext;