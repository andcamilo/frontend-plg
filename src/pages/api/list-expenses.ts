import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import { backendBaseUrl } from '@utils/env';

const listExpensesUrl = `${backendBaseUrl}/dev/listExpenses`;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const response = await axios.get(listExpensesUrl);

    const expenses = response.data?.data?.expenses || [];

    const filteredExpenses = expenses.map((expense: any) => ({
      expense_id: expense.expense_id,
      date: expense.date,
      description: expense.description || 'N/A',
      total: expense.total,
      status: expense.status,
      reference_number: expense.reference_number || 'N/A',
    }));

    // Return the filtered expenses
    return res.status(200).json({
      status: 'success',
      data: filteredExpenses,
    });
  } catch (error) {
    console.error('Error fetching expenses:', error);

    const errorMessage = error.response?.data?.message || 'Failed to fetch expenses';
    return res.status(error.response?.status || 500).json({ message: errorMessage });
  }
}
