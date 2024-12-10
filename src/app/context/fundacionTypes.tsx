// Definir el tipo del estado para la Fundación
export interface FundacionState {
    bienvenido: boolean;
    solicitante: boolean;
    fundacion: boolean;
    personas: boolean;
    fundadores: boolean;
    dignatarios: boolean;
    miembros: boolean;
    protector: boolean;
    beneficiarios: boolean;
    patrimonio: boolean;
    poder: boolean;
    objetivos: boolean;
    ingresos: boolean;
    activos: boolean;
    solicitudAdicional: boolean;
    resumen: boolean;
    solicitudId: string;
    currentPosition: number;
    request: any;
    token: string;
}

// Definir el tipo del contexto de Fundación
export interface FundacionContextType {
    store: FundacionState;
    setStore: React.Dispatch<React.SetStateAction<FundacionState>>;
}
