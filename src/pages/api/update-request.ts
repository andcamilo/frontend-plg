import axios from 'axios';
import { backendBaseUrl } from '@utils/env';

export const updateRequest = async (solicitudId: string, updatePayload: object) => {
  console.log("🚀 ~ updateRequest ~ solicitudId:", solicitudId);
  
  if (!solicitudId || !updatePayload || typeof updatePayload !== 'object') {
    throw new Error('Solicitud ID and valid updates are required.');
  }

  try {
    const requestUrl = `${backendBaseUrl}/dev/update-request/${solicitudId}`;
    console.log("🚀 ~ updateRequest ~ requestUrl:", requestUrl);
    
    const backendResponse = await axios.patch(requestUrl, updatePayload);

    console.log("Backend response:", backendResponse.data);
    return backendResponse.data;
  } catch (error) {
    console.error('Error updating request:', error);
    throw new Error(error.response?.data?.message || 'Failed to update request.');
  }
};
