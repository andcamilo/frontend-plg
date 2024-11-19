import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import { backendBaseUrl } from '@utils/env';

interface DisbursementRequestData {
  disbursementType: string;
  expenseType: string;
  status: string;
  desemboloOficina: Array<{
    expenseType: string;
    otherExpenseType?: string;
    expenseDetail: string;
    amount: number;
    disbursementRecipient: string;
    associatedInvoiceNumber?: string;
    client: string;
  }>;
  desembolsoCliente: Array<{
    invoiceNumber: string;
    client: string;
    amount: number;
    expenseObject: string;
    otherExpenses?: string;
    billedExpensesSent: string;
    clientPaidExpensesSent: string;
    associatedExpenseDetail: string;
    lawyer: string;
  }>;
  desembolsoCajaChica: Array<{
    lawyer: string;
    date: string;
    amount: number;
    invoiceNumber: string;
    disbursementType: string;
    reason: string;
    observation?: string;
  }>;
  detalleDesembolsoPagado: {
    paymentDate: string;
    transactionNumber: string;
    attachedFile: string;
  };
  detalleTransferenciaPago: {
    selectOption: string;
    name: string;
    number: string;
    bank: string;
    observation?: string;
    paymentDate: string;
  };
}

const createDisbursementUrl = `${backendBaseUrl}/dev/create-disbursement`;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const disbursementData: DisbursementRequestData = req.body;

  try {
    console.log("🚀 ~ Sending disbursement data:", disbursementData);

    const response = await axios.post(createDisbursementUrl, disbursementData);

    console.log("🚀 ~ Response data:", response.data);

    return res.status(200).json(response.data);
  } catch (error) {
    console.error('Error creating disbursement:', error);

    const errorMessage = error.response?.data?.message || 'Failed to create disbursement';
    return res.status(error.response?.status || 500).json({ message: errorMessage });
  }
}