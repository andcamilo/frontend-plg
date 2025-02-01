import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import get from 'lodash/get';
import { backendBaseUrl, backendEnv } from '@utils/env';

const usersApiUrl = `${backendBaseUrl}/${backendEnv}/get-users`;

const getUsers = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
 
    const { limit = '10', page = '1' } = req.query;


    const response = await axios.get(usersApiUrl, {
      params: {
        limit: parseInt(limit as string, 10),
        page: parseInt(page as string, 10),
      },
    });

    const data = response.data;
    const status = get(data, 'status', 'unknown');
    const message = get(data, 'message', 'No message provided');
    const totalUsers = get(data, 'totalUsers', 0);
    const currentPageUsers = get(data, 'currentPageUsers', 0);
    const statusCounts = get(data, 'statusCounts', {});
    const rolCounts = get(data, 'rolCounts', {});
    const usuarios = get(data, 'usuarios', []);
    const pagination = get(data, 'pagination', {});

    // Return formatted response
    res.status(200).json({
      status,
      message,
      totalUsers,
      currentPageUsers,
      statusCounts,
      rolCounts,
      usuarios,
      pagination,
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      message: 'Failed to fetch users',
      error: error.message,
    });
  }
};

export default getUsers;
