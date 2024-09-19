import React, { useState, useContext, FormEvent } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import AppStateContext from '@context/context';
import ClipLoader from 'react-spinners/ClipLoader'; // Import spinner

const PensionAlimenticiaDemandado: React.FC = () => {
  const [formData, setFormData] = useState({
    nombreCompleto: '',
    estadoCivil: 'Soltero',
    cedula: '',
    nacionalidad: 'Panamá',
    direccion: '',
    pais: 'Panamá', 
    provincia: '',
    corregimiento: '',
    ingresosTrabajo: '',
    detalleDireccion: '',
    direccionTrabajo: '',
    salario: 'No', 
    hijosDistintos: 'No',
    trabajando: 'No',
  });

  const [isLoading, setIsLoading] = useState(false); // Add loading state

  // Access the context
  const context = useContext(AppStateContext);

  if (!context) {
    throw new Error('AppStateContext must be used within an AppStateProvider');
  }

  const { store, setStore } = context;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    const updatePayload = {
      updates: {
        demandado: {
          nombreCompleto: formData.nombreCompleto,
          estadoCivil: formData.estadoCivil,
          cedula: formData.cedula,
          nacionalidad: formData.nacionalidad,
          direccion: formData.direccion,
          pais: formData.pais,
          provincia: formData.provincia,
          corregimiento: formData.corregimiento,
          ingresosTrabajo: formData.ingresosTrabajo,
          detalleDireccion: formData.detalleDireccion,
          direccionTrabajo: formData.direccionTrabajo,
          salario: formData.salario,
          hijosDistintos: formData.hijosDistintos,
          trabajando: formData.trabajando,
        }
      },
      solicitud: store.solicitudId,
    };

    setIsLoading(true); // Set loading state to true before the API call

    try {
      const response = await axios.patch(`/api/update-request`, updatePayload);

      if (response.status === 200 && response.data.status === 'success') {
        setStore((prevState) => ({
          ...prevState,
          gastosPensionado: true,
        }));

        Swal.fire({
          icon: 'success',
          title: 'Formulario Enviado',
          text: 'Formulario del demandado enviado correctamente.',
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
      setIsLoading(false); // Set loading state to false after the request is complete
    }
  };

  return (
    <div className="text-white bg-gray-900 p-8">
      {/* Header Section */}
      <h2 className="text-2xl font-bold mb-4">Información del Demandado</h2>
      <p className="text-sm mb-4">
        Representa a la persona a la cual se le está solicitando la demanda, en este caso la persona que debe aportar la otra parte correspondiente a la Pensión Alimenticia.
      </p>

      {/* Form Section */}
      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block mb-2 text-sm">Nombre completo:</label>
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
            <label className="block mb-2 text-sm">Estado civil:</label>
            <select
              name="estadoCivil"
              value={formData.estadoCivil}
              onChange={handleChange}
              className="w-full p-2 border border-gray-700 rounded bg-gray-800 text-white"
              required
            >
              <option value="Soltero">Soltero</option>
              <option value="Casado">Casado</option>
            </select>
          </div>
          <div>
            <label className="block mb-2 text-sm">Cédula o pasaporte:</label>
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
            <label className="block mb-2 text-sm">Nacionalidad:</label>
            <select
              name="nacionalidad"
              value={formData.nacionalidad}
              onChange={handleChange}
              className="w-full p-2 border border-gray-700 rounded bg-gray-800 text-white"
            >
              <option value="Panamá">Panamá</option>
            </select>
          </div>
          <div>
            <label className="block mb-2 text-sm">Dirección completa:</label>
            <input
              type="text"
              name="direccion"
              value={formData.direccion}
              onChange={handleChange}
              className="w-full p-2 border border-gray-700 rounded bg-gray-800 text-white"
              required
            />
          </div>
          <div>
            <label className="block mb-2 text-sm">País donde vive:</label>
            <select
              name="pais"
              value={formData.pais}
              onChange={handleChange}
              className="w-full p-2 border border-gray-700 rounded bg-gray-800 text-white"
              required
            >
              <option value="Panamá">Panamá</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block mb-2 text-sm">Provincia:</label>
            <select
              name="provincia"
              value={formData.provincia}
              onChange={handleChange}
              className="w-full p-2 border border-gray-700 rounded bg-gray-800 text-white"
              required
            >
              <option value="Bocas del Toro">Bocas del Toro</option>
            </select>
          </div>
          <div>
            <label className="block mb-2 text-sm">Corregimiento:</label>
            <select
              name="corregimiento"
              value={formData.corregimiento}
              onChange={handleChange}
              className="w-full p-2 border border-gray-700 rounded bg-gray-800 text-white"
              required
            >
              <option value="Bastimentos">Bastimentos</option>
            </select>
          </div>
          <div>
            <label className="block mb-2 text-sm">Ingresos que recibe:</label>
            <input
              type="text"
              name="ingresosTrabajo"
              value={formData.ingresosTrabajo}
              onChange={handleChange}
              className="w-full p-2 border border-gray-700 rounded bg-gray-800 text-white"
              required
            />
          </div>
        </div>

        <div>
          <label className="block mb-2 text-sm">Detalle de la dirección:</label>
          <textarea
            name="detalleDireccion"
            value={formData.detalleDireccion}
            onChange={handleChange}
            className="w-full p-2 border border-gray-700 rounded bg-gray-800 text-white"
            rows={3}
            required
          ></textarea>
        </div>

        <div>
          <label className="block mb-2 text-sm">Dirección de trabajo:</label>
          <textarea
            name="direccionTrabajo"
            value={formData.direccionTrabajo}
            onChange={handleChange}
            className="w-full p-2 border border-gray-700 rounded bg-gray-800 text-white"
            rows={3}
            required
          ></textarea>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block mb-2 text-sm">¿Mantiene el demandado un salario o trabaja como independiente?</label>
            <select
              name="salario"
              value={formData.salario}
              onChange={handleChange}
              className="w-full p-2 border border-gray-700 rounded bg-gray-800 text-white"
            >
              <option value="No">No</option>
              <option value="Sí">Sí</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block mb-2 text-sm">Mantiene hijos distintos a aquellos de la cual se está solicitando la pensión?</label>
            <select
              name="hijosDistintos"
              value={formData.hijosDistintos}
              onChange={handleChange}
              className="w-full p-2 border border-gray-700 rounded bg-gray-800 text-white"
            >
              <option value="No">No</option>
              <option value="Sí">Sí</option>
            </select>
          </div>
          <div>
            <label className="block mb-2 text-sm">¿Está trabajando actualmente o es independiente?</label>
            <select
              name="trabajando"
              value={formData.trabajando}
              onChange={handleChange}
              className="w-full p-2 border border-gray-700 rounded bg-gray-800 text-white"
            >
              <option value="No">No</option>
              <option value="Sí">Sí</option>
            </select>
          </div>
        </div>

        {/* Submit button */}
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

export default PensionAlimenticiaDemandado;
