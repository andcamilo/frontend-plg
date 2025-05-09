import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import { backendBaseUrl, backendEnv } from '@utils/env';

const getDisbursementUrl = (id: string) => `${backendBaseUrl}/${backendEnv}/getDisbursement/${id}`;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ message: 'Disbursement ID is required and must be a string' });
  }

  try {
    console.log(`🚀 ~ Fetching disbursement details for ID: ${id}`);

    const response = await axios.get(getDisbursementUrl(id));

    return res.status(200).json(response.data);
  } catch (error) {
    console.error(`Error fetching disbursement with ID ${id}:`, error);

    const errorMessage = error.response?.data?.message || 'Failed to fetch disbursement details';
    return res.status(error.response?.status || 500).json({ message: errorMessage });
  }
}
