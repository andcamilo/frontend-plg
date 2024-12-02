import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import { backendBaseUrl } from '@utils/env';

const getUserById = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { userCuenta } = req.query;

  if (!userCuenta) {
    return res.status(400).json({ message: 'Missing userCuenta parameter' });
  }

  try {
    // Enviar solicitud al backend con el `userCuenta`
    const response = await axios.get(`${backendBaseUrl}/chris/get-user-cuenta/${userCuenta}`);

    // Retornar la respuesta del backend
    res.status(200).json(response.data);
  } catch (error) {
    console.error('Error fetching user by ID:', error);
    res.status(500).json({
      message: 'Failed to fetch user by ID',
      error: error.response?.data || error.message,
    });
  }
};

export default getUserById;
