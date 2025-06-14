// pages/api/create-only-user.ts

import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import { backendBaseUrl, backendEnv } from '@utils/env';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método no permitido' });
  }
  console.log("📦 Datos recibidos en API create-only-user:", req.body);

  try {
    const response = await axios.post(
      `${backendBaseUrl}/${backendEnv}/create-only-user`,
      req.body,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    const data = response.data;

    // ✅ Verificamos que la propiedad correcta exista: cuenta
    if (!data?.cuenta) {
      console.warn("⚠️ El backend respondió sin cuenta:", data);
      return res.status(400).json({
        status: 'error',
        message: data?.message || 'No se recibió un ID válido desde el backend',
        backendResponse: data,
      });
    }

    // ✅ Reenviamos con el nombre esperado por el frontend: userId
    return res.status(200).json({
      status: 'success',
      userId: data.cuenta,
      ...data,
    });
  } catch (error: any) {
    console.error('❌ Error en /api/create-only-user:', error?.response?.data || error.message);
    return res.status(error?.response?.status || 500).json({
      status: 'error',
      message: error?.response?.data?.message || 'Error interno en el API intermedio',
    });
  }
}
