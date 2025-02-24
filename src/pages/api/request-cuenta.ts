import axios from 'axios';
import { backendBaseUrl, backendEnv } from '@utils/env';
import get from 'lodash/get';

const getRequestsUrl = `${backendBaseUrl}/${backendEnv}/get-requests-cuenta`;

/**
 * Obtiene las solicitudes de cuenta con paginación por cursor.
 * @param limit Número de registros por página.
 * @param cuenta La cuenta del usuario.
 * @param lastVisibleCursor Cursor para la paginación.
 */
export const getRequestsCuenta = async (
  limit = 10,
  cuenta: string,
  lastVisibleCursor: string | null = null
) => {
  try {
    const response = await axios.get(getRequestsUrl, {
      params: {
        limit,
        cuenta,
        lastVisible: lastVisibleCursor, // Envía el cursor si existe
      },
    });

    console.log("Respuesta desde getRequestsCuenta():", response.data);
    const data = response.data;

    const solicitudes = get(data, 'solicitudes', []);
    const pagination = get(data, 'pagination', {});
    const tipoCounts = get(data, 'tipo', {});
    const statusCounts = get(data, 'status', {});
    const months = get(data, 'months', {});

    return {
      solicitudes,
      pagination,
      tipoCounts,
      statusCounts,
      months,
    };
  } catch (error) {
    console.error('Error fetching requests:', error);
    throw error;
  }
};
