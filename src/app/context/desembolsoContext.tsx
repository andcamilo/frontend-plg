import React, { createContext, useState, ReactNode } from 'react';


type DesembolsoOficina = {
    expenseType: string; 
    otherExpenseType?: string;
    expenseDetail: string; 
    amount: number;
    lawyer: string;
    invoiceNumber?: string;
    status: boolean;
};

type DesembolsoCliente = {
    invoiceNumber: string;
    amount: number;
    expenseObject: string; 
    otherExpenses?: string; 
    billedExpensesSent: string; 
    clientPaidExpensesSent: string;
    associatedExpenseDetail: string;
    lawyer: string;
    status: boolean;
};

type DesembolsoCajaChica = {
    lawyer: string; 
    date: string;
    amount: number; 
    invoiceNumber: string; 
    disbursementType: string; 
    reason: string; 
    observation?: string; 
    status: boolean;
};

type DetalleDesembolsoPagado = {
    paymentDate: string;
    transactionNumber: string;
    attachedFile: string;
};

type DetalleTransferenciaPago = {
    selectOption: string;
    name: string; 
    number: string;
    bank: string; 
    observation?: string; 
    paymentDate: string; 
};


type FormDataType = {
    disbursementType: string;
    expenseType: string;
    status: string;
    desemboloOficina: DesembolsoOficina[];
    desembolsoCliente: DesembolsoCliente[];
    desembolsoCajaChica: DesembolsoCajaChica[];
    detalleDesembolsoPagado: DetalleDesembolsoPagado;
    detalleTransferenciaPago: DetalleTransferenciaPago;
    
};

// Initial state for formData
const initialFormData: FormDataType = {
    disbursementType: 'desembolso-gastos',
    expenseType: 'de-oficina',
    status: 'creada',
    desemboloOficina: [
        {
            expenseType: '', 
            otherExpenseType: '',
            expenseDetail: '', 
            amount: 0,
            lawyer: '',
            invoiceNumber: '',
            status: false,
        },
    ],
    desembolsoCliente: [
        {
            invoiceNumber: '',
            amount: 0,
            expenseObject: '', 
            otherExpenses: '', 
            billedExpensesSent: '', 
            clientPaidExpensesSent:'',
            lawyer: '',
            associatedExpenseDetail: '',
            status: false,
        },
    ],
    desembolsoCajaChica:[ {
        lawyer:'',
        date: '',
        amount: 0,
        invoiceNumber: '',
        disbursementType: '',
        reason: '',
        observation: '',
        status: false,
    }],
    detalleDesembolsoPagado: {
        paymentDate: '',
        transactionNumber: '',
        attachedFile: '',
    },
    detalleTransferenciaPago: {
        selectOption: '',
        name: '', 
        number: '',
        bank: '', 
        observation: '', 
        paymentDate: '', 
    }
};

const DesembolsoContext = createContext<{
    state: FormDataType;
    setState: React.Dispatch<React.SetStateAction<FormDataType>>;
} | undefined>(undefined);

export const DesembolsoStateProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [state, setState] = useState<FormDataType>(initialFormData);
    return (
        <DesembolsoContext.Provider value={{ state, setState }}>
            {children}
        </DesembolsoContext.Provider>
    );
};

export default DesembolsoContext;
