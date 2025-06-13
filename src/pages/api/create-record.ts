import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import { backendBaseUrl,backendEnv } from '@utils/env';

interface RequestData {
  name: string;
  lastName: string;
  email: string;
  phone: string;
  solicitud: string;
}

const createRecordUrl = `${backendBaseUrl}/${backendEnv}/create-record`;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const requestData: RequestData = req.body;

  try {
    console.log("🚀 ~ Sending request data:", requestData);

    const response = await axios.post(createRecordUrl, requestData);

    console.log("🚀 ~ Response data:", response.data);

    return res.status(200).json(response.data);
  } catch (error) {
    console.error('Error creating request:', error);

    const errorMessage = error.response?.data?.message || 'Failed to create request';
    return res.status(error.response?.status || 500).json({ message: errorMessage });
  }
}
