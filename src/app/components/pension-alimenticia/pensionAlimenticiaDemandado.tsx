import React, { useState, useContext, FormEvent, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import AppStateContext from '@context/context';
import ClipLoader from 'react-spinners/ClipLoader';
import { Country, State, City } from 'country-state-city';
import DemandadoInfo from './DemandadoInfo'
import { useFetchSolicitud } from '@utils/fetchCurrentRequest';
import get from 'lodash/get';
import CountrySelect from '@components/CountrySelect';

interface SelectOption {
  value: string;
  label: string;
}

const PensionAlimenticiaDemandado: React.FC = () => {
  const [formData, setFormData] = useState({
    nombreCompleto: '',
    estadoCivil: { value: 'Soltero', label: 'Soltero' },
    cedula: '',
    nacionalidad: { value: 'PA', label: 'Panamá' }, // Default value 
    paisDondeVive: { value: 'PA', label: 'Panamá' },
    direccionCasa: '',
    detalleDireccionCasa: '',
    telefono: '',
    telefonoCodigo: 'PA',
    pais: { value: 'PA', label: 'Panamá' }, // Default value
    provincia: { value: '', label: '' }, // Province
    corregimiento: { value: '', label: '' }, // City
    provincia2: '',
    corregimiento2: '',
    trabajando: { value: '', label: '' },
    ocupacion: '',
    ingresosTrabajo: '',
    direccionTrabajo: '',
    detalleDireccionTrabajo: '',
    salario: 'No',
    hijosDistintos: 'No',
  });

  const [paises, setPaises] = useState<SelectOption[]>([]);
  const [provincias, setProvincias] = useState<SelectOption[]>([]);
  const [corregimientos, setCorregimientos] = useState<SelectOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [invalidFields, setInvalidFields] = useState<{ [key: string]: boolean }>({});

  const mantieneIngresosOptions: SelectOption[] = [
    { value: 'no', label: 'No' },
    { value: 'si', label: 'Sí' },
  ];

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
      setCorregimientos([]); // Clear cities when country changes
    }
  }, [formData.nacionalidad]);

  useEffect(() => {
    if (formData.paisDondeVive.value) {
      const states = State.getStatesOfCountry(formData.paisDondeVive.value);
      setProvincias(states.map(state => ({ value: state.isoCode, label: state.name })));
      setCorregimientos([]); // Clear cities when country changes
    }
  }, [formData.paisDondeVive]);

  // Fetch cities when province changes
  useEffect(() => {
    if (formData.provincia.value) {
      const cities = City.getCitiesOfState(formData.paisDondeVive.value, formData.provincia.value);
      setCorregimientos(cities.map(city => ({ value: city.name, label: city.name })));
    }
  }, [formData.provincia, formData.paisDondeVive]);

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
    } else if (!formData.direccionCasa) {
      errores.push({ campo: 'direccionCasa', mensaje: 'Debe introducir la dirección de la vivienda.' });
    } else if (!formData.detalleDireccionCasa.trim()) {
      errores.push({ campo: 'detalleDireccionCasa', mensaje: 'Debe ingresar los detalles de su dirección.' });
    } else if (formData.paisDondeVive.value !== 'PA') {
      if (!formData.provincia2) {
        errores.push({ campo: 'provincia2', mensaje: 'Debe introducir su ocupación en el trabajo.' });
      } else if (!formData.corregimiento2) {
        errores.push({ campo: 'corregimiento2', mensaje: 'Debe introducir los ingresos que recibe por su trabajo.' });
      } 
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

    if (formData.trabajando.value === "si") {
      if (!formData.ocupacion) {
        errores.push({ campo: 'ocupacion', mensaje: 'Debe introducir su ocupación en el trabajo.' });
      } else if (!formData.ingresosTrabajo) {
        errores.push({ campo: 'ingresosTrabajo', mensaje: 'Debe introducir los ingresos que recibe por su trabajo.' });
      } else if (!formData.direccionTrabajo) {
        errores.push({ campo: 'direccionTrabajo', mensaje: 'Debe introducir la dirección de su trabajo.' });
      } else if (!formData.detalleDireccionTrabajo) {
        errores.push({ campo: 'detalleDireccionTrabajo', mensaje: 'Debe introducir los detalles de la dirección.' });
      }
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
        demandado: {
          nombreCompleto: formData.nombreCompleto,
          estadoCivil: formData.estadoCivil,
          cedula: formData.cedula,
          nacionalidad: formData.nacionalidad,
          paisDondeVive: formData.paisDondeVive,
          direccionCasa: formData.direccionCasa,
          detalleDireccionCasa: formData.detalleDireccionCasa,
          pais: formData.pais,
          telefono: `${formData.telefonoCodigo}${formData.telefono}` || '',
          provincia: formData.provincia,
          corregimiento: formData.corregimiento,
          provincia2: formData.provincia2,
          corregimiento2: formData.corregimiento2,
          trabajando: formData.trabajando,
          ocupacion: formData.ocupacion,
          ingresosTrabajo: formData.ingresosTrabajo,
          detalleDireccionTrabajo: formData.detalleDireccionTrabajo,
          direccionTrabajo: formData.direccionTrabajo,
          salario: formData.salario,
          hijosDistintos: formData.hijosDistintos,

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
      <DemandadoInfo />
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
          <div>
            <label className="block mb-2 text-sm">Estado civil:</label>
            <select
              name="estadoCivil"
              value={formData.estadoCivil.value}
              onChange={(e) => handleSelectChange('estadoCivil', { value: e.target.value, label: e.target.options[e.target.selectedIndex].text })}
              className="w-full p-2 border border-gray-700 rounded bg-gray-800 text-white"
            >
              <option value="Soltero">Soltero</option>
              <option value="Casado">Casado</option>
            </select>
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
            <label className="block mb-2 text-sm">Dirección vivienda:</label>
            <input
              type="text"
              name="direccionCasa"
              value={formData.direccionCasa}
              onChange={handleChange}
              className={`w-full p-2 border ${invalidFields.direccionCasa ? 'border-red-500' : 'border-gray-700'} rounded bg-gray-800 text-white`}
              disabled={store.request.status >= 10 && store.rol < 20}
            />
          </div>
          <div>
            <label className="block mb-2 text-sm">Detalle Dirección vivienda:</label>
            <input
              type="text"
              name="detalleDireccionCasa"
              value={formData.detalleDireccionCasa}
              onChange={handleChange}
              className={`w-full p-2 border ${invalidFields.detalleDireccionCasa ? 'border-red-500' : 'border-gray-700'} rounded bg-gray-800 text-white`}
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
            <label className="block mb-2 text-sm">País donde vive</label>
            <select
              name="paisDondeVive"
              value={formData.paisDondeVive.value}
              onChange={(e) => handleSelectChange('paisDondeVive', { value: e.target.value, label: e.target.options[e.target.selectedIndex].text })}
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
          {formData.paisDondeVive.value === 'PA' && (
            <>
              <div>
                <label className="block mb-2 text-sm">Provincia:</label>
                <select
                  name="provincia"
                  value={formData.provincia.value}
                  onChange={(e) => handleSelectChange('provincia', { value: e.target.value, label: e.target.options[e.target.selectedIndex].text })}
                  className="w-full p-2 border border-gray-700 rounded bg-gray-800 text-white"
                  disabled={store.request.status >= 10 && store.rol < 20}
                >
                  {provincias.map((provincia) => (
                    <option key={provincia.value} value={provincia.value}>
                      {provincia.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block mb-2 text-sm">Corregimiento:</label>
                <select
                  name="corregimiento"
                  value={formData.corregimiento.value}
                  onChange={(e) => handleSelectChange('corregimiento', { value: e.target.value, label: e.target.options[e.target.selectedIndex].text })}
                  className="w-full p-2 border border-gray-700 rounded bg-gray-800 text-white"
                  disabled={store.request.status >= 10 && store.rol < 20}
                >
                  {corregimientos.map((corregimiento) => (
                    <option key={corregimiento.value} value={corregimiento.value}>
                      {corregimiento.label}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          {formData.paisDondeVive.value !== 'PA' && (
            <>
              <div>
                <label className="block mb-2 text-sm">Provincia</label>
                <input
                  type="text"
                  name="provincia2"
                  value={formData.provincia2}
                  onChange={handleChange}
                  className={`w-full p-2 border ${invalidFields.provincia2 ? 'border-red-500' : 'border-gray-700'} rounded bg-gray-800 text-white`}
                  disabled={store.request.status >= 10 && store.rol < 20}
                />
              </div>

              <div>
                <label className="block mb-2 text-sm">Corregimiento</label>
                <input
                  type="text"
                  name="corregimiento2"
                  value={formData.corregimiento2}
                  onChange={handleChange}
                  className={`w-full p-2 border ${invalidFields.corregimiento2 ? 'border-red-500' : 'border-gray-700'} rounded bg-gray-800 text-white`}
                  disabled={store.request.status >= 10 && store.rol < 20}
                />
              </div>
            </>
          )}

          {/* Country and State */}


          <div>
            <label className="block mb-2 text-sm">¿Mantiene un trabajo?</label>
            <select
              name="trabajando"
              value={formData.trabajando.value}
              onChange={(e) => {
                const selectedOption = mantieneIngresosOptions.find(option => option.value === e.target.value) || null;
                handleSelectChange('trabajando', selectedOption);
              }}
              className="w-full p-2 border border-gray-700 rounded bg-gray-800 text-white"
              disabled={store.request.status >= 10 && store.rol < 20}
            >
              {mantieneIngresosOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {formData.trabajando.value === 'si' && (
            <>
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
              <div>
                <label className="block mb-2 text-sm">Ingresos que recibe por su trabajo:</label>
                <input
                  type="text"
                  name="ingresosTrabajo"
                  value={formData.ingresosTrabajo}
                  onChange={handleChange}
                  className={`w-full p-2 border ${invalidFields.ingresosTrabajo ? 'border-red-500' : 'border-gray-700'} rounded bg-gray-800 text-white`}
                  disabled={store.request.status >= 10 && store.rol < 20}
                />
              </div>
              <div>
                <label className="block mb-2 text-sm">Detalle de la dirección:</label>
                <textarea
                  name="detalleDireccionTrabajo"
                  value={formData.detalleDireccionTrabajo}
                  onChange={handleChange}
                  className={`w-full p-2 border ${invalidFields.detalleDireccionTrabajo ? 'border-red-500' : 'border-gray-700'} rounded bg-gray-800 text-white`}
                  disabled={store.request.status >= 10 && store.rol < 20}
                />
              </div>
              <div>
                <label className="block mb-2 text-sm">Dirección de trabajo:</label>
                <textarea
                  name="direccionTrabajo"
                  value={formData.direccionTrabajo}
                  onChange={handleChange}
                  className={`w-full p-2 border ${invalidFields.direccionTrabajo ? 'border-red-500' : 'border-gray-700'} rounded bg-gray-800 text-white`}
                  disabled={store.request.status >= 10 && store.rol < 20}
                />
              </div>
            </>
          )}

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
      </form>
    </div>
  );
};

export default PensionAlimenticiaDemandado;
