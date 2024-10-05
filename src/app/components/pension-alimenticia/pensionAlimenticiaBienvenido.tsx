"use client";
import React, { useState, useEffect, useContext } from 'react';
import Swal from 'sweetalert2'; 
import AppStateContext from '@context/context'; 
import { checkAuthToken } from '@utils/checkAuthToken';
import axios from 'axios'; // Replacing emailCheck import with axios
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
    cedula: '',  // Added field for Cedula or ID
    email: '',
    confirmEmail: '',
    notificaciones: '',
    terminosAceptados: false,
  });

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false); 

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const validateEmails = () => formData.email === formData.confirmEmail;

  const handleSubmit = async (e: React.FormEvent) => {
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
          email: formData.email,
          isLogged: isLoggedIn.toString(),
        },
      });
      

      const { cuenta, isLogged } = emailResult.data;

      if (isLogged && cuenta) {
        await sendCreateRequest(cuenta); 
      } else if (!isLogged && cuenta) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Este correo ya está en uso. Por favor, inicia sesión para continuar.',
        });
      } else if (!cuenta) {
        await sendCreateRequest('');  // Send empty or default cuenta
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

  const sendCreateRequest = async (cuenta: string) => {
    try {
      const requestData = {
        nombreSolicita: formData.nombreCompleto,
        telefonoSolicita: formData.telefono,
        telefonoSolicita2: formData.telefonoAlternativo,
        cedula: formData.cedula,  // Send the cedula in the request
        emailSolicita: formData.email,
        actualizarPorCorreo: formData.notificaciones === 'yes',
        cuenta: cuenta || '',  
        precio: 150,
        subtotal: 150,
        total: 150,
        accion: "Creación de solicitud",
        tipo: "pension"
      };

      const response = await axios.post('/api/create-request', requestData);
      const { solicitudId, status } = response.data;

      if (status === 'success' && solicitudId) {
        Swal.fire({
          icon: 'success',
          title: 'Formulario Enviado',
          text: 'Formulario enviado correctamente.',
        });

        setStore((prevState) => ({
          ...prevState,
          solicitudId, 
          solicitud: true,
          currentPosition: 2
        }));
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

      <form className="mt-4" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            required  // Make it required if necessary
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

        <div className="mt-4">
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

        <button className="bg-profile text-white w-full py-3 rounded-lg mt-4" type="submit" disabled={isLoading}>
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
