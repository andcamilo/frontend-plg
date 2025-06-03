import axios from 'axios';
import { backendBaseUrl, backendEnv } from '@utils/env';
import get from 'lodash/get';

const getRequestsByEmailUrl = `${backendBaseUrl}/${backendEnv}/get-requests-by-email`;

export const getRequests = async (email, limit = 10, page = 1, role = 90, tipo = '') => {
  try {
    console.log("🚀 ~ getRequests ~ email:", email);
    console.log("🚀 ~ getRequests ~ role:", role);
    console.log("🚀 ~ getRequests ~ tipo:", tipo);

    const params = { email, limit, page, role };

    if (tipo) {
      params['tipo'] = tipo;
    }

    const response = await axios.get(getRequestsByEmailUrl, { params });

    const data = response.data;

    // If filtering by tipo, the response only contains `ids`
    if (tipo && data?.ids) {
      return {
        ids: data.ids,
        message: data.message,
      };
    }

    const solicitudes = get(data, 'solicitudes', []);
    const allSolicitudes = get(data, 'allSolicitudes', []);
    const pagination = get(data, 'pagination', {});
    const tipoCounts = get(data, 'tipo', {});
    const statusCounts = get(data, 'status', {});
    const months = get(data, 'months', {});

    return {
      solicitudes,
      allSolicitudes,
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
