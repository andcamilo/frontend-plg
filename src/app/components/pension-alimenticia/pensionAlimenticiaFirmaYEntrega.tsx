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
  const [invalidFields, setInvalidFields] = useState<{ [key: string]: boolean }>({});

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

    let errores: { campo: string; mensaje: string }[] = [];

    // 🔹 Validación de campos en orden
    if (selectedOption === 'home') {
      if (!formData.direccion) {
        errores.push({ campo: 'direccion', mensaje: 'Debe introducir la dirección.' });
      } else if (!formData.dia) {
        errores.push({ campo: 'dia', mensaje: 'Debe introducir el día.' });
      } else if (!formData.telefono) {
        errores.push({ campo: 'telefono', mensaje: 'Debe introducir su número de teléfono.' });
      } else if (!formData.hora) {
        errores.push({ campo: 'hora', mensaje: 'Debe introducir la hora.' });
      }
    }

    if (errores.length > 0) {
      const primerError = errores[0]; // 🚀 Tomamos solo el primer error 

      setInvalidFields({ [primerError.campo]: true }); // Marcar solo el campo con error

      Swal.fire({
        icon: 'warning',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 2500,
        background: '#2c2c3e',
        color: '#fff',
        text: primerError.mensaje,
      });

      document.getElementsByName(primerError.campo)[0]?.focus();
      return;
    }

    setInvalidFields({});
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
    setInvalidFields((prev) => ({ ...prev, [name]: false }));
  };

  const [showModal, setShowModal] = useState(false); // Estado para manejar el modal

  const toggleModal = () => {
    setShowModal(!showModal); // Alterna el estado del modal
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
      <h1 className="text-white text-4xl font-bold flex items-center">
        Información sobre la Firma y Entrega
        <button
          className="ml-2 flex items-center justify-center w-10 h-10 bg-white text-black rounded-md border border-gray-300"
          type="button"
          onClick={toggleModal}
        >
          <span className="flex items-center justify-center w-7 h-7 bg-black text-white rounded-full">
            <i className="fa-solid fa-info text-sm"></i>
          </span>
        </button>
      </h1>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-gray-800 rounded-lg w-11/12 md:w-3/4 lg:w-1/2">
            <div className="p-4 border-b border-gray-600 flex justify-between items-center">
              <h2 className="text-white text-xl">Información sobre la Firma y Entrega</h2>
              <button
                className="text-white"
                onClick={toggleModal} // Cierra el modal
              >
                <i className="fa-solid fa-times"></i>
              </button>
            </div>
            <div className="p-4 text-white">
              <h5 className="text-lg">Información</h5>
              <p className="mt-2 texto_justificado">
                Descubre en este Clip cada detalle que te ayudará a entender el tipo de información que debes anexar en esta sección.
                <br />
                <br />
                ¡No dudes en explorar nuestros videos!
              </p>
              <h5 className="text-lg mt-4">Video</h5>
              <iframe
                width="100%"
                height="315"
                src="https://www.youtube.com/embed/bND1jqKk1p8"
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              ></iframe>
            </div>
            <div className="p-4 border-t border-gray-600 text-right">
              <button
                className="bg-red-600 text-white px-4 py-2 rounded-md"
                onClick={toggleModal} // Cierra el modal
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

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
              className={`w-full p-2 border ${invalidFields.direccion ? 'border-red-500' : 'border-gray-700'} rounded bg-gray-800 text-white`}
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
                  className={`w-full p-2 border ${invalidFields.dia ? 'border-red-500' : 'border-gray-700'} rounded bg-gray-800 text-white`}
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
                  className={`w-full p-2 border ${invalidFields.hora ? 'border-red-500' : 'border-gray-700'} rounded bg-gray-800 text-white`}
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
                  className={`w-full p-2 border ${invalidFields.telefono ? 'border-red-500' : 'border-gray-700'} rounded bg-gray-800 text-white`}
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
