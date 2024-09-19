import axios from 'axios';
import { NextApiRequest, NextApiResponse } from 'next';
import { backendBaseUrl } from '@utils/env'; 
import get from 'lodash/get'; // Import get from lodash

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log("API received request");

  if (req.method !== 'PATCH') {
    return res.status(405).json({ message: 'Only PATCH requests are allowed.' });
  }

  console.log("Correct request method");

  const updates = get(req.body, 'updates', null);
  const solicitudId = get(req.body, 'solicitud', null);

  if (!solicitudId || !updates || typeof updates !== 'object') {
    return res.status(400).json({
      message: 'Solicitud ID and valid updates are required.',
    });
  }

  try {
    const requestUrl = `${backendBaseUrl}/dev/update-request/${solicitudId}`;

    console.log("Request URL:", requestUrl);
    const backendResponse = await axios.patch(requestUrl,  { updates }, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log("Backend response:", backendResponse);

    return res.status(backendResponse.status).json(backendResponse.data);

  } catch (error) {
    console.error('Error updating request:', error);
    return res.status(500).json({
      message: 'Failed to update request.',
      error: error.response ? error.response.data : error.message,
    });
  }
}
