import type { NextApiRequest, NextApiResponse } from 'next';
import { backendBaseUrl, backendEnv } from '@utils/env';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {

  const { id } = req.query;
  console.log("🚀 ~ handler ~ id:", id)
  const { items } = req.body;
  console.log("🚀 ~ handler ~ items:", items)

  if (!id || !Array.isArray(items) || !items.every(item => item && typeof item.body === 'object')) {
    return res.status(400).json({ message: 'Missing or invalid required fields' });
  }

  const results: any[] = [];

  try {
    for (const item of items) {
      const lambdaResponse = await fetch(`${backendBaseUrl}/${backendEnv}/update-record?id=${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ item }), // send one item at a time
      });

      const data = await lambdaResponse.json();

      if (!lambdaResponse.ok) {
        results.push({ success: false, item, error: data.message || 'Lambda error' });
      } else {
        results.push({ success: true, item, response: data });
      }
    }

    return res.status(200).json({
      message: 'All items processed',
      results,
    });

  } catch (error: any) {
    console.error("❌ Error calling Lambda:", error);
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
}
