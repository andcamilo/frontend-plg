import React, { useEffect, useContext, useState } from 'react';
import axios from 'axios';
import AppStateContext from '@context/context'; // Assuming context is set up

const PensionAlimenticiaResumen: React.FC = () => {
  // Access the context values
  const context = useContext(AppStateContext);

  if (!context) {
    throw new Error('AppStateContext must be used within an AppStateProvider');
  }

  const { store } = context;
  const [solicitudData, setSolicitudData] = useState<any>(null);

  useEffect(() => {
    const fetchSolicitud = async () => {
      try {
        const response = await axios.get('/api/get-request-id', {
          params: { solicitudId: store.solicitudId },
        });
        console.log('Solicitud Data:', response.data);

        // Set the response data to state
        setSolicitudData(response.data);
      } catch (error) {
        console.error('Error fetching solicitud:', error);
      }
    };

    fetchSolicitud();
  }, []); // Removed the dependency on store.solicitudId

  // Helper function to render a field only if it has a value
  const renderField = (label: string, value: any) => {
    if (value) {
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
      <h2 className="text-2xl font-bold mb-4">Resumen de la Solicitud</h2>
      <p>Revisa toda la información antes de enviar la solicitud.</p>

      {/* Display the fetched data */}
      <div className="mt-4">
        {renderField('ID de Solicitud', solicitudData.id)}
        {renderField('Nombre del Solicitante', solicitudData.nombreSolicita)}
        {renderField('Teléfono', solicitudData.telefonoSolicita)}
        {renderField('Teléfono Alternativo', solicitudData.telefonoSolicita2)}
        {renderField('Correo Electrónico', solicitudData.emailSolicita)}
        {renderField('Tipo de Solicitud', solicitudData.tipo)}
        {renderField('Apoyo Recibe', solicitudData.solicitud?.apoyoRecibe)}
        {renderField('Tipo de Pensión', solicitudData.solicitud?.tipoPension)}
        {renderField('Cantidad de Pensión', solicitudData.solicitud?.cantidadPension)}
        {renderField('Categoría de Pensión', solicitudData.solicitud?.categoriaPension)}
        {renderField('Descripción Adicional', solicitudData.solicitudAdicional?.descripcion)}
        {renderField('Gastos Totales del Pensionado', solicitudData.gastosPensionado?.sumaTotal)}
        {renderField('Actualización por Correo', solicitudData.actualizarPorCorreo ? 'Sí' : 'No')}
        {renderField('Expediente', solicitudData.expediente)}
        {renderField('Estado Civil del Demandado', solicitudData.demandado?.estadoCivil)}
        {renderField('Ingreso del Trabajo del Demandado', solicitudData.demandado?.ingresosTrabajo)}
        {renderField('Nombre Completo del Demandado', solicitudData.demandado?.nombreCompleto)}
      </div>
    </div>
  );
};

export default PensionAlimenticiaResumen;
