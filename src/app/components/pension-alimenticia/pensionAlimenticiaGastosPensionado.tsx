import React, { useState, useContext, FormEvent, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import AppStateContext from '@context/context';
import ClipLoader from 'react-spinners/ClipLoader'; // Import spinner
import { useFetchSolicitud } from '@utils/fetchCurrentRequest';
import get from 'lodash/get';

const PensionAlimenticiaGastosPensionado: React.FC = () => {
  const [formData, setFormData] = useState({
    mensualidadEscolar: 0,
    vestuario: 0,
    atencionMedica: 0,
    medicamentos: 0,
    recreacion: 0,
    habitacion: 0,
    agua: 0,
    luz: 0,
    telefono: 0,
    matricula: 0,
    cuotaPadres: 0,
    uniformes: 0,
    textosLibros: 0,
    utiles: 0,
    transporte: 0,
    meriendas: 0,
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
  const { fetchSolicitud } = useFetchSolicitud(store.solicitudId);


  useEffect(() => {
    if (store.solicitudId) {
      fetchSolicitud();
    }
  }, [store.solicitudId]);

  useEffect(() => {
    if (store.request) {
      console.log("🚀 ~ Updated store.request:", store.request);
      const gastosPensionado = get(store.request, 'gastosPensionado', {});

      if (gastosPensionado && Object.keys(gastosPensionado).length > 0) {
        setFormData((prevFormData) => ({
          ...prevFormData,
          ...gastosPensionado,
        }));
      }
    }
  }, [store.request]);

  // Function to calculate the total sum of all fields
  const calculateTotal = (updatedFormData: any) => {
    const total =
      updatedFormData.mensualidadEscolar +
      updatedFormData.vestuario +
      updatedFormData.atencionMedica +
      updatedFormData.medicamentos +
      updatedFormData.recreacion +
      updatedFormData.habitacion +
      updatedFormData.otros +
      updatedFormData.agua +
      updatedFormData.luz +
      updatedFormData.telefono +
      updatedFormData.matricula +
      updatedFormData.cuotaPadres +
      updatedFormData.uniformes +
      updatedFormData.textosLibros +
      updatedFormData.utiles +
      updatedFormData.transporte +
      updatedFormData.meriendas +
      updatedFormData.supermercado;


    return total;
  };

  // Handle form input changes and automatically update sumaTotal
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const numericValue = value === "" ? 0 : Number(value); // Si el valor es vacío, poner 0

    setFormData((prevFormData) => {
      const updatedFormData = { ...prevFormData, [name]: numericValue };

      return {
        ...updatedFormData,
        sumaTotal: calculateTotal(updatedFormData), // Recalcular total automáticamente
      };
    });
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    if (e.target.value === "0") {
      e.target.value = ""; // Borra el 0 cuando el usuario haga clic en el campo
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    if (e.target.value === "") {
      e.target.value = "0"; // Si el usuario deja el campo vacío, vuelve a poner 0
      setFormData((prevFormData) => ({
        ...prevFormData,
        [e.target.name]: 0, // Asegurar que el estado no quede vacío
        sumaTotal: calculateTotal({ ...prevFormData, [e.target.name]: 0 }),
      }));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    setIsLoading(true); // Set loading state to true before making the API request

    try {
      const updatePayload = {
        solicitudId: store.solicitudId,
        gastosPensionado: {
          mensualidadEscolar: formData.mensualidadEscolar,
          vestuario: formData.vestuario,
          atencionMedica: formData.atencionMedica,
          medicamentos: formData.medicamentos,
          recreacion: formData.recreacion,
          habitacion: formData.habitacion,
          otros: formData.otros,
          agua: formData.agua,
          luz: formData.luz,
          telefono: formData.telefono,
          matricula: formData.matricula,
          cuotaPadres: formData.cuotaPadres,
          uniformes: formData.uniformes,
          textosLibros: formData.textosLibros,
          utiles: formData.utiles,
          transporte: formData.transporte,
          meriendas: formData.meriendas,
          supermercado: formData.supermercado,
          sumaTotal: formData.sumaTotal,
        },
      };

      console.log("🚀 ~ handleSubmit ~ updatePayload:", updatePayload);

      // Make request to Next.js API route (which internally calls AWS Lambda)
      const response = await axios.patch('/api/update-request', updatePayload);

      if (response.status === 200) {
        setStore((prevState) => ({
          ...prevState,
          archivosAdjuntos: true,
          currentPosition: 6
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
    <div className="w-full h-full p-8 overflow-y-scroll scrollbar-thin bg-[#070707] text-white">
      <h2 className="text-3xl font-bold mb-4">Información sobre Gastos del Pensionado</h2>
      <p className="mb-4">
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
              onFocus={handleFocus}
              onBlur={handleBlur}
              className="w-full p-2 border border-gray-700 rounded bg-gray-800 text-white"
              disabled={store.request.status >= 10 && store.rol < 20}
            />
          </div>
          <div>
            <label className="block mb-2 text-sm">Vestuario</label>
            <input
              type="number"
              name="vestuario"
              value={formData.vestuario}
              onChange={handleChange}
              onFocus={handleFocus}
              onBlur={handleBlur}
              className="w-full p-2 border border-gray-700 rounded bg-gray-800 text-white"
              disabled={store.request.status >= 10 && store.rol < 20}
            />
          </div>
          <div>
            <label className="block mb-2 text-sm">Recreación</label>
            <input
              type="number"
              name="recreacion"
              value={formData.recreacion}
              onChange={handleChange}
              onFocus={handleFocus}
              onBlur={handleBlur}
              className="w-full p-2 border border-gray-700 rounded bg-gray-800 text-white"
              disabled={store.request.status >= 10 && store.rol < 20}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block mb-2 text-sm">Atención médica</label>
            <input
              type="number"
              name="atencionMedica"
              value={formData.atencionMedica}
              onChange={handleChange}
              onFocus={handleFocus}
              onBlur={handleBlur}
              className="w-full p-2 border border-gray-700 rounded bg-gray-800 text-white"
              disabled={store.request.status >= 10 && store.rol < 20}
            />
          </div>
          <div>
            <label className="block mb-2 text-sm">Medicina</label>
            <input
              type="number"
              name="medicamentos"
              value={formData.medicamentos}
              onChange={handleChange}
              onFocus={handleFocus}
              onBlur={handleBlur}
              className="w-full p-2 border border-gray-700 rounded bg-gray-800 text-white"
              disabled={store.request.status >= 10 && store.rol < 20}
            />
          </div>
          <div>
            <label className="block mb-2 text-sm">Habitación (alquiler o hipoteca)</label>
            <input
              type="number"
              name="habitacion"
              value={formData.habitacion}
              onChange={handleChange}
              onFocus={handleFocus}
              onBlur={handleBlur}
              className="w-full p-2 border border-gray-700 rounded bg-gray-800 text-white"
              disabled={store.request.status >= 10 && store.rol < 20}
            />
          </div>

        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block mb-2 text-sm">Factura Agua</label>
            <input
              type="number"
              name="agua"
              value={formData.agua}
              onChange={handleChange}
              onFocus={handleFocus}
              onBlur={handleBlur}
              className="w-full p-2 border border-gray-700 rounded bg-gray-800 text-white"
              disabled={store.request.status >= 10 && store.rol < 20}
            />
          </div>
          <div>
            <label className="block mb-2 text-sm">Factura Luz</label>
            <input
              type="number"
              name="luz"
              value={formData.luz}
              onChange={handleChange}
              onFocus={handleFocus}
              onBlur={handleBlur}
              className="w-full p-2 border border-gray-700 rounded bg-gray-800 text-white"
              disabled={store.request.status >= 10 && store.rol < 20}
            />
          </div>
          <div>
            <label className="block mb-2 text-sm">Factura Teléfono</label>
            <input
              type="number"
              name="telefono"
              value={formData.telefono}
              onChange={handleChange}
              onFocus={handleFocus}
              onBlur={handleBlur}
              className="w-full p-2 border border-gray-700 rounded bg-gray-800 text-white"
              disabled={store.request.status >= 10 && store.rol < 20}
            />
          </div>

        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block mb-2 text-sm">Matrícula</label>
            <input
              type="number"
              name="matricula"
              value={formData.matricula}
              onChange={handleChange}
              onFocus={handleFocus}
              onBlur={handleBlur}
              className="w-full p-2 border border-gray-700 rounded bg-gray-800 text-white"
              disabled={store.request.status >= 10 && store.rol < 20}
            />
          </div>
          <div>
            <label className="block mb-2 text-sm">Cuota Padres Educación</label>
            <input
              type="number"
              name="cuotaPadres"
              value={formData.cuotaPadres}
              onChange={handleChange}
              onFocus={handleFocus}
              onBlur={handleBlur}
              className="w-full p-2 border border-gray-700 rounded bg-gray-800 text-white"
              disabled={store.request.status >= 10 && store.rol < 20}
            />
          </div>
          <div>
            <label className="block mb-2 text-sm">Uniformes</label>
            <input
              type="number"
              name="uniformes"
              value={formData.uniformes}
              onChange={handleChange}
              onFocus={handleFocus}
              onBlur={handleBlur}
              className="w-full p-2 border border-gray-700 rounded bg-gray-800 text-white"
              disabled={store.request.status >= 10 && store.rol < 20}
            />
          </div>

        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block mb-2 text-sm">Textos y Libros</label>
            <input
              type="number"
              name="textosLibros"
              value={formData.textosLibros}
              onChange={handleChange}
              onFocus={handleFocus}
              onBlur={handleBlur}
              className="w-full p-2 border border-gray-700 rounded bg-gray-800 text-white"
              disabled={store.request.status >= 10 && store.rol < 20}
            />
          </div>
          <div>
            <label className="block mb-2 text-sm">Útiles </label>
            <input
              type="number"
              name="utiles"
              value={formData.utiles}
              onChange={handleChange}
              onFocus={handleFocus}
              onBlur={handleBlur}
              className="w-full p-2 border border-gray-700 rounded bg-gray-800 text-white"
              disabled={store.request.status >= 10 && store.rol < 20}
            />
          </div>
          <div>
            <label className="block mb-2 text-sm">Transporte</label>
            <input
              type="number"
              name="transporte"
              value={formData.transporte}
              onChange={handleChange}
              onFocus={handleFocus}
              onBlur={handleBlur}
              className="w-full p-2 border border-gray-700 rounded bg-gray-800 text-white"
              disabled={store.request.status >= 10 && store.rol < 20}
            />
          </div>

        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block mb-2 text-sm">Meriendas</label>
            <input
              type="number"
              name="meriendas"
              value={formData.meriendas}
              onChange={handleChange}
              onFocus={handleFocus}
              onBlur={handleBlur}
              className="w-full p-2 border border-gray-700 rounded bg-gray-800 text-white"
              disabled={store.request.status >= 10 && store.rol < 20}
            />
          </div>
          <div>
            <label className="block mb-2 text-sm">Supermercado</label>
            <input
              type="number"
              name="supermercado"
              value={formData.supermercado}
              onChange={handleChange}
              onFocus={handleFocus}
              onBlur={handleBlur}
              className="w-full p-2 border border-gray-700 rounded bg-gray-800 text-white"
              disabled={store.request.status >= 10 && store.rol < 20}
            />
          </div>
          <div>
            <label className="block mb-2 text-sm">Otros</label>
            <input
              type="number"
              name="otros"
              value={formData.otros}
              onChange={handleChange}
              onFocus={handleFocus}
              onBlur={handleBlur}
              className="w-full p-2 border border-gray-700 rounded bg-gray-800 text-white"
              disabled={store.request.status >= 10 && store.rol < 20}
            />
          </div>

        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block mb-2 text-sm">Suma total</label>
            <input
              type="number"
              name="sumaTotal"
              value={formData.sumaTotal}
              readOnly
              className="w-full p-2 border border-gray-700 rounded bg-gray-800 text-white"
              disabled={store.request.status >= 10 && store.rol < 20}
            />
          </div>
        </div>

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
                  'Guardar y continuar'
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
                    currentPosition: 6,
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

export default PensionAlimenticiaGastosPensionado;
