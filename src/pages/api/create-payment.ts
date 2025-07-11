import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import { backendBaseUrl, backendEnv } from '@utils/env';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Only POST requests are allowed' });
  }

  const { customer_id, payment_mode, amount, invoices, email } = req.body;

  if (!customer_id || typeof customer_id !== 'string') {
    return res.status(400).json({ message: 'customer_id is required and must be a string' });
  }
  if (!payment_mode || typeof payment_mode !== 'string') {
    return res.status(400).json({ message: 'payment_mode is required and must be a string' });
  }
  if (typeof amount !== 'number') {
    return res.status(400).json({ message: 'amount is required and must be a number' });
  }
  if (!Array.isArray(invoices)) {
    return res.status(400).json({ message: 'invoices must be an array' });
  }
  if (!email || typeof email !== 'string') {
    return res.status(400).json({ message: 'email is required and must be a string' });
  }

  try {
    const payload = {
      customer_id,
      payment_mode,
      amount,
      invoices,
      email,
    };

    const lambdaUrl = `${backendBaseUrl}/${backendEnv}/create-payment`;

    const response = await axios.post(lambdaUrl, payload, {
      headers: { 'Content-Type': 'application/json' },
    });

    return res.status(200).json(response.data);
  } catch (error) {
    console.error('Error creating payment:', error);
    const errorMessage = error.response
      ? error.response.data.message || 'Failed to create payment via Lambda'
      : 'Network or server error';
    return res.status(500).json({
      message: errorMessage,
      error: error.message,
    });
  }
}
