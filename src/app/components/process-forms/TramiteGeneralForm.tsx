import React from 'react';

const TramiteGeneralForm = ({ formData, setFormData, onSubmit, isSubmitting }: any) => (
  <form onSubmit={onSubmit} className="flex flex-col gap-4">
    <label className="font-bold text-white">Trámite General - Detalles:</label>
    <input
      type="text"
      name="detalle"
      placeholder="Detalle del trámite general"
      value={formData.detalle || ''}
      onChange={e => setFormData((prev: any) => ({ ...prev, detalle: e.target.value }))}
      className="py-3 px-5 block w-full bg-[#1B1B29] text-white border-2 border-white rounded-lg text-sm mb-2"
      required
    />
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

export default TramiteGeneralForm; 