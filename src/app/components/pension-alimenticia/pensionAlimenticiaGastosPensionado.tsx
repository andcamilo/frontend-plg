import React, { useState, useContext, FormEvent } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import AppStateContext from '@context/context';
import ClipLoader from 'react-spinners/ClipLoader'; // Import spinner

const PensionAlimenticiaGastosPensionado: React.FC = () => {
  const [formData, setFormData] = useState({
    mensualidadEscolar: 0,
    vestuario: 0,
    atencionMedica: 0,
    recreacion: 0,
    habitacion: 0,
    otros: 0,
    supermercado: 0,
    sumaTotal: 0,
  });

  const [isLoading, setIsLoading] = useState(false); // Add loading state

  const context = useContext(AppStateContext);

  if (!context) {
    throw new Error('AppStateContext must be used within an AppStateProvider');
  }

  const { store, setStore } = context;

  // Function to calculate the total sum of all fields
  const calculateTotal = (updatedFormData: any) => {
    const total = 
      updatedFormData.mensualidadEscolar +
      updatedFormData.vestuario +
      updatedFormData.atencionMedica +
      updatedFormData.recreacion +
      updatedFormData.habitacion +
      updatedFormData.otros +
      updatedFormData.supermercado;

    return total;
  };

  // Handle form input changes and automatically update sumaTotal
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const updatedFormData = {
      ...formData,
      [name]: Number(value),
    };

    // Update form data and calculate total
    setFormData({
      ...updatedFormData,
      sumaTotal: calculateTotal(updatedFormData),
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    const updatePayload = {
      updates: {
        gastosPensionado: {
          mensualidadEscolar: formData.mensualidadEscolar,
          vestuario: formData.vestuario,
          atencionMedica: formData.atencionMedica,
          recreacion: formData.recreacion,
          habitacion: formData.habitacion,
          otros: formData.otros,
          supermercado: formData.supermercado,
          sumaTotal: formData.sumaTotal,
        }
      },
      solicitud: store.solicitudId,
    };

    setIsLoading(true); // Set loading state to true before making the API request

    try {
      const response = await axios.patch(`/api/update-request`, updatePayload);

      if (response.status === 200 && response.data.status === 'success') {
        setStore((prevState) => ({
          ...prevState,
          archivosAdjuntos: true,
          currentPosition:6 
        }));

        Swal.fire({
          icon: 'success',
          title: 'Formulario Enviado',
          text: 'Información de gastos enviada correctamente.',
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
      <h2 className="text-2xl font-bold mb-4">Información sobre Gastos del Pensionado</h2>
      <p className="text-sm mb-4">
        En esta sección debes indicar los gastos mensuales aproximados que mantiene la persona que requiere la pensión. Si existe alguno que no se encuentre detallado, elige la opción otros y coloca el monto correspondiente a los gastos que no se encuentran en la descripción:
      </p>

      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block mb-2 text-sm">Mensualidad escolar</label>
            <input
              type="number"
              name="mensualidadEscolar"
              value={formData.mensualidadEscolar}
              onChange={handleChange}
              className="w-full p-2 border border-gray-700 rounded bg-gray-800 text-white"
            />
          </div>
          <div>
            <label className="block mb-2 text-sm">Vestuario</label>
            <input
              type="number"
              name="vestuario"
              value={formData.vestuario}
              onChange={handleChange}
              className="w-full p-2 border border-gray-700 rounded bg-gray-800 text-white"
            />
          </div>
          <div>
            <label className="block mb-2 text-sm">Atención médica</label>
            <input
              type="number"
              name="atencionMedica"
              value={formData.atencionMedica}
              onChange={handleChange}
              className="w-full p-2 border border-gray-700 rounded bg-gray-800 text-white"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block mb-2 text-sm">Recreación</label>
            <input
              type="number"
              name="recreacion"
              value={formData.recreacion}
              onChange={handleChange}
              className="w-full p-2 border border-gray-700 rounded bg-gray-800 text-white"
            />
          </div>
          <div>
            <label className="block mb-2 text-sm">Habitación (alquiler o hipoteca)</label>
            <input
              type="number"
              name="habitacion"
              value={formData.habitacion}
              onChange={handleChange}
              className="w-full p-2 border border-gray-700 rounded bg-gray-800 text-white"
            />
          </div>
          <div>
            <label className="block mb-2 text-sm">Otros</label>
            <input
              type="number"
              name="otros"
              value={formData.otros}
              onChange={handleChange}
              className="w-full p-2 border border-gray-700 rounded bg-gray-800 text-white"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block mb-2 text-sm">Supermercado</label>
            <input
              type="number"
              name="supermercado"
              value={formData.supermercado}
              onChange={handleChange}
              className="w-full p-2 border border-gray-700 rounded bg-gray-800 text-white"
            />
          </div>
          <div>
            <label className="block mb-2 text-sm">Suma total</label>
            <input
              type="number"
              name="sumaTotal"
              value={formData.sumaTotal}
              readOnly
              className="w-full p-2 border border-gray-700 rounded bg-gray-800 text-white"
            />
          </div>
        </div>

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

export default PensionAlimenticiaGastosPensionado;
