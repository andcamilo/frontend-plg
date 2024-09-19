import axios from 'axios';
import { backendBaseUrl } from '@utils/env';
import get from 'lodash/get';

export default async function handler(req, res) {
  // Allow only GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Only GET requests are allowed' });
  }

  // Extract solicitudId from query parameters
  const { solicitudId } = req.query;

  // Validate if solicitudId is provided
  if (!solicitudId) {
    return res.status(400).json({ message: 'Solicitud ID is required' });
  }

  try {
    // Lambda function URL to fetch the request by ID
    const lambdaUrl = `${backendBaseUrl}/dev/get-request-id/${solicitudId}`;

    // Make the request to your AWS Lambda function
    const response = await axios.get(lambdaUrl);

    // Safely access the solicitud data using lodash's get
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
