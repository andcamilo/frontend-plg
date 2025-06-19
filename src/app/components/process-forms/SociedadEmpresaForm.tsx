import React, { useState } from 'react';
import CountrySelect from '../CountrySelect';
import axios from 'axios';
import Swal from 'sweetalert2';
import { auth } from '@configuration/firebase';
import { useRouter } from 'next/navigation';

const SociedadEmpresaForm = ({ formData, setFormData }: any) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev: any) => ({
      ...prev,
      [name]: type === 'checkbox' && 'checked' in e.target ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleCountryChange = (name: string, value: string) => {
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // Validate required fields
      if (!formData.nombreCompleto || !formData.telefono || !formData.cedulaPasaporte || !formData.email || !formData.confirmEmail) {
        await Swal.fire({
          icon: 'warning',
          title: 'Por favor, completa todos los campos requeridos.',
          background: '#2c2c3e',
          color: '#fff',
        });
        setIsSubmitting(false);
        return;
      }
      if (formData.email !== formData.confirmEmail) {
        await Swal.fire({
          icon: 'error',
          title: 'Los correos electrónicos no coinciden.',
          background: '#2c2c3e',
          color: '#fff',
        });
        setIsSubmitting(false);
        return;
      }
      // Step 1: Validate email
      const emailResult = await axios.get('/api/validate-email', {
        params: {
          email: formData.email,
          isLogged: 'false',
        },
      });
      const { cuenta } = emailResult.data;

      // Step 2: Create request
      const requestData = {
        nombreSolicita: formData.nombreCompleto,
        telefonoSolicita: `${formData.telefonoCodigo || 'PA'}${formData.telefono}`.trim(),
        cedulaPasaporte: formData.cedulaPasaporte,
        emailSolicita: formData.email,
        actualizarPorCorreo: formData.notificaciones === 'yes',
        cuenta: cuenta || '',
        precio: 1700,
        subtotal: 1700,
        total: 1700,
        accion: 'Creación de solicitud',
        tipo: 'new-sociedad-empresa',
      };
      const response = await axios.post('/api/create-request-empresa', requestData, {
        headers: { 'Content-Type': 'application/json' },
      });
      const solicitudId = response.data?.solicitudId;
      if (!solicitudId) throw new Error('No se recibió solicitudId');
      // Step 3: Create record
      const lawyerEmail = auth.currentUser?.email || '';
      const recordData = {
        solicitudId,
        solicitud: solicitudId,
        name: formData.nombreCompleto,
        lastName: '',
        email: formData.email,
        phone: formData.telefono,
        tipoServicio: '',
        nivelUrgencia: '',
        descripcion: '',
        lawyer: lawyerEmail,
      };
      const recordResponse = await axios.post('/api/create-record', recordData, {
        headers: { 'Content-Type': 'application/json' },
      });
      console.log('[SociedadEmpresaForm] Response from create-record:', recordResponse.data);

      // Step 4: Update solicitud with expedienteId
      const recordRes = recordResponse.data;
      const recordId = recordRes?.recordId;
      const recordType = recordRes?.expedienteType;
      if (!recordId) throw new Error('No se recibió recordId');
      
      const updateRes = await axios.patch('/api/update-request-all', {
        solicitudId,
        expedienteId: recordId,
        expedienteType: recordType,
        status: 10,
      });
      console.log('[SociedadEmpresaForm] Response from update-request-all:', updateRes.data);

      await Swal.fire({
        icon: 'success',
        title: 'Solicitud enviada correctamente',
        timer: 2500,
        showConfirmButton: false,
        background: '#2c2c3e',
        color: '#fff',
      });
      router.push(`/request/sociedad-empresa/${solicitudId}`);
    } catch (error) {
      console.error('[SociedadEmpresaForm] Error in submission:', error);
      await Swal.fire({
        icon: 'error',
        title: 'Error al enviar la solicitud',
        text: 'Por favor, inténtalo nuevamente.',
        background: '#2c2c3e',
        color: '#fff',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = !!(
    formData.nombreCompleto &&
    formData.telefono &&
    formData.cedulaPasaporte &&
    formData.email &&
    formData.confirmEmail
  );

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <h2 className="font-bold text-white text-xl">Información del Solicitante</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="font-bold text-white">Nombre completo</label>
          <input
            type="text"
            name="nombreCompleto"
            value={formData.nombreCompleto || ''}
            onChange={handleChange}
            className="py-3 px-5 block w-full bg-[#1B1B29] text-white border-2 border-white rounded-lg text-sm mb-2"
            required
          />
        </div>
        <div>
          <label className="font-bold text-white">Número de teléfono</label>
          <div className="flex">
            <CountrySelect
              name="telefonoCodigo"
              value={formData.telefonoCodigo || 'PA'}
              onChange={value => handleCountryChange('telefonoCodigo', value)}
              className="w-contain"
            />
            <input
              type="text"
              name="telefono"
              value={formData.telefono || ''}
              onChange={handleChange}
              className="ml-2 px-5 block w-full bg-[#1B1B29] text-white border-2 border-white rounded-lg text-sm"
              required
            />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="font-bold text-white">Número de cédula o Pasaporte</label>
          <input
            type="text"
            name="cedulaPasaporte"
            value={formData.cedulaPasaporte || ''}
            onChange={handleChange}
            className="py-3 px-5 block w-full bg-[#1B1B29] text-white border-2 border-white rounded-lg text-sm mb-2"
            required
          />
        </div>
        <div>
          <label className="font-bold text-white">Dirección de correo electrónico</label>
          <input
            type="email"
            name="email"
            value={formData.email || ''}
            onChange={handleChange}
            className="py-3 px-5 block w-full bg-[#1B1B29] text-white border-2 border-white rounded-lg text-sm mb-2"
            required
          />
        </div>
      </div>
      <div>
        <label className="font-bold text-white">Confirmar correo electrónico</label>
        <input
          type="email"
          name="confirmEmail"
          value={formData.confirmEmail || ''}
          onChange={handleChange}
          className="py-3 px-5 block w-full bg-[#1B1B29] text-white border-2 border-white rounded-lg text-sm mb-2"
          required
        />
      </div>
      <button
        type="submit"
        disabled={!isFormValid || isSubmitting}
        className={`bg-profile text-white font-bold py-3 px-6 rounded-lg transition-colors mt-2 flex items-center justify-center ${
          isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-pink-700'
        }`}
      >
        {isSubmitting ? 'Enviando...' : 'Enviar'}
      </button>
    </form>
  );
};

export default SociedadEmpresaForm; 