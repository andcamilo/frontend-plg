"use client";
import React, { useState, useEffect, useContext } from 'react';
import Swal from 'sweetalert2'; 
import AppStateContext from '@context/context'; 
import { checkAuthToken } from '@utils/checkAuthToken';
import axios from 'axios'; 
import ClipLoader from 'react-spinners/ClipLoader'; 

const PensionAlimenticiaBienvenido: React.FC = () => {
  const context = useContext(AppStateContext);

  if (!context) {
    throw new Error('AppStateContext must be used within an AppStateProvider');
  }

  const { store, setStore } = context;

  const [formData, setFormData] = useState({
    nombreCompleto: '',
    telefono: '',
    telefonoAlternativo: '',
    cedula: '',
    email: '',
    confirmEmail: '',
    notificaciones: '',
    terminosAceptados: false,
    resumenCaso: '', 
    summaryEmail: '',
  });

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false); 
  const [showSummaryForm, setShowSummaryForm] = useState(false); 

  useEffect(() => {
    const userEmail = checkAuthToken();
    if (userEmail) {
      setFormData((prevData) => ({
        ...prevData,
        email: userEmail,
        confirmEmail: userEmail,
      }));
      setIsLoggedIn(true); 
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
  
  const validateEmails = () => formData.email === formData.confirmEmail;

  const handleSubmit = async (e: React.FormEvent, isSummary: boolean = false, currentPostion: number) => {
    e.preventDefault();

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
        await sendCreateRequest(cuenta, isSummary, currentPostion); 
      } else if (!isLogged && cuenta) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Este correo ya está en uso. Por favor, inicia sesión para continuar.',
        });
      } else if (!cuenta) {
        await sendCreateRequest('', isSummary, currentPostion); 
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

  const sendCreateRequest = async (cuenta: string, isSummary: boolean, currentPostion: number) => {
    try {
      const requestData = {
        nombreSolicita: formData.nombreCompleto || '',
        telefonoSolicita: formData.telefono || '',
        telefonoSolicita2: formData.telefonoAlternativo || '',
        cedula: formData.cedula || '',
        emailSolicita: formData.email || formData.summaryEmail ,
        actualizarPorCorreo: formData.notificaciones === 'yes',
        cuenta: cuenta || '',  
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
            currentPosition: currentPostion
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

  return (
    <div className="w-full h-full p-8 overflow-y-scroll scrollbar-thin bg-[#070707]">
      <h1 className="text-white text-4xl font-bold">¡Bienvenido a la Solicitud de Pensión Alimenticia en Línea!</h1>
      <p className="text-white mt-4">
        Estimado cliente, por favor asegúrese de leer la descripción a continuación antes de solicitar el trámite y para aclarar dudas.
      </p>

      <form className="mt-4" onSubmit={(e) => handleSubmit(e, false, store.currentPosition || 0)}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Existing form fields */}
          <input
            type="text"
            name="nombreCompleto"
            value={formData.nombreCompleto}
            onChange={handleChange}
            className="p-4 bg-gray-800 text-white rounded-lg"
            placeholder="Nombre completo"
            required
          />
          <input
            type="text"
            name="telefono"
            value={formData.telefono}
            onChange={handleChange}
            className="p-4 bg-gray-800 text-white rounded-lg"
            placeholder="Número de teléfono"
            required
          />
          <input
            type="text"
            name="telefonoAlternativo"
            value={formData.telefonoAlternativo}
            onChange={handleChange}
            className="p-4 bg-gray-800 text-white rounded-lg"
            placeholder="Número de teléfono alternativo"
          />
          <input
            type="text"
            name="cedula"
            value={formData.cedula}
            onChange={handleChange}
            className="p-4 bg-gray-800 text-white rounded-lg"
            placeholder="Cédula o ID"
            required
          />
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="p-4 bg-gray-800 text-white rounded-lg"
            placeholder="Dirección de correo electrónico"
            required
          />
          <input
            type="email"
            name="confirmEmail"
            value={formData.confirmEmail}
            onChange={handleChange}
            className="p-4 bg-gray-800 text-white rounded-lg"
            placeholder="Confirmar correo electrónico"
            required
          />
        </div>

        {/* Toggle button for case summary */}
        <div className="mt-8">
          <button
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
              name="resumenCaso"  // Make sure this matches the key in formData
              value={formData.resumenCaso}  // This should correctly bind the value from formData
              onChange={handleChange}
              placeholder="Resumen del caso"
              rows={5}
              className="p-4 w-full bg-gray-800 text-white rounded-lg"
              required
            />

            <input
              type="email"
              name="summaryEmail"
              value={formData.summaryEmail}
              onChange={handleChange}
              className="p-4 w-full bg-gray-800 text-white rounded-lg"
              placeholder="Dirección de correo electrónico"
              required
            />
      
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
          </div>
        )}

        {/* Email notification section */}
        <div className="mt-8">
          <p className="text-white">¿Deseas que te notifiquemos a tu correo?</p>
          <label className="inline-flex items-center mt-4">
            <input
              type="radio"
              name="notificaciones"
              value="yes"
              checked={formData.notificaciones === 'yes'}
              onChange={handleChange}
              className="form-radio"
            />
            <span className="ml-2 text-white">Sí, enviarme las notificaciones por correo electrónico.</span>
          </label>
          <label className="inline-flex items-center mt-2">
            <input
              type="radio"
              name="notificaciones"
              value="no"
              checked={formData.notificaciones === 'no'}
              onChange={handleChange}
              className="form-radio"
            />
            <span className="ml-2 text-white">No, lo reviso directamente en el sistema.</span>
          </label>
        </div>

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

        {/* "Guardar y continuar" button with isLoading functionality */}
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
      </form>
    </div>
  );
};

export default PensionAlimenticiaBienvenido;
