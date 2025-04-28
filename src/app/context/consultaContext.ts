import { createContext } from 'react';

export interface ConsultaState {
    solicitudId: string | null;
    request: any;
    token: string | null;
    total: number;
    rol?: number;
}

interface ConsultaContextType {
    store: ConsultaState;
    setStore: React.Dispatch<React.SetStateAction<ConsultaState>>;
}

const ConsultaContext = createContext<ConsultaContextType | null>(null);

export default ConsultaContext; 