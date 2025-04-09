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
  const [invalidFields, setInvalidFields] = useState<{ [key: string]: boolean }>({});
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
    setInvalidFields((prev) => ({ ...prev, [name]: false }));
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

    let errores: { campo: string; mensaje: string }[] = [];

    // 🔹 Validación de campos en orden
    if (formData.mensualidadEscolar < 0) {
      errores.push({ campo: 'mensualidadEscolar', mensaje: 'Debe ingresar una mensualidad escolar válida.' });
    } else if (formData.vestuario < 0) {
      errores.push({ campo: 'vestuario', mensaje: 'Debe ingresar un monto válido para vestuario.' });
    } else if (formData.recreacion < 0) {
      errores.push({ campo: 'recreacion', mensaje: 'Debe ingresar un monto válido para recreación.' });
    } else if (formData.atencionMedica < 0) {
      errores.push({ campo: 'atencionMedica', mensaje: 'Debe ingresar un monto válido para atención médica.' });
    } else if (formData.medicamentos < 0) {
      errores.push({ campo: 'medicamentos', mensaje: 'Debe ingresar un monto válido para medicamentos.' });
    } else if (formData.habitacion < 0) {
      errores.push({ campo: 'habitacion', mensaje: 'Debe ingresar un monto válido para habitación (alquiler o hipoteca).' });
    } else if (formData.agua < 0) {
      errores.push({ campo: 'agua', mensaje: 'Debe ingresar un monto válido para la factura de agua.' });
    } else if (formData.luz < 0) {
      errores.push({ campo: 'luz', mensaje: 'Debe ingresar un monto válido para la factura de luz.' });
    } else if (formData.telefono < 0) {
      errores.push({ campo: 'telefono', mensaje: 'Debe ingresar un monto válido para la factura de teléfono.' });
    } else if (formData.matricula < 0) {
      errores.push({ campo: 'matricula', mensaje: 'Debe ingresar un monto válido para matrícula escolar.' });
    } else if (formData.cuotaPadres < 0) {
      errores.push({ campo: 'cuotaPadres', mensaje: 'Debe ingresar un monto válido para cuota de padres en educación.' });
    } else if (formData.uniformes < 0) {
      errores.push({ campo: 'uniformes', mensaje: 'Debe ingresar un monto válido para uniformes.' });
    } else if (formData.textosLibros < 0) {
      errores.push({ campo: 'textosLibros', mensaje: 'Debe ingresar un monto válido para textos y libros.' });
    } else if (formData.utiles < 0) {
      errores.push({ campo: 'utiles', mensaje: 'Debe ingresar un monto válido para útiles escolares.' });
    } else if (formData.transporte < 0) {
      errores.push({ campo: 'transporte', mensaje: 'Debe ingresar un monto válido para transporte.' });
    } else if (formData.meriendas < 0) {
      errores.push({ campo: 'meriendas', mensaje: 'Debe ingresar un monto válido para meriendas.' });
    } else if (formData.supermercado < 0) {
      errores.push({ campo: 'supermercado', mensaje: 'Debe ingresar un monto válido para supermercado.' });
    } else if (formData.otros < 0) {
      errores.push({ campo: 'otros', mensaje: 'Debe ingresar un monto válido para otros gastos.' });
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
          position: "top-end",
          icon: "success",
          title: "Información de gastos actualizada correctamente.",
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
      setIsLoading(false); // Set loading state to false after the request is complete
    }
  };

  const [showModal, setShowModal] = useState(false); // Estado para manejar el modal

  const toggleModal = () => {
    setShowModal(!showModal); // Alterna el estado del modal
  };

  return (
    <div className="w-full h-full p-8 overflow-y-scroll scrollbar-thin bg-[#070707] text-white">
      <h1 className="text-white text-3xl font-bold flex items-center">
        Información sobre Gastos del Pensionado
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
              <h2 className="text-white text-xl">Información sobre Gastos del Pensionado</h2>
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
                src="https://www.youtube.com/embed/zBMiqdtpuyU"
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
