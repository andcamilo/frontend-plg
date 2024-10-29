import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { solicitudId, accionista } = req.body;  // Obtenemos solicitudId y accionista del cuerpo de la solicitud

  // Verificar si se proporcionó el ID de la solicitud
  if (!solicitudId) {
    return res.status(400).json({ message: 'solicitudId es requerido' });
  }

  // Verificar si se proporcionó el campo `accionista`
  if (typeof accionista === 'undefined') {
    return res.status(400).json({ message: 'El campo accionista es requerido' });
  }

  console.log('🚀 ~ handler ~ solicitudId:', solicitudId);
  console.log('🚀 ~ handler ~ accionista:', accionista);

  try {
    // Verificar si se ha proporcionado el `personId` y el porcentaje de acciones
    if (!accionista.personId) {
      return res.status(400).json({ message: 'personId es requerido para el accionista' });
    }

    if (!accionista.porcentajeAcciones) {
      return res.status(400).json({ message: 'porcentajeAcciones es requerido para el accionista' });
    }

    // Construir el payload para la actualización
    const updatePayload = {
      solicitudId,
      accionista: {
        personId: accionista.personId,  // ID de la persona seleccionada
        porcentajeAcciones: accionista.porcentajeAcciones,  // Porcentaje de acciones
      },
    };

    // Enviar solicitud a la API externa (por ejemplo, AWS Lambda o Firebase)
    const externalApiResponse = await axios.patch(
      `http://localhost:4000/chris/update-personAccionista`,  // URL de la API para actualizar accionistas
      updatePayload  // Enviar el cuerpo con solicitudId y accionista
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
