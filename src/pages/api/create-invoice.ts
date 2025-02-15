import axios from 'axios';
import { backendBaseUrl, backendEnv } from '@utils/env';
import type { NextApiRequest, NextApiResponse } from 'next';

export const getLineItem = (pensionType) => {
  if (pensionType === "Primera vez") {
    return {
      item_id: "5848961000000098003",
      name: "Legal Services",
      description: "Professional legal services rendered.",
      quantity: 1,
      rate: 150,
      item_order: 1,
    };
  } else {
    return {
      item_id: "5848961000000148093",
      name: "Legal Services 2",
      description: "Professional legal services rendered.",
      quantity: 1,
      rate: 200,
      item_order: 1,
    };
  }
};


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Only POST requests are allowed' });
  }

  const { customer_id, pensionType } = req.body;

  if (!customer_id || typeof customer_id !== 'string') {
    return res.status(400).json({ message: 'customer_id is required and must be a string' });
  }

  if (!pensionType || typeof pensionType !== 'string') {
    return res.status(400).json({ message: 'pensionType is required and must be a string' });
  }

  try {
   
    const today = new Date().toISOString().split('T')[0]; // Format as YYYY-MM-DD
    const lineItem = getLineItem(pensionType);

    const payload = {
      customer_id,
      date: today,
      due_date: today,
      line_items: [lineItem],
      terms: "Terms & Conditions apply",
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
