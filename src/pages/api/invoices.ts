import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import { backendBaseUrl } from '@utils/env';

const listDisbursementsUrl = `${backendBaseUrl}/dev/listDisbursements`;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { page = 1, limit = 10 } = req.query; // Default to page 1, limit 10

  try {
    console.log('🚀 ~ Fetching disbursements:', { page, limit });

    const response = await axios.get(listDisbursementsUrl, {
      params: {
        page,
        limit,
      },
    });

    // console.log('🚀 ~ Response data:', JSON.stringify(response.data, null, 2));

    return res.status(200).json(response.data);
  } catch (error) {
    console.error('Error fetching disbursements:', error);

    const errorMessage = error.response?.data?.message || 'Failed to fetch disbursements';
    return res.status(error.response?.status || 500).json({ message: errorMessage });
  }
}
