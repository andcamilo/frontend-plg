import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import { backendBaseUrl } from '@utils/env';
import { getServicePrice } from '@/src/app/utils/priceSelector';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const {
    solicitudId,
    solicitud,
    demandante,
    demandado,
    archivosAdjuntos,
    firmaYEntrega,
    gastosPensionado,
    pensionType,
    solicitudAdicional
  } = req.body;
    console.log("🚀 ~ handler ~ pensionType:", pensionType)

  if (!solicitudId) {
    return res.status(400).json({ message: 'solicitudId is required' });
  }

  // Find the first non-empty field to send
  const dataToSend =
  solicitud
    ? {
        ...solicitud,
        canasta: {
          items: [
            {
              item: "Pensión alimenticia",
              precio: getServicePrice(pensionType),
            },
          ],
          subtotal: getServicePrice(pensionType), 
          total: getServicePrice(pensionType),
        },
      }
    : demandante
    ? { demandante }
    : demandado
    ? { demandado }
    : archivosAdjuntos
    ? { archivosAdjuntos }
    : firmaYEntrega
    ? { firmaYEntrega }
    : gastosPensionado
    ? { gastosPensionado }
    : solicitudAdicional
    ? { solicitudAdicional }
    : null;

    // Log for debugging
    console.log("Data to send:", dataToSend);


  // If none of the fields have data, return an error
  if (!dataToSend) {
    return res.status(400).json({ message: 'At least one data field must be provided.' });
  }

  console.log('🚀 ~ handler ~ solicitudId:', solicitudId);
  console.log('🚀 ~ handler ~ dataToSend:', dataToSend);

  try {
    const externalApiResponse = await axios.patch(
      `${backendBaseUrl}/chris/update-request/${solicitudId}`,
      dataToSend
    );

    console.log('🚀 ~ handler ~ externalApiResponse:', externalApiResponse.data);

    return res.status(200).json(externalApiResponse.data);
  } catch (error) {
    console.error('Error making PATCH request to AWS Lambda:', error.toJSON ? error.toJSON() : error);

    if (error.response) {
      console.error('🚨 ~ handler ~ error.response:', error.response.data);

      return res.status(error.response.status).json({
        message: error.response.data?.message || 'External API request failed',
      });
    } else {
      return res.status(500).json({ message: 'Internal server error' });
    }
  }
}
