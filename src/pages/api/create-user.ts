import axios from 'axios';
import { backendBaseUrl, backendEnv } from '@utils/env';

export const createUser = async (userData: {
  nombre: string;
  email: string;
  rol: string;
  telefonoSolicita: string;
}) => {
  try {
    const response = await axios.post(backendBaseUrl!, userData);
    return response.data;
  } catch (error) {
    console.error('Error creating user:', error);
    throw new Error(error.response?.data?.message || 'Failed to create user');
  }
};
