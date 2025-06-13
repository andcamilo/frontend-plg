import React, { useState } from 'react';
import CountrySelect from '../CountrySelect';
import axios from 'axios';
import Swal from 'sweetalert2';
import { auth } from '@configuration/firebase';

const ConsultaPresencialForm = ({ formData, setFormData }: any) => {
  const [showEmailRespuesta, setShowEmailRespuesta] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [disponibilidad, setDisponibilidad] = useState([
    { fecha: '', horaInicio: '', horaFin: '' }
  ]);

  // Extra fields for presencial
  const [consultaOficina, setConsultaOficina] = useState('');
  const [buscarCliente, setBuscarCliente] = useState('');
  const [direccionBuscar, setDireccionBuscar] = useState('');

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

  const handleDisponibilidadChange = (idx: number, field: string, value: string) => {
    setDisponibilidad(prev => {
      const updated = [...prev];
      updated[idx][field] = value;
      return updated;
    });
  };

  const handleConsultaOficinaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setConsultaOficina(e.target.value);
    setFormData((prev: any) => ({ ...prev, consultaOficina: e.target.value }));
    if (e.target.value === 'No') setBuscarCliente('');
  };

  const handleBuscarClienteChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setBuscarCliente(e.target.value);
    setFormData((prev: any) => ({ ...prev, buscarCliente: e.target.value }));
    if (e.target.value === 'No') setDireccionBuscar('');
  };

  const handleDireccionBuscarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDireccionBuscar(e.target.value);
    setFormData((prev: any) => ({ ...prev, direccionBuscar: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const disponibilidadPayload = disponibilidad.map((d) => ({
        fecha: d.fecha,
        horaInicio: d.horaInicio,
        horaFin: d.horaFin,
      }));
      // First API call
      const requestData = {
        nombreSolicita: formData.nombreCompleto,
        telefonoSolicita: formData.telefono,
        celularSolicita: formData.celular,
        cedulaPasaporte: formData.cedulaPasaporte || '',
        emailSolicita: formData.email,
        empresaSolicita: formData.empresa || '',
        tipoConsulta: 'Consulta Presencial',
        areaLegal: formData.areaLegal || '',
        detallesPropuesta: formData.detallesPropuesta || '',
        preguntasEspecificas: formData.preguntasEspecificas || '',
        emailRespuesta: formData.emailRespuesta || '',
        disponibilidad: disponibilidadPayload,
        consultaOficina,
        buscarCliente,
        direccionBuscar,
        accion: 'Creación de solicitud',
        tipo: 'consulta-presencial',
        item: 'Consulta Presencial',
        status: 1,
        precio: 80,
        subtotal: 80,
        total: 80,
      };
      console.log('[ConsultaPresencialForm] Sending create-request-consultaPropuesta:', requestData);
      const response = await axios.post('/api/create-request-consultaPropuesta', requestData, {
        headers: { 'Content-Type': 'application/json' },
      });
      console.log('[ConsultaPresencialForm] Response from create-request-consultaPropuesta:', response.data);
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
        lawyer: lawyerEmail,
      };
      console.log('[ConsultaPresencialForm] Sending create-record:', recordData);
      const recordResponse = await axios.post('/api/create-record', recordData, {
        headers: { 'Content-Type': 'application/json' },
      });
      console.log('[ConsultaPresencialForm] Response from create-record:', recordResponse.data);

      await Swal.fire({
        icon: 'success',
        title: 'Consulta presencial enviada correctamente',
        timer: 2500,
        showConfirmButton: false,
        background: '#2c2c3e',
        color: '#fff',
      });
      window.location.reload();
    } catch (error) {
      console.error('[ConsultaPresencialForm] Error in submission:', error);
      await Swal.fire({
        icon: 'error',
        title: 'Error al enviar la consulta presencial',
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
      <div className="mb-2">
        <label className="font-bold text-white">Tipo de consulta:</label>
        <input
          type="text"
          value="Consulta Presencial"
          disabled
          className="py-3 px-5 block w-full bg-[#1B1B29] text-white border-2 border-white rounded-lg text-sm mb-2"
        />
      </div>
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
        <label className="font-bold text-white">Detalles de la Solicitud de Propuesta:</label>
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
      <h2 className="font-bold text-white text-xl mt-4">Calendario y Disponibilidad</h2>
      <div className="mb-2 text-gray-300 text-sm">
        Escoge una fecha y un rango de horas en las que estás disponible, y te confirmaremos dentro de las próximas 24 horas.
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-2">
        <div>
          <label className="text-white">Fecha:</label>
          <input
            type="date"
            value={disponibilidad[0].fecha}
            onChange={e => handleDisponibilidadChange(0, 'fecha', e.target.value)}
            className="py-2 px-3 block w-full bg-[#1B1B29] text-white border-2 border-white rounded-lg text-sm [&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:brightness-200"
          />
        </div>
        <div>
          <label className="text-white">Hora Inicio:</label>
          <input
            type="time"
            value={disponibilidad[0].horaInicio}
            onChange={e => handleDisponibilidadChange(0, 'horaInicio', e.target.value)}
            className="py-2 px-3 block w-full bg-[#1B1B29] text-white border-2 border-white rounded-lg text-sm [&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:brightness-200"
          />
        </div>
        <div>
          <label className="text-white">Hora Fin:</label>
          <input
            type="time"
            value={disponibilidad[0].horaFin}
            onChange={e => handleDisponibilidadChange(0, 'horaFin', e.target.value)}
            className="py-2 px-3 block w-full bg-[#1B1B29] text-white border-2 border-white rounded-lg text-sm [&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:brightness-200"
          />
        </div>
      </div>
      <div>
        <label className="font-bold text-white">¿Desea que la consulta sea en las oficinas de Panamá Legal Group o en una dirección específica?</label>
        <select
          name="consultaOficina"
          value={consultaOficina}
          onChange={handleConsultaOficinaChange}
          className="py-3 px-5 block w-full bg-[#1B1B29] text-white border-2 border-white rounded-lg text-sm mb-2"
        >
          <option value="">Seleccione una opción</option>
          <option value="Si">Sí, en las oficinas de Panamá Legal Group.</option>
          <option value="No">No, en una dirección específica.</option>
        </select>
      </div>
      {consultaOficina === 'No' && (
        <div>
          <label className="font-bold text-white">Indique la Dirección:</label>
          <input
            type="text"
            name="direccionBuscar"
            value={direccionBuscar}
            onChange={handleDireccionBuscarChange}
            className="py-3 px-5 block w-full bg-[#1B1B29] text-white border-2 border-white rounded-lg text-sm mb-2"
          />
        </div>
      )}
      <div>
        <label className="font-bold text-white">¿Desea que lo busquemos a un lugar en específico para llegar a nuestras oficinas?</label>
        <select
          name="buscarCliente"
          value={buscarCliente}
          onChange={handleBuscarClienteChange}
          className="py-3 px-5 block w-full bg-[#1B1B29] text-white border-2 border-white rounded-lg text-sm mb-2"
        >
          <option value="">Seleccione una opción</option>
          <option value="Si">Sí</option>
          <option value="No">No</option>
        </select>
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

export default ConsultaPresencialForm; 