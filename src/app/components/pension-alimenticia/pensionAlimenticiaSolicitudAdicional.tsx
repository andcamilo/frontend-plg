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
          icon: 'success',
          title: 'Solicitud Adicional',
          text: 'Solicitud adicional enviada correctamente.',
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

  return (
    <div className="w-full h-full p-8 overflow-y-scroll scrollbar-thin bg-[#070707] text-white">
      {/* Header Section */}
      <h2 className="text-3xl font-bold mb-4">Solicitud Adicional</h2>
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
            value={additionalRequest}
            onChange={(e) => setAdditionalRequest(e.target.value)}
            className="w-full p-2 border border-gray-700 rounded bg-gray-800 text-white"
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
        <div className="mt-6">
          {(!store.request.status || store.request.status < 10 || (store.request.status >= 10 && store.rol > 20)) && (
            <>
              <button
                type="submit"
                className="w-full md:w-auto bg-profile hover:bg-profile text-white font-semibold py-2 px-4 rounded"
                disabled={isLoading} // Disable button while loading
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
            </>
          )}

          {store.request.status >= 10 && (
            <>
              <button
                className="bg-profile text-white w-full py-3 rounded-lg mt-6"
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
            </>
          )}
        </div>
      </form>
    </div>
  );
};

export default PensionAlimenticiaSolicitudAdicional;
