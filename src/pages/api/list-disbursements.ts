import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import { backendBaseUrl, backendEnv } from '@utils/env';

interface Disbursement {
  id: string;
  source: string;
  disbursementType: string;
  expenseType: string;
  status: string;
  lawyer: string;
  invoiceNumber: string;
  amount: number;
  date: string;
}

interface DisbursementResponse {
  status: string;
  disbursements: Disbursement[];
  count: number;
  nextCursor: string;
  firestoreReads: number;
}

const listDisbursementsUrl = `${backendBaseUrl}/${backendEnv}/listDisbursements`;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const limit = parseInt((req.query.limit as string) || '10', 10);
  const email = req.query.email as string;
  const role = parseInt(req.query.role as string, 10);
  const lastDate = req.query.lastDate as string;
  const filter = req.query.filter === 'true';

  const params: Record<string, any> = {
    limit,
  };

  // If filter is true, always add email
  if (filter && email) {
    params.email = email;
  } else if (![50, 90, 99].includes(role) && email) {
    // Otherwise, only include email if role is NOT 50, 90, or 99
    params.email = email;
  }

  // Add lastDate if provided (used for cursor-based pagination)
  if (lastDate) {
    params.lastDate = lastDate;
  }

  try {
    console.log("🚀 ~ handler ~ params:", params)
    const response = await axios.get<DisbursementResponse>(listDisbursementsUrl, {
      params,
      headers: {
        'Content-Type': 'application/json'
      }
    });


    // Return the response data with proper typing
    return res.status(200).json(response.data);
  } catch (error) {
    console.error('Error fetching disbursements:', error);
    const errorMessage = error.response?.data?.message || 'Failed to fetch disbursements';
    return res.status(error.response?.status || 500).json({ message: errorMessage });
  }
}
