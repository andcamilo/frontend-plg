import axios from 'axios';
import { NextApiRequest, NextApiResponse } from 'next';
import { backendBaseUrl } from '@utils/env'; 

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Only POST requests are allowed' });
  }

  const {
    actualizarPorCorreo,
    emailSolicita,
    cuenta,
    accion,
    item,
    precio,
    subtotal,
    total,
    nombreSolicita,
    telefonoSolicita,
    cedulaPasaporte,
    tipo,
  } = req.body;


  try {
    const requestUrl = `${backendBaseUrl}/dev/create-request-empresa`;

    const backendResponse = await axios.post(requestUrl, {
      actualizarPorCorreo,
      emailSolicita,
      cuenta,
      accion,
      item,
      precio,
      subtotal,
      total,
      nombreSolicita,
      telefonoSolicita,
      cedulaPasaporte,
      tipo,
    }, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return res.status(backendResponse.status).json(backendResponse.data);

  } catch (error) {
    console.error('Error creating request:', error);
    return res.status(500).json({
      message: 'Failed to create request',
      error: error.response ? error.response.data : error.message,
    });
  }
}
