import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import { backendBaseUrl, backendEnv } from '@utils/env';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { userId } = req.query;

  if (req.method !== 'DELETE') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  if (!userId) {
    return res.status(400).json({ message: 'userId is required' });
  }

  console.log('🚀 ~ handler ~ userId:', userId);

  try {
    const externalApiResponse = await axios.delete(
      `${backendBaseUrl}/${backendEnv}/delete-user/${userId}`
    );

    console.log('🚀 ~ handler ~ externalApiResponse:', externalApiResponse.data);

    return res.status(200).json({ message: 'Usuario eliminada exitosamente', data: externalApiResponse.data });
  } catch (error) {
    console.error('Error making DELETE request to AWS Lambda:', error.toJSON ? error.toJSON() : error);

    if (error.response) {
      console.error('🚨 ~ handler ~ error.response:', error.response.data);

      return res.status(error.response.status).json({
        message: error.response.data?.message || 'External API request failed',
      });
    } else {
      return res.status(500).json({ message: 'Internal server error' });
    }
  }
}
