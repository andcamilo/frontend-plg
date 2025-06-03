import axios from 'axios';
import { backendBaseUrl, backendEnv } from '@utils/env';
import get from 'lodash/get';

const getRequestRecordsUrl = `${backendBaseUrl}/${backendEnv}/get-requests-record`;

export const getRequestsRecords = async (email, tipo = '') => {
  try {
    console.log("🚀 ~ getRequests ~ email:", email);
    console.log("🚀 ~ getRequests ~ tipo:", tipo);

    const params = { email, tipo };

    const response = await axios.get(getRequestRecordsUrl, { params });

    const data = response.data;

 
    return {
    solicitudes: data.solicitudes,
    message: data.message,
    };

  } catch (error) {
    console.error('Error fetching requests:', error);
    throw error;
  }
};
