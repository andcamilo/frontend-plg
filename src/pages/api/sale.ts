import { NextApiRequest, NextApiResponse } from 'next'
import axios, { AxiosError } from 'axios'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const SOAP_URL = process.env.NEXT_PUBLIC__PAYMENT_SOAP_URL;
  const SOAP_ACTION = '"http://tempuri.org/Sale"';

  if (!SOAP_URL) {
    return res.status(500).json({ message: "SOAP_URL no está definido en .env" });
  }

  console.log("Received request at /api/sale");

  if (!req.body) {
    console.error("Request body is empty.");
    return res.status(400).json({ message: 'Request body cannot be empty' });
  }

  console.log("Request body:", req.body);

  try {
    const response = await axios.post(SOAP_URL, req.body, {
      headers: {
        'Content-Type': 'text/xml; charset=utf-8',
        'SOAPAction': SOAP_ACTION,
      },
    });
    console.log("🚀 ~ handler ~ response:", response)


    res.status(200).json(response.data);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      console.error("Axios error details:", {
        message: axiosError.message,
        status: axiosError.response?.status,
        data: axiosError.response?.data,
      });

      res.status(axiosError.response?.status || 500).json({
        message: 'Error processing sale',
        error: axiosError.response?.data || axiosError.message,
      });
    } else {
      console.error("Unexpected error:", error);
      res.status(500).json({ message: 'Unexpected error occurred while processing the sale' });
    }
  }
}
