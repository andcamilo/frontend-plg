import { NextApiRequest, NextApiResponse } from 'next';
import axios, { AxiosError } from 'axios';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const SOAP_URL = 'http://tokenv2.test.merchantprocess.net/TokenWebService.asmx';
  const SOAP_ACTION = '"http://tempuri.org/GetTransactionResult"';

  console.log("Received request at /api/getTransactionResult");

  // Validate the incoming request body
  const { transactionId, amount } = req.body;

  if (!transactionId || !amount) {
    console.error("Missing required fields in request body.");
    return res.status(400).json({ message: 'All fields are required: APIKey, accountNumber, clientTracking, transactionId, amount' });
  }

  console.log("Request fields:", req.body);

  // Construct the SOAP request payload
  const soapRequest = `<?xml version="1.0" encoding="utf-8"?>
    <soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" 
                  xmlns:xsd="http://www.w3.org/2001/XMLSchema" 
                  xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
      <soap:Body>
        <GetTransactionResult xmlns="http://tempuri.org/">
          <APIKey>EhrqwakURmYS</APIKey>
          <accountNumber>112549</accountNumber>
          <clientTracking>SALE-TRACKING-01</clientTracking>
          <transactionId>${transactionId}</transactionId>
          <amount>${amount}</amount>
           <systemTracking>TEST</systemTracking>
        </GetTransactionResult>
      </soap:Body>
    </soap:Envelope>`;
  console.log("🚀 ~ handler ~ soapRequest:", soapRequest)

  try {
    const response = await axios.post(SOAP_URL, soapRequest, {
      headers: {
        'Content-Type': 'text/xml; charset=utf-8',
        'SOAPAction': SOAP_ACTION,
      },
    });

    console.log("Transaction result retrieved successfully:", response.data);

    res.status(200).json({ data: response.data }); // Send back the response from the SOAP API
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
        message: 'Error retrieving transaction result',
        error: axiosError.response?.data || axiosError.message,
      });
    } else {
      // Handle other errors
      console.error("Unexpected error:", error);
      res.status(500).json({ message: 'Unexpected error occurred while retrieving the transaction result' });
    }
  }
}
