import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { solicitudId, director } = req.body;  // Obtenemos solicitudId y director del cuerpo de la solicitud

  // Verificar si se proporcionó el ID de la solicitud
  if (!solicitudId) {
    return res.status(400).json({ message: 'solicitudId es requerido' });
  }

  // Verificar si se proporcionó el campo `director`
  if (typeof director === 'undefined') {
    return res.status(400).json({ message: 'El campo director es requerido' });
  }

  console.log('🚀 ~ handler ~ solicitudId:', solicitudId);
  console.log('🚀 ~ handler ~ director:', director);

  try {
    let updatePayload;

    // Verificar si es Director Nominal o Propio
    if (director.servicio === 'Director Nominal') {
      // Para Director Nominal solo enviamos el servicio, sin personId ni esDirector
      updatePayload = {
        solicitudId,  
        director: {
          servicio: director.servicio  // Solo servicio para director nominal
        }
      };
    } else if (director.servicio === 'Director Propio') {
      // Para Director Propio enviamos todos los detalles
      if (!director.personId) {
        return res.status(400).json({ message: 'personId es requerido para Director Propio' });
      }

      updatePayload = {
        solicitudId,
        director: {
          personId: director.personId,  // Enviar personId solo en el caso de Director Propio
          servicio: director.servicio,
          esDirector: director.esDirector
        }
      };
    } else {
      return res.status(400).json({ message: 'Tipo de servicio no válido' });
    }

    // Enviar solicitud a la API externa (por ejemplo, AWS Lambda o Firebase)
    const externalApiResponse = await axios.patch(
      `http://localhost:4000/chris/update-personDirector`,  // Solo usamos la URL sin personId
      updatePayload  // Enviar el cuerpo con solicitudId y director
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
