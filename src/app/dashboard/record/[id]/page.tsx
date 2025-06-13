'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import Swal from 'sweetalert2';

const RecordPage = () => {
  const params = useParams();
  const solicitudId = params?.id as string;

  const [title, setTitle] = useState('');
  const [stage, setStage] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  if (!solicitudId) {
    return <div className="text-white p-4">No se encontró el ID del expediente</div>;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
  
    const item = {
      body: {
        title,
        stage,
        descripcion
      }
    };
  
    try {
      const response = await fetch(`/api/update-record?id=${solicitudId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: [
            {
              body: {
                title,
                stage,
                descripcion,
                ...(file ? { file: file } : {})
              }
            }
          ]
        }),
      });
  
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Error');
      Swal.fire({
        icon: 'success',
        title: '¡Expediente actualizado!',
        text: 'El expediente se actualizó correctamente.',
        confirmButtonColor: '#3085d6',
        confirmButtonText: 'OK'
      });
      // Optional: clear form after success
      setTitle('');
      setStage('');
      setDescripcion('');
      setFile(null);
    } catch (error: any) {
      setMessage('Error al actualizar el expediente');
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <div className="p-8 w-full text-white">
      <h1 className="text-2xl font-bold mb-6">Detalles del Expediente</h1>

      <div className="bg-[#1B1B29] rounded-lg shadow p-6 mb-8 border border-white">
        <p className="text-white">ID del Expediente: <strong>{solicitudId}</strong></p>
      </div>

      {message && <div className={`my-4 p-3 rounded ${message.startsWith('Error') ? 'bg-red-700' : 'bg-green-700'} text-white`}>{message}</div>}

      <form onSubmit={handleSubmit} className="bg-[#1B1B29] rounded-lg shadow p-6 border border-white space-y-6">
        <h2 className="text-xl font-semibold mb-4">Crear nuevo item</h2>

        <div>
          <label className="block font-bold mb-2">Título</label>
          <input
            type="text"
            className="w-full py-3 px-5 bg-[#1B1B29] text-white border-2 border-white rounded-lg text-sm"
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block font-bold mb-2">Etapa</label>
          <input
            type="text"
            className="w-full py-3 px-5 bg-[#1B1B29] text-white border-2 border-white rounded-lg text-sm"
            value={stage}
            onChange={e => setStage(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block font-bold mb-2">Descripción</label>
          <textarea
            className="w-full py-3 px-5 bg-[#1B1B29] text-white border-2 border-white rounded-lg text-sm"
            value={descripcion}
            onChange={e => setDescripcion(e.target.value)}
            rows={4}
            required
          />
        </div>

        <div>
          <label className="block font-bold mb-2">Adjuntar archivo</label>
          <input
            type="file"
            className="block w-full text-white"
            style={{ colorScheme: 'dark' }}
            onChange={e => setFile(e.target.files ? e.target.files[0] : null)}
          />
        </div>

        <button
          type="submit"
          className="bg-profile text-white font-bold py-3 px-6 rounded-lg transition-colors hover:bg-pink-700 flex items-center justify-center"
          disabled={loading}
        >
          {loading ? 'Guardando...' : 'Crear Item'}
        </button>
      </form>
    </div>
  );
};

export default RecordPage;
