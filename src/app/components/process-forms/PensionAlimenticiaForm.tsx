import React, { useState } from 'react';
import CountrySelect from '../CountrySelect';
import axios from 'axios';
import Swal from 'sweetalert2';
import { auth } from '@configuration/firebase';
import { useRouter } from 'next/navigation';

const PensionAlimenticiaForm = ({ formData, setFormData }: any) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleCountryChange = (name: string, value: string) => {
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // Validate required fields
      if (!formData.nombreCompleto || !formData.telefono || !formData.cedula || !formData.email || !formData.confirmarEmail) {
        await Swal.fire({
          icon: 'warning',
          title: 'Por favor, completa todos los campos requeridos.',
          background: '#2c2c3e',
          color: '#fff',
        });
        setIsSubmitting(false);
        return;
      }
      if (formData.email !== formData.confirmarEmail) {
        await Swal.fire({
          icon: 'error',
          title: 'Los correos electrónicos no coinciden.',
          background: '#2c2c3e',
          color: '#fff',
        });
        setIsSubmitting(false);
        return;
      }
      // Step 1: Create request
      const requestData = {
        nombreSolicita: formData.nombreCompleto,
        telefonoSolicita: `${formData.telefonoCodigo || 'PA'}${formData.telefono}`.trim(),
        telefonoSolicita2: `${formData.telefonoAlternativoCodigo || 'PA'}${formData.telefonoAlternativo}`.trim(),
        cedulaPasaporte: formData.cedula,
        emailSolicita: formData.email,
        summaryEmail: formData.email,
        precio: 1800,
        subtotal: 1800,
        total: 1800,
        resumenCaso: '',
        tipo: 'pension-alimenticia',
      };
      const response = await axios.post('/api/create-request', requestData, {
        headers: { 'Content-Type': 'application/json' },
      });
      const solicitudId = response.data?.solicitudId || response.data?.uid;
      if (!solicitudId) throw new Error('No se recibió solicitudId');
      // Step 2: Create record
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
        type: 'pension-alimenticia',
        lawyer: lawyerEmail,
      };
      const recordRes = await axios.post('/api/create-record', recordData, {
        headers: { 'Content-Type': 'application/json' },
      });
      const recordResponse = recordRes.data;
      const recordId = recordResponse?.recordId;
      const recordType = recordResponse?.expedienteType;
      if (!recordId) throw new Error('No se recibió recordId');
      // Step 3: Update solicitud with expedienteId
      const updateRes = await axios.patch('/api/update-request-all', {
        solicitudId,
        expedienteId: recordId,
        expedienteType: recordType,
        status: 1,
      });
      if (updateRes.status !== 200) throw new Error('Error al actualizar la solicitud con expedienteId');
      await Swal.fire({
        icon: 'success',
        title: 'Solicitud enviada correctamente',
        timer: 2500,
        showConfirmButton: false,
        background: '#2c2c3e',
        color: '#fff',
      });
      router.push(`/request/pension-alimenticia/${solicitudId}`);
    } catch (error) {
      console.error('[PensionAlimenticiaForm] Error in submission:', error);
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

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <input
            type="text"
            name="nombreCompleto"
            placeholder="Nombre completo"
            value={formData.nombreCompleto || ''}
            onChange={handleChange}
            className="py-3 px-5 block w-full bg-[#23263A] text-white border-2 border-white rounded-lg text-sm mb-2"
            required
          />
        </div>
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
            placeholder="Número de teléfono"
            value={formData.telefono || ''}
            onChange={handleChange}
            className="ml-2 px-5 block w-full bg-[#23263A] text-white border-2 border-white rounded-lg text-sm"
            required
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex">
          <CountrySelect
            name="telefonoAlternativoCodigo"
            value={formData.telefonoAlternativoCodigo || 'PA'}
            onChange={value => handleCountryChange('telefonoAlternativoCodigo', value)}
            className="w-contain"
          />
          <input
            type="text"
            name="telefonoAlternativo"
            placeholder="Número de teléfono alternativo"
            value={formData.telefonoAlternativo || ''}
            onChange={handleChange}
            className="ml-2 px-5 block w-full bg-[#23263A] text-white border-2 border-white rounded-lg text-sm"
          />
        </div>
        <div>
          <input
            type="text"
            name="cedula"
            placeholder="Cédula o ID"
            value={formData.cedula || ''}
            onChange={handleChange}
            className="py-3 px-5 block w-full bg-[#23263A] text-white border-2 border-white rounded-lg text-sm mb-2"
            required
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <input
            type="email"
            name="email"
            placeholder="Dirección de correo electrónico"
            value={formData.email || ''}
            onChange={handleChange}
            className="py-3 px-5 block w-full bg-[#23263A] text-white border-2 border-white rounded-lg text-sm mb-2"
            required
          />
        </div>
        <div>
          <input
            type="email"
            name="confirmarEmail"
            placeholder="Confirmar correo electrónico"
            value={formData.confirmarEmail || ''}
            onChange={handleChange}
            className="py-3 px-5 block w-full bg-[#23263A] text-white border-2 border-white rounded-lg text-sm mb-2"
            required
          />
        </div>
      </div>
      <button
        type="submit"
        disabled={isSubmitting}
        className={`bg-profile text-white font-bold py-3 px-6 rounded-lg transition-colors mt-2 flex items-center justify-center ${
          isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-pink-700'
        }`}
      >
        {isSubmitting ? 'Enviando...' : 'Enviar'}
      </button>
    </form>
  );
};

export default PensionAlimenticiaForm; 