import axios from 'axios';

export const getZohoAccessToken = async () => {
  try {
    const response = await axios.post('https://accounts.zoho.com/oauth/v2/token', null, {
      params: {
        grant_type: 'refresh_token',
        client_id: process.env.ZOHO_CLIENT_ID,     // Asegúrate de tener estas variables de entorno configuradas
        client_secret: process.env.ZOHO_CLIENT_SECRET,
        refresh_token: process.env.ZOHO_REFRESH_TOKEN,
      },
    });

    return response.data.access_token;
  } catch (error) {
    console.error('Error obtaining Zoho Access Token:', error);
    throw new Error('Failed to get Zoho Access Token');
  }
};
