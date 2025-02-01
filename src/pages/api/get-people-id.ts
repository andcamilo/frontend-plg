import axios from 'axios';
import { backendBaseUrl, backendEnv } from '@utils/env';
import get from 'lodash/get';

export default async function handler(req, res) {
  // Solo permitir solicitudes GET
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Only GET requests are allowed' });
  }

  // Extraer solicitudId de los parámetros de la query
  const { solicitudId } = req.query;

  // Validar si se proporcionó el solicitudId
  if (!solicitudId) {
    return res.status(400).json({ message: 'Solicitud ID is required' });
  }

  try {
    // URL de la función Lambda para obtener las personas por solicitudId
    const lambdaUrl = `${backendBaseUrl}/${backendEnv}/get-people-id/${solicitudId}`;

    // Realizar la solicitud a tu función Lambda en AWS
    const response = await axios.get(lambdaUrl);

    // Acceder de manera segura a los datos de las personas usando lodash's get
    const people = get(response, 'data.people', null);

    // Verificar si se encontraron personas
    if (!people || people.length === 0) {
      return res.status(404).json({ message: 'No people found for the provided Solicitud ID' });
    }

    // Enviar los datos de las personas de vuelta al cliente
    return res.status(200).json(people);
  } catch (error) {
    console.error('Error fetching people:', error);

    // Manejar errores de respuesta de Lambda o problemas de red
    const errorMessage = error.response
      ? error.response.data.message || 'Failed to fetch people from Lambda'
      : 'Network or server error';

    return res.status(500).json({
      message: errorMessage,
      error: error.message,
    });
  }
}
