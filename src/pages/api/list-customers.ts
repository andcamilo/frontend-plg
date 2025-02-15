import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import { backendBaseUrl, backendEnv } from '@utils/env';

const listCustomersUrl = `${backendBaseUrl}/${backendEnv}/listCustomers`;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { page = 1, limit = 20 } = req.query;

  try {
    console.log('🚀 ~ Fetching customers:', { page, limit });

    // Fetch customer data from backend
    const response = await axios.get(listCustomersUrl, {
      params: {
        page,
        limit,
      },
    });

    // Extract relevant fields: contact_id, contact_name, and email
    const customers = response.data?.data || [];
    const formattedCustomers = customers.map((customer: any) => ({
      contact_id: customer.contact_id,
      contact_name: customer.contact_name,
      email: customer.email || '', // Ensure empty string if email is null
    }));

    return res.status(200).json({
      status: 'success',
      data: formattedCustomers,
    });
  } catch (error: any) {
    console.error('Error fetching customers:', error);

    const errorMessage = error.response?.data?.message || 'Failed to fetch customers';
    return res.status(error.response?.status || 500).json({ message: errorMessage });
  }
}
