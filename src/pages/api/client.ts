import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import get from 'lodash/get';
import { backendBaseUrl } from '@utils/env';

const peopleApiUrl = `${backendBaseUrl}/dev/get-people`;

const getPeople = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { limit = '10', page = '1' } = req.query;

    const response = await axios.get(peopleApiUrl, {
      params: {
        limit: parseInt(limit as string, 10),
        page: parseInt(page as string, 10),
      },
    });

    const data = response.data;
    const totalRecords = get(data, 'totalRecords', 0);
    const personas = get(data, 'personas', []);
    const pagination = get(data, 'pagination', {});

    // Return formatted response
    res.status(200).json({
      message: 'Personas fetched successfully',
      totalRecords,
      personas,
      pagination,
    });
  } catch (error) {
    console.error('Error fetching people:', error);
    res.status(500).json({
      message: 'Failed to fetch personas',
      error: error.message,
    });
  }
};

export default getPeople;
