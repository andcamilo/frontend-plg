import axios from 'axios';
import { NextApiRequest, NextApiResponse } from 'next';
import { backendBaseUrl, backendEnv } from '@utils/env';

// Definir la estructura de los datos de la solicitud
interface RequestData {
  nombreSolicita: string;
  telefonoSolicita: string;
  cedulaPasaporte: string;
  emailSolicita: string;
  actualizarPorCorreo: boolean;
  cuenta: string;
  precio: number;
  subtotal: number;
  total: number;
  accion: string;
  tipo: string; // Campo tipo para indicar que es una solicitud de fundación, por ejemplo "new-fundacion"
}

// Cambiar la URL del endpoint para la solicitud de Fundación
const createRequestUrl = `${backendBaseUrl}/${backendEnv}/create-request-fundacion`;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Solo permitir el método POST
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  // Parsear el cuerpo de la solicitud
  const requestData: RequestData = req.body;

  try {
    // Log para verificar que se están enviando los datos correctos
    console.log("🚀 ~ Enviando datos de la solicitud de Fundación:", requestData);

    // Enviar los datos al backend de la fundación
    const response = await axios.post(createRequestUrl, requestData);

    // Log para verificar la respuesta del backend
    console.log("🚀 ~ Datos de respuesta de la solicitud de Fundación:", response.data);

    // Devolver la respuesta al cliente
    return res.status(200).json(response.data);
  } catch (error) {
    console.error('Error al crear la solicitud de Fundación:', error);

    // Mensaje de error en caso de fallo
    const errorMessage = error.response?.data?.message || 'Error al crear la solicitud de Fundación';
    return res.status(error.response?.status || 500).json({ message: errorMessage });
  }
}
