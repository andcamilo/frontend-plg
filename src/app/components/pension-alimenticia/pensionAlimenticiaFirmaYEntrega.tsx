import React, { useState, useContext, useEffect } from 'react';
import Swal from 'sweetalert2';
import AppStateContext from '@context/context';
import axios from 'axios';
import ClipLoader from 'react-spinners/ClipLoader';
import { useFetchSolicitud } from '@utils/fetchCurrentRequest'
import get from 'lodash/get';
import CountrySelect from '@components/CountrySelect';
import countryCodes from '@utils/countryCode';


const PensionAlimenticiaFirmaYEntrega: React.FC = () => {
  const [selectedOption, setSelectedOption] = useState<string>('office');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const context = useContext(AppStateContext);

  if (!context) {
    throw new Error('AppStateContext must be used within an AppStateProvider');
  }

  const { store, setStore } = context;
  const { fetchSolicitud } = useFetchSolicitud(store.solicitudId);

  const [formData, setFormData] = useState({
    direccion: "",
    dia: "",
    hora: "",
    telefonoCodigo: 'PA',
    telefono: "",
  });

  useEffect(() => {
    if (store.solicitudId) {
      fetchSolicitud();
    }
  }, [store.solicitudId]);

  useEffect(() => {
    if (store.request) {
      console.log("🚀 ~ Updated store.request:", store.request);
      const firmaYEntrega = get(store.request, 'firmaYEntrega', {});

      if (firmaYEntrega && Object.keys(firmaYEntrega).length > 0) {
        setSelectedOption(firmaYEntrega.deliveryOption)
        setFormData((prevFormData) => ({
          ...prevFormData,
          direccion: get(store.request, 'firmaYEntrega.direccion', ''),
          dia: get(store.request, 'firmaYEntrega.dia', ''),
          hora: get(store.request, 'firmaYEntrega.hora', ''),
          telefono: get(store.request, 'firmaYEntrega.telefonoSolicita', ''),

        }));
      }
    }
  }, [store.request]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsLoading(true);

    const firmaYEntregaData = {
      deliveryOption: selectedOption,
    }

    try {
      const updatePayload = {
        solicitudId: store.solicitudId,
        firmaYEntrega: {
          deliveryOption: selectedOption,
          ...(selectedOption === "home" && {
            direccion: formData.direccion,
            dia: formData.dia,
            hora: formData.hora,
            telefonoSolicita: `${countryCodes[formData.telefonoCodigo]}${formData.telefono}` || '',
          }),
        },
      };

      const response = await axios.patch('/api/update-request', updatePayload);

      if (response.status === 200) {
        setStore((prevState) => ({
          ...prevState,
          solicitudAdicional: true,
          currentPosition: 8
        }));

        Swal.fire({
          position: "top-end",
          icon: "success",
          title: "Información de la firma y entrega actualizada correctamente.",
          showConfirmButton: false,
          timer: 2500,
          timerProgressBar: true,
          toast: true,
          background: '#2c2c3e',
          color: '#fff',
          customClass: {
            popup: 'custom-swal-popup',
            title: 'custom-swal-title',
            icon: 'custom-swal-icon',
            timerProgressBar: 'custom-swal-timer-bar',
          },
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleCountryChange = (name: string, value: string) => {
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  return (
    <div className="w-full h-full p-8 overflow-y-scroll scrollbar-thin bg-[#070707] text-white">
      {/* Header Section */}
      <h2 className="text-3xl font-bold mb-4">Información sobre la Firma y Entrega</h2>
      <p className="mb-6">
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
            disabled={store.request.status >= 10 && store.rol < 20}
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
            disabled={store.request.status >= 10 && store.rol < 20}
          />
          <label htmlFor="home" className="ml-3 text-sm">
            Entrega y firma a domicilio.
          </label>
        </div>
      </div>

      {/* Información para "Puedo ir a sus oficinas" */}
      {selectedOption === 'office' && (
        <div>
          <p className="mb-6">
            Nuestros abogados te contactarán para coordinar una cita en nuestras oficinas, que se encuentran en la siguiente dirección:
          </p>
          <div className="mb-4">
            <p className="text-sm"><strong>Dirección:</strong> Área Bancaria, Edificio Proconsa</p>
            <p className="text-sm"><strong>Piso:</strong> 12</p>
            <p className="text-sm"><strong>Oficinas:</strong> C y D</p>
          </div>

          <p className="mb-6">
            Si necesitas confirmar la dirección o tienes alguna pregunta adicional, no dudes en llamarnos al siguiente número de teléfono:
          </p>
          <p className="mb-4">
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

          <p className="mb-6">
            Nuestros horarios de oficina para atención al público son:
            <br />
            <strong>Lunes a viernes:</strong> De 9:00 a.m. a 5:00 p.m.
          </p>
        </div>
      )}

      {/* Información para "Entrega y firma a domicilio" */}
      {selectedOption === 'home' && (
        <div>
          <p className="mb-4">
            Enviaremos a uno de nuestros mensajeros para recaudar de manera segura tus documentos y tu firma. Nuestros abogados se contactarán contigo para asegurarnos que tengas todo lo que necesitamos listo.
          </p>
          <p className="mb-2 font-semibold">Por favor incluya la siguiente información:</p>

          <div className="col-span-2">
            <label className="text-white">Dirección</label>
            <input
              type="text"
              name="direccion"
              value={formData.direccion}
              onChange={handleChange}
              className="w-full p-2 border border-gray-700 rounded bg-gray-800 text-white"
              placeholder="Dirección"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">

            <div >
              <div >
                <label className="block mb-2 text-sm">Día:</label>
                <input
                  type="date"
                  name="dia"
                  value={formData.dia}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-700 rounded bg-gray-800 text-white"
                  disabled={store.request.status >= 10 && store.rol < 20}
                />
              </div>

              <div>
                <label className="block mb-2 mt-4 text-sm">Hora (Formato 24 horas):</label>
                <input
                  type="time"
                  name="hora"
                  value={formData.hora}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-700 rounded bg-gray-800 text-white"
                />
              </div>
            </div>
            <div >
              <label className="block mb-2 text-sm">Número de teléfono</label>
              <div className="flex gap-2">
                <CountrySelect
                  name="telefonoCodigo"
                  value={formData.telefonoCodigo}
                  onChange={(value) => handleCountryChange('telefonoCodigo', value)}
                  isDisabled={store.request.status >= 10 && store.rol < 20}
                  className="w-contain"
                />
                <input
                  type="text"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleChange}
                  className="p-4 bg-gray-800 text-white rounded-lg w-full"
                  placeholder="Número de teléfono"
                  required
                  disabled={store.request.status >= 10 && store.rol < 20}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Botón de Guardar y Continuar */}
      <div className="mt-6">
        {(!store.request.status || store.request.status < 10 || (store.request.status >= 10 && store.rol > 20)) && (
          <button
            type="submit"
            className="w-full md:w-auto bg-profile hover:bg-profile text-white font-semibold py-2 px-4 rounded"
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
        )}

        {store.request.status >= 10 && (
          <button
            className="bg-profile text-white w-full py-3 rounded-lg mt-6"
            type="button"
            onClick={() => {
              setStore((prevState) => ({
                ...prevState,
                currentPosition: 8,
              }));
            }}
          >
            Continuar
          </button>
        )}
      </div>
    </div>
  );

};

export default PensionAlimenticiaFirmaYEntrega;
