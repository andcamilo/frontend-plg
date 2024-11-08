import React, { useState, useContext, FormEvent, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import AppStateContext from '@context/context';
import ClipLoader from 'react-spinners/ClipLoader';
import { Country, State, City } from 'country-state-city';
import DemandadoInfo from './DemandadoInfo'
import { useFetchSolicitud } from '@utils/fetchCurrentRequest';
import get from 'lodash/get';
import countryCodes from '@utils/countryCode';

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
    direccionCasa: '',
    detalleDireccionCasa: '',
    telefono: '',
    telefonoCodigo: 'PA',
    pais: { value: 'PA', label: 'Panamá' }, // Default value
    provincia: { value: '', label: '' }, // Province
    corregimiento: { value: '', label: '' }, // City
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

  // Fetch cities when province changes
  useEffect(() => {
    if (formData.provincia.value) {
      const cities = City.getCitiesOfState(formData.nacionalidad.value, formData.provincia.value);
      setCorregimientos(cities.map(city => ({ value: city.name, label: city.name })));
    }
  }, [formData.provincia]);

  // Handle form changes for input and textarea fields
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value, // Only update the value for input fields
    }));
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
  };

  const removeCountryCode = (phone: string, countryCode: string = "507") => {
    // Check if the phone number starts with the country code
    if (phone.startsWith(countryCode)) {
      return phone.slice(countryCode.length); // Remove the country code for display
    }
    return phone;
  };

  // Handle form submission
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
          direccionCasa: formData.direccionCasa,
          detalleDireccionCasa: formData.detalleDireccionCasa,
          pais: formData.pais,
          telefono: `${countryCodes[formData.telefonoCodigo]}${formData.telefono}` || '',
          provincia: formData.provincia,
          corregimiento: formData.corregimiento,
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

  return (
    <div className="text-white bg-gray-900 p-8">
      <DemandadoInfo />
      {/* Form Section */}
      <form className="space-y-6" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              value={formData.estadoCivil.value}
              onChange={(e) => handleSelectChange('estadoCivil', { value: e.target.value, label: e.target.options[e.target.selectedIndex].text })}
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
            <label className="block mb-2 text-sm">Dirección vivienda:</label>
            <input
              type="text"
              name="direccionCasa"
              value={formData.direccionCasa}
              onChange={handleChange}
              className="w-full p-2 border border-gray-700 rounded bg-gray-800 text-white"
              required
            />
          </div>
          <div>
            <label className="block mb-2 text-sm">Detalle Dirección vivienda:</label>
            <input
              type="text"
              name="detalleDireccionCasa"
              value={formData.detalleDireccionCasa}
              onChange={handleChange}
              className="w-full p-2 border border-gray-700 rounded bg-gray-800 text-white"
              required
            />
          </div>
          <div>
            <label className="block mb-2 text-sm">Nacionalidad:</label>
            <select
              name="nacionalidad"
              value={formData.nacionalidad.value}
              onChange={(e) => handleSelectChange('nacionalidad', { value: e.target.value, label: e.target.options[e.target.selectedIndex].text })}
              className="w-full p-2 border border-gray-700 rounded bg-gray-800 text-white"
            >
              {paises.map((pais) => (
                <option key={pais.value} value={pais.value}>
                  {pais.label}
                </option>
              ))}
            </select>
          </div>

          {/* Country and State */}
          <div>
            <label className="block mb-2 text-sm">Provincia:</label>
            <select
              name="provincia"
              value={formData.provincia.value}
              onChange={(e) => handleSelectChange('provincia', { value: e.target.value, label: e.target.options[e.target.selectedIndex].text })}
              className="w-full p-2 border border-gray-700 rounded bg-gray-800 text-white"
              required
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
              required
            >
              {corregimientos.map((corregimiento) => (
                <option key={corregimiento.value} value={corregimiento.value}>
                  {corregimiento.label}
                </option>
              ))}
            </select>
          </div>

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
              required
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
                  className="w-full p-2 border border-gray-700 rounded bg-gray-800 text-white"
                />
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
              <div>
                <label className="block mb-2 text-sm">Detalle de la dirección:</label>
                <textarea
                  name="detalleDireccionTrabajo"
                  value={formData.detalleDireccionTrabajo}
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
            </>
          )}
                    
          <div>
            <label className="block mb-2 text-xs">Teléfono:</label>
            <select
              name="telefonoCodigo"
              value={formData.telefonoCodigo}
              onChange={handleSelectCountryCodeChange}
              className="p-3 bg-gray-800 text-white rounded-lg"
            >
              {Object.entries(countryCodes).map(([code, dialCode]) => (
                <option key={code} value={code}>{code}: {dialCode}</option>
              ))}
            </select>
            <input
              type="text"
              name="telefono"
              value={removeCountryCode(formData.telefono)}
              onChange={handleChange}
              className="ml-1 p-2 border border-gray-700 rounded bg-gray-800 text-white"
            />
          </div>
        </div>

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
