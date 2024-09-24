import React, { useState, useContext, useEffect } from 'react';
import Swal from 'sweetalert2'; 
import AppStateContext from '@context/context'; // Import the context
import ClipLoader from 'react-spinners/ClipLoader'; // Import spinner
import { updateRequest } from '@api/update-request'; // Import the refactored updateRequest function

const PensionAlimenticiaSolicitud: React.FC = () => {
  const context = useContext(AppStateContext);

  if (!context) {
    throw new Error('AppStateContext must be used within an AppStateProvider');
  }

  const { store, setStore } = context;

  const [formData, setFormData] = useState({
    pensionType: '',
    pensionAmount: 0,
    receiveSupport: 'No',
    pensionCategory: 'Hijos menores de edad',
  });

  const [isLoading, setIsLoading] = useState(false); // Add loading state

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!store.solicitudId) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se ha encontrado el ID de la solicitud. Intente nuevamente.',
      });
      return;
    }

    setIsLoading(true); // Set loading to true when the request starts

    try {
      // Create the payload structure to match the cURL example
      const updatePayload = {
        solicitud: {
          tipoPension: formData.pensionType,
          cantidadPension: formData.pensionAmount,
          recibeApoyo: formData.receiveSupport, // Matches the structure from your cURL
          categoriaPension: formData.pensionCategory,
        },
      };
      console.log("🚀 ~ handleSubmit ~ updatePayload:", updatePayload);

      // Use the updateRequest function
      const response = await updateRequest(store.solicitudId, updatePayload);

      if (response.status === 'success') {
        setStore((prevState) => ({
          ...prevState,
          demandante: true,
          currentPosition: 3, // Move to the next step in the process
        }));

        Swal.fire({
          icon: 'success',
          title: 'Formulario Enviado',
          text: 'Formulario enviado correctamente. Se habilitó la sección de Demandante.',
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
      setIsLoading(false); // Set loading to false after the request is complete
    }
  };

  // Log when 'demandante' changes in the context
  useEffect(() => {
    console.log("🚀 ~ demandante:", store.demandante);
  }, [store.demandante]);

  return (
    <div className="w-full h-full p-8 overflow-y-scroll scrollbar-thin bg-[#070707] text-white">
      <h1 className="text-3xl font-bold">Información de la Solicitud</h1>
      <p className="mt-4">
        En esta sección debes indicar si deseas realizar la solicitud de pensión alimenticia por primera vez, solicitar un aumento,
        rebaja o suspensión en caso que el pensionado sea mayor de edad.
      </p>
      <p className="mt-4">
        <strong>Nota:</strong> Tenga en cuenta que la Pensión Alimenticia corresponde al 50% de cada una de las partes. Si usted desea 
        que el demandado aporte 500$, debe solicitar la pensión por al menos 1000$.
      </p>
      
      {/* Pension Type Selection */}
      <div className="mt-6">
        <label className="block font-bold">Seleccione la opción que más le convenga:</label>
        <div className="mt-2 space-y-2">
          {['Primera vez', 'Aumento', 'Rebaja o Suspensión', 'Desacato'].map(option => (
            <label key={option} className="block">
              <input
                type="radio"
                name="pensionType"
                value={option}
                onChange={handleChange}
                checked={formData.pensionType === option}
                className="form-radio"
              />
              <span className="ml-2">
                {option === 'Primera vez' 
                  ? 'Estoy solicitando Pensión Alimenticia por PRIMERA VEZ' 
                  : `Quiero solicitar ${option}`}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Pension Amount Input */}
      <div className="mt-6">
        <label className="block font-bold">¿Cuánto desea obtener de Pensión Alimenticia?</label>
        <input
          type="number"
          name="pensionAmount"
          value={formData.pensionAmount}
          onChange={handleChange}
          className="p-4 mt-2 w-full bg-gray-800 text-white rounded-lg"
          placeholder="Introduzca el monto"
        />
      </div>

      {/* Receive Support Dropdown */}
      <div className="mt-6">
        <label className="block font-bold">¿Recibe usted algún aporte por parte del demandado?</label>
        <select
          name="receiveSupport"
          value={formData.receiveSupport}
          onChange={handleChange}
          className="p-4 mt-2 w-full bg-gray-800 text-white rounded-lg"
        >
          <option value="No">No</option>
          <option value="Sí">Sí</option>
        </select>
      </div>

      {/* Pension Category Dropdown */}
      <div className="mt-6">
        <label className="block font-bold">¿Qué tipo de pensión requiere solicitar?</label>
        <select
          name="pensionCategory"
          value={formData.pensionCategory}
          onChange={handleChange}
          className="p-4 mt-2 w-full bg-gray-800 text-white rounded-lg"
        >
          <option value="Hijos menores de edad">Hijos menores de edad</option>
          <option value="Mayores de edad hasta 25 años con estudios en curso">Mayores de edad hasta 25 años con estudios en curso</option>
          <option value="Mujer embarazada (ayuda prenatal)">Mujer embarazada (ayuda prenatal)</option>
          <option value="Personas con discapacidad">Personas con discapacidad</option>
          <option value="En condición de Cónyuge">En condición de Cónyuge</option>
          <option value="Padres o ascendientes de grado más próximo (abuelos)">Padres o ascendientes de grado más próximo (abuelos)</option>
          <option value="Hermanos">Hermanos</option>
        </select>
      </div>

      {/* Requirements Section */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold">Requisitos:</h2>
        <p className="mt-4">Por favor prepare los siguientes documentos e información para gestionar la solicitud de pensión de alimentos de menores de edad.</p>
        <ul className="list-disc list-inside mt-4">
          <li>Copia de la cédula o documento de identidad de la persona solicitante</li>
          <li>Certificado(s) de Nacimiento de la(s) persona(s) que va(n) a recibir o reciben la pensión alimenticia</li>
        </ul>
      </div>

      {/* Cost Information */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold">Costo del trámite:</h2>
        <p className="mt-4">US$675.00 incluyendo gastos. Método de pago: US$337.50 al momento de la solicitud y US$337.50 debe ser cancelado antes de la audiencia.</p>
      </div>

      <button
        className="bg-profile text-white w-full py-3 rounded-lg mt-8"
        onClick={handleSubmit}
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
  );
};

export default PensionAlimenticiaSolicitud;
