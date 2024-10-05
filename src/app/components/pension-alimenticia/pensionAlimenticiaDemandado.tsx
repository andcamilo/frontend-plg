import React, { useState, useContext, FormEvent, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import AppStateContext from '@context/context';
import ClipLoader from 'react-spinners/ClipLoader';
import { Country, State, City } from 'country-state-city'; // Import country-state-city library

const PensionAlimenticiaDemandado: React.FC = () => {
  const [formData, setFormData] = useState({
    nombreCompleto: '',
    estadoCivil: 'Soltero',
    cedula: '',
    nacionalidad: 'Panamá', // Default value
    direccion: '',
    pais: 'Panamá', // Default value
    provincia: '', // State
    corregimiento: '', // City
    ingresosTrabajo: '',
    detalleDireccion: '',
    direccionTrabajo: '',
    salario: 'No',
    hijosDistintos: 'No',
    trabajando: 'No',
  });

  const [states, setStates] = useState<State[]>([]); // To store states based on selected country
  const [cities, setCities] = useState<City[]>([]);  // To store cities based on selected state

  const [isLoading, setIsLoading] = useState(false);

  // Access the context
  const context = useContext(AppStateContext);

  if (!context) {
    throw new Error('AppStateContext must be used within an AppStateProvider');
  }

  const { store, setStore } = context;

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Handle country change and load corresponding states
  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedCountry = e.target.value;
    setFormData((prevData) => ({ ...prevData, pais: selectedCountry, provincia: '', corregimiento: '' }));
    const countryCode = Country.getAllCountries().find((country) => country.name === selectedCountry)?.isoCode;
    if (countryCode) {
      const fetchedStates = State.getStatesOfCountry(countryCode);
      setStates(fetchedStates);
    }
  };

  // Handle state change and load corresponding cities
  const handleStateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedState = e.target.value;
    setFormData((prevData) => ({ ...prevData, provincia: selectedState, corregimiento: '' }));
    const stateCode = states.find((state) => state.name === selectedState)?.isoCode;
    const countryCode = Country.getAllCountries().find((country) => country.name === formData.pais)?.isoCode;
    if (stateCode && countryCode) {
      const fetchedCities = City.getCitiesOfState(countryCode, stateCode);
      setCities(fetchedCities);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const updatePayload = {
        solicitudId: store.solicitudId,
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
          icon: 'success',
          title: 'Formulario Enviado',
          text: 'Formulario del demandado enviado correctamente.',
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

  useEffect(() => {
    // Initially load the states for the default country
    const defaultCountryCode = Country.getAllCountries().find((country) => country.name === formData.pais)?.isoCode;
    if (defaultCountryCode) {
      setStates(State.getStatesOfCountry(defaultCountryCode));
    }
  }, []);

  return (
    <div className="text-white bg-gray-900 p-8">
      {/* Header Section */}
      <h2 className="text-2xl font-bold mb-4">Información del Demandado</h2>
      <p className="text-sm mb-4">
        Representa a la persona a la cual se le está solicitando la demanda, en este caso la persona que debe aportar la otra parte correspondiente a la Pensión Alimenticia.
      </p>
      <p className="text-sm mb-4">
        Debe completar la mayor cantidad de información del demandado.
      </p>
      <p className="text-sm mb-4">
        Persona demandada a quien se le solicita la pensión. Por favor incluir la mayor cantidad de información que posea. En los casos de Revisión de Pensión por Disminución o Suspensión de Pensión solamente, serían los datos de la persona que está recibiendo pensión actualmente o el tutor o representante de un menor de edad o persona con discapacidad:
      </p>

      {/* Form Section */}
      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Name and Civil Status */}
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

          {/* Cedula and Nationality */}
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
          <div>
            <label className="block mb-2 text-sm">Nacionalidad:</label>
            <select
              name="nacionalidad"
              value={formData.nacionalidad}
              onChange={handleChange}
              className="w-full p-2 border border-gray-700 rounded bg-gray-800 text-white"
            >
              {Country.getAllCountries().map((country) => (
                <option key={country.isoCode} value={country.name}>
                  {country.name}
                </option>
              ))}
            </select>
          </div>

          {/* Country and State */}
          <div>
            <label className="block mb-2 text-sm">País donde vive:</label>
            <select
              name="pais"
              value={formData.pais}
              onChange={handleCountryChange}
              className="w-full p-2 border border-gray-700 rounded bg-gray-800 text-white"
            >
              {Country.getAllCountries().map((country) => (
                <option key={country.isoCode} value={country.name}>
                  {country.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block mb-2 text-sm">Provincia:</label>
            <select
              name="provincia"
              value={formData.provincia}
              onChange={handleStateChange}
              className="w-full p-2 border border-gray-700 rounded bg-gray-800 text-white"
              disabled={!states.length}
            >
              {states.map((state) => (
                <option key={state.isoCode} value={state.name}>
                  {state.name}
                </option>
              ))}
            </select>
          </div>

          {/* City and Income */}
          <div>
            <label className="block mb-2 text-sm">Corregimiento:</label>
            <select
              name="corregimiento"
              value={formData.corregimiento}
              onChange={handleChange}
              className="w-full p-2 border border-gray-700 rounded bg-gray-800 text-white"
              disabled={!cities.length}
            >
              {cities.map((city) => (
                <option key={city.name} value={city.name}>
                  {city.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block mb-2 text-sm">Ingresos que recibe por su trabajo:</label>
            <input
              type="text"
              name="ingresosTrabajo"
              value={formData.ingresosTrabajo}
              onChange={handleChange}
              className="w-full p-2 border border-gray-700 rounded bg-gray-800 text-white"
            />
          </div>

          {/* Address Details and Work Address */}
          <div>
            <label className="block mb-2 text-sm">Detalle de la dirección:</label>
            <textarea
              name="detalleDireccion"
              value={formData.detalleDireccion}
              onChange={handleChange}
              className="w-full p-2 border border-gray-700 rounded bg-gray-800 text-white"
            />
          </div>
          <div>
            <label className="block mb-2 text-sm">Dirección de trabajo:</label>
            <textarea
              name="direccionTrabajo"
              value={formData.direccionTrabajo}
              onChange={handleChange}
              className="w-full p-2 border border-gray-700 rounded bg-gray-800 text-white"
            />
          </div>
        </div>

        {/* Submit button */}
        <div className="mt-6">
          <button
            type="submit"
            className="w-full md:w-auto bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded"
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
        </div>
      </form>
    </div>
  );
};

export default PensionAlimenticiaDemandado;
