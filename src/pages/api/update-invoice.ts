
import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import { backendBaseUrl, backendEnv } from '@utils/env';

const updateInvoiceUrlBase = `${backendBaseUrl}/${backendEnv}/updateInvoice`;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PATCH') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const { fieldUpdate, ids } = req.body;
    if (!fieldUpdate || !ids || !Array.isArray(ids)) {
      return res.status(400).json({
        message: 'Invalid request: fieldUpdate and ids (array) are required in the request body',
      });
    }

    const results = await Promise.all(
      ids.map(async (invoiceId: string) => {
        console.log("🚀 ~ updateInvoice ~ invoiceId:", invoiceId);
        if (!invoiceId) {
          return { invoiceId, status: 'error', error: 'Missing invoiceId' };
        }

        const url = `${updateInvoiceUrlBase}?invoiceId=${encodeURIComponent(invoiceId)}`;
        console.log("Calling URL:", url);

        try {
          const response = await axios.patch(url, fieldUpdate);
          return { invoiceId, status: 'success', data: response.data };
        } catch (error: any) {
          return { invoiceId, status: 'error', error: error.response?.data || error.message };
        }
      })
    );

    return res.status(200).json({ status: 'success', results });
  } catch (error: any) {
    console.error('Error in update-invoices API route:', error);
    return res.status(500).json({ status: 'error', message: 'Internal Server Error', error: error.message });
  }
}
