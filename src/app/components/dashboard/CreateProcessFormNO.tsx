import React, { useState } from 'react';
import PropuestaLegalForm from '../process-forms/PropuestaLegalForm';
import ConsultaEscritaForm from '../process-forms/ConsultaEscritaForm';
import ConsultaVirtualForm from '../process-forms/ConsultaVirtualForm';
import ConsultaPresencialForm from '../process-forms/ConsultaPresencialForm';
import FundacionInteresPrivadoForm from '../process-forms/FundacionInteresPrivadoForm';
import SociedadEmpresaForm from '../process-forms/SociedadEmpresaForm';
import SalidaMenoresExtranjeroForm from '../process-forms/SalidaMenoresExtranjeroForm';
import PensionAlimenticiaForm from '../process-forms/PensionAlimenticiaForm';
import TramiteGeneralForm from '../process-forms/TramiteGeneralForm';

const CreateProcessFormNO = ({
  form2,
  setForm2,
  handleForm2Change,
  handleFormSubmitNo,
  isSubmitting
}: any) => {
  const [isDigitalizado, setIsDigitalizado] = useState('SI');

  return (
    <>
      <label className="font-bold text-white mb-2 block">¿El trámite ya está digitalizado en la plataforma?</label>
      <select
        name="isDigitalizado"
        value={isDigitalizado}
        onChange={e => setIsDigitalizado(e.target.value)}
        className="py-3 px-5 block w-full bg-[#1B1B29] text-white border-2 border-white rounded-lg text-sm mb-4"
      >
        <option value="SI">SI</option>
        <option value="NO">NO</option>
      </select>

      {isDigitalizado === 'SI' && (
        <>
          <label className="font-bold text-white">Tipo de solicitud:</label>
          <select
            name="tipoSolicitud"
            value={form2.tipoSolicitud}
            onChange={handleForm2Change}
            className="py-3 px-5 block w-full bg-[#1B1B29] text-white border-2 border-white rounded-lg text-sm mb-2"
            required
          >
            <option value="">Seleccione un tipo de solicitud</option>
            <option value="propuesta-legal">Propuesta Legal</option>
            <option value="consulta-escrita">Consulta Escrita</option>
            <option value="consulta-virtual">Consulta Virtual</option>
            <option value="consulta-presencial">Consulta Presencial</option>
            <option value="new-fundacion-interes-privado">Fundación de Interés Privado</option>
            <option value="new-sociedad-empresa">Sociedad / Empresa</option>
            <option value="menores-al-extranjero">Salida de Menores al Extranjero</option>
            <option value="pension">Pensión Alimenticia</option>
          </select>
          {form2.tipoSolicitud === 'propuesta-legal' && (
            <PropuestaLegalForm
              formData={form2}
              setFormData={setForm2}
              onSubmit={handleFormSubmitNo}
              isSubmitting={isSubmitting}
            />
          )}
          {form2.tipoSolicitud === 'consulta-escrita' && (
            <ConsultaEscritaForm
              formData={form2}
              setFormData={setForm2}
              onSubmit={handleFormSubmitNo}
              isSubmitting={isSubmitting}
            />
          )}
          {form2.tipoSolicitud === 'consulta-virtual' && (
            <ConsultaVirtualForm
              formData={form2}
              setFormData={setForm2}
              onSubmit={handleFormSubmitNo}
              isSubmitting={isSubmitting}
            />
          )}
          {form2.tipoSolicitud === 'consulta-presencial' && (
            <ConsultaPresencialForm
              formData={form2}
              setFormData={setForm2}
              onSubmit={handleFormSubmitNo}
              isSubmitting={isSubmitting}
            />
          )}
          {(form2.tipoSolicitud === 'new-fundacion-interes-privado' || form2.tipoSolicitud === 'new-fundacion') && (
            <FundacionInteresPrivadoForm
              formData={form2}
              setFormData={setForm2}
              onSubmit={handleFormSubmitNo}
              isSubmitting={isSubmitting}
            />
          )}
          {form2.tipoSolicitud === 'new-sociedad-empresa' && (
            <SociedadEmpresaForm
              formData={form2}
              setFormData={setForm2}
              onSubmit={handleFormSubmitNo}
              isSubmitting={isSubmitting}
            />
          )}
          {form2.tipoSolicitud === 'menores-al-extranjero' && (
            <SalidaMenoresExtranjeroForm
              formData={form2}
              setFormData={setForm2}
              onSubmit={handleFormSubmitNo}
              isSubmitting={isSubmitting}
            />
          )}
          {(form2.tipoSolicitud === 'pension-alimenticia' || form2.tipoSolicitud === 'pension') && (
            <PensionAlimenticiaForm
              formData={form2}
              setFormData={setForm2}
              onSubmit={handleFormSubmitNo}
              isSubmitting={isSubmitting}
            />
          )}
        </>
      )}
      {isDigitalizado === 'NO' && (
        <TramiteGeneralForm
          formData={form2}
          setFormData={setForm2}
          onSubmit={handleFormSubmitNo}
          isSubmitting={isSubmitting}
        />
      )}
    </>
  );
};

export default CreateProcessFormNO; 