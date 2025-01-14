import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import { backendBaseUrl } from '@utils/env'; 

const listItemsUrl = `${backendBaseUrl}/chris/listItems`;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const { page, limit, ...restQuery } = req.query;

    console.log('🚀 ~ Fetching items with query params:', req.query);

    const response = await axios.get(listItemsUrl, {
      params: {
        page,
        limit,
        ...restQuery, // Include any additional query parameters
      },
    });
    return res.status(200).json(response.data);
  } catch (error) {
    console.error('Error fetching items:', error);

    // Handle and return errors gracefully
    const errorMessage = error.response?.data?.message || 'Failed to fetch items';
    return res.status(error.response?.status || 500).json({ message: errorMessage });
  }
}
