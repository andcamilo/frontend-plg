import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import { backendBaseUrl } from '@utils/env';

const listInvoicesUrl = `${backendBaseUrl}/chris/listInvoices`;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const response = await axios.get(listInvoicesUrl);

    const invoices = response.data?.data?.invoices || [];

    const filteredInvoices = invoices.map((invoice: any) => ({
      invoice_id: invoice.invoice_id,
      customer_id: invoice.customer_id,
      customer_name: invoice.customer_name,
      invoice_number: invoice.invoice_number,
      email: invoice.email,
    }));

    // Return the filtered invoices
    return res.status(200).json({
      status: 'success',
      data: filteredInvoices,
    });
  } catch (error) {
    console.error('Error fetching invoices:', error);

    const errorMessage = error.response?.data?.message || 'Failed to fetch invoices';
    return res.status(error.response?.status || 500).json({ message: errorMessage });
  }
}