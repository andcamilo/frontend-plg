import React, { useEffect, useContext, useState } from 'react';
import axios from 'axios';
import AppStateContext from '@context/context';
import { useFetchSolicitud } from '@utils/fetchCurrentRequest';
import get from 'lodash/get';

const PensionAlimenticiaResumen: React.FC = () => {
  // Access the context values
  const context = useContext(AppStateContext);

  if (!context) {
    throw new Error('AppStateContext must be used within an AppStateProvider');
  }

  const [solicitudData, setSolicitudData] = useState<any>(null);
  const { store } = context;
  const { fetchSolicitud } = useFetchSolicitud(store.solicitudId);

  useEffect(() => {
    if (store.solicitudId) {
      fetchSolicitud();
    }
  }, [store.solicitudId]);

  useEffect(() => {
    if (store.request) {
      console.log("🚀 ~ Updated store.request:", store.request);
      setSolicitudData(store.request);
    }
  }, [store.request]);

  // Helper function to render a field only if it has a non-empty value
  const renderField = (label: string, value: any) => {
    // Check if value is an object with "label" or "value" keys and handle appropriately
    if (typeof value === 'object' && value !== null) {
      value = value.label || JSON.stringify(value); // Use `label` if available, otherwise stringify the object
    }

    if (value !== undefined && value !== null && value !== '') {
      return (
        <div className="mb-4">
          <strong>{label}: </strong>
          <span>{value}</span>
        </div>
      );
    }
    return null;
  };

  if (!solicitudData) {
    return <p className="text-white">Cargando los detalles de la solicitud...</p>;
  }

  return (
    <div className="text-white">
      <h1 className="text-4xl font-bold mb-4">Resumen de la Solicitud</h1>
      <p>Revisa toda la información antes de enviar la solicitud.</p>
      <hr></hr>

      {/* Display the fetched data */}
      <div className="mt-4">
        <h2 className="text-3xl font-bold mb-4">Información del Solicitante</h2>
        {renderField('Nombre del Solicitante', get(solicitudData, 'nombreSolicita'))}
        {renderField('Teléfono', get(solicitudData, 'telefonoSolicita'))}
        {renderField('Teléfono Alternativo', get(solicitudData, 'telefonoSolicita2'))}
        {renderField('Cédula o pasaporte', get(solicitudData, 'cedulaPasaporte'))}
        {renderField('Correo Electrónico', get(solicitudData, 'emailSolicita'))}
        <hr className='mt-4 mb-4'></hr>
        <h2 className="text-3xl font-bold mb-4">Información de la Solicitud</h2>
        {renderField('Tipo de Pensión ', get(solicitudData, 'pensionType'))}
        {solicitudData.pensionType === 'Primera vez' && (
          <>
            <h5 className="text-xl font-bold mt-2 mb-4">Está solicitando pensión alimentaria por primera vez.</h5>
            <div className="ml-6">
              {renderField('¿Cuánto desea obtener de Pensión Alimenticia?', get(solicitudData, 'pensionAmount'))}
              {renderField('¿Recibe usted algún aporte por parte del demandado?', get(solicitudData, 'receiveSupport'))}
              {solicitudData.receiveSupport === 'Sí' && (
                <>
                  {renderField('¿Cuánto le están aportando de pensión alimenticia actualmente?', get(solicitudData, 'currentSupportAmount'))}
                </>
              )}
              {renderField('¿Qué tipo de pensión requiere solicitar?', get(solicitudData, 'pensionCategory'))}
            </div>

          </>
        )}

        {solicitudData.pensionType === 'Aumento' && (
          <>
            <h5 className="text-xl font-bold mt-2 mb-4">Quiere solicitar un Aumento.</h5>
            <div className="ml-6">
              {renderField('¿Cuánto le están aportando de pensión alimenticia actualmente?', get(solicitudData, 'currentAmount'))}
              {renderField('¿Cuánto desea solicitar de aumento?', get(solicitudData, 'increaseAmount'))}
              {renderField('El monto total que desea recibir es el siguiente', get(solicitudData, 'totalAmount'))}
              {renderField('¿Está usted de acuerdo con el monto total que recibirá?', get(solicitudData, 'agreesWithAmount'))}
              {solicitudData.agreesWithAmount === 'No' && (
                <>
                  {renderField('Por favor explique por qué no está de acuerdo con el monto total', get(solicitudData, 'disagreementReason'))}
                </>
              )}
              {renderField('¿Sabe dónde está radicado su expediente actualmente de pensión alimenticia?', get(solicitudData, 'knowsCaseLocation'))}
              {solicitudData.knowsCaseLocation === 'Si' && (
                <>
                  {renderField('Indique Juzgado', get(solicitudData, 'court'))}
                  {renderField('Indique número de expediente', get(solicitudData, 'caseNumber'))}
                  {renderField('Indique la fecha de la última sentencia', get(solicitudData, 'sentenceDate'))}
                </>
              )}
              {solicitudData.knowsCaseLocation === 'No' && (
                <>
                  {renderField('¿Desea que la firma se encargue de investigar dónde se encuentra adjudicado el expediente y la sentencia?', get(solicitudData, 'wantsInvestigation'))}
                  {solicitudData.wantsInvestigation === 'Si' && (
                    <>
                      {renderField('Especifique la provincia', get(solicitudData, 'province'))}
                    </>
                  )}
                </>
              )}
            </div>

          </>
        )}

        {solicitudData.pensionType === 'Rebaja o Suspensión' && (
          <>
            <h5 className="text-xl font-bold mt-2 mb-4">Quiere solicitar Rebaja o Suspensión</h5>
            <div className="ml-6">
              {renderField('¿Desea Disminuir o Suspender la pensión?', get(solicitudData, 'pensionSubType'))}
              {solicitudData.pensionSubType === 'Disminuir' && (
                <>
                  {renderField('¿Cuánto le está aportando de pensión alimenticia actualmente?', get(solicitudData, 'currentAmount'))}
                  {renderField('¿Cuánto desea reducir de la pensión asignada?', get(solicitudData, 'reduceAmount'))}
                  {renderField('¿Sabe dónde está radicado su expediente actualmente de pensión alimenticia?', get(solicitudData, 'knowsCaseLocation'))}
                  {solicitudData.knowsCaseLocation === 'No' && (
                    <>
                      {renderField('¿Desea que la firma se encargue de investigar dónde se encuentra adjudicado el expediente y la sentencia?', get(solicitudData, 'wantsInvestigation'))}
                      {solicitudData.wantsInvestigation === 'Si' && (
                        <>
                          {renderField('Especifique la provincia', get(solicitudData, 'province'))}
                        </>
                      )}
                    </>
                  )}
                  {solicitudData.knowsCaseLocation === 'Si' && (
                    <>
                      {renderField('Indique Juzgado', get(solicitudData, 'court'))}
                      {renderField('Indique número de expediente', get(solicitudData, 'caseNumber'))}
                      {renderField('Indique la fecha de la última sentencia', get(solicitudData, 'sentenceDate'))}
                    </>
                  )}
                </>
              )}

            </div>

          </>
        )}

        {solicitudData.pensionType === 'Desacato' && (
          <>
            <h5 className="text-xl font-bold mt-2 mb-4">Quiere solicitar un Desacato.</h5>
            <div className="ml-6">
              {renderField('Indique el día de pago asignada por el juez', get(solicitudData, 'paymentDay'))}
              {renderField('Indique la fecha en la que recibió la última mensualidad', get(solicitudData, 'lastPaymentDate'))}
              {renderField('¿Sabe dónde está radicado su expediente actualmente de pensión alimenticia?', get(solicitudData, 'knowsCaseLocation'))}
              {solicitudData.knowsCaseLocation === 'No' && (
                <>
                  {renderField('¿Desea que la firma se encargue de investigar dónde se encuentra adjudicado el expediente y la sentencia?', get(solicitudData, 'wantsInvestigation'))}
                  {solicitudData.wantsInvestigation === 'Si' && (
                    <>
                      {renderField('Especifique la provincia', get(solicitudData, 'province'))}
                    </>
                  )}
                </>
              )}
              {solicitudData.knowsCaseLocation === 'Si' && (
                <>
                  {renderField('Indique Juzgado', get(solicitudData, 'court'))}
                  {renderField('Indique número de expediente', get(solicitudData, 'caseNumber'))}
                  {renderField('Indique la fecha de la última sentencia', get(solicitudData, 'sentenceDate'))}
                </>
              )}
            </div>

          </>
        )}

        <hr className='mt-4 mb-4'></hr>
        <h2 className="text-3xl font-bold mb-4">Información del Demandante</h2>
        {solicitudData.demandante && (
          <div >
            {renderField('Nombre Completo', get(solicitudData, 'demandante.nombreCompleto'))}
            {renderField('Cédula', get(solicitudData, 'demandante.cedula'))}
            {renderField('Correo Electrónico', get(solicitudData, 'demandante.email'))}
            {renderField('Teléfono', get(solicitudData, 'demandante.telefonoSolicita'))}
            {renderField('Dirección', get(solicitudData, 'demandante.direccion'))}
            {renderField('Detalle Dirección', get(solicitudData, 'demandante.detalleDireccion'))}
            {renderField('Nacionalidad', get(solicitudData, 'demandante.nacionalidad.label'))}
            {renderField('País de Residencia', get(solicitudData, 'demandante.paisDondeVive.label'))}
            {renderField('Provincia', get(solicitudData, 'demandante.provincia.label'))}
            {renderField('Corregimiento', get(solicitudData, 'demandante.corregimiento.label'))}
            {renderField('Estado Civil', get(solicitudData, 'demandante.estadoCivil.label'))}

            {renderField('Relación con el Demandado', get(solicitudData, 'demandante.relacionDemandado.label'))}

            {renderField('¿Mantiene usted ingresos por trabajo o como independiente?', get(solicitudData, 'demandante.mantieneIngresos.label'))}
            {solicitudData.demandante.mantieneIngresos.label === 'Sí' && (
              <>
                <div className='ml-6'>
                  {renderField('Lugar de Trabajo', get(solicitudData, 'demandante.lugarTrabajo'))}
                  {renderField('Ocupación', get(solicitudData, 'demandante.ocupacion'))}
                  {renderField('Ingresos Mensuales', get(solicitudData, 'demandante.ingresosMensuales'))}
                  {renderField('Vive en', get(solicitudData, 'demandante.viveEn.label'))}
                </div>
              </>
            )}

            {renderField('Estudia', get(solicitudData, 'demandante.estudia.label'))}
            {solicitudData.demandante.estudia.label === 'Sí' && (
              <>
                <div className='ml-6'>
                  {renderField('Lugar de Estudio', get(solicitudData, 'demandante.lugarEstudio'))}
                  {renderField('Año que Cursa', get(solicitudData, 'demandante.anoCursando'))}
                  {renderField('Tipo de Estudio', get(solicitudData, 'demandante.tipoEstudio.label'))}
                  {renderField('Tiempo Completo', get(solicitudData, 'demandante.tiempoCompleto.label'))}
                  {renderField('Parentesco con el Pensionado', get(solicitudData, 'demandante.parentescoPension.label'))}
                </div>
              </>
            )}
            {renderField('Representa a un Menor', get(solicitudData, 'demandante.representaMenor.label'))}

          </div>
        )}

        <hr className='mt-4 mb-4'></hr>
        <h2 className="text-3xl font-bold mb-4">Información del Demandado</h2>
        {solicitudData.demandado && (
          <div className="ml-6">
            {renderField('Nombre Completo', get(solicitudData, 'demandado.nombreCompleto'))}
            {renderField('Cédula', get(solicitudData, 'demandado.cedula'))}
            {renderField('Teléfono', get(solicitudData, 'demandado.telefono'))}
            {renderField('Nacionalidad', get(solicitudData, 'demandado.nacionalidad.label'))}
            {renderField('País de Residencia', get(solicitudData, 'demandado.paisDondeVive.label'))}
            {renderField('Provincia', get(solicitudData, 'demandado.provincia.label'))}
            {renderField('Corregimiento', get(solicitudData, 'demandado.corregimiento.label'))}
            {renderField('Estado Civil', get(solicitudData, 'demandado.estadoCivil.label'))}

            {renderField('¿Está Trabajando?', get(solicitudData, 'demandado.trabajando.label'))}

            {solicitudData.demandado.trabajando.label === 'Sí' && (
              <div className="ml-6">
                {renderField('Ocupación', get(solicitudData, 'demandado.ocupacion'))}
                {renderField('Ingresos por Trabajo', get(solicitudData, 'demandado.ingresosTrabajo'))}
                {renderField('Dirección de Trabajo', get(solicitudData, 'demandado.direccionTrabajo'))}
                {renderField('Detalle Dirección de Trabajo', get(solicitudData, 'demandado.detalleDireccionTrabajo'))}
              </div>
            )}
          </div>
        )}

        <hr className='mt-4 mb-4'></hr>
        <h2 className="text-3xl font-bold mb-4">Información sobre Gastos del Pensionado</h2>
        {solicitudData.gastosPensionado && (
          <div className="ml-6">
            {renderField('Agua', get(solicitudData, 'gastosPensionado.agua'))}
            {renderField('Luz', get(solicitudData, 'gastosPensionado.luz'))}
            {renderField('Teléfono', get(solicitudData, 'gastosPensionado.telefono'))}
            {renderField('Supermercado', get(solicitudData, 'gastosPensionado.supermercado'))}
            {renderField('Vestuario', get(solicitudData, 'gastosPensionado.vestuario'))}
            {renderField('Recreación', get(solicitudData, 'gastosPensionado.recreacion'))}
            {renderField('Habitación', get(solicitudData, 'gastosPensionado.habitacion'))}
            {renderField('Transporte', get(solicitudData, 'gastosPensionado.transporte'))}
            {renderField('Meriendas', get(solicitudData, 'gastosPensionado.meriendas'))}
            {renderField('Medicamentos', get(solicitudData, 'gastosPensionado.medicamentos'))}
            {renderField('Atención Médica', get(solicitudData, 'gastosPensionado.atencionMedica'))}
            {renderField('Cuota de Padres', get(solicitudData, 'gastosPensionado.cuotaPadres'))}
            {renderField('Matricula', get(solicitudData, 'gastosPensionado.matricula'))}
            {renderField('Mensualidad Escolar', get(solicitudData, 'gastosPensionado.mensualidadEscolar'))}
            {renderField('Útiles Escolares', get(solicitudData, 'gastosPensionado.utiles'))}
            {renderField('Uniformes', get(solicitudData, 'gastosPensionado.uniformes'))}
            {renderField('Textos o Libros', get(solicitudData, 'gastosPensionado.textosLibros'))}
            {renderField('Otros Gastos', get(solicitudData, 'gastosPensionado.otros'))}
            {renderField('Gastos Totales del Pensionado', get(solicitudData, 'gastosPensionado.sumaTotal'))}

          </div>
        )}

        <hr className='mt-4 mb-4'></hr>
        <h2 className="text-3xl font-bold mb-4">Información sobre la Firma y Entrega</h2>
        {solicitudData.firmaYEntrega && (
          <>
            <h4 className="text-1xl font-bold mb-4">Por favor indícanos cómo deseas firmar y entregarnos los documentos para el proceso:</h4>
            {solicitudData.firmaYEntrega.deliveryOption === "home" && (
              <>
                <h4 className="text-1xl font-bold mb-4">Entrega y firma a domicilio.</h4>
                <div className="ml-6">
                  {renderField('Dirección', get(solicitudData, 'firmaYEntrega.direccion'))}
                  {renderField('Día', get(solicitudData, 'firmaYEntrega.dia'))}
                  {renderField('Número de teléfono', get(solicitudData, 'firmaYEntrega.telefonoSolicita'))}
                  {renderField('Hora (Formato 24 horas)', get(solicitudData, 'firmaYEntrega.hora'))}
                </div>
              </>
            )}
            {solicitudData.firmaYEntrega.deliveryOption === "office" && (
              <>
                <h4 className="text-1xl font-bold mb-4">Puedo ir a sus oficinas a firmar y entregar todo.</h4>
              </>
            )}

          </>
        )}

        <hr className='mt-4 mb-4'></hr>
        <h2 className="text-3xl font-bold mb-4">Solicitud Adicional</h2>
        {solicitudData.solicitudAdicional && (
          <>
            {renderField('Descripción de la solicitud', get(solicitudData, 'solicitudAdicional.descripcion'))}
          </>
        )}

        <hr className='mt-4 mb-4'></hr>
        <h2 className="text-3xl font-bold mb-4">Costos</h2>
        <table className="w-full mt-4 text-white border border-gray-600">
          <thead>
            <tr className="border-b border-gray-600">
              <th className="text-left p-2">#</th>
              <th className="text-left p-2">Item</th>
              <th className="text-right p-2">Precio</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-gray-600">
              <td className="p-2">1</td>
              <td className="p-2">{get(solicitudData, 'canasta.items[0].item')}</td>
              <td className="text-right p-2">${get(solicitudData, 'canasta.items[0].precio')}</td>
            </tr>
            {/* Mostrar Servicio Adicional si aplica */}
            {/* {servicioAdicional && (
              <tr className="border-b border-gray-600">
                <td className="p-2">2</td>
                <td className="p-2">Servicio Adicional</td>
                <td className="text-right p-2">$5.00</td>
              </tr>
            )} */}
            <tr className="border-b border-gray-600">
              <td colSpan={2} className="text-right p-2">Subtotal</td>
              <td className="text-right p-2">${get(solicitudData, 'canasta.subtotal').toFixed(2)}</td>
            </tr>
            <tr className="border-b border-gray-600">
              <td colSpan={2} className="text-right p-2">Total</td>
              <td className="text-right p-2">${get(solicitudData, 'canasta.total').toFixed(2)}</td>
            </tr>
          </tbody>
        </table>

      </div>
    </div>
  );
};

export default PensionAlimenticiaResumen;
