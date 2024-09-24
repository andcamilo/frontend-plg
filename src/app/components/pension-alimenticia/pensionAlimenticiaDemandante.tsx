import axios from 'axios';
import React, { useState, useContext, FormEvent } from 'react';
import Swal from 'sweetalert2';
import AppStateContext from '@context/context'; // Import the context
import ClipLoader from 'react-spinners/ClipLoader'; // Import spinner

const PensionAlimenticiaDemandante: React.FC = () => {
  const [formData, setFormData] = useState({
    nombreCompleto: '',
    telefono: '',
    cedula: '',
    email: '',
    confirmEmail: '',
    nacionalidad: 'Panama', // Default value for the select dropdown
  });

  const [isLoading, setIsLoading] = useState(false); // Add loading state

  const context = useContext(AppStateContext);

  if (!context) {
    throw new Error('AppStateContext must be used within an AppStateProvider');
  }

  const { store, setStore } = context;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Validate emails before submitting the form
  const validateEmails = () => formData.email === formData.confirmEmail;

  // Handle form submission
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
  
    if (!validateEmails()) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Los correos electrónicos no coinciden. Por favor, verifica e intenta de nuevo.',
      });
      return;
    }
  

  
    setIsLoading(true); // Set loading state to true before API call
  
    try {
  
      const updatePayload = {
        solicitudId: store.solicitudId,
        demandante: {
          nombreCompleto: formData.nombreCompleto,
          telefono: formData.telefono,
          cedula: formData.cedula,
          email: formData.email,
          nacionalidad: formData.nacionalidad,
        },
      };

      console.log("🚀 ~ handleSubmit ~ updatePayload:", updatePayload);

      // Make request to Next.js API route (which internally calls AWS Lambda)
      const response = await axios.patch('/api/update-request', updatePayload);
  
      if (response.status === 200) {
        setStore((prevState) => ({
          ...prevState,
          demandado: true,
          currentPosition: 4
        }));
  
        Swal.fire({
          icon: 'success',
          title: 'Formulario Enviado',
          text: 'Formulario enviado correctamente.',
        });
      } else {
        console.error('Unexpected response from server:', response.data);
        throw new Error('Error al actualizar la solicitud.');
      }
    } catch (error) {
      if (error.response) {
        console.error('Error response:', error.response.data);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: `Hubo un problema al actualizar la solicitud: ${error.response.data.message || error.message}.`,
        });
      } else {
        console.error('Error updating request:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Hubo un problema al actualizar la solicitud. Por favor, inténtelo de nuevo más tarde.',
        });
      }
    } finally {
      setIsLoading(false); // Set loading state to false after API call is finished
    }
  };

  return (
    <div className="bg-gray-900 text-white p-8">
      <h2 className="text-lg font-bold mb-2">Información del Demandante</h2>
      <p className="text-sm mb-2">
        El demandante se refiere a la persona que ejerce o presenta el reclamo legal, en este apartado debes completar todos los datos solicitados.
      </p>

      <form className="space-y-6 mt-5" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block mb-2 text-sm">Nombre completo</label>
            <input
              type="text"
              name="nombreCompleto"
              value={formData.nombreCompleto}
              onChange={handleChange}
              className="w-full p-2 border border-gray-700 rounded bg-gray-800 text-white"
              required
            />
          </div>
          <div>
            <label className="block mb-2 text-sm">Número de teléfono</label>
            <input
              type="text"
              name="telefono"
              value={formData.telefono}
              onChange={handleChange}
              className="w-full p-2 border border-gray-700 rounded bg-gray-800 text-white"
              required
            />
          </div>
          <div>
            <label className="block mb-2 text-sm">Cédula o pasaporte</label>
            <input
              type="text"
              name="cedula"
              value={formData.cedula}
              onChange={handleChange}
              className="w-full p-2 border border-gray-700 rounded bg-gray-800 text-white"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block mb-2 text-sm">Correo</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full p-2 border border-gray-700 rounded bg-gray-800 text-white"
              required
            />
          </div>
          <div>
            <label className="block mb-2 text-sm">Confirmar correo</label>
            <input
              type="email"
              name="confirmEmail"
              value={formData.confirmEmail}
              onChange={handleChange}
              className="w-full p-2 border border-gray-700 rounded bg-gray-800 text-white"
              required
            />
          </div>
          <div>
            <label className="block mb-2 text-sm">Nacionalidad</label>
            <select
              name="nacionalidad"
              value={formData.nacionalidad}
              onChange={handleChange}
              className="w-full p-2 border border-gray-700 rounded bg-gray-800 text-white"
              required
            >
              <option value="Panama">Panama</option>
              {/* Add more options */}
            </select>
          </div>
        </div>

        <div className="mt-6">
          <button
            type="submit"
            className="w-full md:w-auto bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded"
            disabled={isLoading} // Disable button when loading
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

export default PensionAlimenticiaDemandante;
