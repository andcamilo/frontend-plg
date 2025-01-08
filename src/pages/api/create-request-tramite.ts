import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import { backendBaseUrl } from '@utils/env';

const createTramiteUrl = `${backendBaseUrl}/dev/create-request-tramite`;


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method Not Allowed' });
    }

    const requestData = req.body; // Recibe los datos sin una estructura específica

    try {
        console.log("🚀 ~ Sending tremite data:", requestData);

        // Envía los datos al backend, tal como los recibió del frontend
        const response = await axios.post(createTramiteUrl, requestData);

        console.log("🚀 ~ Response data:", response.data);

        return res.status(200).json(response.data);
    } catch (error) {
        console.error('Error creating consulta:', error);

        const errorMessage = error.response?.data?.message || 'Failed to create consulta';
        return res.status(error.response?.status || 500).json({ message: errorMessage });
    }
}
