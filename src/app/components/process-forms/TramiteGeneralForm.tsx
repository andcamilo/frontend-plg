import React, { useState } from 'react';
import Swal from 'sweetalert2';
import { useRouter } from 'next/navigation';
import { uploadFile } from '@/src/app/utils/firebase-upload';
import { auth } from '@configuration/firebase';
import { Rol } from '@constants/roles';

interface FileInput {
  id: number;
  file: File | null;
}

const TramiteGeneralForm = ({ formData, setFormData }: any) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [fileInputs, setFileInputs] = useState<FileInput[]>([{ id: Date.now(), file: null }]);
  const router = useRouter();

  const handleFileChange = (index: number, file: File | null) => {
    setFileInputs((prev) => prev.map((input, i) => i === index ? { ...input, file } : input));
  };

  const handleAddFileInput = () => {
    setFileInputs((prev) => [...prev, { id: Date.now() + Math.random(), file: null }]);
  };

  const handleRemoveFileInput = (index: number) => {
    setFileInputs((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      // 1. Upload files to Firebase and collect URLs
      const fileUploadPromises = fileInputs
        .filter(input => input.file)
        .map(input => uploadFile(input.file as File));
      const fileUrls = await Promise.all(fileUploadPromises);

      // 2. Create tramite request
      const tramiteData = {
        nombre: formData.nombre || '',
        email: formData.email || '',
        rol: Rol.CLIENTE,
        telefonoSolicita: formData.telefono || '',
        cedulaPasaporte: formData.cedulaPasaporte || ''
      };

      const tramiteRes = await fetch('/api/create-request-tramite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(tramiteData),
      });
      if (!tramiteRes.ok) throw new Error('Error al crear el trámite');
      const tramiteJson = await tramiteRes.json();
      const solicitudId = tramiteJson?.uid || tramiteJson?.solicitudId;
      if (!solicitudId) throw new Error('No se recibió solicitudId');

      // 3. Create record
      const recordData = {
        solicitudId,
        solicitud: solicitudId,
        name: formData.nombre || '',
        lastName: formData.apellido || '',
        email: formData.email || '',
        phone: formData.telefono || '',
        tipoServicio: formData.tipoServicio || '',
        nivelUrgencia: formData.nivelUrgencia || '',
        descripcion: formData.descripcion || '',
        lawyer: auth.currentUser?.email || '',
        type: 'tramite-general'
      };
      const recordRes = await fetch('/api/create-record', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(recordData),
      });
      if (!recordRes.ok) throw new Error('Error al crear el expediente');
      const recordResponse = await recordRes.json();
      const recordId = recordResponse?.recordId;
      if (!recordId) throw new Error('No se recibió recordId');

      // 4. Update solicitud with expedienteId
      const recordType = recordResponse?.expedienteType;
      const updateRes = await fetch('/api/update-request-all', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          solicitudId, 
          expedienteId: recordId,
          expedienteType: recordType,
          status: 1,
        }),
      });
      if (!updateRes.ok) throw new Error('Error al actualizar la solicitud con expedienteId');

      setSuccess(true);
      setFormData({});
      setFileInputs([{ id: Date.now(), file: null }]);
      await Swal.fire({
        icon: 'success',
        title: 'Trámite y expediente creados exitosamente.',
        timer: 2500,
        showConfirmButton: false,
        background: '#2c2c3e',
        color: '#fff',
      });
      router.push(`/dashboard/my-records`);
    } catch (err: any) {
      setError(err.message || 'Error desconocido');
      await Swal.fire({
        icon: 'error',
        title: 'Error al crear el trámite o expediente',
        text: err.message || 'Error desconocido',
        background: '#2c2c3e',
        color: '#fff',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <label className="font-bold text-white">Nombre Completo</label>
      <input
        type="text"
        name="nombre"
        placeholder="Nombre Completo"
        value={formData.nombre || ''}
        onChange={e => setFormData((prev: any) => ({ ...prev, nombre: e.target.value }))}
        className="py-3 px-5 block w-full bg-[#1B1B29] text-white border-2 border-white rounded-lg text-sm mb-2"
        required
      />
      <label className="font-bold text-white">Email</label>
      <input
        type="email"
        name="email"
        placeholder="Correo electrónico"
        value={formData.email || ''}
        onChange={e => setFormData((prev: any) => ({ ...prev, email: e.target.value }))}
        className="py-3 px-5 block w-full bg-[#1B1B29] text-white border-2 border-white rounded-lg text-sm mb-2"
        required
      />
      <label className="font-bold text-white">Teléfono</label>
      <input
        type="text"
        name="telefono"
        placeholder="Teléfono"
        value={formData.telefono || ''}
        onChange={e => setFormData((prev: any) => ({ ...prev, telefono: e.target.value }))}
        className="py-3 px-5 block w-full bg-[#1B1B29] text-white border-2 border-white rounded-lg text-sm mb-2"
        required
      />
      <label className="font-bold text-white">Cédula o Pasaporte</label>
      <input
        type="text"
        name="cedulaPasaporte"
        placeholder="Cédula o Pasaporte"
        value={formData.cedulaPasaporte || ''}
        onChange={e => setFormData((prev: any) => ({ ...prev, cedulaPasaporte: e.target.value }))}
        className="py-3 px-5 block w-full bg-[#1B1B29] text-white border-2 border-white rounded-lg text-sm mb-2"
        required
      />

      <label className="font-bold text-white">Detalle del tipo de servicio que requiere</label>
      <select
        name="tipoServicio"
        value={formData.tipoServicio || ''}
        onChange={e => setFormData((prev: any) => ({ ...prev, tipoServicio: e.target.value }))}
        className="py-3 px-5 block w-full bg-[#1B1B29] text-white border-2 border-white rounded-lg text-sm mb-2"
        required
      >
        <option value="">Seleccione una opción</option>
        <option value="Revisión o Elaboración de Contrato">Revisión o Elaboración de Contrato</option>
        <option value="Laboral">Laboral</option>
        <option value="Consulta o Investigación Legal">Consulta o Investigación Legal</option>
        <option value="DGI">DGI</option>
        <option value="Caja de Seguro Social">Caja de Seguro Social</option>
        <option value="Municipio">Municipio</option>
        <option value="Migración">Migración</option>
        <option value="Temas Bancarios">Temas Bancarios</option>
        <option value="Varios">Varios</option>
        <option value="Otros">Otros</option>
      </select>

      <label className="font-bold text-white">Nivel de urgencia</label>
      <select
        name="nivelUrgencia"
        value={formData.nivelUrgencia || ''}
        onChange={e => setFormData((prev: any) => ({ ...prev, nivelUrgencia: e.target.value }))}
        className="py-3 px-5 block w-full bg-[#1B1B29] text-white border-2 border-white rounded-lg text-sm mb-2"
        required
      >
        <option value="">Seleccione el nivel de urgencia</option>
        <option value="Bajo: No excede 15 días hábiles">Bajo: No excede 15 días hábiles</option>
        <option value="Medio: No excede 7 días hábiles">Medio: No excede 7 días hábiles</option>
        <option value="Alto: No excede 72 horas">Alto: No excede 72 horas</option>
        <option value="Atención Extraordinaria: No excede 24 horas">Atención Extraordinaria: No excede 24 horas</option>
      </select>

      <label className="font-bold text-white">Descripción del requerimiento o situación, si son varios, puede detallarlos en puntos separados en la siguiente casilla.</label>
      <textarea
        name="descripcion"
        placeholder="Describa el requerimiento o situación"
        value={formData.descripcion || ''}
        onChange={e => setFormData((prev: any) => ({ ...prev, descripcion: e.target.value }))}
        className="py-3 px-5 block w-full bg-[#1B1B29] text-white border-2 border-white rounded-lg text-sm mb-2"
        required
      />

      <label className="font-bold text-white">Subir documentos</label>
      {fileInputs.map((input, idx) => (
        <div key={input.id} className="flex items-center gap-2 mb-2">
          <input
            type="file"
            name={`documentos-${input.id}`}
            onChange={e => handleFileChange(idx, e.target.files ? e.target.files[0] : null)}
            className="py-3 px-5 block w-full bg-[#1B1B29] text-white border-2 border-white rounded-lg text-sm"
          />
          <button
            type="button"
            onClick={handleAddFileInput}
            className="text-white rounded px-2 py-1 font-bold text-lg"
            title="Agregar otro archivo"
          >
            +
          </button>
          {fileInputs.length > 1 && (
            <button
              type="button"
              onClick={() => handleRemoveFileInput(idx)}
              className="text-white rounded px-2 py-1 font-bold text-lg"
              title="Eliminar este archivo"
            >
              -
            </button>
          )}
        </div>
      ))}

      {error && <div className="text-red-500 font-bold">{error}</div>}
      {success && <div className="text-green-500 font-bold">Trámite y expediente creados exitosamente.</div>}

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

export default TramiteGeneralForm; 