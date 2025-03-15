import axios from 'axios';
import { backendBaseUrl, backendEnv } from '@utils/env';
import get from 'lodash/get';

export default async function handler(req, res) {
  // Permitir solo solicitudes GET
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Only GET requests are allowed' });
  }

  // Extraer casoId de los parámetros de la query
  const { casoId } = req.query;

  // Validar que se proporciona un casoId
  if (!casoId) {
    return res.status(400).json({ message: 'Caso ID is required' });
  }

  try {
    // URL de la función Lambda para obtener el caso por ID
    const lambdaUrl = `${backendBaseUrl}/${backendEnv}/get-caso-id/${casoId}`;

    // Hacer la solicitud a la función Lambda en AWS
    const response = await axios.get(lambdaUrl);

    // Obtener los datos del caso de manera segura con lodash
    const caso = get(response, 'data.caso', null);

    // Verificar si el caso fue encontrado
    if (!caso) {
      return res.status(404).json({ message: 'Caso not found' });
    }

    // Enviar la respuesta con los datos del caso
    return res.status(200).json(caso);
  } catch (error) {
    console.error('Error fetching caso:', error);

    // Manejo de errores en la respuesta de Lambda o problemas de red
    const errorMessage = error.response
      ? error.response.data.message || 'Failed to fetch caso from Lambda'
      : 'Network or server error';

    return res.status(500).json({
      message: errorMessage,
      error: error.message,
    });
  }
}
