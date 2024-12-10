import { NextApiRequest, NextApiResponse } from 'next'
import axios, { AxiosError } from 'axios'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const SOAP_URL = 'http://tokenv2.test.merchantprocess.net/TokenWebService.asmx';
  const SOAP_ACTION = '"http://tempuri.org/Sale"';

  console.log("Received request at /api/sale");

  // Validate the incoming request body
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

    console.log("Sale processed successfully:", response.data);

    res.status(200).json(response.data); // Send back the response from the SOAP API
  } catch (error) {
    if (axios.isAxiosError(error)) {
      // Handle Axios-specific errors
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
      // Handle other errors
      console.error("Unexpected error:", error);
      res.status(500).json({ message: 'Unexpected error occurred while processing the sale' });
    }
  }
}
