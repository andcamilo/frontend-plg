import axios from 'axios';
import { backendBaseUrl, backendEnv } from '@utils/env';
import get from 'lodash/get';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Only GET requests are allowed' });
  }

  const { solicitudId } = req.query;
  console.log("🚀 ~ handler ~ solicitudId:", solicitudId)

  if (!solicitudId) {
    return res.status(400).json({ message: 'Solicitud ID is required' });
  }

  try {
    const lambdaUrl = `${backendBaseUrl}/${backendEnv}/get-request-id/${solicitudId}`;

    const response = await axios.get(lambdaUrl);

    const solicitud = get(response, 'data.solicitud', null);

    // Check if solicitud is found
    if (!solicitud) {
      return res.status(404).json({ message: 'Solicitud not found' });
    }

    // Send the solicitud back to the client
    return res.status(200).json(solicitud);
  } catch (error) {
    console.error('Error fetching solicitud:', error);

    // Handle error response from Lambda or network issues
    const errorMessage = error.response
      ? error.response.data.message || 'Failed to fetch solicitud from Lambda'
      : 'Network or server error';

    return res.status(500).json({
      message: errorMessage,
      error: error.message,
    });
  }
}
