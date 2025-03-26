import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import { backendBaseUrl, backendEnv } from '@utils/env';

const setInvoiceDraftUrl = `${backendBaseUrl}/${backendEnv}/setInvoiceDraft`;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ message: 'Method Not Allowed' });
  }
  
  const { invoiceId } = req.query;

  if (!invoiceId) {
    return res.status(400).json({ message: 'Missing invoiceId parameter' });
  }

  console.log("🚀 ~ handler ~ invoiceId:", invoiceId)
  
  try {
    const response = await axios.post(
      `${setInvoiceDraftUrl}?invoiceId=${encodeURIComponent(String(invoiceId))}`,
      null,
      {
        headers: {
          'Content-Type': 'application/json'
        },
      }
    );

    console.log("🚀 ~ handler ~ response:", response)
    
    return res.status(200).json(response.data);
  } catch (error: any) {
    console.error("Error in set-invoice-draft API route:", error);
    return res.status(error.response?.status || 500).json({
      message: error.response?.data || error.message
    });
  }
}
