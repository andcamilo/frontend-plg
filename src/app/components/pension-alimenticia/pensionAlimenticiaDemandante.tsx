import axios from 'axios';
import React, { useState, useEffect, useContext, FormEvent } from 'react';
import Swal from 'sweetalert2';
import AppStateContext from '@context/context';
import ClipLoader from 'react-spinners/ClipLoader';
import Select from 'react-select';
import { Country, State, City } from 'country-state-city';
import InformacionDelDemandante from './InformacionDelDemandante'
import InformacionGeneralAdicional from './InformacionGeneralAdicional'
import ToggleTextComponent from './ToggleTextComponen'
import { useFetchSolicitud } from '@utils/fetchCurrentRequest'
import get from 'lodash/get';
import countryCodes from '@utils/countryCode';
import CountrySelect from '@components/CountrySelect';

// Define the type for the select options
interface SelectOption {
  value: string;
  label: string;
}

interface Menor {
  tipoPersona: SelectOption;
  nombreCompletoMenor: string;
  fechaNacimientoMenor: string;
  edadMenor: number;
  parentescoConDemandado: SelectOption;
}

const PensionAlimenticiaDemandante: React.FC = () => {
  const [formData, setFormData] = useState({
    nombreCompleto: '',
    telefonoSolicita: '',
    telefonoCodigo: 'PA',
    cedula: '',
    email: '',
    confirmEmail: '',
    direccion: '',
    detalleDireccion: '',
    estadoCivil: { value: '', label: '' },
    relacionDemandado: { value: '', label: '' },
    nacionalidad: { value: '', label: '' },
    paisDondeVive: { value: '', label: '' },
    provincia: { value: '', label: '' },
    corregimiento: { value: '', label: '' },
    provincia2: '',
    corregimiento2: '',
    mantieneIngresos: { value: '', label: '' },
    lugarTrabajo: '',
    ingresosMensuales: '',
    viveEn: { value: '', label: '' },
    estudia: { value: '', label: '' },
    lugarEstudio: '',
    ocupacion: '',
    anoCursando: '',
    tipoEstudio: { value: '', label: '' },
    tiempoCompleto: { value: '', label: '' },
    parentescoPension: { value: '', label: '' },
    representaMenor: { value: '', label: '' },
    menores: [] as Menor[],
    tipoPersona: { value: '', label: '' },
    nombreCompletoMenor: '',
    fechaNacimientoMenor: '',
    edadMenor: '',
    parentescoConDemandado: { value: '', label: '' }
  });

  // Options for select fields
  const estadoCivilOptions: SelectOption[] = [
    { value: 'soltero', label: 'Soltero' },
    { value: 'casado', label: 'Casado' },
  ];

  const relacionDemandadoOptions: SelectOption[] = [
    { value: 'familia', label: 'Familia' },
    { value: 'amigo', label: 'Amigo' },
    { value: 'otro', label: 'Otro' },
  ];

  const mantieneIngresosOptions: SelectOption[] = [
    { value: 'si', label: 'Sí' },
    { value: 'no', label: 'No' },
  ];

  const viveEnOptions: SelectOption[] = [
    { value: 'casa_propia', label: 'Casa Propia' },
    { value: 'casa_hipoteca', label: 'Casa con Hipoteca' },
    { value: 'alquiler', label: 'Alquiler' },
    { value: 'con_familiares', label: 'Con Familiares' },
  ];

  const estudiaOptions: SelectOption[] = [
    { value: 'si', label: 'Sí' },
    { value: 'no', label: 'No' },
  ];

  const tipoEstudioOptions: SelectOption[] = [
    { value: 'bachillerato', label: 'Bachillerato' },
    { value: 'licenciatura', label: 'Licenciatura' },
    { value: 'maestria', label: 'Maestría' },
    { value: 'doctorado', label: 'Doctorado' },
  ];

  const tiempoCompletoOptions: SelectOption[] = [
    { value: 'completo', label: 'Tiempo Completo' },
    { value: 'parcial', label: 'Tiempo Parcial' },
    { value: 'nocturno', label: 'Nocturno' },
  ];

  const parentescoPensionOptions: SelectOption[] = [
    { value: 'a_nombre_propio', label: 'A nombre propio' },
    { value: 'padres', label: 'Padres' },
    { value: 'hijos', label: 'Hijos' },
  ];

  const representaMenorOptions: SelectOption[] = [
    { value: 'si', label: 'Sí' },
    { value: 'no', label: 'No' },
  ];

  const tipoPersonaOptions: SelectOption[] = [
    { value: 'menor', label: 'Menor' },
    { value: 'discapacidad', label: 'Persona con discapacidad' },
  ];

  const parentescoConDemandadoOptions: SelectOption[] = [
    { value: 'madre', label: 'Madre' },
    { value: 'padre', label: 'Padre' },
    { value: 'tutor', label: 'Tutor' },
  ];

  const [paises, setPaises] = useState<SelectOption[]>([]);
  const [provincias, setProvincias] = useState<SelectOption[]>([]);
  const [corregimientos, setCorregimientos] = useState<SelectOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);

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
      const demandante = get(store.request, 'demandante', {});

      if (demandante && Object.keys(demandante).length > 0) {
        setFormData((prevFormData) => ({
          ...prevFormData,
          ...demandante,
        }));
      }
    }
  }, [store.request]);

  // Load countries on component mount
  useEffect(() => {
    const countries = Country.getAllCountries();
    setPaises(countries.map(country => ({ value: country.isoCode, label: country.name })));
  }, []);

  useEffect(() => {
    console.log("🚀 ~ formData.menores:", formData.menores)
  }, [formData.menores]);

  useEffect(() => {
    if (formData.nacionalidad.value) {
      const states = State.getStatesOfCountry(formData.nacionalidad.value);
      setProvincias(states.map(state => ({ value: state.isoCode, label: state.name })));
    }
  }, [formData.nacionalidad]);

  useEffect(() => {
    if (formData.paisDondeVive.value) {
      const states = State.getStatesOfCountry(formData.paisDondeVive.value);
      setProvincias(states.map(state => ({ value: state.isoCode, label: state.name })));
    }
  }, [formData.paisDondeVive]);

  useEffect(() => {
    if (formData.provincia.value) {
      const cities = City.getCitiesOfState(formData.paisDondeVive.value, formData.provincia.value);
      setCorregimientos(cities.map(city => ({ value: city.name, label: city.name })));
    }
  }, [formData.provincia]);

  const addMenor = () => {
    setFormData((prevData: any) => ({
      ...prevData,
      menores: [
        ...prevData.menores,
        {
          tipoPersona: { value: '', label: '' },
          nombreCompletoMenor: '',
          fechaNacimientoMenor: '',
          edadMenor: '',
          parentescoConDemandado: { value: '', label: '' },
        },
      ],
    }));
  };

  const handleMenorChange = (index: number, field: keyof Menor, value: any) => {
    setFormData((prevData) => {
      const updatedMenores = [...prevData.menores];

      // Update the field with the new value
      updatedMenores[index] = {
        ...updatedMenores[index],
        [field]: value,
      };

      // If the field is fechaNacimientoMenor, calculate edadMenor
      if (field === 'fechaNacimientoMenor') {
        const birthDate = new Date(value);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDifference = today.getMonth() - birthDate.getMonth();

        // Adjust if the birth month and day haven't occurred yet this year
        if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }

        // Set edadMenor based on the calculated age
        updatedMenores[index].edadMenor = age; // Convert to string if edadMenor is a text field
      }

      return { ...prevData, menores: updatedMenores };
    });
  };

  const handleRemoveMenor = (index: number) => {
    setFormData((prevData) => {
      const updatedMenores = [...prevData.menores];
      updatedMenores.splice(index, 1); // Elimina el menor en el índice específico
      return { ...prevData, menores: updatedMenores };
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSelectChange = (name: string, selectedOption: SelectOption | null) => {
    setFormData((prevData) => ({
      ...prevData,
      [name]: selectedOption ? { value: selectedOption.value, label: selectedOption.label } : { value: '', label: '' },
    }));
  };

  const handleCountryChange = (name: string, value: string) => {
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (formData.email !== formData.confirmEmail) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Los correos electrónicos no coinciden. Por favor, verifica e intenta de nuevo.',
      });
      return;
    }

    setIsLoading(true);

    try {
      const updatePayload = {
        solicitudId: store.solicitudId,
        demandante: {
          nombreCompleto: formData.nombreCompleto,
          telefonoSolicita: `${countryCodes[formData.telefonoCodigo]}${formData.telefonoSolicita}` || '',
          cedula: formData.cedula,
          email: formData.email,
          nacionalidad: formData.nacionalidad,
          paisDondeVive: formData.paisDondeVive,
          confirmEmail: formData.confirmEmail,
          direccion: formData.direccion,
          detalleDireccion: formData.detalleDireccion,
          estadoCivil: formData.estadoCivil,
          relacionDemandado: formData.relacionDemandado,
          provincia: formData.provincia,
          corregimiento: formData.corregimiento,
          mantieneIngresos: formData.mantieneIngresos,
          lugarTrabajo: formData.mantieneIngresos.value === 'si' ? formData.lugarTrabajo : '',
          ocupacion: formData.ocupacion,
          ingresosMensuales: formData.mantieneIngresos.value === 'si' ? formData.ingresosMensuales : '',
          viveEn: formData.mantieneIngresos.value === 'si' ? formData.viveEn : '',
          estudia: formData.estudia,
          lugarEstudio: formData.estudia.value === 'si' ? formData.lugarEstudio : '',
          anoCursando: formData.estudia.value === 'si' ? formData.anoCursando : '',
          tipoEstudio: formData.estudia.value === 'si' ? formData.tipoEstudio : '',
          tiempoCompleto: formData.estudia.value === 'si' ? formData.tiempoCompleto : '',
          parentescoPension: formData.estudia.value === 'si' ? formData.parentescoPension : '',
          representaMenor: formData.representaMenor,

          tipoPersona: formData.representaMenor.value === 'si' ? formData.tipoPersona : '',
          menores: formData.menores || []
        },
      };

      const response = await axios.patch('/api/update-request', updatePayload);

      if (response.status === 200) {
        setStore((prevState) => ({
          ...prevState,
          demandado: true,
          currentPosition: 4,
        }));

        Swal.fire({
          position: "top-end",
          icon: "success",
          title: "Información del demandade actualizada correctamente.",
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
        console.error('Unexpected response from server:', response.data);
        throw new Error('Error al actualizar la solicitud.');
      }
    } catch (error) {
      if (error.response) {
        console.error('Error response:', error.response.data);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: `Hubo un problema al actualizar la solicitud: ${error.response.data.message || error.message}.`,
        });
      } else {
        console.error('Error updating request:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Hubo un problema al actualizar la solicitud. Por favor, inténtelo de nuevo más tarde.',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const customSelectStyles = {
    control: (provided: any) => ({
      ...provided,
      backgroundColor: '#1f2937',
      borderColor: '#4b5563',
      color: 'white',
    }),
    singleValue: (provided: any) => ({
      ...provided,
      color: 'white',
    }),
    menu: (provided: any) => ({
      ...provided,
      backgroundColor: '#1f2937',
    }),
    option: (provided: any, state: any) => ({
      ...provided,
      backgroundColor: state.isSelected ? '#6b7280' : '#1f2937',
      color: 'white',
    }),
  };

  return (
    <div className="w-full h-full p-8 overflow-y-scroll scrollbar-thin bg-[#070707] text-white">
      <InformacionDelDemandante />
      <form className="space-y-6 mt-5" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block mb-2 text-sm">Nombre completo</label>
            <input
              type="text"
              name="nombreCompleto"
              value={formData.nombreCompleto}
              onChange={handleChange}
              className="w-full p-2 border border-gray-700 rounded bg-gray-800 text-white"
              required
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
                name="telefonoSolicita"
                value={formData.telefonoSolicita}
                onChange={handleChange}
                className="p-4 bg-gray-800 text-white rounded-lg w-full"
                placeholder="Número de teléfono"
                required
                disabled={store.request.status >= 10 && store.rol < 20}
              />
            </div>
          </div>
          <div>
            <label className="block mb-2 text-sm">Cédula o pasaporte</label>
            <input
              type="text"
              name="cedula"
              value={formData.cedula}
              onChange={handleChange}
              className="w-full p-2 border border-gray-700 rounded bg-gray-800 text-white"
              required
              disabled={store.request.status >= 10 && store.rol < 20}
            />
          </div>
          <div>
            <label className="block mb-2 text-sm">Dirección</label>
            <input
              type="text"
              name="direccion"
              value={formData.direccion}
              onChange={handleChange}
              className="w-full p-2 border border-gray-700 rounded bg-gray-800 text-white"
              required
              disabled={store.request.status >= 10 && store.rol < 20}
            />
          </div>
          <div>
            <label className="block mb-2 text-sm">Correo</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full p-2 border border-gray-700 rounded bg-gray-800 text-white"
              required
              disabled={store.request.status >= 10 && store.rol < 20}
            />
          </div>
          <div>
            <label className="block mb-2 text-sm">Confirmar correo</label>
            <input
              type="email"
              name="confirmEmail"
              value={formData.confirmEmail}
              onChange={handleChange}
              className="w-full p-2 border border-gray-700 rounded bg-gray-800 text-white"
              required
              disabled={store.request.status >= 10 && store.rol < 20}
            />
          </div>
          <div>
            <label className="block mb-2 text-sm">Nacionalidad</label>
            <Select
              options={paises}
              value={paises.find(p => p.value === formData.nacionalidad.value)}
              onChange={(option) => handleSelectChange('nacionalidad', option)}
              styles={customSelectStyles}
              required
            />
          </div>
          <div>
            <label className="block mb-2 text-sm">País donde vive</label>
            <Select
              options={paises}
              value={paises.find(p => p.value === formData.paisDondeVive.value)}
              onChange={(option) => handleSelectChange('paisDondeVive', option)}
              styles={customSelectStyles}
              required
            />
          </div>
          {formData.paisDondeVive.value === 'PA' && (
            <>
              <div>
                <label className="block mb-2 text-sm">Provincia</label>
                <Select
                  options={provincias}
                  value={provincias.find(p => p.value === formData.provincia.value)}
                  onChange={(option) => handleSelectChange('provincia', option)}
                  styles={customSelectStyles}
                /* isDisabled={formData.paisDondeVive.value !== 'PA'} */
                />
              </div>

              <div>
                <label className="block mb-2 text-sm">Corregimiento</label>
                <Select
                  options={corregimientos}
                  value={corregimientos.find(c => c.value === formData.corregimiento.value)}
                  onChange={(option) => handleSelectChange('corregimiento', option)}
                  styles={customSelectStyles}
                /* isDisabled={!formData.provincia.value} */
                />
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
                  className="w-full p-2 border border-gray-700 rounded bg-gray-800 text-white"
                  disabled={store.request.status >= 10 && store.rol < 20}
                />
              </div>

              <div>
                <label className="block mb-2 text-sm">Corregimiento</label>
                <input
                  type="text"
                  name="Corregimiento2"
                  value={formData.corregimiento2}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-700 rounded bg-gray-800 text-white"
                  disabled={store.request.status >= 10 && store.rol < 20}
                />
              </div>
            </>
          )}

          <div >
            <label className="block mb-2 text-sm">Detalle de la dirección</label>
            <textarea
              name="detalleDireccion"
              value={formData.detalleDireccion}
              onChange={handleChange}
              className="w-full p-2 border border-gray-700 rounded bg-gray-800 text-white"
              required
              disabled={store.request.status >= 10 && store.rol < 20}
            />
          </div>
          <div>
            <label className="block mb-2 text-sm">Estado civil</label>
            <Select
              options={estadoCivilOptions}
              value={estadoCivilOptions.find(ec => ec.value === formData.estadoCivil.value)}
              onChange={(option) => handleSelectChange('estadoCivil', option)}
              styles={customSelectStyles}
              required
            />
          </div>
          <div>
            <label className="block mb-2 text-sm">Relación con la persona a la que demandas</label>
            <Select
              options={relacionDemandadoOptions}
              value={relacionDemandadoOptions.find(rd => rd.value === formData.relacionDemandado.value)}
              onChange={(option) => handleSelectChange('relacionDemandado', option)}
              styles={customSelectStyles}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block mb-2 text-sm">¿Mantiene usted ingresos por trabajo o como independiente?</label>
            <Select
              options={mantieneIngresosOptions}
              value={mantieneIngresosOptions.find(mi => mi.value === formData.mantieneIngresos.value)}
              onChange={(option) => handleSelectChange('mantieneIngresos', option)}
              styles={customSelectStyles}
              required
            />
          </div>
        </div>

        {formData.mantieneIngresos.value === 'si' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block mb-2 text-sm">Lugar de trabajo</label>
              <input
                type="text"
                name="lugarTrabajo"
                value={formData.lugarTrabajo}
                onChange={handleChange}
                className="w-full p-2 border border-gray-700 rounded bg-gray-800 text-white"
                disabled={store.request.status >= 10 && store.rol < 20}
              />
            </div>
            <div>
              <label className="block mb-2 text-sm">Ingresos mensuales</label>
              <input
                type="text"
                name="ingresosMensuales"
                value={formData.ingresosMensuales}
                onChange={handleChange}
                className="w-full p-2 border border-gray-700 rounded bg-gray-800 text-white"
                disabled={store.request.status >= 10 && store.rol < 20}
              />
            </div>
            <div>
              <label className="block mb-2 text-sm">Ocupacion</label>
              <input
                type="text"
                name="ocupacion"
                value={formData.ocupacion}
                onChange={handleChange}
                className="w-full p-2 border border-gray-700 rounded bg-gray-800 text-white"
                disabled={store.request.status >= 10 && store.rol < 20}
              />
            </div>
            <div>
              <label className="block mb-2 text-sm">Vive en</label>
              <Select
                options={viveEnOptions}
                value={viveEnOptions.find(vive => vive.value === formData.viveEn.value)}
                onChange={(option) => handleSelectChange('viveEn', option)}
                styles={customSelectStyles}
              />
            </div>
          </div>
        )}

        {/* Estudia section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div>
            <label className="block mb-2 text-sm">¿Estudia?</label>
            <Select
              options={estudiaOptions}
              value={estudiaOptions.find(est => est.value === formData.estudia.value)}
              onChange={(option) => handleSelectChange('estudia', option)}
              styles={customSelectStyles}
              required
            />
          </div>
        </div>

        {/* Conditionally render these fields if 'Estudia' is 'Sí' */}
        {formData.estudia.value === 'si' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block mb-2 text-sm">Lugar de estudio</label>
              <input
                type="text"
                name="lugarEstudio"
                value={formData.lugarEstudio}
                onChange={handleChange}
                className="w-full p-2 border border-gray-700 rounded bg-gray-800 text-white"
                disabled={store.request.status >= 10 && store.rol < 20}
              />
            </div>
            <div>
              <label className="block mb-2 text-sm">Año cursando</label>
              <input
                type="text"
                name="anoCursando"
                value={formData.anoCursando}
                onChange={handleChange}
                className="w-full p-2 border border-gray-700 rounded bg-gray-800 text-white"
                disabled={store.request.status >= 10 && store.rol < 20}
              />
            </div>
            <div>
              <label className="block mb-2 text-sm">Tipo de estudio</label>
              <Select
                options={tipoEstudioOptions}
                value={tipoEstudioOptions.find(tipo => tipo.value === formData.tipoEstudio.value)}
                onChange={(option) => handleSelectChange('tipoEstudio', option)}
                styles={customSelectStyles}
              />
            </div>
            <div>
              <label className="block mb-2 text-sm">¿Tiempo completo o parcial?</label>
              <Select
                options={tiempoCompletoOptions}
                value={tiempoCompletoOptions.find(tc => tc.value === formData.tiempoCompleto.value)}
                onChange={(option) => handleSelectChange('tiempoCompleto', option)}
                styles={customSelectStyles}
              />
            </div>
            <div>
              <label className="block mb-2 text-sm">Parentesco con quien requiere la pensión</label>
              <Select
                options={parentescoPensionOptions}
                value={parentescoPensionOptions.find(par => par.value === formData.parentescoPension.value)}
                onChange={(option) => handleSelectChange('parentescoPension', option)}
                styles={customSelectStyles}
              />
            </div>
          </div>
        )}

        {/* ¿Representa a un menor de edad o persona con discapacidad? */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div>
            <label className="block mb-2 text-sm">¿Representa a un menor de edad o persona con discapacidad que requiere pensión alimenticia?</label>
            <Select
              options={representaMenorOptions}
              value={representaMenorOptions.find(repr => repr.value === formData.representaMenor.value)}
              onChange={(option) => handleSelectChange('representaMenor', option)}
              styles={customSelectStyles}
              required
            />
          </div>
        </div>

        {/* Conditionally render these fields if 'representaMenor' is 'Sí' */}
        {formData.representaMenor.value === 'si' && (
          <div className="mt-6">
            <label className="block mb-2 text-sm">Menores</label>

            {(!store.request.status || store.request.status < 10 || (store.request.status >= 10 && store.rol > 20)) && (
              <>
                <button
                  type="button"
                  onClick={addMenor}
                  className="bg-profile text-white font-semibold py-2 px-4 rounded mb-4"
                >
                  Adicionar Menor
                </button>
              </>
            )}

            {formData.menores.map((menor, index) => (
              <div key={index} className="p-4 mb-4 rounded-md bg-gray-900 text-white">
                <h4 className="mb-4 font-semibold text-lg">Menor #{index + 1}</h4>

                {/* Contenedor grid para mostrar los campos de dos en dos */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block mb-2 text-sm">Tipo de Persona</label>
                    <Select
                      options={tipoPersonaOptions}
                      value={tipoPersonaOptions.find(tipo => tipo.value === menor.tipoPersona.value)}
                      onChange={(option) => handleMenorChange(index, 'tipoPersona', option)}
                      styles={customSelectStyles}
                    />
                  </div>

                  <div>
                    <label className="block mb-2 text-sm">Nombre Completo</label>
                    <input
                      type="text"
                      value={menor.nombreCompletoMenor}
                      onChange={(e) => handleMenorChange(index, 'nombreCompletoMenor', e.target.value)}
                      className="w-full p-2 border border-gray-700 rounded bg-gray-800 text-white"
                    />
                  </div>

                  <div>
                    <label className="block mb-2 text-sm">Fecha de Nacimiento</label>
                    <input
                      type="date"
                      value={menor.fechaNacimientoMenor}
                      onChange={(e) => handleMenorChange(index, 'fechaNacimientoMenor', e.target.value)}
                      className="w-full p-2 border border-gray-700 rounded bg-gray-800 text-white"
                    />
                  </div>

                  <div>
                    <label className="block mb-2 text-sm">Edad</label>
                    <input
                      type="text"
                      value={menor.edadMenor}
                      onChange={(e) => handleMenorChange(index, 'edadMenor', e.target.value)}
                      className="w-full p-2 border border-gray-700 rounded bg-gray-800 text-white"
                    />
                  </div>

                  <div className="md:col-span-2"> {/* Ocupa las dos columnas en pantallas medianas */}
                    <label className="block mb-2 text-sm">Parentesco con Demandado</label>
                    <Select
                      options={parentescoConDemandadoOptions}
                      value={parentescoConDemandadoOptions.find(par => par.value === menor.parentescoConDemandado.value)}
                      onChange={(option) => handleMenorChange(index, 'parentescoConDemandado', option)}
                      styles={customSelectStyles}
                    />
                  </div>
                </div>

                {/* Botón para eliminar menor */}
                <button
                  type="button"
                  onClick={() => handleRemoveMenor(index)}
                  className="mt-4 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded w-full"
                >
                  Eliminar Menor
                </button>
              </div>
            ))}
          </div>
        )}

        <InformacionGeneralAdicional />
        <ToggleTextComponent />

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
                    currentPosition: 4,
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

export default PensionAlimenticiaDemandante;
