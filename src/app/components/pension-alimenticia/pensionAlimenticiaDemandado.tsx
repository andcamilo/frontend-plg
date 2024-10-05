import React, { useState, useContext, FormEvent, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import AppStateContext from '@context/context';
import ClipLoader from 'react-spinners/ClipLoader';
import { Country, State, City } from 'country-state-city'; // Importing country-state-city

interface SelectOption {
  value: string;
  label: string;
}

const PensionAlimenticiaDemandado: React.FC = () => {
  const [formData, setFormData] = useState({
    nombreCompleto: '',
    estadoCivil: { value: 'Soltero', label: 'Soltero' },
    cedula: '',
    nacionalidad: { value: 'Panamá', label: 'Panamá' }, // Default value
    direccion: '',
    pais: { value: 'Panamá', label: 'Panamá' }, // Default value
    provincia: { value: '', label: '' }, // Province
    corregimiento: { value: '', label: '' }, // City
    ingresosTrabajo: '',
    detalleDireccion: '',
    direccionTrabajo: '',
    salario: 'No',
    hijosDistintos: 'No',
    trabajando: 'No',
  });

  const [paises, setPaises] = useState<SelectOption[]>([]);
  const [provincias, setProvincias] = useState<SelectOption[]>([]);
  const [corregimientos, setCorregimientos] = useState<SelectOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Access the context
  const context = useContext(AppStateContext);
  if (!context) {
    throw new Error('AppStateContext must be used within an AppStateProvider');
  }
  const { store, setStore } = context;

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

  // Handle form changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: { value, label: value },
    }));
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
          estadoCivil: formData.estadoCivil.value,
          cedula: formData.cedula,
          nacionalidad: formData.nacionalidad.label,
          direccion: formData.direccion,
          pais: formData.pais.label,
          provincia: formData.provincia.label,
          corregimiento: formData.corregimiento.label,
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

  return (
    <div className="text-white bg-gray-900 p-8">
      {/* Header Section */}
      <h2 className="text-2xl font-bold mb-4">Información del Demandado</h2>
      <p className="text-sm mb-4">
        Representa a la persona a la cual se le está solicitando la demanda, en este caso la persona que debe aportar la otra parte correspondiente a la Pensión Alimenticia.
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
              value={formData.estadoCivil.value}
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
              value={formData.nacionalidad.value}
              onChange={handleChange}
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
              onChange={handleChange}
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

          {/* City */}
          <div>
            <label className="block mb-2 text-sm">Corregimiento:</label>
            <select
              name="corregimiento"
              value={formData.corregimiento.value}
              onChange={handleChange}
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

          {/* Income, Address, and Work Address */}
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
