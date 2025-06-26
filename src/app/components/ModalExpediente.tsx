'use client';

import React, { useState } from 'react';
import Swal from 'sweetalert2';

interface ModalExpedienteProps {
  isOpen: boolean;
  onClose: () => void;
  solicitudId: string;
  onSuccess?: () => void;
}

const ModalExpediente: React.FC<ModalExpedienteProps> = ({
  isOpen,
  onClose,
  solicitudId,
  onSuccess
}) => {
  const [title, setTitle] = useState('');
  const [stage, setStage] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
  
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
      
      // Clear form after success
      setTitle('');
      setStage('');
      setDescripcion('');
      setFile(null);
      
      // Call success callback to refresh data
      if (onSuccess) {
        onSuccess();
      }
      
      // Close modal
      onClose();
    } catch (error: any) {
      setMessage('Error al actualizar el expediente');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setTitle('');
      setStage('');
      setDescripcion('');
      setFile(null);
      setMessage(null);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[#1B1B29] rounded-lg shadow-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto border border-white">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">Agregar Item al Expediente</h2>
          <button
            onClick={handleClose}
            disabled={loading}
            className="text-white hover:text-gray-300 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        {message && (
          <div className={`my-4 p-3 rounded ${message.startsWith('Error') ? 'bg-red-700' : 'bg-green-700'} text-white`}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block font-bold mb-2 text-white">Título</label>
            <input
              type="text"
              className="w-full py-3 px-5 bg-[#1B1B29] text-white border-2 border-white rounded-lg text-sm"
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className="block font-bold mb-2 text-white">Etapa</label>
            <input
              type="text"
              className="w-full py-3 px-5 bg-[#1B1B29] text-white border-2 border-white rounded-lg text-sm"
              value={stage}
              onChange={e => setStage(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className="block font-bold mb-2 text-white">Descripción</label>
            <textarea
              className="w-full py-3 px-5 bg-[#1B1B29] text-white border-2 border-white rounded-lg text-sm"
              value={descripcion}
              onChange={e => setDescripcion(e.target.value)}
              rows={4}
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className="block font-bold mb-2 text-white">Adjuntar archivo</label>
            <input
              type="file"
              className="block w-full text-white"
              style={{ colorScheme: 'dark' }}
              onChange={e => setFile(e.target.files ? e.target.files[0] : null)}
              disabled={loading}
            />
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="flex-1 bg-gray-600 text-white font-bold py-3 px-6 rounded-lg transition-colors hover:bg-gray-700 disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 bg-profile text-white font-bold py-3 px-6 rounded-lg transition-colors hover:bg-pink-700 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Guardando...' : 'Crear Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalExpediente; 