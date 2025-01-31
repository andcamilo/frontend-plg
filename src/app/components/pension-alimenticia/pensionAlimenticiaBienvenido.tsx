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

  // Fetch user data based on cuenta
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
        icon: 'error',
        title: 'Error',
        text: 'Los correos electrónicos no coinciden. Por favor, verifica e intenta de nuevo.',
      });
      return;
    }

    setIsLoading(true);

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
            className="p-4 bg-gray-800 text-white rounded-lg"
            placeholder="Nombre completo"
            required
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
              className="p-4 bg-gray-800 text-white rounded-lg w-full"
              placeholder="Número de teléfono"
              required
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
            className="p-4 bg-gray-800 text-white rounded-lg"
            placeholder="Cédula o ID"
            required
            disabled={store.request.status >= 10 && store.rol < 20}
          />
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="p-4 bg-gray-800 text-white rounded-lg"
            placeholder="Dirección de correo electrónico"
            required
            disabled={store.request.status >= 10 && store.rol < 20}
          />
          <input
            type="email"
            name="confirmEmail"
            value={formData.confirmEmail}
            onChange={handleChange}
            className="p-4 bg-gray-800 text-white rounded-lg"
            placeholder="Confirmar correo electrónico"
            required
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
                onClick={(e) => handleSubmit(e as any, true, 1)}
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
              required
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
