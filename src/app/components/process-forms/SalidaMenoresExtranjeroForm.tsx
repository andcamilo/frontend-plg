import React, { useState } from 'react';
import CountrySelect from '../CountrySelect';
import axios from 'axios';
import Swal from 'sweetalert2';

const initialMenor = {
  nombreCompleto: '',
  cedulaPasaporte: '',
  pasaporte: null,
  certificadoNacimiento: null,
  identificacion: null,
};

const initialAutorizado = {
  nombreCompleto: '',
  cedulaPasaporte: '',
  nacionalidad: 'Panama',
  telefonoCodigo: 'PA',
  telefono: '',
  email: '',
  identificacion: null,
  pasaporte: null,
  parentesco: '',
};

const SalidaMenoresExtranjeroForm = ({ formData, setFormData }: any) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [menores, setMenores] = useState([{ ...initialMenor }]);
  const [autorizado, setAutorizado] = useState({ ...initialAutorizado });
  const [esAutorizante, setEsAutorizante] = useState('Si');
  const [autorizacionTercero, setAutorizacionTercero] = useState('No');
  const [fechaSalida, setFechaSalida] = useState('');
  const [fechaRetorno, setFechaRetorno] = useState('');
  const [fechaFirma, setFechaFirma] = useState('');
  const [boletosViaje, setBoletosViaje] = useState<File | null>(null);
  const [parentesco, setParentesco] = useState('');

  const handleMenorChange = (idx: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, files } = e.target;
    setMenores(prev => prev.map((m, i) => i === idx ? { ...m, [name]: files ? files[0] : value } : m));
  };

  const handleAddMenor = () => {
    setMenores(prev => [...prev, { ...initialMenor }]);
  };

  const handleAutorizadoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, files } = e.target as any;
    setAutorizado(prev => ({ ...prev, [name]: files ? files[0] : value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // Validate required fields (minimal for demo)
      if (!autorizado.nombreCompleto || !autorizado.cedulaPasaporte || !autorizado.telefono || !autorizado.email) {
        await Swal.fire({
          icon: 'warning',
          title: 'Por favor, completa todos los campos requeridos.',
          background: '#2c2c3e',
          color: '#fff',
        });
        setIsSubmitting(false);
        return;
      }
      // Prepare FormData for file uploads
      const data = new FormData();
      data.append('autorizado', JSON.stringify(autorizado));
      data.append('esAutorizante', esAutorizante);
      data.append('autorizacionTercero', autorizacionTercero);
      data.append('fechaSalida', fechaSalida);
      data.append('fechaRetorno', fechaRetorno);
      data.append('fechaFirma', fechaFirma);
      if (boletosViaje) data.append('boletosViaje', boletosViaje);
      data.append('parentesco', parentesco);
      menores.forEach((menor, idx) => {
        data.append(`menores[${idx}]`, JSON.stringify({
          nombreCompleto: menor.nombreCompleto,
          cedulaPasaporte: menor.cedulaPasaporte,
        }));
        if (menor.identificacion) data.append(`menorIdentificacion${idx}`, menor.identificacion);
        if (menor.pasaporte) data.append(`menorPasaporte${idx}`, menor.pasaporte);
        if (menor.certificadoNacimiento) data.append(`menorCertificadoNacimiento${idx}`, menor.certificadoNacimiento);
      });
      if (autorizado.identificacion) data.append('autorizadoIdentificacion', autorizado.identificacion);
      if (autorizado.pasaporte) data.append('autorizadoPasaporte', autorizado.pasaporte);
      // Step 1: Create request
      const requestRes = await axios.post('/api/create-request-consultaPropuesta', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const solicitudId = requestRes.data?.solicitudId || requestRes.data?.uid;
      if (!solicitudId) throw new Error('No se recibió solicitudId');
      // Step 2: Create record
      const recordData = {
        solicitudId,
        solicitud: solicitudId,
        name: autorizado.nombreCompleto,
        lastName: '',
        email: autorizado.email,
        phone: autorizado.telefono,
        tipoServicio: '',
        nivelUrgencia: '',
        descripcion: '',
        lawyer: '',
      };
      await axios.post('/api/create-record', recordData, {
        headers: { 'Content-Type': 'application/json' },
      });
      await Swal.fire({
        icon: 'success',
        title: 'Solicitud enviada correctamente',
        timer: 2500,
        showConfirmButton: false,
        background: '#2c2c3e',
        color: '#fff',
      });
      window.location.reload();
    } catch (error) {
      console.error('[SalidaMenoresExtranjeroForm] Error in submission:', error);
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
      {/* Información del Menor */}
      <h2 className="font-bold text-white text-xl">Información del Menor</h2>
      {menores.map((menor, idx) => (
        <div key={idx} className="mb-4 border-b border-gray-700 pb-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-white">Nombre completo del Menor:</label>
              <input type="text" name="nombreCompleto" value={menor.nombreCompleto} onChange={e => handleMenorChange(idx, e)} className="py-3 px-5 block w-full bg-[#1B1B29] text-white border-2 border-white rounded-lg text-sm mb-2" required />
            </div>
            <div>
              <label className="font-bold text-white">Cédula o pasaporte del Menor:</label>
              <input type="text" name="cedulaPasaporte" value={menor.cedulaPasaporte} onChange={e => handleMenorChange(idx, e)} className="py-3 px-5 block w-full bg-[#1B1B29] text-white border-2 border-white rounded-lg text-sm mb-2" required />
            </div>
          </div>
        </div>
      ))}
      <button type="button" onClick={handleAddMenor} className="bg-profile text-white font-bold py-2 px-4 rounded-lg mb-4 w-fit">Adicionar Menor</button>
      {/* Información del Autorizado */}
      <h2 className="font-bold text-white text-xl">Información del Autorizado</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="font-bold text-white">Nombre completo:</label>
          <input type="text" name="nombreCompleto" value={autorizado.nombreCompleto} onChange={handleAutorizadoChange} className="py-3 px-5 block w-full bg-[#1B1B29] text-white border-2 border-white rounded-lg text-sm mb-2" required />
        </div>
        <div>
          <label className="font-bold text-white">Correo electrónico:</label>
          <input type="email" name="email" value={autorizado.email} onChange={handleAutorizadoChange} className="py-3 px-5 block w-full bg-[#1B1B29] text-white border-2 border-white rounded-lg text-sm mb-2" required />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="font-bold text-white">Número de cédula o pasaporte:</label>
          <input type="text" name="cedulaPasaporte" value={autorizado.cedulaPasaporte} onChange={handleAutorizadoChange} className="py-3 px-5 block w-full bg-[#1B1B29] text-white border-2 border-white rounded-lg text-sm mb-2" required />
        </div>
        <div>
          <label className="font-bold text-white">Nacionalidad:</label>
          <select name="nacionalidad" value={autorizado.nacionalidad} onChange={handleAutorizadoChange} className="py-3 px-5 block w-full bg-[#1B1B29] text-white border-2 border-white rounded-lg text-sm mb-2">
            <option value="Panama">Panama</option>
            {/* Add more options as needed */}
          </select>
        </div>
        <div>
          <label className="font-bold text-white">Número de teléfono:</label>
          <div className="flex">
            <CountrySelect name="telefonoCodigo" value={autorizado.telefonoCodigo} onChange={value => setAutorizado((prev: any) => ({ ...prev, telefonoCodigo: value }))} className="w-contain" />
            <input type="text" name="telefono" value={autorizado.telefono} onChange={handleAutorizadoChange} className="ml-2 px-5 block w-full bg-[#1B1B29] text-white border-2 border-white rounded-lg text-sm" required />
          </div>
        </div>
      </div>
      <div>
        <label className="font-bold text-white">¿Indica si eres el autorizante de la salida del menor?</label>
        <select value={esAutorizante} onChange={e => setEsAutorizante(e.target.value)} className="py-3 px-5 block w-full bg-[#1B1B29] text-white border-2 border-white rounded-lg text-sm mb-2">
          <option value="Si">Si</option>
          <option value="No">No</option>
        </select>
      </div>
      <div>
        <label className="font-bold text-white">Parentesco con el menor:</label>
        <select value={parentesco} onChange={e => setParentesco(e.target.value)} className="py-3 px-5 block w-full bg-[#1B1B29] text-white border-2 border-white rounded-lg text-sm mb-2">
          <option value="">Seleccione</option>
          <option value="Padre">Padre</option>
          <option value="Madre">Madre</option>
          <option value="Tutor legal">Tutor legal</option>
          <option value="Otro">Otro</option>
        </select>
      </div>
      <div>
        <label className="font-bold text-white">La autorización va dirigida a un tercero:</label>
        <select value={autorizacionTercero} onChange={e => setAutorizacionTercero(e.target.value)} className="py-3 px-5 block w-full bg-[#1B1B29] text-white border-2 border-white rounded-lg text-sm mb-2">
          <option value="No">No</option>
          <option value="Si">Si</option>
        </select>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="font-bold text-white">Indique la fecha de salida del menor:</label>
          <input type="date" value={fechaSalida} onChange={e => setFechaSalida(e.target.value)} className="py-3 px-5 block w-full bg-[#1B1B29] text-white border-2 border-white rounded-lg text-sm mb-2" />
        </div>
        <div>
          <label className="font-bold text-white">Indique la fecha de retorno del menor:</label>
          <input type="date" value={fechaRetorno} onChange={e => setFechaRetorno(e.target.value)} className="py-3 px-5 block w-full bg-[#1B1B29] text-white border-2 border-white rounded-lg text-sm mb-2" />
        </div>
        <div>
          <label className="font-bold text-white">Indique la fecha que desea asistir a firmar a la notaría:</label>
          <input type="date" value={fechaFirma} onChange={e => setFechaFirma(e.target.value)} className="py-3 px-5 block w-full bg-[#1B1B29] text-white border-2 border-white rounded-lg text-sm mb-2" />
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

export default SalidaMenoresExtranjeroForm; 