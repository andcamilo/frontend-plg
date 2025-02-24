import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import { backendBaseUrl, backendEnv } from '@utils/env'; // Adjust the path to your environment variables as needed

const listContactsUrl = `${backendBaseUrl}/${backendEnv}/listContacts`; // The Lambda URL

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    console.log('🚀 ~ Fetching contacts');

   
    const response = await axios.get(listContactsUrl);

    return res.status(200).json(response.data);
  } catch (error) {
    console.error('Error fetching contacts:', error);

    const errorMessage = error.response?.data?.message || 'Failed to fetch contacts';
    return res.status(error.response?.status || 500).json({ message: errorMessage });
  }
}
