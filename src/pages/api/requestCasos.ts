import axios from 'axios';
import { backendBaseUrl, backendEnv } from '@utils/env';
import get from 'lodash/get';

const getCasosUrl = `${backendBaseUrl}/${backendEnv}/get-requestsCasos`;

export const getCasos = async (limit = 10, page = 1) => {
  try {
    const response = await axios.get(getCasosUrl, {
      params: {
        limit,
        page,
      },
    });
    const data = response.data;

    // Extraer los datos específicos de casos
    const casos = get(data, 'casos', []);
    const pagination = get(data, 'pagination', {});

    return {
      casos,
      pagination
    };
  } catch (error) {
    console.error('Error fetching casos:', error);
    throw error;
  }
};
