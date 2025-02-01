import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import { backendBaseUrl, backendEnv } from '@utils/env'; 

// Define the base URL for the Lambda API
const updateDisbursementByIdUrl = `${backendBaseUrl}/${backendEnv}/updateDisbursementID`;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PATCH') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    // Extract `id` and `fieldUpdate` from the request body
    const { id, ...fieldUpdate } = req.body;

    console.log("🚀 ~ handler ~ id:", id);
    console.log("🚀 ~ handler ~ fieldUpdate:", fieldUpdate);

    // Validate input
    if (!id || typeof id !== 'string') {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid input: "id" is required and must be a string',
      });
    }

    if (!fieldUpdate || typeof fieldUpdate !== 'object') {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid input: "fieldUpdate" must be an object',
      });
    }

    // Make the request to the Lambda API
    const response = await axios.patch(`${updateDisbursementByIdUrl}/${id}`, fieldUpdate);

    // Respond with the Lambda's response
    return res.status(200).json(response.data);
  } catch (error) {
    console.error('Error calling updateDisbursementID Lambda:', error);

    const errorMessage =
      error.response?.data?.message || 'Failed to update disbursement';

    return res
      .status(error.response?.status || 500)
      .json({ status: 'error', message: errorMessage });
  }
}
