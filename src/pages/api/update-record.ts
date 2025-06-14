import type { NextApiRequest, NextApiResponse } from 'next';
import { backendBaseUrl, backendEnv } from '@utils/env';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  console.log("🚀 ~ handler ~ id:", id);

  if (Array.isArray(req.body?.items)) {
    const { items } = req.body;
    console.log("📦 Modo múltiples items:", items);

    if (!id || !items.every(item => item && typeof item.body === 'object')) {
      return res.status(400).json({ message: 'Missing or invalid required fields (items)' });
    }

    const results: any[] = [];

    try {
      for (const item of items) {
        const lambdaResponse = await fetch(`${backendBaseUrl}/${backendEnv}/update-record?id=${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ item }),
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
      console.error("❌ Error calling Lambda (items):", error);
      return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  }

  else if (typeof req.body === 'object' && req.body !== null) {
    console.log("🆕 Modo datos únicos:", req.body);

    try {
      const lambdaResponse = await fetch(`${backendBaseUrl}/${backendEnv}/update-record?id=${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req.body),
      });

      const data = await lambdaResponse.json();

      if (!lambdaResponse.ok) {
        return res.status(lambdaResponse.status).json({ message: data.message || 'Lambda error' });
      }

      return res.status(200).json({ status: 'success', data });
    } catch (error: any) {
      console.error("❌ Error calling Lambda (single):", error);
      return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  }

  return res.status(400).json({ message: 'Invalid request format' });
}
