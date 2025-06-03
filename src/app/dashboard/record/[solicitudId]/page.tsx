'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';

const RecordPage = () => {
  const params = useParams();
  const solicitudId = params?.solicitudId as string;

  const [title, setTitle] = useState('');
  const [stage, setStage] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [file, setFile] = useState<File | null>(null);

  if (!solicitudId) {
    return <div className="text-white p-4">No se encontró el ID del expediente</div>;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Formulario enviado (aún no implementado)');
  };

  return (
    <div className="p-8 w-full text-white">
      <h1 className="text-2xl font-bold mb-6">Detalles del Expediente</h1>

      <div className="bg-[#1B1B29] rounded-lg shadow p-6 mb-8 border border-white">
        <p className="text-white">ID del Expediente: <strong>{solicitudId}</strong></p>
      </div>

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
        >
          Crear Item
        </button>
      </form>
    </div>
  );
};

export default RecordPage;
