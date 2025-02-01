import React, { useEffect, useContext, useState } from 'react';
import axios from 'axios';
import AppStateContext from '@context/context'; 
import { useFetchSolicitud } from '@utils/fetchCurrentRequest';
import get from 'lodash/get';

const PensionAlimenticiaResumen: React.FC = () => {
  // Access the context values
  const context = useContext(AppStateContext);

  if (!context) {
    throw new Error('AppStateContext must be used within an AppStateProvider');
  }
  
  const [solicitudData, setSolicitudData] = useState<any>(null);
  const { store } = context;
  const { fetchSolicitud } = useFetchSolicitud(store.solicitudId);

  useEffect(() => {
    if (store.solicitudId) {
      fetchSolicitud(); 
    }
  }, [store.solicitudId]);

  useEffect(() => {
    if (store.request) {
      console.log("🚀 ~ Updated store.request:", store.request);
      setSolicitudData(store.request);
    }
  }, [store.request]);

  // Helper function to render a field only if it has a non-empty value
  const renderField = (label: string, value: any) => {
    // Check if value is an object with "label" or "value" keys and handle appropriately
    if (typeof value === 'object' && value !== null) {
      value = value.label || JSON.stringify(value); // Use `label` if available, otherwise stringify the object
    }
    
    if (value !== undefined && value !== null && value !== '') {
      return (
        <div className="mb-4">
          <strong>{label}: </strong>
          <span>{value}</span>
        </div>
      );
    }
    return null;
  };

  if (!solicitudData) {
    return <p className="text-white">Cargando los detalles de la solicitud...</p>;
  }

  return (
    <div className="text-white">
      <h2 className="text-3xl font-bold mb-4">Resumen de la Solicitud</h2>
      <p>Revisa toda la información antes de enviar la solicitud.</p>

      {/* Display the fetched data */}
      <div className="mt-4">
        {renderField('ID de Solicitud', get(solicitudData, 'id'))}
        {renderField('Nombre del Solicitante', get(solicitudData, 'nombreSolicita'))}
        {renderField('Teléfono', get(solicitudData, 'telefonoSolicita'))}
        {renderField('Teléfono Alternativo', get(solicitudData, 'telefonoSolicita2'))}
        {renderField('Correo Electrónico', get(solicitudData, 'emailSolicita'))}
        {renderField('Tipo de Solicitud', get(solicitudData, 'tipo'))}
        {renderField('Apoyo Recibe', get(solicitudData, 'solicitud.apoyoRecibe'))}
        {renderField('Tipo de Pensión', get(solicitudData, 'solicitud.tipoPension'))}
        {renderField('Cantidad de Pensión', get(solicitudData, 'solicitud.cantidadPension'))}
        {renderField('Categoría de Pensión', get(solicitudData, 'solicitud.categoriaPension'))}
        {renderField('Descripción Adicional', get(solicitudData, 'solicitudAdicional.descripcion'))}
        {renderField('Gastos Totales del Pensionado', get(solicitudData, 'gastosPensionado.sumaTotal'))}
        {renderField('Actualización por Correo', get(solicitudData, 'actualizarPorCorreo') ? 'Sí' : 'No')}
        {renderField('Expediente', get(solicitudData, 'expediente'))}
        {renderField('Estado Civil del Demandado', get(solicitudData, 'demandado.estadoCivil'))}
        {renderField('Ingreso del Trabajo del Demandado', get(solicitudData, 'demandado.ingresosTrabajo'))}
        {renderField('Nombre Completo del Demandado', get(solicitudData, 'demandado.nombreCompleto'))}
      </div>
    </div>
  );
};

export default PensionAlimenticiaResumen;
