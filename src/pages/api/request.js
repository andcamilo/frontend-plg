import axios from 'axios';
import { backendBaseUrl } from '@utils/env';
import get from 'lodash/get';

const getRequestsUrl = `${backendBaseUrl}/dev/get-requests`;

export const getRequests = async () => {
  try {
    const response = await axios.get(getRequestsUrl);
    const data = response.data;

    const solicitudes = get(data, 'solicitudes', []);
    return solicitudes;
  } catch (error) {
    console.error('Error fetching requests:', error);
    throw error; 
  }
};
