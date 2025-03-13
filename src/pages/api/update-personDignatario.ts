import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import { backendBaseUrl, backendEnv } from '@utils/env';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { solicitudId, dignatario } = req.body;  // Obtenemos solicitudId y dignatario del cuerpo de la solicitud

  // Verificar si se proporcionó el ID de la solicitud
  if (!solicitudId) {
    return res.status(400).json({ message: 'solicitudId es requerido' });
  }

  // Verificar si se proporcionó el campo `dignatario`
  if (typeof dignatario === 'undefined') {
    return res.status(400).json({ message: 'El campo dignatario es requerido' });
  }

  console.log('🚀 ~ handler ~ solicitudId:', solicitudId);
  console.log('🚀 ~ handler ~ dignatario:', dignatario);

  try {
    let updatePayload;

    // Verificar si es Dignatario Nominal o Propio
    if (dignatario.servicio === 'Dignatario Nominal') {
      const formattedPositions = dignatario.positions
        ? dignatario.positions // Si ya viene como array de strings, lo dejamos igual
        : dignatario.posiciones?.map(pos => pos.nombre) || [];

      // Determinar el nombre del campo basado en cuál propiedad existe
      const positionsField = dignatario.positions ? 'positions' : 'posiciones';
      const personIdField = positionsField === 'positions' ? 'id_persona' : 'personId';
      
      // Para Dignatario Nominal solo enviamos el servicio, sin personId ni posiciones
      updatePayload = {
        solicitudId,
        dignatario: {
          [personIdField]: dignatario.personId,
          servicio: dignatario.servicio,
          [positionsField]: formattedPositions,
        }
      };
    } else if (dignatario.servicio === 'Dignatario Propio') {
      // Para Dignatario Propio enviamos todos los detalles, incluidas las posiciones
      if (!dignatario.personId) {
        return res.status(400).json({ message: 'personId es requerido para Dignatario Propio' });
      }

      if (!Array.isArray(dignatario.positions) && !Array.isArray(dignatario.posiciones)) {
        return res.status(400).json({ message: 'Debe proporcionar positions o posiciones como un array' });
      }

      // Convertir la estructura de posiciones según lo recibido
      const formattedPositions = dignatario.positions
        ? dignatario.positions // Si ya viene como array de strings, lo dejamos igual
        : dignatario.posiciones?.map(pos => pos.nombre) || []; // Convertir `posiciones` a array de strings

      const positionsField = dignatario.positions ? 'positions' : 'posiciones';
      const personIdField = positionsField === 'positions' ? 'id_persona' : 'personId';

      updatePayload = {
        solicitudId,
        dignatario: {
          [personIdField]: dignatario.personId,  // Enviar personId solo en el caso de Dignatario Propio
          servicio: dignatario.servicio,
          [positionsField]: formattedPositions, // Asegurar que positions sea siempre un array de strings
        }
      };
    } else {
      return res.status(400).json({ message: 'Tipo de servicio no válido' });
    }

    console.log('📤 Payload enviado a la API externa:', JSON.stringify(updatePayload, null, 2));

    // Enviar solicitud a la API externa (por ejemplo, AWS Lambda o Firebase)
    const externalApiResponse = await axios.patch(
      `${backendBaseUrl}/${backendEnv}/update-personDignatario`,
      updatePayload  // Enviar el cuerpo con solicitudId y dignatario
    );

    // Retornar la respuesta de la API externa
    return res.status(200).json(externalApiResponse.data);
  } catch (error) {
    console.error('❌ Error haciendo PATCH request a la API:', error.toJSON ? error.toJSON() : error);

    if (error.response) {
      return res.status(error.response.status).json({
        message: error.response.data?.message || 'La solicitud a la API externa falló',
      });
    } else {
      return res.status(500).json({ message: 'Error interno del servidor' });
    }
  }
}
