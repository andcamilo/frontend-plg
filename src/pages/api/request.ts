import axios from 'axios';
import { backendBaseUrl, backendEnv } from '@utils/env';
import get from 'lodash/get';

const getRequestsUrl = `${backendBaseUrl}/${backendEnv}/get-requests`;
const getRequestsByEmailUrl = `${backendBaseUrl}/${backendEnv}/get-requests-by-email`;

export const getRequests = async (email, limit = 10, page = 1) => {

  try {
    console.log("🚀 ~ getRequests ~ email:", email)
    const response = await axios.get(getRequestsUrl, {
        params: { limit, page },
      });


    const data = response.data;
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
