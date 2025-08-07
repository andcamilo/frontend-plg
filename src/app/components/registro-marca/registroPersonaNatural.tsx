import React, { useState, useContext, FormEvent, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import AppStateContext from '@context/context';
import ClipLoader from 'react-spinners/ClipLoader';
import { Country, State, City } from 'country-state-city';
import { useFetchSolicitud } from '@utils/fetchCurrentRequest';
import get from 'lodash/get';
import CountrySelect from '@components/CountrySelect';
import PersonaNaturalInfo from '@components/registro-marca/PersonaNaturalInfo'
interface SelectOption {
  value: string;
  label: string;
}

const RegistroPersonaNatural: React.FC = () => {
  const [formData, setFormData] = useState({
    nombreCompleto: '',
    cedula: '',
    nacionalidad: { value: 'PA', label: 'Panamá' }, // Default value 
    paisNacimiento: { value: 'PA', label: 'Panamá' },
    direccion: '',
    paisResidencia:{ value: 'PA', label: 'Panamá' },
    telefono: '',
    telefonoCodigo: 'PA',
    email: '',
    direccionPanama:'',
    ocupacion: '',
    archivoPasaporte: '',
  });

  const [paises, setPaises] = useState<SelectOption[]>([]);
  const [provincias, setProvincias] = useState<SelectOption[]>([]);
  const [corregimientos, setCorregimientos] = useState<SelectOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
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
      const demandado = get(store.request, 'demandado', {});

      if (demandado && Object.keys(demandado).length > 0) {
        setFormData((prevFormData) => ({
          ...prevFormData,
          ...demandado,
        }));
      }
    }
  }, [store.request]);

  // Fetch countries on mount
  useEffect(() => {
    const countries = Country.getAllCountries();
    setPaises(countries.map(country => ({ value: country.isoCode, label: country.name })));
  }, []);

  // Fetch provinces when country changes
  useEffect(() => {
    if (formData.nacionalidad.value) {
      const states = State.getStatesOfCountry(formData.nacionalidad.value);
      setProvincias(states.map(state => ({ value: state.isoCode, label: state.name })));
    }
  }, [formData.nacionalidad]);

  useEffect(() => {
    if (formData.paisNacimiento.value) {
      const states = State.getStatesOfCountry(formData.paisNacimiento.value);
      setProvincias(states.map(state => ({ value: state.isoCode, label: state.name })));
    }
  }, [formData.paisNacimiento]);

  // Handle form changes for input and textarea fields
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value, // Only update the value for input fields
    }));
    setInvalidFields((prev) => ({ ...prev, [name]: false }));
  };

  const handleSelectCountryCodeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Handle form changes for select fields
  const handleSelectChange = (name: string, selectedOption: SelectOption | null) => {
    setFormData((prevData) => ({
      ...prevData,
      [name]: selectedOption ? { value: selectedOption.value, label: selectedOption.label } : { value: '', label: '' },
    }));
    setInvalidFields((prev) => ({ ...prev, [name]: false }));
  };

  const removeCountryCode = (phone: string, countryCode: string = "507") => {
    // Check if the phone number starts with the country code
    if (phone.startsWith(countryCode)) {
      return phone.slice(countryCode.length); // Remove the country code for display
    }
    return phone;
  };

  const handleCountryChange = (name: string, value: string) => {
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    let errores: { campo: string; mensaje: string }[] = [];

    // 🔹 Validación de campos en orden
    if (!formData.nombreCompleto.trim()) {
      errores.push({ campo: 'nombreCompleto', mensaje: 'Debe introducir su nombre completo.' });
    } else if (!formData.cedula.trim()) {
      errores.push({ campo: 'cedula', mensaje: 'Debe ingresar su cédula.' });
    } else if (!formData.direccion) {
      errores.push({ campo: 'direccion', mensaje: 'Debe introducir la dirección.' });
    } else if (!formData.direccionPanama.trim()) {
      errores.push({ campo: 'direccionPanama', mensaje: 'Debe ingresar los detalles de su dirección en Panamá.' });
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

    if (errores.length > 0) {
      const primerError = errores[0]; // 🚀 Tomamos solo el primer error formData.paisDondeVive.value !== 'PA'

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

    if (!formData.telefono) {
      errores.push({ campo: 'telefono', mensaje: 'Debe introducir el número de teléfono.' });
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
    setIsLoading(true);

    try {
      const updatePayload = {
        solicitudId: store.solicitudId,
        PersonaNatural: {
          nombreCompleto: formData.nombreCompleto,
          cedula: formData.cedula,
          nacionalidad: formData.nacionalidad,
          paisNacimiento: formData.paisNacimiento,
          direccion: formData.direccion,
          paisResidencia: formData.paisResidencia,
          email:formData.email,
          telefono: `${formData.telefonoCodigo}${formData.telefono}` || '',
          direccionPanama:formData.direccionPanama,
          ocupacion:formData.ocupacion,
          archivoPasaporte:formData.archivoPasaporte
        },
      };

      const response = await axios.patch('/api/update-request', updatePayload);

      if (response.status === 200) {
        setStore((prevState) => ({
          ...prevState,
          gastosPensionado: true,
          currentPosition: 5,
        }));

        Swal.fire({
          position: "top-end",
          icon: "success",
          title: "Información del demandado actualizada correctamente.",
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
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Hubo un problema al actualizar la solicitud. Por favor, inténtelo de nuevo más tarde.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full h-full p-8 overflow-y-scroll scrollbar-thin bg-[#070707] text-white">
      <PersonaNaturalInfo />
      {/* Form Section */}
      <form className="space-y-6 mt-5" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block mb-2 text-sm">Nombre completo:</label>
            <input
              type="text"
              name="nombreCompleto"
              value={formData.nombreCompleto}
              onChange={handleChange}
              className={`w-full p-2 border ${invalidFields.nombreCompleto ? 'border-red-500' : 'border-gray-700'} rounded bg-gray-800 text-white`}
              disabled={store.request.status >= 10 && store.rol < 20}
            />
          </div>

            {/* Cedula and Nationality */}
          <div>
            <label className="block mb-2 text-sm">Cédula o pasaporte:</label>
            <input
              type="text"
              name="cedula"
              value={formData.cedula}
              onChange={handleChange}
              className={`w-full p-2 border ${invalidFields.cedula ? 'border-red-500' : 'border-gray-700'} rounded bg-gray-800 text-white`}
              disabled={store.request.status >= 10 && store.rol < 20}
            />
          </div>
          <div>
            <label className="block mb-2 text-sm">Nacionalidad:</label>
            <select
              name="nacionalidad"
              value={formData.nacionalidad.value}
              onChange={(e) => handleSelectChange('nacionalidad', { value: e.target.value, label: e.target.options[e.target.selectedIndex].text })}
              className="w-full p-2 border border-gray-700 rounded bg-gray-800 text-white"
              disabled={store.request.status >= 10 && store.rol < 20}
            >
              {paises.map((pais) => (
                <option key={pais.value} value={pais.value}>
                  {pais.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-2 text-sm">Dirección:</label>
            <input
              name="direccion"
              type="text"
              value={formData.direccion}
              onChange={handleChange}
              className="w-full p-2 border border-gray-700 rounded bg-gray-800 text-white"
            />
          </div>
          
          <div>
            <label className="block mb-2 text-sm">País de Residencia:</label>
            <select
              name="paisResidencia"
              value={formData.paisResidencia.value}
              onChange={(e) => handleSelectChange('paisResidencia', { value: e.target.value, label: e.target.options[e.target.selectedIndex].text })}
              className="w-full p-2 border border-gray-700 rounded bg-gray-800 text-white"
              disabled={store.request.status >= 10 && store.rol < 20}
            >
              {paises.map((pais) => (
                <option key={pais.value} value={pais.value}>
                  {pais.label}
                </option>
              ))}
            </select>
          </div>
          
          <div>
                <label className="block mb-2 text-sm">Ocupación:</label>
                <input
                  type="text"
                  name="ocupacion"
                  value={formData.ocupacion}
                  onChange={handleChange}
                  className={`w-full p-2 border ${invalidFields.ocupacion ? 'border-red-500' : 'border-gray-700'} rounded bg-gray-800 text-white`}
                  disabled={store.request.status >= 10 && store.rol < 20}
                />
              </div>     

            <div className="w-full">
            <label className="block mb-2 text-sm">Número de teléfono</label>
            <div className="flex gap-2">
              <CountrySelect
                name="telefonoCodigo"
                value={formData.telefonoCodigo}
                onChange={(value) => handleCountryChange('telefonoCodigo', value)}
                isDisabled={store.request.status >= 10 && store.rol < 20}
                className="w-contain"
              />
              <input
                type="text"
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                className={`w-full p-2 border ${invalidFields.telefono ? 'border-red-500' : 'border-gray-700'} rounded bg-gray-800 text-white`}
                placeholder="Número de teléfono"
                disabled={store.request.status >= 10 && store.rol < 20}
              />
            </div>
          </div>
        
        <div>
                <label className="block mb-2 text-sm">Email:</label>
                <input
                  type="text"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full p-2 border ${invalidFields.email ? 'border-red-500' : 'border-gray-700'} rounded bg-gray-800 text-white`}
                  disabled={store.request.status >= 10 && store.rol < 20}
                />
              </div> 

          <div>
            <label className="block mb-2 text-sm">Dirección de Panamá:</label>
            <input
              type="text"
              name="direccionPanama"
              value={formData.direccionPanama}
              onChange={handleChange}
              className={`w-full p-2 border ${invalidFields.direccionPanama ? 'border-red-500' : 'border-gray-700'} rounded bg-gray-800 text-white`}
              disabled={store.request.status >= 10 && store.rol < 20}
            />
            <p className="text-xs text-gray-400 mt-1">
              * Obligatorio colocar una dirección en Panamá para efecto de notificaciones.
            </p>
        </div>

        <div>
  <label className="block mb-2 text-sm">Adjuntar copia de pasaporte o cédula <span className="text-red-500">*</span></label>
  <input
    type="file"
    accept=".pdf,.jpg,.jpeg,.png"
    onChange={(e) => {
      const file = e.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setFormData((prev) => ({
            ...prev,
            archivoPasaporte: reader.result as string, // Guarda como base64
          }));
        };
        reader.readAsDataURL(file); // convierte a base64
      }
    }}
    className="w-full p-2 border border-gray-700 rounded bg-gray-800 text-white"
    disabled={store.request.status >= 10 && store.rol < 20}
  />
  {formData.archivoPasaporte && (
    <p className="text-xs text-green-400 mt-1">Archivo adjuntado correctamente.</p>
  )}
</div>

        <div className="mt-6">

          {(!store.request.status || store.request.status < 10 || (store.request.status >= 10 && store.rol > 20)) && (
            <>
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
                    currentPosition: 5,
                  }));
                }}
              >
                Continuar
              </button>
            </>
          )}
        </div>
      </div>
      </form>
    </div>
  );
};

export default RegistroPersonaNatural;
