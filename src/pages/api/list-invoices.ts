import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import { backendBaseUrl, backendEnv } from '@utils/env';

const listInvoicesUrl = `${backendBaseUrl}/${backendEnv}/listInvoices`;

// Only these columns should be included in the response
const COLUMNS_TO_KEEP = [
  'invoice_number',        // numero de factura
  'status',                // Estado
  'email',                 // correo
  'created_by',            // creador por
  'total',                 // total
  'company_name',
  'balance',               // balance
  'modified_time',         // fecha de modificacion
  'date',                  // fecha
  'due_date',              // fecha de vencimiento
  'client_viewed_time',   // visto por el cliente
  'invoice_id',
];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    // Always fetch 1000 records from page 1 in the backend
    const { page = '1', limit = '1000' } = req.query;

    const response = await axios.get(listInvoicesUrl, {
      params: { page, limit },
    });
    console.log("🚀 ~ handler ~ response:", response)

    // Extract both data and pagination metadata from the backend response
    const remote = response.data;

    // Only keep the specified columns for each invoice record
    const cleanedData = (remote.data || []).map((invoice: any) => {
      const cleaned: any = {};
      COLUMNS_TO_KEEP.forEach((col) => {
        if (invoice.hasOwnProperty(col)) {
          cleaned[col] = invoice[col];
        }
      });
      return cleaned;
    });

    return res.status(200).json({
      status: 'success',
      data: cleanedData,
      // Include pagination metadata for frontend use
      pagination: {
        totalCount: remote.totalCount || 0,
        totalPages: remote.totalPages || 0,
        currentPage: remote.currentPage || 1,
        hasMorePages: remote.hasMorePages || false
      }
    });
  } catch (error: any) {
    console.error('Error fetching invoices:', error);
    return res
      .status(error?.response?.status || 500)
      .json({ message: error?.response?.data?.message || 'Failed to fetch invoices' });
  }
}
