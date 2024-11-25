import { NextApiRequest, NextApiResponse } from 'next'
import axios from 'axios'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log("hola mundo")

  try {
    const response = await axios.post(
      'http://tokenv2.test.merchantprocess.net/TokenWebService.asmx',
      req.body,
      {
        headers: {
          'Content-Type': 'text/xml; charset=utf-8',
          'SOAPAction': '"http://tempuri.org/Sale"',
        },
      }
    )

    res.status(200).json(response.data)
  } catch (error) {
    console.error('Error processing sale:', error)
    res.status(500).json({ message: 'Error processing sale' })
  }
}