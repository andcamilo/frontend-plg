import React, { useState } from 'react';
import Swal from 'sweetalert2'; // Import SweetAlert2
import { emailCheck } from '@/src/pages/api/email-check';
import axios from 'axios';

const PensionAlimenticiaForm: React.FC = () => {
  const [formData, setFormData] = useState({
    nombreCompleto: '',
    telefono: '',
    telefonoAlternativo: '',
    email: '',
    confirmEmail: '',
    notificaciones: '',
    terminosAceptados: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const validateEmails = () => {
    return formData.email === formData.confirmEmail;
  };

  const handleEmailCheck = async () => {
    try {
      const result = await emailCheck(formData.email);
      console.log("🚀 ~ handleEmailCheck ~ result:", result)
      if (result.exists) {
        return result.cuenta;
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Correo no encontrado',
          text: `El correo no está registrado.`,
        });
        return null;
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error al verificar el correo. Intente nuevamente más tarde.',
      });
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateEmails()) {
      Swal.fire({
        icon: 'warning',
        title: 'Error',
        text: 'Los correos electrónicos no coinciden. Por favor, verifica e intenta de nuevo.',
      });
      return;
    }

    // Check if the email exists using the email-check API
    const cuenta = await handleEmailCheck();

    if (cuenta) {
      // Prepare the data for creating the solicitud using the found cuenta
      const solicitudData = {
        actualizarPorCorreo: formData.notificaciones === 'yes' ? 'sí' : 'no',
        emailSolicita: formData.email,
        accion: 'Creación de solicitud',
        item: 'Pensión alimenticia',
        precio: 150,
        subtotal: 150,
        total: 150,
        nombreSolicita: formData.nombreCompleto,
        telefonoSolicita: formData.telefono,
        telefonoSolicita2: formData.telefonoAlternativo,
        tipo: 'pension',
        cuenta: cuenta,
      };

      try {
        const response = await axios.post('/api/create-request', solicitudData, {
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.status === 200) {
          Swal.fire({
            icon: 'success',
            title: 'Solicitud creada',
            text: 'La solicitud ha sido creada exitosamente.',
          });
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Hubo un problema al crear la solicitud.',
          });
        }
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Hubo un problema al crear la solicitud. Intente nuevamente más tarde.',
        });
      }
    }
  };

  return (
    <div className="w-1/2 h-full p-8 overflow-y-scroll scrollbar-thin bg-[#070707]">
      <h1 className="text-white text-4xl font-bold">¡Bienvenido a la Solicitud de Pensión Alimenticia en Línea!</h1>
      <p className="text-white mt-4">
        Estimado cliente, por favor asegúrese de leer la descripción a continuación antes de solicitar el trámite y para aclarar dudas.
      </p>
      <h2 className="text-white text-2xl font-bold mt-8">Nombre del solicitante/contacto:</h2>
      <p className="text-white mt-2">
        * Puede ser la misma persona, o bien un amigo o un familiar que ayude a quien solicita la pensión.
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
        <div className="mt-8">
          <h2 className="text-white text-3xl font-bold">Condiciones del servicio</h2>
          <p className="mt-4">
            Le recordamos las Condiciones del servicio de este trámite, por favor leer atentamente.
          </p>
          <ul className="list-disc list-inside mt-4">
            <li>Todos los datos serán utilizados para el proceso solicitado, conforme a la Ley de Protección de Datos Personales.</li>
            <li>El costo del servicio se limita a la Solicitud de Pensión Alimenticia en primera instancia.</li>
            <li>El cliente podrá solicitar reuniones de seguimiento con el abogado asignado.</li>
          </ul>
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
        <button className="bg-profile text-white w-full py-3 rounded-lg mt-4" type="submit">
          Guardar y continuar
        </button>
      </form>
    </div>
  );
};

export default PensionAlimenticiaForm;
