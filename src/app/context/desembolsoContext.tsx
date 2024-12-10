import React, { createContext, useState, ReactNode } from 'react';


type DesembolsoOficina = {
    expenseType: string; 
    otherExpenseType?: string;
    expenseDetail: string; 
    amount: number;
    disbursementRecipient: string;
    associatedInvoiceNumber?: string;
    client: string;
    status: boolean;
};

type DesembolsoCliente = {
    invoiceNumber: string;
    client: string; 
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
    lawyer: string; // A quién se le realiza el desembolso
    date: string; // Fecha
    amount: number; // Monto ($)
    invoiceNumber: string; // Número de factura
    disbursementType: string; // Tipo de desembolso
    reason: string; // Motivo
    observation?: string; // Observación (optional)
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
            disbursementRecipient: '',
            associatedInvoiceNumber: '',
            client: '',
            status: false,
        },
    ],
    desembolsoCliente: [
        {
            invoiceNumber: '',
            client: '',
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
