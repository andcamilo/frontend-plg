import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import { backendBaseUrl, backendEnv } from '@utils/env';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Only POST requests are allowed' });
    }

    const { casoId, summaryEmail, resumenCaso, comentario, status } = req.body;

    if (!casoId) {
        return res.status(400).json({ message: 'casoId is required' });
    }

    const dataToUpdate: any = {};

    if (summaryEmail) dataToUpdate.summaryEmail = summaryEmail;
    if (resumenCaso) dataToUpdate.resumenCaso = resumenCaso;
    if (comentario) dataToUpdate.comentario = comentario;
    if (status) dataToUpdate.status = status;

    if (Object.keys(dataToUpdate).length === 0) {
        return res.status(400).json({ message: 'At least one field (summaryEmail, resumenCaso, comentario) must be provided.' });
    }

    console.log('🚀 ~ handler ~ casoId:', casoId);
    console.log('🚀 ~ handler ~ dataToUpdate:', dataToUpdate);

    try {
        const externalApiResponse = await axios.patch(
            `${backendBaseUrl}/${backendEnv}/update-caso/${casoId}`,
            dataToUpdate
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
