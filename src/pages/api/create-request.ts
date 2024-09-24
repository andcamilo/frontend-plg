import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

interface RequestData {
  nombreSolicita: string;
  telefonoSolicita: string;
  telefonoSolicita2: string;
  emailSolicita: string;
  actualizarPorCorreo: boolean;
  cuenta: string;
  precio: number;
  subtotal: number;
  total: number;
  accion: string;
  tipo: string;
}

const createRequestUrl = `https://7hzt4b9tck.execute-api.us-east-1.amazonaws.com/dev/create-request`;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const requestData: RequestData = req.body;

  try {
    console.log("🚀 ~ Sending request data:", requestData);

    const response = await axios.post(createRequestUrl, requestData);

    console.log("🚀 ~ Response data:", response.data);

    return res.status(200).json(response.data);
  } catch (error) {
    console.error('Error creating request:', error);

    const errorMessage = error.response?.data?.message || 'Failed to create request';
    return res.status(error.response?.status || 500).json({ message: errorMessage });
  }
}
