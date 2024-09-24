import axios from 'axios';
import { backendBaseUrl } from '@utils/env';

export const createRequest = async (requestData: {
  nombreSolicita: string;
  telefonoSolicita: string;
  telefonoSolicita2: string;
  emailSolicita: string;
  actualizarPorCorreo: boolean;
  cuenta: string;
  precio: number;
  subtotal: number;
  total: number;
  accion: string;
  tipo: string;
}) => {
  try {
    const response = await axios.post(`${backendBaseUrl}/dev/create-request`, requestData);
    return response.data;
    console.log("🚀 ~ response:", response)
  } catch (error) {
    console.error('Error creating request:', error);
    throw new Error(error.response?.data?.message || 'Failed to create request');
  }
};
