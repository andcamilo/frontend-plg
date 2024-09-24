import React, { useState, useContext, FormEvent } from 'react';
import Swal from 'sweetalert2';
import AppStateContext from '@context/context'; // Import the context
import axios from 'axios';
import ClipLoader from 'react-spinners/ClipLoader'; // Import spinner

// Helper function to convert file to base64
const convertFileToBase64 = (file: File) => {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
};

const PensionAlimenticiaArchivosAdjuntos: React.FC = () => {
  const [cedulaFile, setCedulaFile] = useState<File | null>(null);
  const [nacimientoFile, setNacimientoFile] = useState<File | null>(null);
  const [sentenciaFile, setSentenciaFile] = useState<File | null>(null);
  const [additionalDocs, setAdditionalDocs] = useState<File[]>([]);
  const [showAdditionalDocs, setShowAdditionalDocs] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // Add loading state

  // Access the context
  const context = useContext(AppStateContext);

  if (!context) {
    throw new Error('AppStateContext must be used within an AppStateProvider');
  }

  const { store, setStore } = context;

  const handleAddDocument = () => {
    setAdditionalDocs([...additionalDocs, new File([], "")]); // Add empty file entry
  };

  const handleRemoveDocument = (index: number) => {
    setAdditionalDocs(additionalDocs.filter((_, i) => i !== index));
  };

  const toggleAdditionalDocs = () => {
    setShowAdditionalDocs(!showAdditionalDocs);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, setFile: React.Dispatch<React.SetStateAction<File | null>>) => {
    const file = e.target.files?.[0] || null;
    setFile(file);
  };

  const handleAdditionalDocChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const newDocs = [...additionalDocs];
    if (e.target.files?.[0]) {
      newDocs[index] = e.target.files[0];
    }
    setAdditionalDocs(newDocs);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true); // Set loading state to true before making the API request

    try {
      // Convert files to base64
      const cedulaBase64 = cedulaFile ? await convertFileToBase64(cedulaFile) : null;
      const nacimientoBase64 = nacimientoFile ? await convertFileToBase64(nacimientoFile) : null;
      const sentenciaBase64 = sentenciaFile ? await convertFileToBase64(sentenciaFile) : null;

      // Convert additional documents to base64
      const additionalDocsBase64 = await Promise.all(
        additionalDocs.map((file) => convertFileToBase64(file))
      );

      // Prepare the update payload
      const updatePayload = {
        updates: {
          archivosAdjuntos: {
            cedula: cedulaBase64,
            certificadoNacimiento: nacimientoBase64,
            sentencia: sentenciaBase64,
            additionalDocs: additionalDocsBase64,
          },
        },
        solicitud: store.solicitudId,
      };

      // Send the data to the API
      const response = await axios.patch(`/api/update-request`, updatePayload);

      if (response.status === 200 && response.data.status === 'success') {
        setStore((prevState) => ({
          ...prevState,
          firmaYEntrega: true,
          currentPosition: 7
        }));

        Swal.fire({
          icon: 'success',
          title: 'Archivos Adjuntos',
          text: 'Archivos adjuntados correctamente.',
        });
      } else {
        throw new Error('Error al actualizar la solicitud.');
      }
    } catch (error) {
      console.error('Error uploading files:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Hubo un problema al adjuntar los archivos. Por favor, inténtelo de nuevo más tarde.',
      });
    } finally {
      setIsLoading(false); // Set loading state to false after the request is complete
    }
  };

  return (
    <div className="text-white bg-gray-900 p-8">
      <h2 className="text-2xl font-bold mb-4">Información sobre los Archivos Adjuntos</h2>
      <p className="text-sm mb-4">
        En esta sección debes adjuntar la siguiente información necesaria para tramitar tu solicitud.
      </p>

      {/* Form Section */}
      <form className="space-y-6" onSubmit={handleSubmit}>
        {/* Archivo 1 */}
        <div>
          <label className="block mb-2 text-sm">Copia de cédula de quien solicita la Pensión Alimenticia.</label>
          <input
            type="file"
            onChange={(e) => handleFileChange(e, setCedulaFile)}
            className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:bg-gray-800 file:text-gray-300 hover:file:bg-gray-700"
          />
        </div>

        {/* Archivo 2 */}
        <div>
          <label className="block mb-2 text-sm">Certificado de Nacimiento del pensionado.</label>
          <input
            type="file"
            onChange={(e) => handleFileChange(e, setNacimientoFile)}
            className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:bg-gray-800 file:text-gray-300 hover:file:bg-gray-700"
          />
        </div>

        {/* Archivo 3 */}
        <div>
          <label className="block mb-2 text-sm">Copia de la Sentencia o Mediación en caso que la hubiere.</label>
          <input
            type="file"
            onChange={(e) => handleFileChange(e, setSentenciaFile)}
            className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:bg-gray-800 file:text-gray-300 hover:file:bg-gray-700"
          />
        </div>

        {/* Toggle Optional Documents Section */}
        <div className="mt-6">
          <button
            type="button"
            onClick={toggleAdditionalDocs}
            className="w-full md:w-auto bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded"
          >
            {showAdditionalDocs ? 'Ocultar Documentos Adicionales' : 'Agregar Documento Adicional ▾'}
          </button>
        </div>

        {/* Optional Additional Documents Section */}
        {showAdditionalDocs && (
          <>
            {additionalDocs.map((doc, index) => (
              <div key={index} className="space-y-4 mt-4">
                <div>
                  <label className="block mb-2 text-sm">- Documento adicional:</label>
                  <input
                    type="file"
                    onChange={(e) => handleAdditionalDocChange(e, index)}
                    className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:bg-gray-800 file:text-gray-300 hover:file:bg-gray-700"
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => handleRemoveDocument(index)}
                    className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}

            {/* Add More Document Button */}
            <div className="mt-4">
              <button
                type="button"
                onClick={handleAddDocument}
                className="w-full md:w-auto bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded"
              >
                Otro Documento adicional
              </button>
            </div>
          </>
        )}

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
              'Guardar y continuar'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PensionAlimenticiaArchivosAdjuntos;
