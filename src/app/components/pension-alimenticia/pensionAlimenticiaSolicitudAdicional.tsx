import React, { useState, useContext, FormEvent } from 'react';
import Swal from 'sweetalert2';
import AppStateContext from '@context/context'; // Import the context
import axios from 'axios';
import ClipLoader from 'react-spinners/ClipLoader'; // Import spinner

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
      // Convert file to base64 if present
      const additionalFileBase64 = additionalFile ? await convertFileToBase64(additionalFile) : null;

      // Prepare the payload for the API call
      const updatePayload = {
        updates: {
          solicitudAdicional: {
            descripcion: additionalRequest,
            documentoAdicional: additionalFileBase64,
          },
        },
        solicitud: store.solicitudId, // Ensure this is the solicitud ID from the context
      };

      // Make the PATCH request to your API
      const response = await axios.patch(`/api/update-request`, updatePayload);

      if (response.status === 200 && response.data.status === 'success') {
        // Update context after successful submission
        setStore((prevState) => ({
          ...prevState,
          resumen: true, // Set resumen to true in the context
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
    <div className="text-white bg-gray-900 p-8">
      {/* Header Section */}
      <h2 className="text-2xl font-bold mb-4">Solicitud Adicional</h2>
      <p className="text-sm mb-6">
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
          ></textarea>
        </div>

        {/* File Upload Section */}
        <div className="mb-6">
          <label className="block mb-2 text-sm font-semibold">Adjuntar algún documento adicional que desee. *</label>
          <input
            type="file"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:bg-gray-800 file:text-gray-300 hover:file:bg-gray-700"
          />
        </div>

        {/* Submit Button */}
        <div className="mt-6">
          <button
            type="submit"
            className="w-full md:w-auto bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded"
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
        </div>
      </form>
    </div>
  );
};

export default PensionAlimenticiaSolicitudAdicional;
