import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import { backendBaseUrl, backendEnv } from '@utils/env';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const updatePayload = req.body;  // Recibimos todo el payload directamente desde el frontend

  // Verificar si se proporcionó el ID de la solicitud
  if (!updatePayload.solicitudId) {
    return res.status(400).json({ message: 'solicitudId es requerido' });
  }

  try {
    // Enviar el payload directamente a la API externa sin modificar su estructura
    const externalApiResponse = await axios.patch(
      `${backendBaseUrl}/${backendEnv}/update-person`,  
      updatePayload  
    );

    // Retornar la respuesta de la API externa
    return res.status(200).json(externalApiResponse.data);
  } catch (error) {
    console.error('Error haciendo PATCH request a la API:', error.toJSON ? error.toJSON() : error);

    if (error.response) {
      return res.status(error.response.status).json({
        message: error.response.data?.message || 'La solicitud a la API externa falló',
      });
    } else {
      return res.status(500).json({ message: 'Error interno del servidor' });
    }
  }
}
