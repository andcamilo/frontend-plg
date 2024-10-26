import axios from 'axios';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { solicitudId, solicitudAdicional } = req.body;  // Obtenemos solicitudId y solicitudAdicional del cuerpo de la solicitud

  // Verificar si se proporcionó el ID de la solicitud
  if (!solicitudId) {
    return res.status(400).json({ message: 'solicitudId es requerido' });
  }

  // Verificar si se proporcionó el campo `solicitudAdicional`
  if (typeof solicitudAdicional === 'undefined' || solicitudAdicional.trim() === '') {
    return res.status(400).json({ message: 'El campo solicitudAdicional es requerido' });
  }

  console.log('🚀 ~ handler ~ solicitudId:', solicitudId);
  console.log('🚀 ~ handler ~ solicitudAdicional:', solicitudAdicional);

  try {
    // Construir el payload para la actualización
    const updatePayload = {
      solicitudId,
      solicitudAdicional: solicitudAdicional.trim(),
    };

    // Enviar solicitud a la API externa (por ejemplo, AWS Lambda o Firebase)
    const externalApiResponse = await axios.patch(
      `http://localhost:4000/chris/update-solicitud-adicional`,  // URL de la API para actualizar la solicitud adicional
      updatePayload  // Enviar el cuerpo con solicitudId y solicitudAdicional
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
