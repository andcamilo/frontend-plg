import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import { backendBaseUrl } from '@utils/env'; 

const updateDisbursementUrl = `${backendBaseUrl}/chris/updateDisbursement`;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PATCH') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const { fieldUpdate, ids } = req.body;
    console.log("🚀 ~ handler ~ ids:", ids)
    console.log("🚀 ~ handler ~ fieldUpdate:", fieldUpdate)

    if (!fieldUpdate || !ids || !Array.isArray(ids)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid input: fieldUpdate (object) and ids (array) are required',
      });
    }

    const response = await axios.patch(updateDisbursementUrl, {
      fieldUpdate,
      ids,
    });

    return res.status(200).json(response.data);
  } catch (error) {
    console.error('Error calling updateDisbursement Lambda:', error);

    const errorMessage =
      error.response?.data?.message || 'Failed to update disbursements';

    return res
      .status(error.response?.status || 500)
      .json({ status: 'error', message: errorMessage });
  }
}
