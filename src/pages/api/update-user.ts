import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import { backendBaseUrl } from '@utils/env';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { userId, ...updatePayload } = req.body; // Extraer userId del payload

    // Verificar si se proporcionó el ID de la solicitud en la URL
    if (!userId) {
        return res.status(400).json({ message: 'userId es requerido en la URL' });
    }

    try {
        // Enviar el payload directamente a la API externa sin el userId
        const externalApiResponse = await axios.patch(
            `${backendBaseUrl}/dev/update-user/${userId}`, 
            updatePayload 
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