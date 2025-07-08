import axios from 'axios';
import type { NextApiRequest, NextApiResponse } from 'next';
import { backendBaseUrl, backendEnv } from '@utils/env';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Only POST requests are allowed' });
  }

  const { customer_id, rate, date, status, payment_terms, notes } = req.body;

  if (!customer_id || typeof customer_id !== 'string') {
    return res.status(400).json({ message: 'customer_id is required and must be a string' });
  }
  if (typeof rate !== 'number') {
    return res.status(400).json({ message: 'rate is required and must be a number' });
  }
  if (!date || typeof date !== 'string') {
    return res.status(400).json({ message: 'date is required and must be a string' });
  }
  if (!status || typeof status !== 'string') {
    return res.status(400).json({ message: 'status is required and must be a string' });
  }
  if (typeof payment_terms !== 'number') {
    return res.status(400).json({ message: 'payment_terms is required and must be a number' });
  }

  try {
    const payload = {
      customer_id,
      date,
      status,
      payment_terms,
      notes,
      line_items: [
        {
          item_id: '1690190000008580001',
          rate,
          quantity: 1,
        },
      ],
    };

    const lambdaUrl = `${backendBaseUrl}/${backendEnv}/createInvoice`;

    // Make a POST request to the Lambda function
    const response = await axios.post(lambdaUrl, payload, {
      headers: { 'Content-Type': 'application/json' },
    });

    // Return the Lambda response to the client
    return res.status(200).json(response.data);
  } catch (error) {
    console.error('Error creating invoice:', error);

    const errorMessage = error.response
      ? error.response.data.message || 'Failed to create invoice via Lambda'
      : 'Network or server error';

    return res.status(500).json({
      message: errorMessage,
      error: error.message,
    });
  }
}
