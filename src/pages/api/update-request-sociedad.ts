import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const {
        solicitudId,
        bienvenido,
        solicitante,
        empresa,
        personas,
        directores,
        dignatarios,
        accionistas,
        capital,
        poder,
        actividades,
        ingresos,
        solicitudAdicional,
        resumen
    } = req.body;

    if (!solicitudId) {
        return res.status(400).json({ message: 'solicitudId is required' });
    }

    // Find the first non-empty field to send
    const dataToSend =
        bienvenido
            ? { bienvenido }
            : solicitante
                ? { solicitante }
                : empresa
                    ? { empresa }
                    : personas
                        ? { personas }
                        : directores
                            ? { directores }
                            : dignatarios
                                ? { dignatarios }
                                : accionistas
                                    ? { accionistas }
                                    : capital
                                        ? { capital }
                                        : poder
                                            ? { poder }
                                            : actividades
                                                ? { actividades }
                                                : ingresos
                                                    ? { ingresos }
                                                    : solicitudAdicional
                                                        ? { solicitudAdicional }
                                                        : resumen
                                                            ? { resumen }
                                                            : null;

    // If none of the fields have data, return an error
    if (!dataToSend) {
        return res.status(400).json({ message: 'At least one data field must be provided.' });
    }

    console.log('🚀 ~ handler ~ solicitudId:', solicitudId);
    console.log('🚀 ~ handler ~ dataToSend:', dataToSend);

    try {
        const externalApiResponse = await axios.patch(
            `http://localhost:4000/chris/update-request/${solicitudId}`,
            dataToSend
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
