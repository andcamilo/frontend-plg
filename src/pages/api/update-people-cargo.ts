import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import { backendBaseUrl, backendEnv } from '@utils/env';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { peopleId, cargo } = req.body;

    if (!peopleId) {
        return res.status(400).json({ message: 'peopleId is required' });
    }

    try {
        const externalApiResponse = await axios.patch(
            `${backendBaseUrl}/${backendEnv}/update-people-cargo/${peopleId}`,
            { cargo }, // Envolver en un objeto JSON
            {
                headers: {
                    'Content-Type': 'application/json', // Asegurarte de que el contenido es JSON
                },
            }
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