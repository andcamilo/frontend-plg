import axios from 'axios';
import get from 'lodash/get';
import { backendBaseUrl } from '@utils/env';

const validateEmailUrl = `${backendBaseUrl}/dev/validate-email`;

export const emailCheck = async (email: string, isLoggedIn: boolean) => {
  console.log("🚀 ~ emailCheck ~ isLoggedIn:", isLoggedIn)
  console.log("🚀 ~ emailCheck ~ email:", email)
  try {
    const response = await axios.get(validateEmailUrl, {
      params: {
        email: email,
        isLogged: isLoggedIn.toString(),
      },
    });
    console.log("🚀 ~ emailCheck ~ response:", response)
    
    const isLogged = get(response, 'data.isLogged', 'error');
    const cuenta = get(response, 'data.cuenta', null);

    return {
      isLogged,
      cuenta,
    };
  } catch (error) {
    console.error('Error checking email:', error);
    throw new Error('Failed to check email');
  }
};
