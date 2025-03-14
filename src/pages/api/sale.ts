import { NextApiRequest, NextApiResponse } from 'next'
import axios, { AxiosError } from 'axios'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log("Entered /api/sale endpoint");

  const SOAP_URL = process.env.NEXT_PUBLIC__PAYMENT_SOAP_URL;
  const SOAP_ACTION = '"http://tempuri.org/Sale"';

  if (!SOAP_URL) {
    console.error("SOAP_URL not defined in environment variables.");
    return res.status(500).json({ message: "SOAP_URL no está definido en .env" });
  }

  if (!req.body) {
    console.error("Request body is empty.");
    return res.status(400).json({ message: 'Request body cannot be empty' });
  }

  console.log("Request body received:", req.body);
  console.log("Using SOAP_URL:", SOAP_URL);

  try {
    console.log("Preparing to send SOAP request.");
    console.log("SOAPAction:", SOAP_ACTION);

    const config = {
      headers: {
        'Content-Type': 'text/xml; charset=utf-8',
        'SOAPAction': SOAP_ACTION,
      },
      timeout: 30000, // 30 seconds timeout (adjust as needed)
    };

    console.log("Axios request configuration:", config);

    const response = await axios.post(SOAP_URL, req.body, config);

    console.log("SOAP response received:", {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
      data: response.data,
    });

    return res.status(200).json(response.data);
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Axios error caught:", error);
      console.error("Axios error details:", {
        message: error.message,
        code: error.code,
        status: error.response?.status,
        headers: error.response?.headers,
        data: error.response?.data,
        stack: error.stack,
      });
      return res.status(error.response?.status || 500).json({
        message: 'Error processing sale',
        error: error.response?.data || error.message,
      });
    } else {
      console.error("Unexpected error caught:", error);
      return res.status(500).json({
        message: 'Unexpected error occurred while processing the sale',
        error: error,
      });
    }
  }
}
