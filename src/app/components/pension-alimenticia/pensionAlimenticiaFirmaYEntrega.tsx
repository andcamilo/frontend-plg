import React, { useState, useContext } from 'react';
import Swal from 'sweetalert2';
import AppStateContext from '@context/context';
import axios from 'axios';
import ClipLoader from 'react-spinners/ClipLoader';

const PensionAlimenticiaFirmaYEntrega: React.FC = () => {
  const [selectedOption, setSelectedOption] = useState<string>('office');
  const [isLoading, setIsLoading] = useState<boolean>(false); 

  const context = useContext(AppStateContext);

  if (!context) {
    throw new Error('AppStateContext must be used within an AppStateProvider');
  }

  const { store, setStore } = context;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsLoading(true);

    const updatePayload = {
      updates: {
        firmaYEntrega: {
          deliveryOption: selectedOption,
        },
      },
      solicitud: store.solicitudId,
    };

    try {
      const response = await axios.patch(`/api/update-request`, updatePayload);

      if (response.status === 200 && response.data.status === 'success') {
        setStore((prevState) => ({
          ...prevState,
          solicitudAdicional: true, 
        }));

        Swal.fire({
          icon: 'success',
          title: 'Firma y Entrega',
          text: 'Firma y entrega guardadas correctamente.',
        });
      } else {
        throw new Error('Error al actualizar la solicitud.');
      }
    } catch (error) {
      console.error('Error updating request:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Hubo un problema al actualizar la solicitud. Por favor, inténtelo de nuevo más tarde.',
      });
    } finally {
      // Set loading state to false after the request completes
      setIsLoading(false);
    }
  };

  return (
    <div className="text-white bg-gray-900 p-8">
      {/* Header Section */}
      <h2 className="text-2xl font-bold mb-4">Información sobre la Firma y Entrega</h2>
      <p className="text-sm mb-6">
        En esta sección debes elegir el lugar en donde deseas entregar las pruebas y gestionar la firma de Poder correspondiente para comenzar tu trámite.
      </p>

      {/* Radio Options Section */}
      <p className="font-semibold mb-4">Por favor indícanos cómo deseas firmar y entregarnos los documentos para el proceso:</p>
      <div className="space-y-4 mb-8">
        <div className="flex items-center">
          <input
            type="radio"
            id="office"
            name="deliveryOption"
            value="office"
            checked={selectedOption === 'office'}
            onChange={() => setSelectedOption('office')}
            className="form-radio h-4 w-4 text-purple-600"
          />
          <label htmlFor="office" className="ml-3 text-sm">
            Puedo ir a sus oficinas a firmar y entregar todo.
          </label>
        </div>

        <div className="flex items-center">
          <input
            type="radio"
            id="home"
            name="deliveryOption"
            value="home"
            checked={selectedOption === 'home'}
            onChange={() => setSelectedOption('home')}
            className="form-radio h-4 w-4 text-purple-600"
          />
          <label htmlFor="home" className="ml-3 text-sm">
            Entrega y firma a domicilio.
          </label>
        </div>
      </div>

      {/* Address and Contact Information */}
      <p className="text-sm mb-6">
        Nuestros abogados te contactarán para coordinar una cita en nuestras oficinas, que se encuentran en la siguiente dirección:
      </p>
      <div className="mb-4">
        <p className="text-sm"><strong>Dirección:</strong> Área Bancaria, Edificio Proconsa</p>
        <p className="text-sm"><strong>Piso:</strong> 12</p>
        <p className="text-sm"><strong>Oficinas:</strong> C y D</p>
      </div>

      <p className="text-sm mb-6">
        Si necesitas confirmar la dirección o tienes alguna pregunta adicional, no dudes en llamarnos al siguiente número de teléfono:
      </p>
      <p className="text-sm mb-4">
        <strong>Teléfono de contacto:</strong> +507 396-1402
      </p>

      <div className="flex items-center mb-6">
        <button className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded inline-flex items-center">
          <img
            src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg"
            alt="WhatsApp"
            className="w-5 h-5 mr-2"
          />
          WhatsApp
        </button>
      </div>

      <p className="text-sm mb-6">
        Nuestros horarios de oficina para atención al público son:
        <br />
        <strong>Lunes a viernes:</strong> De 9:00 a.m. a 5:00 p.m.
      </p>

      <div className="mt-6">
        <button
          type="submit"
          className="w-full md:w-auto bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded"
          onClick={handleSubmit}
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <ClipLoader size={24} color="#ffffff" />
              <span className="ml-2">Cargando...</span>
            </div>
          ) : (
            'Guardar y continuar'
          )}
        </button>
      </div>
    </div>
  );
};

export default PensionAlimenticiaFirmaYEntrega;
