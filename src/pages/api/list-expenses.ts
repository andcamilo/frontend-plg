import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import { backendBaseUrl, backendEnv } from '@utils/env';

const listExpensesUrl = `${backendBaseUrl}/${backendEnv}/listExpenses`;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    // Always fetch 1000 items from page 1
    const response = await axios.get(listExpensesUrl, {
      params: {
        page: 1,
        limit: 1000,
      },
    });

    // If your backend returns fields under `data.expenses`, just pass them through:
    const expenses = response.data?.data?.expenses 
      || response.data?.data 
      || []; // fallback

    // Return everything untouched
    return res.status(200).json({
      status: 'success',
      data: expenses,
    });
  } catch (error: any) {
    console.error('Error fetching expenses:', error);
    const errorMessage = error.response?.data?.message || 'Failed to fetch expenses';
    return res
      .status(error.response?.status || 500)
      .json({ message: errorMessage });
  }
}
