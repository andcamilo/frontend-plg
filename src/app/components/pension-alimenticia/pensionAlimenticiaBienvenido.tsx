// PensionAlimenticiaBienvenido.tsx
"use client";
import React, { useState, useEffect, useContext, useRef } from 'react';
import Swal from 'sweetalert2';
import AppStateContext from '@context/context';
import { checkAuthToken } from '@utils/checkAuthToken';
import axios from 'axios';
import ClipLoader from 'react-spinners/ClipLoader';
import countryCodes from '@utils/countryCode';
import { useFetchSolicitud } from '@utils/fetchCurrentRequest';
import { useRouter } from 'next/router';
import get from 'lodash/get';
import ReCAPTCHA from 'react-google-recaptcha';
import CountrySelect from '@components/CountrySelect'; // Adjust the path accordingly
import { backendBaseUrl, backendEnv } from '@utils/env';

const PensionAlimenticiaBienvenido: React.FC = () => {
  const context = useContext(AppStateContext);
  const [recaptchaToken, setRecaptchaToken] = useState(null);
  const router = useRouter();
  const { id } = router.query;

  if (!context) {
    throw new Error('AppStateContext must be used within an AppStateProvider');
  }

  const { store, setStore } = context;

  const [formData, setFormData] = useState({
    nombreCompleto: '',
    telefono: '',
    telefonoAlternativo: '',
    telefonoCodigo: 'PA',
    telefonoAlternativoCodigo: 'PA',
    cedulaPasaporte: '',
    email: '',
    confirmEmail: '',
    notificaciones: '',
    terminosAceptados: false,
    resumenCaso: '',
    summaryEmail: '',
    cuenta: '',
  });

  const [errors, setErrors] = useState({
    nombreCompleto: false,
    telefono: false,
    cedulaPasaporte: false,
    email: false,
    confirmEmail: false
  });

  const solicitudId = store.solicitudId || (Array.isArray(id) ? id[0] : id);
  const { fetchSolicitud } = useFetchSolicitud(solicitudId);

  // Initialize solicitudId and fetchSolicitud
  useEffect(() => {
    if (!store.solicitudId && solicitudId) {
      setStore((prevState) => ({
        ...prevState,
        solicitudId: solicitudId,
      }));
    }

    if (solicitudId) {
      fetchSolicitud();
    }
  }, [id, solicitudId, store.solicitudId, /* setStore, fetchSolicitud */]);

  // Populate formData from store.request
  useEffect(() => {
    if (store.request) {
      const nombreCompleto = get(store.request, 'nombreSolicita', '');
      const telefono = get(store.request, 'telefonoSolicita', '');
      const telefonoAlternativo = get(store.request, 'telefonoSolicita2', '');
      const email = get(store.request, 'emailSolicita', '');
      const confirmEmail = get(store.request, 'emailSolicita', '');
      const cedulaPasaporte = get(store.request, 'cedulaPasaporte', '');

      setFormData((prevFormData) => ({
        ...prevFormData,
        nombreCompleto,
        telefono,
        telefonoAlternativo,
        email,
        confirmEmail,
        cedulaPasaporte,
      }));
    }
  }, [store.request]);

  // Update store based on store.request flags
  useEffect(() => {
    if (store.request) {
      setStore((prevState) => ({
        ...prevState,
        ...(store.request.nombreSolicita && { solicitud: true }),
        ...(store.request.pensionType && { demandante: true }),
        ...(store.request.demandante && { demandado: true }),
        ...(store.request.demandado && { gastosPensionado: true }),
        ...(store.request.gastosPensionado && { archivosAdjuntos: true }),
        ...(store.request.archivosAdjuntos && { firmaYEntrega: true }),
        ...(store.request.firmaYEntrega && { solicitudAdicional: true }),
        ...(store.request.solicitudAdicional && { resumen: true }),
      }));
    }
  }, [store.request, setStore]);

  useEffect(() => {
    if (formData.cuenta) {
      const fetchUser = async () => {
        try {
          console.log("Cuenta ", formData.cuenta);
          const response = await axios.get('/api/get-user-cuenta', {
            params: { userCuenta: formData.cuenta },
          });

          const user = response.data;
          setStore((prevData) => ({
            ...prevData,
            rol: get(user, 'solicitud.rol', 0)
          }));

        } catch (error) {
          console.error('Failed to fetch user:', error);
        }
      };

      fetchUser();
    }
  }, [formData.cuenta, setStore]);

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showSummaryForm, setShowSummaryForm] = useState(false);

  // Check authentication token on mount
  useEffect(() => {
    const userData = checkAuthToken();
    console.log("userData ", userData?.user_id);
    if (userData) {
      setFormData((prevData) => ({
        ...prevData,
        email: userData?.email || '',
        confirmEmail: userData?.email || '',
        cuenta: userData?.user_id || '',
      }));
      setIsLoggedIn(true);
    }
  }, []);

  useEffect(() => {
    if (formData.cuenta) {
      const fetchUser = async () => {
        try {
          console.log("Cuenta ", formData.cuenta)
          const response = await axios.get('/api/get-user-cuenta', {
            params: { userCuenta: formData.cuenta },
          });

          const user = response.data;
          console.log("Usuario ", user)
          setStore((prevData) => ({
            ...prevData,
            rol: get(user, 'solicitud.rol', 0)
          }));

        } catch (error) {
          console.error('Failed to fetch solicitudes:', error);
        }
      };

      fetchUser();
    }
  }, [formData.cuenta]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prevData) => ({
        ...prevData,
        [name]: checked,
      }));
    } else {
      setFormData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
    }
  };

  const handleCountryChange = (name: string, value: string) => {
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const validateEmails = () => formData.email === formData.confirmEmail;

  const nombreCompletoRef = useRef<HTMLInputElement>(null);
  const telefonoRef = useRef<HTMLInputElement>(null);
  const cedulaPasaporteRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const confirmEmailRef = useRef<HTMLInputElement>(null);

  const fieldValidations = [
    { field: "nombreCompleto", ref: nombreCompletoRef, errorMessage: "Por favor, ingrese el nombre completo." },
    { field: "telefono", ref: telefonoRef, errorMessage: "Por favor, ingrese el número de teléfono." },
    { field: "cedulaPasaporte", ref: cedulaPasaporteRef, errorMessage: "Por favor, ingrese la cédula o pasaporte." },
    { field: "email", ref: emailRef, errorMessage: "Por favor, ingrese el correo electrónico." },
    { field: "confirmEmail", ref: confirmEmailRef, errorMessage: "Por favor, confirme el correo electrónico." },
  ];

  const validateFields = () => {
    for (const { field, ref, errorMessage } of fieldValidations) {
      // Verifica si el campo está vacío
      if (!formData[field]) {
        setErrors((prevErrors) => ({ ...prevErrors, [field]: true }));

        Swal.fire({
          position: "top-end",
          icon: "warning",
          title: errorMessage,
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
            timerProgressBar: 'custom-swal-timer-bar'
          }
        });

        // Scroll al campo en error
        if (ref.current) {
          ref.current.scrollIntoView({ behavior: "smooth", block: "center" });
          ref.current.focus();
        }

        return false;
      }

      // Validación adicional para el nombre completo (mínimo 3 letras)
      if (field === 'nombreCompleto' && formData.nombreCompleto.length < 3) {
        setErrors((prevErrors) => ({ ...prevErrors, [field]: true }));

        Swal.fire({
          position: "top-end",
          icon: "warning",
          title: "El nombre debe tener al menos 3 caracteres.",
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
            timerProgressBar: 'custom-swal-timer-bar'
          }
        });

        // Scroll al campo en error
        if (ref.current) {
          ref.current.scrollIntoView({ behavior: "smooth", block: "center" });
          ref.current.focus();
        }
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (
    e: React.FormEvent,
    isSummary: boolean = false,
    currentPosition: number
  ) => {
    e.preventDefault();

    if (!recaptchaToken) {
      alert('Please complete the reCAPTCHA');
      return;
    }

    if (!validateEmails()) {
      Swal.fire({
        position: "top-end",
        icon: 'error',
        title: 'Error',
        text: 'Los correos electrónicos no coinciden. Por favor, verifica e intenta de nuevo.',
        showConfirmButton: false,
        timer: 1500,
      });
      return;
    }

    if (!formData.terminosAceptados) {
      Swal.fire({
        position: "top-end",
        icon: "warning",
        title: "Debes aceptar los términos y condiciones.",
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
          timerProgressBar: 'custom-swal-timer-bar'
        }
      });

      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    if (!validateFields()) {
      setIsLoading(false);
      return;
    }

    try {
      const emailResult = await axios.get('/api/validate-email', {
        params: {
          email: formData.email || formData.summaryEmail,
          isLogged: isLoggedIn.toString(),
        },
      });

      const { cuenta, isLogged } = emailResult.data;

      if (isLogged && cuenta) {
        await sendCreateRequest(cuenta, isSummary, currentPosition);
      } else if (!isLogged && cuenta) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Este correo ya está en uso. Por favor, inicia sesión para continuar.',
        });
      } else if (!cuenta) {
        await sendCreateRequest('', isSummary, currentPosition);
      }

    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Hubo un problema verificando el correo. Por favor, inténtalo de nuevo más tarde.',
      });
      console.error('API Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const sendCreateRequest = async (cuenta: string, isSummary: boolean, currentPosition: number) => {
    try {
      const authToken = checkAuthToken ? await checkAuthToken() : null;
      const requestData = {
        nombreSolicita: formData.nombreCompleto || '',
        telefonoSolicita: `${countryCodes[formData.telefonoCodigo]}${formData.telefono}` || '',
        telefonoSolicita2: `${countryCodes[formData.telefonoAlternativoCodigo]}${formData.telefonoAlternativo}` || '',
        cedulaPasaporte: formData.cedulaPasaporte || '',
        emailSolicita: formData.email || formData.summaryEmail,
        actualizarPorCorreo: formData.notificaciones === 'yes',
        cuenta: cuenta || authToken?.user_id || '',
        precio: 150,
        subtotal: 150,
        total: 150,
        resumenCaso: formData.resumenCaso || '',
        summaryEmail: formData.summaryEmail || formData.email,
        accion: isSummary ? "Envío de resumen de caso" : "Creación de solicitud",
        tipo: isSummary ? "resumen" : "pension"
      };

      const response = await axios.post('/api/create-request', requestData);
      const { solicitudId, status } = response.data;

      if (status === 'success' && solicitudId) {
        Swal.fire({
          icon: 'success',
          title: isSummary ? 'Resumen Enviado' : 'Formulario Enviado',
          text: isSummary ? 'Resumen enviado correctamente.' : 'Formulario enviado correctamente.',
        });

        if (!isSummary) {
          setStore((prevState) => ({
            ...prevState,
            solicitudId,
            solicitud: true,
            currentPosition: 2
          }));
        }
      }

    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Hubo un problema enviando la solicitud. Por favor, inténtalo de nuevo más tarde.',
      });
      console.error('Error creating request:', error);
    }
  };

  useEffect(() => {
    console.log("🚀 ~ solicitud:", store.solicitud);
  }, [store.solicitud]);


  const handleRecaptchaChange = (token) => {
    setRecaptchaToken(token);
  };

  const sendCasoResumen = async () => {
    try {
      const requestData = {
        resumenCaso: formData.resumenCaso || '',
        summaryEmail: formData.summaryEmail || '',
        status: 1,
      };

      const response = await axios.post(`${backendBaseUrl}/${backendEnv}/create-caso-resumen`, requestData);
      const { status } = response.data;

      if (status === 'success') {
        Swal.fire({
          icon: 'success',
          title: 'Resumen del Caso Enviado',
          text: 'Resumen enviado correctamente.',
        }).then(() => {
          router.push('/home');
        });
      }

    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Hubo un problema enviando el resumen. Por favor, inténtalo de nuevo más tarde.',
      });
      console.error('Error sending summary:', error);
    }
  };

  return (
    <div className="w-full h-full p-8 overflow-y-scroll scrollbar-thin bg-[#070707]">
      <h1 className="text-white text-4xl font-bold">¡Bienvenido a la Solicitud de Pensión Alimenticia en Línea!</h1>
      <p className="text-white mt-4">
        Estimado cliente, por favor asegúrese de leer la descripción a continuación antes de solicitar el trámite y para aclarar dudas.
      </p>

      <form className="mt-4" onSubmit={(e) => handleSubmit(e, false, store.currentPosition || 0)}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            name="nombreCompleto"
            value={formData.nombreCompleto}
            onChange={handleChange}
            className={`w-full p-4 bg-gray-800 text-white rounded-lg ${errors.nombreCompleto ? 'border-2 border-red-500' : ''}`}
            placeholder="Nombre completo"
            disabled={store.request.status >= 10 && store.rol < 20}
          />


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
              className={`w-full p-4 bg-gray-800 text-white rounded-lg ${errors.telefono ? 'border-2 border-red-500' : ''}`}
              placeholder="Número de teléfono"
              disabled={store.request.status >= 10 && store.rol < 20}
            />
          </div>

          <div className="flex gap-2">
            <CountrySelect
              name="telefonoAlternativoCodigo"
              value={formData.telefonoAlternativoCodigo}
              onChange={(value) => handleCountryChange('telefonoAlternativoCodigo', value)}
              isDisabled={store.request.status >= 10 && store.rol < 20}
              className="w-contain"
            />
            <input
              type="text"
              name="telefonoAlternativo"
              value={formData.telefonoAlternativo}
              onChange={handleChange}
              className="p-4 bg-gray-800 text-white rounded-lg w-full"
              placeholder="Número de teléfono alternativo"
              disabled={store.request.status >= 10 && store.rol < 20}
            />
          </div>

          <input
            type="text"
            name="cedulaPasaporte"
            value={formData.cedulaPasaporte}
            onChange={handleChange}
            className={`w-full p-4 bg-gray-800 text-white rounded-lg ${errors.cedulaPasaporte ? 'border-2 border-red-500' : ''}`}
            placeholder="Cédula o ID"
            disabled={store.request.status >= 10 && store.rol < 20}
          />
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={`w-full p-4 bg-gray-800 text-white rounded-lg ${errors.email ? 'border-2 border-red-500' : ''}`}
            placeholder="Dirección de correo electrónico"
            disabled={store.request.status >= 10 && store.rol < 20}
          />
          <input
            type="email"
            name="confirmEmail"
            value={formData.confirmEmail}
            onChange={handleChange}
            className={`w-full p-4 bg-gray-800 text-white rounded-lg ${errors.confirmEmail ? 'border-2 border-red-500' : ''}`}
            placeholder="Confirmar correo electrónico"
            disabled={store.request.status >= 10 && store.rol < 20}
          />
        </div>

        {/* Toggle button for case summary */}
        <div className="mt-8">
          <button
            type="button"
            className="bg-profile text-white w-full py-3 rounded-lg"
            onClick={() => setShowSummaryForm((prev) => !prev)}
          >
            {showSummaryForm ? "Ocultar Resumen de tu caso ▲" : "Enviar Resumen de tu caso ▼"}
          </button>
        </div>

        {/* Conditionally render the summary form */}
        {showSummaryForm && (
          <div className="mt-4">
            <textarea
              name="resumenCaso"
              value={formData.resumenCaso}
              onChange={handleChange}
              placeholder="Resumen del caso"
              rows={5}
              className="p-4 w-full bg-gray-800 text-white rounded-lg"
              required
              disabled={store.request.status >= 10 && store.rol < 20}
            />
            <input
              type="email"
              name="summaryEmail"
              value={formData.summaryEmail}
              onChange={handleChange}
              className="p-4 w-full bg-gray-800 text-white rounded-lg"
              placeholder="Dirección de correo electrónico"
              required
              disabled={store.request.status >= 10 && store.rol < 20}
            />

            {(!store.request.status || store.request.status < 10 || (store.request.status >= 10 && store.rol > 20)) && (
              <button
                className={`w-full py-3 rounded-lg mt-4 ${isLoading ? 'bg-gray-400' : 'bg-profile'} text-white`}
                type="button"
                onClick={sendCasoResumen}
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <ClipLoader size={24} color="#ffffff" />
                    <span className="ml-2">Cargando...</span>
                  </div>
                ) : (
                  'Enviar y salir'
                )}
              </button>
            )}
          </div>
        )}

        {/* Email notification section */}
        <div className="mt-4">
          <p className="text-white">¿Deseas que te notifiquemos a tu correo?</p>
          <label className="inline-flex items-center mt-4">
            <input
              type="radio"
              name="notificaciones"
              value="yes"
              checked={formData.notificaciones === "yes"}
              onChange={handleChange}
              className="form-radio"
            />
            <span className="ml-2 text-white">Sí, enviarme las notificaciones por correo electrónico.</span>
          </label>
        </div>
        <div className="mt-2">
          <label className="inline-flex items-center mt-2">
            <input
              type="radio"
              name="notificaciones"
              value="no"
              checked={formData.notificaciones === "no"}
              onChange={handleChange}
              className="form-radio"
            />
            <span className="ml-2 text-white">No, lo reviso directamente en el sistema.</span>
          </label>
        </div>

        {/* Terms and conditions checkbox */}
        <div className="mt-4">
          <label className="inline-flex items-center">
            <input
              type="checkbox"
              name="terminosAceptados"
              checked={formData.terminosAceptados}
              onChange={handleChange}
              className="form-checkbox"
            />
            <span className="ml-2 text-white">Acepto los términos y condiciones de este servicio.</span>
          </label>
        </div>

        <div className="mt-4">
          <ReCAPTCHA
            sitekey="6LejlrwqAAAAAN_WiEXqKIAT3qhfqPm-y1wh3BPi"
            onChange={handleRecaptchaChange}
          />
        </div>

        {/* Submit button */}
        {(!store.request.status || store.request.status < 10 || (store.request.status >= 10 && store.rol > 20)) && (
          <button
            className={`w-full py-3 rounded-lg mt-4 ${isLoading ? 'bg-gray-400' : 'bg-profile'} text-white`}
            type="submit"
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
        )}

        {/* Continue button when request status >= 10 */}
        {store.request.status >= 10 && (
          <button
            className="bg-profile text-white w-full py-3 rounded-lg mt-6"
            type="button"
            onClick={() => {
              setStore((prevState) => ({
                ...prevState,
                currentPosition: 2,
              }));
            }}
          >
            Continuar
          </button>
        )}
      </form>
    </div>
  );
};

export default PensionAlimenticiaBienvenido;
