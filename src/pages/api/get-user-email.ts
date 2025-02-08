import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import { backendBaseUrl } from '@utils/env';

const getUserById = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { userEmail } = req.body;

  console.log("📥 Email recibido en `/api/get-user-email`:", userEmail);

  if (!userEmail) {
    console.error("❌ Error: `userEmail` no fue enviado correctamente.");
    return res.status(400).json({ message: 'Missing userEmail parameter' });
  }

  try {
    console.log("🔄 Enviando solicitud al backend con email:", userEmail);

    const response = await axios.post(`${backendBaseUrl}/chris/get-user-email`, {
      userEmail,
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    console.log("✅ Respuesta del backend:", response.data);

    res.status(200).json(response.data);
  } catch (error: any) {
    console.error("❌ Error en `/api/get-user-email`:", error.response?.data || error.message);
    res.status(500).json({
      message: 'Failed to fetch user by email',
      error: error.response?.data || error.message,
    });
  }
};

export default getUserById;
