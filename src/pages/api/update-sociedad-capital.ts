import axios from 'axios';
import { NextApiRequest, NextApiResponse } from 'next';
import { backendBaseUrl } from '@utils/env';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { solicitudId, capital } = req.body;  // Obtenemos solicitudId y capital del cuerpo de la solicitud

  // Verificar si se proporcionó el ID de la solicitud
  if (!solicitudId) {
    return res.status(400).json({ message: 'solicitudId es requerido' });
  }

  // Verificar si se proporcionó el campo `capital`
  if (typeof capital === 'undefined') {
    return res.status(400).json({ message: 'El campo capital es requerido' });
  }

  console.log('🚀 ~ handler ~ solicitudId:', solicitudId);
  console.log('🚀 ~ handler ~ capital:', capital);

  try {
    // Verificar si se ha proporcionado los campos obligatorios de capital
    if (!capital.capital || !capital.cantidadAcciones) {
      return res.status(400).json({ message: 'capital y cantidadAcciones son requeridos' });
    }

    // Construir el payload para la actualización
    const updatePayload = {
      solicitudId,
      capital: {
        capital: capital.capital,  // Monto del capital
        cantidadAcciones: capital.cantidadAcciones,  // Cantidad de acciones
        accionesSinValorNominal: capital.accionesSinValorNominal,  // 'Sí' o 'No'
        valorPorAccion: capital.valorPorAccion || null,  // Valor por acción si aplica
      },
    };

    // Enviar solicitud a la API externa (por ejemplo, AWS Lambda o Firebase)
    const externalApiResponse = await axios.patch(
      `${backendBaseUrl}/dev/update-sociedad-capital`,  // URL de la API para actualizar el capital
      updatePayload  // Enviar el cuerpo con solicitudId y capital
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
