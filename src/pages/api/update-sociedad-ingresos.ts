import axios from 'axios';
import { NextApiRequest, NextApiResponse } from 'next';
import { backendBaseUrl } from '@utils/env';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { solicitudId, fuentesIngresos } = req.body;  // Obtenemos solicitudId y fuentesIngresos del cuerpo de la solicitud

  // Verificar si se proporcionó el ID de la solicitud
  if (!solicitudId) {
    return res.status(400).json({ message: 'solicitudId es requerido' });
  }

  // Verificar si se proporcionó el campo `fuentesIngresos`
  if (typeof fuentesIngresos === 'undefined') {
    return res.status(400).json({ message: 'El campo fuentesIngresos es requerido' });
  }

  console.log('🚀 ~ handler ~ solicitudId:', solicitudId);
  console.log('🚀 ~ handler ~ fuentesIngresos:', fuentesIngresos);

  try {
    // Validar que al menos una fuente de ingresos esté seleccionada
    const { ingresoNegocios, herencia, ahorrosPersonales, ventaActivos, ingresoInmueble, otro } = fuentesIngresos;
    if (!ingresoNegocios && !herencia && !ahorrosPersonales && !ventaActivos && !ingresoInmueble && !otro) {
      return res.status(400).json({ message: 'Debe seleccionar al menos una fuente de ingresos' });
    }

    // Construir el payload para la actualización
    const updatePayload = {
      solicitudId,
      fuentesIngresos: {
        ingresoNegocios: ingresoNegocios || false, // True si seleccionado
        herencia: herencia || false, // True si seleccionado
        ahorrosPersonales: ahorrosPersonales || false, // True si seleccionado
        ventaActivos: ventaActivos || false, // True si seleccionado
        ingresoInmueble: ingresoInmueble || false, // True si seleccionado
        otro: otro || '', // Si está vacío, lo dejamos como string vacío
      },
    };

    // Enviar solicitud a la API externa (por ejemplo, AWS Lambda o Firebase)
    const externalApiResponse = await axios.patch(
      `${backendBaseUrl}/dev/update-sociedad-ingresos`,  // URL de la API para actualizar los ingresos
      updatePayload  // Enviar el cuerpo con solicitudId y fuentesIngresos
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
