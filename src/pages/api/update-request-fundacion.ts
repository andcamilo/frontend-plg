import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';
import { backendBaseUrl, backendEnv } from '@utils/env';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const {
        solicitudId,
        bienvenido,
        solicitante,
        fundacion,
        personas,
        fundacores,
        dignatarios,
        miembros,
        protector,
        beneficiarios,
        patrimonio,
        poder,
        objetivos,
        ingresos,
        activos,
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
                : fundacion
                    ? { fundacion }
                    : personas
                        ? { personas }
                        : fundacores
                            ? { fundacores }
                            : dignatarios
                                ? { dignatarios }
                                : miembros
                                    ? { miembros }
                                    : protector
                                        ? { protector }
                                        : beneficiarios
                                            ? { beneficiarios }
                                            : patrimonio
                                                ? { patrimonio }
                                                : poder
                                                    ? { poder }
                                                    : objetivos
                                                        ? { objetivos }
                                                        : ingresos
                                                            ? { ingresos }
                                                            : activos
                                                                ? { activos }
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
            `${backendBaseUrl}/${backendEnv}/update-request/${solicitudId}`,
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
