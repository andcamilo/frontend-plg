import React, { useState, useContext, FormEvent, useEffect } from 'react';
import Swal from 'sweetalert2';
import AppStateContext from '@context/context'; // Import the context
import axios from 'axios';
import ClipLoader from 'react-spinners/ClipLoader'; // Import spinner
import { useFetchSolicitud } from '@utils/fetchCurrentRequest'
import get from 'lodash/get';

const convertFileToBase64 = (file: File) => {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

const PensionAlimenticiaSolicitudAdicional: React.FC = () => {
  const [additionalRequest, setAdditionalRequest] = useState<string>(''); // Additional request text
  const [additionalFile, setAdditionalFile] = useState<File | null>(null); // File input state
  const [isLoading, setIsLoading] = useState<boolean>(false); // Loading state
  const [invalidFields, setInvalidFields] = useState<{ [key: string]: boolean }>({});

  // Access the context
  const context = useContext(AppStateContext);

  if (!context) {
    throw new Error('AppStateContext must be used within an AppStateProvider');
  }

  const { store, setStore } = context;
  const { fetchSolicitud } = useFetchSolicitud(store.solicitudId);

  useEffect(() => {
    if (store.solicitudId) {
      fetchSolicitud();
    }
  }, [store.solicitudId]);


  useEffect(() => {
    if (store.request) {
      console.log("🚀 ~ Updated store.request:", store.request);
      const solicitudAdicional = get(store.request, 'solicitudAdicional', {});

      if (solicitudAdicional) {
        setAdditionalRequest(solicitudAdicional.descripcion)
      }
    }
  }, [store.request]);

  // Handle file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setAdditionalFile(file);
  };

  // Handle form submission
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    let errores: { campo: string; mensaje: string }[] = [];

    // 🔹 Validación de campos en orden
    if (!additionalRequest) {
      errores.push({ campo: 'additionalRequest', mensaje: 'Debe introducir una breve descripción de su caso.' });
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
    setIsLoading(true); // Set loading state

    try {
      const additionalFileBase64 = additionalFile ? await convertFileToBase64(additionalFile) : null;

      // Prepare the payload for the API call
      const solicitudAdicionalData = {
        descripcion: additionalRequest,
        documentoAdicional: additionalFileBase64,
      }

      const updatePayload = {
        solicitudId: store.solicitudId,
        solicitudAdicional: {
          descripcion: additionalRequest,
          documentoAdicional: additionalFileBase64,
        },
      };

      const response = await axios.patch('/api/update-request', updatePayload);


      if (response.status === 200) {
        // Update context after successful submission
        setStore((prevState) => ({
          ...prevState,
          resumen: true,
          currentPosition: 9
        }));

        // Show success message
        Swal.fire({
          position: "top-end",
          icon: "success",
          title: "Información de la solicitud adicional actualizada correctamente.",
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
      console.error('Error uploading file:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Hubo un problema al enviar la solicitud adicional. Por favor, inténtelo de nuevo más tarde.',
      });
    } finally {
      setIsLoading(false); // Reset loading state
    }
  };

  const [showModal, setShowModal] = useState(false); // Estado para manejar el modal

  const toggleModal = () => {
    setShowModal(!showModal); // Alterna el estado del modal
  };

  return (
    <div className="w-full h-full p-8 overflow-y-scroll scrollbar-thin bg-[#070707] text-white">
      {/* Header Section */}
      <h1 className="text-white text-4xl font-bold">Solicitud Adicional</h1>
    
      <p className="mb-6">
        Si requiere algún otro proceso no incluido en esta solicitud, por favor detallar y nuestro equipo se contactará contigo en no más de 48 horas laborables.
      </p>

      {/* Form Section */}
      <form onSubmit={handleSubmit}>
        {/* Additional Request Textarea */}
        <div className="mb-6">
          <label className="block mb-2 text-sm font-semibold">Solicitud adicional:</label>
          <textarea
            rows={4}
            name='additionalRequest'
            value={additionalRequest}
            onChange={(e) => setAdditionalRequest(e.target.value)}
            className={`w-full p-2 border ${invalidFields.additionalRequest ? 'border-red-500' : 'border-gray-700'} rounded bg-gray-800 text-white`}
            disabled={store.request.status >= 10 && store.rol < 20}
          ></textarea>
        </div>

        {/* File Upload Section */}
        <div className="mb-6">
          <label className="block mb-2 text-sm font-semibold">Adjuntar algún documento adicional que desee. *</label>
          <input
            type="file"
            onChange={handleFileChange}
            className="w-full p-2 bg-gray-800 text-white rounded-lg"
            disabled={store.request.status >= 10 && store.rol < 20}
          />
        </div>

        {/* Submit Button */}
        <div className="mt-6 flex flex-col md:flex-row gap-4">
          {(!store.request.status || store.request.status < 10 || (store.request.status >= 10 && store.rol > 20)) && (
            <button
              type="submit"
              className="w-full md:w-auto bg-profile hover:bg-profile text-white font-semibold py-2 px-4 rounded"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <ClipLoader size={24} color="#ffffff" />
                  <span className="ml-2">Cargando...</span>
                </div>
              ) : (
                'Guardar y Continuar'
              )}
            </button>
          )}

          <button
            className="w-full md:w-auto bg-profile hover:bg-profile text-white font-semibold py-2 px-4 rounded"
            type="button"
            onClick={() => {
              setStore((prevState) => ({
                ...prevState,
                currentPosition: 9,
              }));
            }}
          >
            Continuar
          </button>
        </div>
      </form>
    </div>
  );
};

export default PensionAlimenticiaSolicitudAdicional;
