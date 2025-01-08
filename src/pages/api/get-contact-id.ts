import axios from 'axios';
import { backendBaseUrl } from '@utils/env';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Allow only GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed. Only GET requests are allowed.' });
  }

  const { email } = req.query;

  // Validate email parameter
  if (!email || typeof email !== 'string') {
    return res.status(400).json({ message: 'The email parameter is required and must be a string.' });
  }

  const lambdaUrl = `${backendBaseUrl}/chris/users/contact/${email}`;

  console.log("🚀 ~ handler ~ lambdaUrl:", lambdaUrl);

  try {
    // Call the Lambda function
    const { data } = await axios.get(lambdaUrl);
    console.log("🚀 ~ handler ~ Lambda response data:", data);

    // Extract contactId
    const contactId = data?.contactId;
    console.log("🚀 ~ handler ~ contactId:", contactId)

    if (!contactId) {
      return res.status(404).json({ message: 'Contact ID not found for the provided email.' });
    }

    // Return success response
    return res.status(200).json({ contactId });
  } catch (error) {
    console.error('Error fetching contactId:', error);

    // Handle different error scenarios
    const status = error.response?.status || 500;
    const message =
      error.response?.data?.message ||
      'An error occurred while fetching the contact ID from the Lambda function.';

    return res.status(status).json({
      message,
      error: error.message,
    });
  }
}
