import React, { createContext, useState, ReactNode } from 'react';

type DesembolsoOficina = {
    expenseType: string; 
    otherExpenseType?: string;
    expenseDetail: string; 
    amount: number;
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
    status: boolean;
};

type DesembolsoCajaChica = {
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
    solicita: string;
    desemboloOficina: DesembolsoOficina[];
    desembolsoCliente: DesembolsoCliente[];
    desembolsoCajaChica: DesembolsoCajaChica[];
    detalleDesembolsoPagado: DetalleDesembolsoPagado;
    detalleTransferenciaPago: DetalleTransferenciaPago;
};

// Initial state for formData
const initialFormData: FormDataType = {
    disbursementType: 'desembolso-gastos',
    solicita: '',
    expenseType: 'de-oficina',
    status: 'creada',
    desemboloOficina: [
        {
            expenseType: '', 
            otherExpenseType: '',
            expenseDetail: '', 
            amount: 0,
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
            associatedExpenseDetail: '',
            status: false,
        },
    ],
    desembolsoCajaChica: [{
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

// ✅ Mapping function to use when setting context state from backend data
export const mapDisbursementToFormData = (raw: any): FormDataType => {
    const formatDate = (date: any): string => {
      if (!date) return '';
      if (typeof date === 'string') return date;
      if (date?.seconds) {
        const d = new Date(date.seconds * 1000);
        return d.toISOString().split('T')[0];
      }
      return '';
    };
  
    const toNumber = (val: any): number =>
      typeof val === 'string' ? parseFloat(val) || 0 : val || 0;
  
    return {
      disbursementType: raw.disbursementType || raw.tipo_desembolso || 'desembolso-gastos',
      expenseType: raw.expenseType || (raw.isGasto ? 'de-cliente' : 'de-oficina'),
      status: raw.status || 'creada',
      solicita: raw.solicita || '',
      desemboloOficina: raw.desemboloOficina?.length
        ? raw.desemboloOficina.map((item: any) => ({
            expenseType: item.expenseType || '',
            otherExpenseType: item.otherExpenseType || '',
            expenseDetail: item.expenseDetail || '',
            amount: toNumber(item.amount),
            lawyer: item.lawyer || '',
            invoiceNumber: item.invoiceNumber || '',
            status: item.status || false,
          }))
        : raw.oficina
        ? [
            {
              expenseType: raw.oficina.tipo_gasto || '',
              otherExpenseType: '',
              expenseDetail: raw.oficina.gasto || '',
              amount: toNumber(raw.oficina.monto),
              lawyer: raw.abogado || '',
              invoiceNumber: raw.oficina.factura || '',
              status: raw.status === 'pagado' || false,
            },
          ]
        : [],
  
      desembolsoCliente: raw.desembolsoCliente?.length
        ? raw.desembolsoCliente.map((item: any) => ({
            invoiceNumber: item.invoiceNumber || '',
            amount: toNumber(item.amount),
            expenseObject: item.expenseObject || '',
            otherExpenses: item.otherExpenses || '',
            billedExpensesSent: item.billedExpensesSent || '',
            clientPaidExpensesSent: item.clientPaidExpensesSent || '',
            associatedExpenseDetail: item.associatedExpenseDetail || '',
            lawyer: item.lawyer || '',
            status: item.status || false,
          }))
        : raw.gastosAsociados?.length
        ? raw.gastosAsociados.map((gasto: any) => ({
            invoiceNumber: gasto.factura || '',
            amount: toNumber(gasto.monto),
            expenseObject: gasto.tipo || '',
            otherExpenses: gasto.tipo_gasto_otros || '',
            billedExpensesSent: gasto.gastos_facturados_enviados || '',
            clientPaidExpensesSent: gasto.gastos_enviados_pagados || '',
            associatedExpenseDetail: gasto.detalle_gasto || '',
            lawyer: raw.abogado || '',
            status: raw.status === 'pagado' || false,
          }))
        : [],
  
      desembolsoCajaChica: raw.desembolsoCajaChica?.length
        ? raw.desembolsoCajaChica.map((item: any) => ({
            lawyer: item.lawyer || '',
            date: formatDate(item.date),
            amount: toNumber(item.amount),
            invoiceNumber: item.invoiceNumber || '',
            disbursementType: item.disbursementType || '',
            reason: item.reason || '',
            observation: item.observation || '',
            status: item.status || false,
          }))
        : raw.cajaChica
        ? [
            {
              lawyer: raw.abogado || '',
              date: formatDate(raw.cajaChica.fecha_desembolso),
              amount: toNumber(raw.cajaChica.monto),
              invoiceNumber: raw.cajaChica.factura || '',
              disbursementType: raw.cajaChica.tipo_desembolso || '',
              reason: raw.cajaChica.motivo || '',
              observation: raw.cajaChica.observacion || '',
              status: raw.status === 'pagado' || false,
            },
          ]
        : [],
  
      detalleDesembolsoPagado: {
        paymentDate: formatDate(raw.detalleDesembolsoPagado?.paymentDate || raw.pagado?.fecha_pagado),
        transactionNumber: raw.detalleDesembolsoPagado?.transactionNumber || raw.pagado?.numero_pagado || '',
        attachedFile: raw.detalleDesembolsoPagado?.attachedFile || raw.pagado?.adjunto_documento || '',
      },
  
      detalleTransferenciaPago: {
        selectOption: raw.detalleTransferenciaPago?.selectOption || raw.pago?.select_pago || '',
        name: raw.detalleTransferenciaPago?.name || raw.pago?.nombre_pago || '',
        number: raw.detalleTransferenciaPago?.number || raw.pago?.numero_pago || '',
        bank: raw.detalleTransferenciaPago?.bank || raw.pago?.banco_pago || '',
        observation: raw.detalleTransferenciaPago?.observation || raw.pago?.observacion_pago || raw.pago?.observacion || '',
        paymentDate: formatDate(raw.detalleTransferenciaPago?.paymentDate || raw.pago?.fecha_pago),
      },
    };
  };
  

