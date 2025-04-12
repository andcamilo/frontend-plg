import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import { backendBaseUrl, backendEnv } from '@utils/env';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { solicitudId, id } = req.body;

  if (!solicitudId || !id) {
    return res.status(400).json({ message: 'solicitudId and id are required' });
  }

  console.log('🚀 ~ handler ~ solicitudId:', solicitudId);
  console.log('🚀 ~ handler ~ abogadoId a eliminar:', id);

  try {
    const externalApiResponse = await axios.patch(
      `${backendBaseUrl}/${backendEnv}/remove-request-abogados/${solicitudId}`,
      { id } // solo enviamos el ID a eliminar
    );

    console.log('✅ ~ handler ~ Abogado eliminado:', externalApiResponse.data);

    return res.status(200).json(externalApiResponse.data);
  } catch (error) {
    console.error('Error al eliminar abogado en Lambda:', error.toJSON ? error.toJSON() : error);

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
