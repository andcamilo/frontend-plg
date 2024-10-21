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

// Define the type for the select options
interface SelectOption {
  value: string;
  label: string;
}

const PensionAlimenticiaDemandante: React.FC = () => {
  const [formData, setFormData] = useState({
    nombreCompleto: '',
    telefono: '',
    cedula: '',
    email: '',
    confirmEmail: '',
    direccion: '',
    detalleDireccion: '',
    estadoCivil: { value: '', label: '' }, 
    relacionDemandado: { value: '', label: '' }, 
    nacionalidad: { value: '', label: '' }, 
    provincia: { value: '', label: '' }, 
    corregimiento: { value: '', label: '' }, 
    mantieneIngresos: { value: '', label: '' }, 
    lugarTrabajo: '', 
    ingresosMensuales: '', 
    viveEn: { value: '', label: '' }, 
    estudia: { value: '', label: '' }, 
    lugarEstudio: '', 
    anoCursando: '', 
    tipoEstudio: { value: '', label: '' }, 
    tiempoCompleto: { value: '', label: '' }, 
    parentescoPension: { value: '', label: '' },
    representaMenor: { value: '', label: '' }, 
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

  // Load countries on component mount
  useEffect(() => {
    const countries = Country.getAllCountries();
    setPaises(countries.map(country => ({ value: country.isoCode, label: country.name })));
  }, []);

  useEffect(() => {
    if (formData.nacionalidad.value) {
      const states = State.getStatesOfCountry(formData.nacionalidad.value);
      setProvincias(states.map(state => ({ value: state.isoCode, label: state.name })));
    }
  }, [formData.nacionalidad]);

  useEffect(() => {
    if (formData.provincia.value) {
      const cities = City.getCitiesOfState(formData.nacionalidad.value, formData.provincia.value);
      setCorregimientos(cities.map(city => ({ value: city.name, label: city.name })));
    }
  }, [formData.provincia]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
          telefono: formData.telefono,
          cedula: formData.cedula,
          email: formData.email,
          direccion: formData.direccion,
          detalleDireccion: formData.detalleDireccion,
          estadoCivil: formData.estadoCivil.value,
          relacionDemandado: formData.relacionDemandado.value,
          nacionalidad: formData.nacionalidad.value,
          provincia: formData.provincia.value,
          corregimiento: formData.corregimiento.value,
          mantieneIngresos: formData.mantieneIngresos.value,
          lugarTrabajo: formData.mantieneIngresos.value === 'si' ? formData.lugarTrabajo : '', 
          ingresosMensuales: formData.mantieneIngresos.value === 'si' ? formData.ingresosMensuales : '', 
          viveEn: formData.mantieneIngresos.value === 'si' ? formData.viveEn.value : '', 
          estudia: formData.estudia.value,
          lugarEstudio: formData.estudia.value === 'si' ? formData.lugarEstudio : '',
          anoCursando: formData.estudia.value === 'si' ? formData.anoCursando : '',
          tipoEstudio: formData.estudia.value === 'si' ? formData.tipoEstudio.value : '',
          tiempoCompleto: formData.estudia.value === 'si' ? formData.tiempoCompleto.value : '',
          parentescoPension: formData.estudia.value === 'si' ? formData.parentescoPension.value : '',
          representaMenor: formData.representaMenor.value,
          tipoPersona: formData.representaMenor.value === 'si' ? formData.tipoPersona.value : '',
          nombreCompletoMenor: formData.representaMenor.value === 'si' ? formData.nombreCompletoMenor : '',
          fechaNacimientoMenor: formData.representaMenor.value === 'si' ? formData.fechaNacimientoMenor : '',
          edadMenor: formData.representaMenor.value === 'si' ? formData.edadMenor : '',
          parentescoConDemandado: formData.representaMenor.value === 'si' ? formData.parentescoConDemandado.value : ''
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
          icon: 'success',
          title: 'Formulario Enviado',
          text: 'Formulario enviado correctamente.',
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
    <div className="bg-gray-900 text-white p-8">
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
            />
          </div>
          <div>
            <label className="block mb-2 text-sm">Número de teléfono</label>
            <input
              type="text"
              name="telefono"
              value={formData.telefono}
              onChange={handleChange}
              className="w-full p-2 border border-gray-700 rounded bg-gray-800 text-white"
              required
            />
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
            <label className="block mb-2 text-sm">Provincia</label>
            <Select
              options={provincias}
              value={provincias.find(p => p.value === formData.provincia.value)}
              onChange={(option) => handleSelectChange('provincia', option)}
              styles={customSelectStyles}
              required
            />
          </div>
          <div>
            <label className="block mb-2 text-sm">Corregimiento</label>
            <Select
              options={corregimientos}
              value={corregimientos.find(c => c.value === formData.corregimiento.value)}
              onChange={(option) => handleSelectChange('corregimiento', option)}
              styles={customSelectStyles}
              required
            />
          </div>
          <div >
            <label className="block mb-2 text-sm">Detalle de la dirección</label>
            <textarea
              name="detalleDireccion"
              value={formData.detalleDireccion}
              onChange={handleChange}
              className="w-full p-2 border border-gray-700 rounded bg-gray-800 text-white"
              required
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

        {/* Conditionally render these fields if 'mantieneIngresos' is 'Sí' */}
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block mb-2 text-sm">¿Es la persona menor o persona con discapacidad?</label>
              <Select
                options={tipoPersonaOptions}
                value={tipoPersonaOptions.find(tipo => tipo.value === formData.tipoPersona.value)}
                onChange={(option) => handleSelectChange('tipoPersona', option)}
                styles={customSelectStyles}
              />
            </div>
            <div>
              <label className="block mb-2 text-sm">Nombre completo</label>
              <input
                type="text"
                name="nombreCompletoMenor"
                value={formData.nombreCompletoMenor}
                onChange={handleChange}
                className="w-full p-2 border border-gray-700 rounded bg-gray-800 text-white"
              />
            </div>
            <div>
              <label className="block mb-2 text-sm">Fecha de nacimiento</label>
              <input
                type="text"
                name="fechaNacimientoMenor"
                value={formData.fechaNacimientoMenor}
                onChange={handleChange}
                className="w-full p-2 border border-gray-700 rounded bg-gray-800 text-white"
                placeholder="dd/mm/aaaa"
              />
            </div>
            <div>
              <label className="block mb-2 text-sm">Edad</label>
              <input
                type="text"
                name="edadMenor"
                value={formData.edadMenor}
                onChange={handleChange}
                className="w-full p-2 border border-gray-700 rounded bg-gray-800 text-white"
              />
            </div>
            <div>
              <label className="block mb-2 text-sm">Parentesco del menor o persona con discapacidad con la persona demandada a quien se le solicita la pensión</label>
              <Select
                options={parentescoConDemandadoOptions}
                value={parentescoConDemandadoOptions.find(par => par.value === formData.parentescoConDemandado.value)}
                onChange={(option) => handleSelectChange('parentescoConDemandado', option)}
                styles={customSelectStyles}
              />
            </div>
          </div>
        )}

        <InformacionGeneralAdicional />
        <ToggleTextComponent />

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

export default PensionAlimenticiaDemandante;
