import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import get from 'lodash/get';
import { backendBaseUrl, backendEnv } from '@utils/env';

const validateEmailUrl = `${backendBaseUrl}/${backendEnv}/validate-email`;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { email, isLogged } = req.query; // Retrieving query parameters from req

  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  console.log("🚀 ~ handler ~ isLogged:", isLogged);
  console.log("🚀 ~ handler ~ email:", email);

  try {
    const response = await axios.get(validateEmailUrl, {
      params: {
        email: email.toString(),
        isLogged: isLogged?.toString(),
      },
    });

    console.log("🚀 ~ handler ~ response:", response.data);

    const isLoggedResponse = get(response, 'data.isLogged', 'error');
    const cuenta = get(response, 'data.cuenta', null);

    return res.status(200).json({ isLogged: isLoggedResponse, cuenta });
  } catch (error) {
    console.error('Error checking email:', error.toJSON ? error.toJSON() : error);

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
