import React from 'react';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

const tipoSolicitudOptions: { [key: string]: { value: string; label: string }[] } = {
  'corporativo': [
    { value: 'nueva-sociedad-empresa', label: 'Nueva Sociedades/Empresas' },
    { value: 'solicitud-cambios-sociedades', label: 'Solicitud de Cambios sociedades' },
    { value: 'fundaciones', label: 'Fundaciones' },
  ],
  'propiedad-intelectual': [
    { value: 'marcas', label: 'Marcas' },
    { value: 'patentes', label: 'Patentes' },
    { value: 'derecho-autor', label: 'Derecho de autor' },
  ],
  'direccion-general-ingresos': [
    { value: 'registro-ruc', label: 'Registro de Ruc' },
    { value: 'paz-salvos', label: 'Paz y Salvos' },
    { value: 'actualizacion-correos', label: 'Actualización de correos' },
    { value: 'solicitud-vivienda-principe', label: 'Solicitud de vivienda Príncipe' },
  ],
  'familia': [
    { value: 'solicitud-pensiones', label: 'Solicitud de pensiones' },
    { value: 'pension', label: 'Pensiones' },
    { value: 'desacato', label: 'Desacato' },
  ],
  'laboral': [
    { value: 'contrato', label: 'Contrato' },
    { value: 'permisos-trabajos', label: 'Permisos de trabajos' },
    { value: 'conciliaciones', label: 'Conciliaciones' },
    { value: 'citaciones', label: 'Citaciones' },
  ],
  'migracion': [
    { value: 'salidas-menores', label: 'Salidas de menores' },
    { value: 'residencias', label: 'Residencias' },
    { value: 'visas', label: 'Visas' },
    { value: 'naturalizacion', label: 'Naturalización' },
  ],
  'propiedades': [
    { value: 'propiedades', label: 'Propiedades' },
  ],
  'consultas-propuestas': [
    { value: 'consultas-propuestas', label: 'Consultas y Propuestas' },
  ],
  'otros': [
    { value: 'otros', label: 'Otros' },
  ],
};

const CreateProcessFormSI = ({
  isSubmitting,
  form,
  setForm,
  solicitudes,
  selectedSolicitudId,
  setSelectedSolicitudId,
  handleFormChange,
  handleFormSubmitSI,
  emailExists
}: any) => (
  <form onSubmit={handleFormSubmitSI} className="flex flex-col gap-4">
    <label className="font-bold text-white">Correo electrónico:</label>
    <div className="relative w-full">
      <input
        type="email"
        name="email"
        placeholder="Correo electrónico"
        value={form.email}
        onChange={handleFormChange}
        className={`py-3 px-5 block w-full bg-[#1B1B29] text-white border-2 rounded-lg text-sm mb-2 ${form.email ? (emailExists ? 'border-green-500 pr-10' : 'border-red-500 pr-10') : 'border-white'}`}
        required
      />
      {form.email && (
        emailExists ? (
          <CheckCircleIcon className="text-green-500 absolute right-3 top-1/2 transform -translate-y-1/2" />
        ) : (
          <CancelIcon className="text-red-500 absolute right-3 top-1/2 transform -translate-y-1/2" />
        )
      )}
    </div>
    <label className="font-bold text-white">Tipo de trámite:</label>
    <select
      name="tipoTramite"
      value={form.tipoTramite}
      onChange={handleFormChange}
      className="py-3 px-5 block w-full bg-[#1B1B29] text-white border-2 border-white rounded-lg text-sm mb-2"
      required
    >
      <option value="">Seleccione un tipo de trámite</option>
      <option value="corporativo">Corporativo</option>
      <option value="propiedad-intelectual">Propiedad Intelectual</option>
      <option value="direccion-general-ingresos">Dirección General de ingresos</option>
      <option value="familia">Familia</option>
      <option value="laboral">Laboral</option>
      <option value="migracion">Migración</option>
      <option value="propiedades">Propiedades</option>
      <option value="consultas-propuestas">Consultas y Propuestas</option>
      <option value="otros">Otros</option>
    </select>
    {form.tipoTramite && (
      <>
        <label className="font-bold text-white">Tipo de solicitud:</label>
        <select
          name="tipoSolicitud"
          value={form.tipoSolicitud || ''}
          onChange={handleFormChange}
          className="py-3 px-5 block w-full bg-[#1B1B29] text-white border-2 border-white rounded-lg text-sm mb-2"
          required
        >
          <option value="">Seleccione un tipo de solicitud</option>
          {tipoSolicitudOptions[form.tipoTramite]?.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </>
    )}
    {solicitudes.length > 0 && (
      <>
        <label className="font-bold text-white">Seleccionar Solicitud:</label>
        <select
          value={selectedSolicitudId}
          onChange={e => setSelectedSolicitudId(e.target.value)}
          className="py-3 px-5 block w-full bg-[#1B1B29] text-white border-2 border-white rounded-lg text-sm mb-2"
          required
        >
          {solicitudes.map(s => (
            <option key={s.id} value={s.id}>
              {s.id}
            </option>
          ))}
        </select>
      </>
    )}
    <button
      type="submit"
      disabled={isSubmitting}
      className={`bg-profile text-white font-bold py-3 px-6 rounded-lg transition-colors mt-2 flex items-center justify-center ${
        isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-pink-700'
      }`}
    >
      {isSubmitting ? (
        <>
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Enviando...
        </>
      ) : (
        'Enviar'
      )}
    </button>
  </form>
);

export default CreateProcessFormSI; 