import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import { backendBaseUrl, backendEnv } from '@utils/env';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método no permitido' });
  }

  const { nombreAccionista } = req.body;

  if (!nombreAccionista) {
    return res.status(400).json({ message: 'Falta el ID de la solicitud' });
  }

  try {
    const response = await axios.post(
      `${backendBaseUrl}/${backendEnv}/create-declaracion-jurada-file/${nombreAccionista}`
    );

    console.log("📥 Respuesta del backend:", response.data);
    const data = response.data;

    if (!data?.fileUrl) {
      return res.status(400).json({
        status: 'error',
        message: 'No se recibió una URL de archivo válida desde el backend',
        backendResponse: data,
      });
    }

    return res.status(200).json({
      status: 'success',
      fileUrl: data.fileUrl,
    });
  } catch (error: any) {
    console.error('❌ Error en /api/create-declaracion-jurada-file:', error?.response?.data || error.message);
    return res.status(error?.response?.status || 500).json({
      status: 'error',
      message: error?.response?.data?.message || 'Error interno en el API intermedio',
    });
  }
}
