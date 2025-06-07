import React from 'react';

const CreateProcessFormNO = ({
  isSubmitting,
  form2,
  setForm2,
  isEmergentFieldVisible,
  handleForm2Change,
  handleForm2FileChange,
  handleFormSubmitNo
}: any) => (
  <form onSubmit={handleFormSubmitNo} className="flex flex-col gap-4">
    <label className="font-bold text-white">Nombre:</label>
    <input
      type="text"
      name="nombre"
      placeholder="Nombre"
      value={form2.nombre}
      onChange={handleForm2Change}
      className="py-3 px-5 block w-full bg-[#1B1B29] text-white border-2 border-white rounded-lg text-sm mb-2"
      required
    />
    <label className="font-bold text-white">Apellido:</label>
    <input
      type="text"
      name="apellido"
      placeholder="Apellido"
      value={form2.apellido}
      onChange={handleForm2Change}
      className="py-3 px-5 block w-full bg-[#1B1B29] text-white border-2 border-white rounded-lg text-sm mb-2"
      required
    />
    <label className="font-bold text-white">Correo electrónico:</label>
    <input
      type="email"
      name="email"
      placeholder="Correo electrónico"
      value={form2.email}
      onChange={handleForm2Change}
      className="py-3 px-5 block w-full bg-[#1B1B29] text-white border-2 border-white rounded-lg text-sm mb-2"
      required
    />
    <label className="font-bold text-white">Tipo de Servicio:</label>
    <select
      name="tipoServicio"
      value={form2.tipoServicio}
      onChange={handleForm2Change}
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
    <label className="font-bold text-white">Nivel de Urgencia:</label>
    <select
      name="nivelUrgencia"
      value={form2.nivelUrgencia}
      onChange={handleForm2Change}
      className="py-3 px-5 block w-full bg-[#1B1B29] text-white border-2 border-white rounded-lg text-sm mb-2"
      required
    >
      <option value="">Seleccione nivel de urgencia</option>
      <option value="Bajo">Bajo: No excede 15 días hábiles</option>
      <option value="Medio">Medio: No excede 7 días hábiles</option>
      <option value="Alto">Alto: No excede 72 horas</option>
      <option value="Atención Extraordinaria">Atención Extraordinaria: No excede 24 horas</option>
    </select>
    <small className="text-gray-400 mt-1 mb-4">
      * Por favor tomar nota de que los tiempos aquí establecidos son respecto al proceso de la firma, sin embargo, los trámites también dependerán de la institución pública en los casos que aplique, para la cual daremos seguimiento, pero no podemos garantizar tiempos de ejecución de ellas.
    </small>
    {isEmergentFieldVisible && (
      <>
        <label className="font-bold text-white">Descripción Extra:</label>
        <textarea
          name="descripcionExtra"
          placeholder="Por favor, detalle la urgencia de su solicitud"
          value={form2.descripcionExtra}
          onChange={handleForm2Change}
          className="py-3 px-5 block w-full bg-[#1B1B29] text-white border-2 border-white rounded-lg text-sm mb-2"
          rows={3}
          required
        />
        <small className="text-gray-400 mt-1 mb-4">
          * En caso de que requiera este nivel de urgencia, por favor incluya la descripción de la situación y por qué el tiempo establecido.
        </small>
      </>
    )}
    <label className="font-bold text-white">Descripción del Trámite:</label>
    <textarea
      name="descripcion"
      placeholder="Ingrese descripción del trámite"
      value={form2.descripcion}
      onChange={handleForm2Change}
      className="py-3 px-5 block w-full bg-[#1B1B29] text-white border-2 border-white rounded-lg text-sm mb-2"
      rows={3}
      required
    />
    <label className="font-bold text-white">Documentos Adjuntos:</label>
    {form2.documentos.map((file: File | null, idx: number) => (
      <div key={idx} className="flex items-center gap-2 mb-2">
        <input
          type="file"
          onChange={e => handleForm2FileChange(idx, e.target.files ? e.target.files[0] : null)}
          className="block w-full text-white"
          style={{ colorScheme: 'dark' }}
        />
        {form2.documentos.length > 1 && idx > 0 && (
          <button 
            type="button" 
            onClick={() => {
              setForm2((prev: any) => {
                const newDocumentos = prev.documentos.filter((_: any, i: number) => i !== idx);
                return { ...prev, documentos: newDocumentos };
              });
            }} 
            className="text-2xl text-white"
          >
            -
          </button>
        )}
      </div>
    ))}
    {form2.documentos.length < 3 && (
      <button 
        type="button" 
        onClick={() => {
          setForm2((prev: any) => ({
            ...prev,
            documentos: [...prev.documentos, null]
          }));
        }} 
        className="text-2xl text-white"
      >
        +
      </button>
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

export default CreateProcessFormNO; 