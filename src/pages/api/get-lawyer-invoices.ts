import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import { backendBaseUrl, backendEnv } from '@utils/env';

const lambdaUrl = `${backendBaseUrl}/${backendEnv}/get-solicitudes-by-lawyer`;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ message: 'Method Not Allowed' });

  const email = (req.body?.email || req.query?.email) as string | undefined;
  if (!email) return res.status(400).json({ message: 'email is required' });

  try {
    const response = await axios.get(lambdaUrl, { params: { email } });
    return res.status(200).json(response.data);
  } catch (err: any) {
    const status = err?.response?.status || 500;
    const data = err?.response?.data;
    console.error('[get-lawyer-invoices] error', { status, data, message: err?.message });
    return res.status(status).json({ message: data?.message || 'Failed to fetch invoices' });
  }
}
