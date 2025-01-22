import React, { createContext, useState, ReactNode } from 'react';

export interface PaymentState {
    token: string;
    solicitudId: string;
};

export interface PaymentContextType {
    store: PaymentState;
    setStore: React.Dispatch<React.SetStateAction<PaymentState>>;
}

// Initial state for the PaymentContext
const initialState: PaymentState = {
    token: '',
    solicitudId: ''
};

const PaymentContext = createContext<PaymentContextType | undefined>(undefined);

// Create the provider
export const PaymentStateProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [store, setStore] = useState<PaymentState>(initialState);

    return (
        <PaymentContext.Provider value={{ store, setStore }}>
            {children}
        </PaymentContext.Provider>
    );
};

export default PaymentContext;
