import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { solicitudId, poder } = req.body;  // Obtenemos solicitudId y poder del cuerpo de la solicitud

  // Verificar si se proporcionó el ID de la solicitud
  if (!solicitudId) {
    return res.status(400).json({ message: 'solicitudId es requerido' });
  }

  // Verificar si se proporcionó el campo `poder`
  if (typeof poder === 'undefined') {
    return res.status(400).json({ message: 'El campo poder es requerido' });
  }

  console.log('🚀 ~ handler ~ solicitudId:', solicitudId);
  console.log('🚀 ~ handler ~ poder:', poder);

  try {
    // Verificar si se ha proporcionado el `personId` para el poder
    if (!poder.personId) {
      return res.status(400).json({ message: 'personId es requerido para el poder' });
    }

    // Construir el payload para la actualización
    const updatePayload = {
      solicitudId,
      poder: {
        personId: poder.personId,  // ID de la persona seleccionada
      },
    };

    // Enviar solicitud a la API externa (por ejemplo, AWS Lambda o Firebase)
    const externalApiResponse = await axios.patch(
      `http://localhost:4000/chris/update-personPoder`,  // URL de la API para actualizar poder
      updatePayload  // Enviar el cuerpo con solicitudId y poder
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
