import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import { backendBaseUrl, backendEnv } from '@utils/env';

const approveInvoicesUrl = `${backendBaseUrl}/${backendEnv}/approve-invoices`;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const { invoice_ids } = req.body;
    if (!Array.isArray(invoice_ids) || invoice_ids.length === 0) {
      return res.status(400).json({ message: 'invoice_ids must be a non-empty array' });
    }

    const response = await axios.post(approveInvoicesUrl, { invoice_ids }, {
      headers: { 'Content-Type': 'application/json' }
    });

    return res.status(response.status).json(response.data);
  } catch (error: any) {
    console.error('Error approving invoices:', error);
    return res
      .status(error?.response?.status || 500)
      .json({ message: error?.response?.data?.message || 'Failed to approve invoices' });
  }
}
