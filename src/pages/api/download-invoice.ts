import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import { backendBaseUrl, backendEnv } from '@utils/env';

const lambdaDownloadUrl = (id: string) => `${backendBaseUrl}/${backendEnv}/invoices/${id}/download`;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { id } = req.query;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({ message: 'Invoice id is required and must be a string' });
  }

  try {
    const response = await axios.get(lambdaDownloadUrl(id), {
      responseType: 'arraybuffer',
      headers: {
        Accept: 'application/pdf',
      },
    });

    const contentType = response.headers['content-type'] || 'application/pdf';
    const filename = `invoice-${id}.pdf`;

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return res.status(200).send(Buffer.from(response.data));
  } catch (error: any) {
    console.error('Error downloading invoice from Lambda:', error?.toJSON ? error.toJSON() : error);

    if (error?.response) {
      const status = error.response.status || 500;
      // Try to extract message body if available
      let message = 'Failed to download invoice';
      try {
        const data = typeof error.response.data === 'string' ? error.response.data : JSON.stringify(error.response.data);
        message = data;
      } catch {}
      return res.status(status).json({ message });
    }
    return res.status(500).json({ message: 'Internal server error' });
  }
}
