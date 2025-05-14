import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import { backendBaseUrl, backendEnv } from '@utils/env';

const deleteDisbursementUrl = `${backendBaseUrl}/${backendEnv}/delete-disbursements`;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { ids } = req.body;

  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ message: 'IDs array is required' });
  }

  try {
    console.log('🚀 ~ Deleting disbursements:', { ids });

    const response = await axios.post(deleteDisbursementUrl, { ids });

    return res.status(200).json(response.data);
  } catch (error) {
    console.error('Error deleting disbursements:', error);

    const errorMessage = error.response?.data?.message || 'Failed to delete disbursements';
    return res.status(error.response?.status || 500).json({ message: errorMessage });
  }
}
