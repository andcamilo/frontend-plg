import React, { useState, useContext, FormEvent, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import AppStateContext from '@context/context';
import ClipLoader from 'react-spinners/ClipLoader';
import { Country, State, City } from 'country-state-city';
import { useFetchSolicitud } from '@utils/fetchCurrentRequest';
import get from 'lodash/get';
import RepresentanteLegal from '@components/registro-marca/informacionRepresentanteLegal';
import CountrySelect from '@components/CountrySelect';
interface SelectOption {
  value: string;
  label: string;
}

const RegistroPersonaJuridica: React.FC = () => {
  const [formData, setFormData] = useState({
    nombreSociedad: '',
    pais: { value: 'PA', label: 'Panamá' }, // Default value 
    numeroRegistro: '',
    domicilio: '',
    direccionPanama:'',
    archivoRegistro: '',
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
  }, [store.solicitudId, fetchSolicitud]);

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
    if (formData.pais.value) {
      const states = State.getStatesOfCountry(formData.pais.value);
      setProvincias(states.map(state => ({ value: state.isoCode, label: state.name })));
    }
  }, [formData.pais]);

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
    if (!formData.nombreSociedad.trim()) {
      errores.push({ campo: 'nombreSociedad', mensaje: 'Debe introducir su nombre de la persona jurídica/sociedad.' });
    } else if (!formData.numeroRegistro.trim()) {
      errores.push({ campo: 'numeroRegistro', mensaje: 'Debe ingresar el número de registro de la persona Jurídica.' });
    } else if (!formData.domicilio) {
      errores.push({ campo: 'domicilio', mensaje: 'Debe introducir el domicilio.' });
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
        PersonaJuridica: {
          nombreSociedad:formData.nombreSociedad,
          pais: formData.pais,
          numeroRegistro: formData.numeroRegistro,
          domicilio:formData.domicilio,
          direccionPanama:formData.direccionPanama,
          archivoRegistro: formData.archivoRegistro
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
          title: "Información de la Persona Jurídica se ha actualizada correctamente.",
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
      <h1>Formulario para Persona Jurídica</h1>
      <form className="mt-5 space-y-6" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block mb-2 text-sm">Nombre de la Persona Jurídica/Sociedad:</label>
            <input name="nombreSociedad" value={formData.nombreSociedad} onChange={handleChange} className={`w-full p-2 border ${invalidFields.nombreSociedad ? 'border-red-500' : 'border-gray-700'} rounded bg-gray-800 text-white`} />
          </div>

          <div>
            <label className="block mb-2 text-sm">País de Constitución de la Persona Jurídica:</label>
            <select name="pais" value={formData.pais.value} onChange={(e) => handleSelectChange('pais', { value: e.target.value, label: e.target.options[e.target.selectedIndex].text })} className="w-full p-2 border border-gray-700 rounded bg-gray-800 text-white">
              {paises.map((pais) => <option key={pais.value} value={pais.value}>{pais.label}</option>)}
            </select>
          </div>

          <div>
            <label className="block mb-2 text-sm">Número de Registro:</label>
            <input name="numeroRegistro" value={formData.numeroRegistro} onChange={handleChange} className={`w-full p-2 border ${invalidFields.numeroRegistro ? 'border-red-500' : 'border-gray-700'} rounded bg-gray-800 text-white`} />
          </div>

          <div>
            <label className="block mb-2 text-sm">Domicilio de la Persona Jurídica:</label>
            <input name="domicilio" value={formData.domicilio} onChange={handleChange} className={`w-full p-2 border ${invalidFields.domicilio ? 'border-red-500' : 'border-gray-700'} rounded bg-gray-800 text-white`} />
          </div>

          <div>
            <label className="block mb-2 text-sm">Dirección en Panamá:</label>
            <input name="direccionPanama" value={formData.direccionPanama} onChange={handleChange} className={`w-full p-2 border ${invalidFields.direccionPanama ? 'border-red-500' : 'border-gray-700'} rounded bg-gray-800 text-white`} />
            <p className="text-xs text-gray-400 mt-1">* Obligatorio colocar una dirección en Panamá para efecto de notificaciones.</p>
          </div>

          <div>
            <label className="block mb-2 text-sm">Adjuntar copia del Registro de la persona jurídica <span className="text-red-500">*</span></label>
            <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                const reader = new FileReader();
                reader.onloadend = () => {
                  const result = reader.result as string | ArrayBuffer | null;
                  const dataUrl = typeof result === 'string' ? result : '';
                  setFormData((prev) => ({ ...prev, archivoRegistro: dataUrl }));
                };
                reader.readAsDataURL(file);
              }
            }} className="w-full p-2 border border-gray-700 rounded bg-gray-800 text-white" />
            {formData.archivoRegistro && <p className="text-xs text-green-400 mt-1">Archivo adjuntado correctamente.</p>}
          </div>
        </div>

        <RepresentanteLegal />

        <div className="flex justify-end mt-10">
          <button type="submit" className="bg-profile hover:bg-profile-dark text-white font-semibold py-2 px-4 rounded" disabled={isLoading}>
            {isLoading ? <ClipLoader size={24} color="#ffffff" /> : 'Guardar y continuar'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default RegistroPersonaJuridica;
