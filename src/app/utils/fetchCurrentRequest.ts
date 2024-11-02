// utils/fetchSolicitud.js
import axios from 'axios';
import AppStateContext from '@context/context';
import AppStateContextFundacion from '@context/fundacionContext';
import AppStateContextSociedad from '@context/sociedadesContext';
import React, { useContext } from 'react';

export const useFetchSolicitud = (solicitudId) => {
  const pensionContext = useContext(AppStateContext);
  const fundacionContext = useContext(AppStateContextFundacion);
  const sociedadContext = useContext(AppStateContextSociedad);

  // Verificar si estamos trabajando con pensión, fundación o sociedad
  const context = pensionContext?.store.solicitudId
    ? pensionContext
    : fundacionContext?.store.solicitudId
    ? fundacionContext
    : sociedadContext?.store.solicitudId
    ? sociedadContext
    : pensionContext || fundacionContext || sociedadContext;

  if (!context) {
    throw new Error('AppStateContext must be used within an AppStateProvider');
  }

  const { store, setStore } = context;

  const fetchSolicitud = async () => {
    if (!solicitudId) return; // Verifica que solicitudId esté disponible antes de hacer la solicitud

    try {
      const response = await axios.get('/api/get-request-id', {
        params: { solicitudId },
      });

      // Actualizar el campo `request` en el store
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
