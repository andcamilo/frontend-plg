import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import { backendBaseUrl, backendEnv } from '@utils/env';

const listInvoicesUrl = `${backendBaseUrl}/${backendEnv}/listInvoices`;

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

    // We'll assume 'response.data.data' is already an array in the shape 
    // we want to pass to our frontend. 
    // If your external service returns a nested object, adjust accordingly.
    const remote = response.data;

    return res.status(200).json({
      status: 'success',
      // we want a direct array in `data`
      // if remote.data is the array of invoices, pass it along
      data: remote.data || [],
    });
  } catch (error: any) {
    console.error('Error fetching invoices:', error);
    return res
      .status(error?.response?.status || 500)
      .json({ message: error?.response?.data?.message || 'Failed to fetch invoices' });
  }
}
