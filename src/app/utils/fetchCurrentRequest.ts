// utils/fetchSolicitud.js
import axios from 'axios';
import AppStateContext from '@context/context';
import React, { useContext } from 'react';

export const useFetchSolicitud = (solicitudId) => {
  const context = useContext(AppStateContext);

  if (!context) {
    throw new Error('AppStateContext must be used within an AppStateProvider');
  }

  const { store, setStore } = context;

  const fetchSolicitud = async () => {
    try {
      const response = await axios.get('/api/get-request-id', {
        params: { solicitudId },
      });

      // Update the request field in the store
      setStore(prevStore => ({
        ...prevStore,
        request: response.data,
      }));
    } catch (error) {
      console.error('Error fetching solicitud:', error);
    }
  };

  return { fetchSolicitud };
};
