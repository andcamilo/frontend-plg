import React, { useState } from 'react';
import CountrySelect from '../CountrySelect';
import axios from 'axios';
import Swal from 'sweetalert2';
import { auth } from '@configuration/firebase';
import { useRouter } from 'next/navigation';

const ConsultaEscritaForm = ({ formData, setFormData }: any) => {
  const [showEmailRespuesta, setShowEmailRespuesta] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleCountryChange = (name: string, value: string) => {
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleAddEmailRespuesta = () => {
    setShowEmailRespuesta(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // First API call
      const requestData = {
        nombreSolicita: formData.nombreCompleto,
        telefonoSolicita: formData.telefono,
        celularSolicita: formData.celular,
        cedulaPasaporte: formData.cedulaPasaporte || '',
        emailSolicita: formData.email,
        empresaSolicita: formData.empresa || '',
        tipoConsulta: 'Consulta Escrita',
        areaLegal: formData.areaLegal || '',
        detallesPropuesta: formData.detallesPropuesta || '',
        preguntasEspecificas: formData.preguntasEspecificas || '',
        emailRespuesta: formData.emailRespuesta || '',
        accion: 'Creación de solicitud',
        tipo: 'consulta-escrita',
        item: 'Consulta Escrita',
        status: 10,
        precio: 175,
        subtotal: 175,
        total: 175,
      };
      console.log('[ConsultaEscritaForm] Sending create-request-consultaPropuesta:', requestData);
      const response = await axios.post('/api/create-request-consultaPropuesta', requestData, {
        headers: { 'Content-Type': 'application/json' },
      });
      console.log('[ConsultaEscritaForm] Response from create-request-consultaPropuesta:', response.data);
      const solicitudId = response.data?.solicitudId || response.data?.uid;
      if (!solicitudId) throw new Error('No se recibió solicitudId');

      // Second API call
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
        descripcion: formData.detallesPropuesta,
        type: 'consulta-escrita',
        lawyer: lawyerEmail,
      };
      console.log('[ConsultaEscritaForm] Sending create-record:', recordData);
      const recordResponse = await axios.post('/api/create-record', recordData, {
        headers: { 'Content-Type': 'application/json' },
      });
      console.log('[ConsultaEscritaForm] Response from create-record:', recordResponse.data);

      // Step 3: Update solicitud with expedienteId
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
      console.log('[ConsultaEscritaForm] Response from update-request-all:', updateRes.data);

      await Swal.fire({
        icon: 'success',
        title: 'Consulta enviada correctamente',
        timer: 2500,
        showConfirmButton: false,
        background: '#2c2c3e',
        color: '#fff',
      });
      router.push(`/request/consulta-propuesta/${solicitudId}`);
    } catch (error) {
      console.error('[ConsultaEscritaForm] Error in submission:', error);
      await Swal.fire({
        icon: 'error',
        title: 'Error al enviar la consulta',
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
          <label className="font-bold text-white">Nombre completo de a quién va dirigida la Consulta (persona natural):</label>
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
          <label className="font-bold text-white">Dirección de correo electrónico:</label>
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="font-bold text-white">Número de cédula o Pasaporte:</label>
          <input
            type="text"
            name="cedulaPasaporte"
            value={formData.cedulaPasaporte || ''}
            onChange={handleChange}
            className="py-3 px-5 block w-full bg-[#1B1B29] text-white border-2 border-white rounded-lg text-sm mb-2"
          />
        </div>
        <div>
          <label className="font-bold text-white">Número de teléfono:</label>
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
              className="ml-2 px-5 block w-full bg-[#1B1B29] text-white border-2 border-white rounded-lg text-sm "
            />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="font-bold text-white">Número de celular / WhatsApp:</label>
          <div className="flex">
            <CountrySelect
              name="celularCodigo"
              value={formData.celularCodigo || 'PA'}
              onChange={value => handleCountryChange('celularCodigo', value)}
              className="w-contain"
            />
            <input
              type="text"
              name="celular"
              value={formData.celular || ''}
              onChange={handleChange}
              className="px-5 ml-2 block w-full bg-[#1B1B29] text-white border-2 border-white rounded-lg text-sm"
            />
          </div>
        </div>
      </div>
      <button
        type="button"
        onClick={handleAddEmailRespuesta}
        className="bg-profile text-white font-bold py-3 px-6 rounded-lg transition-colors mt-2 mb-2 flex items-center justify-center"
      >
        Adicionar correo electrónico para envío de consulta
      </button>
      {showEmailRespuesta && (
        <div>
          <label className="font-bold text-white">Correo electrónico adicional para envío de consulta:</label>
          <input
            type="email"
            name="emailRespuesta"
            value={formData.emailRespuesta || ''}
            onChange={handleChange}
            className="py-3 px-5 block w-full bg-[#1B1B29] text-white border-2 border-white rounded-lg text-sm mb-2"
          />
        </div>
      )}
      <div>
        <label className="font-bold text-white">Si la consulta va dirigida a una empresa, por favor incluya el nombre:</label>
        <input
          type="text"
          name="empresa"
          value={formData.empresa || ''}
          onChange={handleChange}
          className="py-3 px-5 block w-full bg-[#1B1B29] text-white border-2 border-white rounded-lg text-sm mb-2"
        />
      </div>
      <h2 className="font-bold text-white text-xl mt-4">Detalles de la Consulta</h2>
      <div>
        <label className="font-bold text-white">Área Legal:</label>
        <input
          type="text"
          name="areaLegal"
          value={formData.areaLegal || ''}
          onChange={handleChange}
          className="py-3 px-5 block w-full bg-[#1B1B29] text-white border-2 border-white rounded-lg text-sm mb-2"
        />
      </div>
      <div>
        <label className="font-bold text-white">Detalles de la Consulta Escrita:</label>
        <textarea
          name="detallesPropuesta"
          value={formData.detallesPropuesta || ''}
          onChange={handleChange}
          className="py-3 px-5 block w-full bg-[#1B1B29] text-white border-2 border-white rounded-lg text-sm mb-2"
          rows={3}
        />
      </div>
      <div>
        <label className="font-bold text-white">Preguntas Específicas:</label>
        <textarea
          name="preguntasEspecificas"
          value={formData.preguntasEspecificas || ''}
          onChange={handleChange}
          className="py-3 px-5 block w-full bg-[#1B1B29] text-white border-2 border-white rounded-lg text-sm mb-2"
          rows={3}
        />
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

export default ConsultaEscritaForm; 