import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import { backendBaseUrl, backendEnv } from '@utils/env';

const listDisbursementsUrl = `${backendBaseUrl}/${backendEnv}/listDisbursements`;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const limit = parseInt((req.query.limit as string) || '10', 10);
  const page = parseInt((req.query.page as string) || '1', 10);
  const email = req.query.email as string;
  const role = parseInt(req.query.role as string, 10);

  const params: Record<string, any> = {
    limit,
    page,
  };

  // ✅ Only include email if role is NOT 50, 90, or 99
  if (![50, 90, 99].includes(role) && email) {
    params.email = email;
  }

  try {
    const response = await axios.get(listDisbursementsUrl, {
      params,
    });

    return res.status(200).json(response.data);
  } catch (error) {
    console.error('Error fetching disbursements:', error);
    const errorMessage = error.response?.data?.message || 'Failed to fetch disbursements';
    return res.status(error.response?.status || 500).json({ message: errorMessage });
  }
}
