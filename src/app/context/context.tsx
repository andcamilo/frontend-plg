import React, { createContext, useState, ReactNode } from 'react';

export interface FormData {
  pensionType: string;          // 'Primera vez' or other pension types
  pensionAmount: number;        // Amount requested for pension
  receiveSupport: string;       // 'Si' or 'No'
  pensionCategory: string;      // Category of the pension
  currentSupportAmount: number; // Support amount currently received
  
  currentAmount: number;        // Current pension amount
  increaseAmount: number;       // Amount requested for increase
  totalAmount: number;          // Total amount after increase
  agreesWithAmount: string;     // 'Si' or 'No'
  disagreementReason: string;   // Reason for disagreement

  // Case location and court info
  province: string;             // Province name
  court: string;                // Court name for case

  // Rebaja o Suspensión
  pensionSubType: string;       // 'Disminuir' or 'Suspender'
  reduceAmount: number;         // Amount requested for reduction
  knowsCaseLocation: string;    // 'Si' or 'No'
  wantsInvestigation: string;   // 'Si' or 'No'
  suspensionReason: string;     // Reason for suspension

  // Desacato
  desacatoDescription: string;  // Description of desacato
  paymentDay: string;           // Day assigned for payment by the court
  lastPaymentDate: string;      // Last date when the pension was paid

  // For Desacato or Rebaja o Suspensión
  courtName: string;            // Name of the court
  caseNumber: string;           // Case number
  sentenceDate: string;         // Date of the last sentence
  sentenceFile: File | null;    // Scanned file of the sentence, can be null

  // General fields
  reason: string;               // Reason for reduction/suspension
}

// Define the shape of your AppState including FormData in solicitud
export interface AppState {
  bienvenido: boolean;
  demandante: boolean;
  demandado: boolean;
  gastosPensionado: boolean;
  archivosAdjuntos: boolean;
  firmaYEntrega: boolean;
  solicitudAdicional: boolean;
  resumen: boolean;
  solicitudId: string;
  currentPosition: number;
  solictud: FormData;
  request: any;
}

// Initial state for the context
const initialState: AppState = {
  bienvenido: true,
  demandante: false,
  demandado: false,
  gastosPensionado: false,
  archivosAdjuntos: false,
  firmaYEntrega: false,
  solicitudAdicional: false,
  resumen: false,
  solicitudId: "",
  currentPosition: 1,
  request: "",
  solictud: {
    pensionType: '',
    pensionAmount: 0,
    receiveSupport: '',
    pensionCategory: 'Hijos menores de edad',
    currentSupportAmount: 0,
    currentAmount: 0,
    increaseAmount: 0,
    totalAmount: 0,
    agreesWithAmount: '',
    disagreementReason: '',
    province: '',
    court: '',
    pensionSubType: '',
    reduceAmount: 0,
    knowsCaseLocation: '',
    wantsInvestigation: '',
    suspensionReason: '',
    desacatoDescription: '',
    paymentDay: '',
    lastPaymentDate: '',
    courtName: '',
    caseNumber: '',
    sentenceDate: '',
    sentenceFile: null,
    reason: ''
  }
};

// Define context type
export interface AppStateContextType {
  store: AppState;
  setStore: React.Dispatch<React.SetStateAction<AppState>>;
}

// Create context
const AppStateContext = createContext<AppStateContextType | undefined>(undefined);

// Context Provider component
export const AppStateProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [store, setStore] = useState<AppState>(initialState);

  return (
    <AppStateContext.Provider value={{ store, setStore }}>
      {children}
    </AppStateContext.Provider>
  );
};

export default AppStateContext;
