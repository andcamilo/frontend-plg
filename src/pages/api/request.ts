import axios from 'axios';
import { backendBaseUrl } from '@utils/env';
import get from 'lodash/get';

const getRequestsUrl = `${backendBaseUrl}/chris/get-requests`;

export const getRequests = async (limit = 10, page = 1) => {
  try {
    const response = await axios.get(getRequestsUrl, {
      params: {
        limit,
        page,
      },
    });
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
      months
    };
  } catch (error) {
    console.error('Error fetching requests:', error);
    throw error;
  }
};
