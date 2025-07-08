import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import { backendBaseUrl, backendEnv } from '@utils/env';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { solicitudIds } = req.body;

  if (!Array.isArray(solicitudIds) || solicitudIds.length === 0) {
    return res.status(400).json({ message: 'solicitudIds must be a non-empty array' });
  }

  console.log('🚀 ~ handler ~ solicitudIds:', solicitudIds);

  try {
    // Enviamos los IDs al backend (por ejemplo, AWS Lambda)
    const response = await axios.post(
      `${backendBaseUrl}/${backendEnv}/delete-multiple-requests`,
      { solicitudIds }
    );

    console.log('✅ Respuesta del backend:', response.data);

    return res.status(200).json({
      message: 'Solicitudes eliminadas correctamente',
      data: response.data,
    });
  } catch (error: any) {
    console.error('❌ Error al hacer POST a AWS Lambda:', error.toJSON ? error.toJSON() : error);

    if (error.response) {
      return res.status(error.response.status).json({
        message: error.response.data?.message || 'Error del servidor externo',
      });
    }

    return res.status(500).json({ message: 'Error interno del servidor' });
  }
}