import React, { useEffect, useContext, useState } from 'react';
import axios from 'axios';
import AppStateContext from '@context/context';
import { useFetchSolicitud } from '@utils/fetchCurrentRequest';
import get from 'lodash/get';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

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

  const generatePDF = () => {
    const doc = new jsPDF();
    let y = 20; // Posición inicial en Y
    const pageHeight = doc.internal.pageSize.height; // Altura de la página

    // Función auxiliar para manejar texto con saltos de página automáticos
    const addLine = (text: string) => {
      if (y + 10 > pageHeight) {
        doc.addPage();
        y = 20; // Reinicia la posición Y en la nueva página
      }
      doc.text(text, 10, y);
      y += 10;
    };

    // Título del documento
    doc.setFontSize(20);
    addLine('Resumen de la Solicitud');

    // Información del Solicitante
    if (solicitudData) {
      doc.setFontSize(16);
      addLine('Información del Solicitante');
      doc.setFontSize(12);
      addLine(`Nombre: ${solicitudData.nombreSolicita || 'N/A'}`);
      addLine(`Teléfono: ${solicitudData.telefonoSolicita || 'N/A'}`);
      addLine(`Teléfono Alternativo: ${solicitudData.telefonoSolicita2 || 'N/A'}`);
      addLine(`Cédula o Pasaporte: ${solicitudData.cedulaPasaporte || 'N/A'}`);
      addLine(`Correo Electrónico: ${solicitudData.emailSolicita || 'N/A'}`);
      y += 10;
    }

    doc.setFontSize(16);
    addLine('Información de la Solicitud');
    doc.setFontSize(12);
    addLine(`Tipo de Pensión: ${solicitudData.pensionType || 'N/A'}`);

    if (solicitudData.pensionType === 'Primera vez') {
      y += 5; // Espaciado entre secciones
      doc.setFontSize(14);
      addLine('Está solicitando pensión alimentaria por primera vez.');
      doc.setFontSize(12);
      y += 5;

      addLine(`¿Cuánto desea obtener de Pensión Alimenticia?: ${solicitudData.pensionAmount || 'N/A'}`);
      addLine(`¿Recibe usted algún aporte por parte del demandado?: ${solicitudData.receiveSupport || 'N/A'}`);

      if (solicitudData.receiveSupport === 'Sí') {
        addLine(`¿Cuánto le están aportando de pensión alimenticia actualmente?: ${solicitudData.currentSupportAmount || 'N/A'}`);
      }

      addLine(`¿Qué tipo de pensión requiere solicitar?: ${solicitudData.pensionCategory || 'N/A'}`);
      y += 10;
    } else if (solicitudData.pensionType === 'Aumento') {
      y += 5; // Espaciado antes de la sección
      doc.setFontSize(14);
      addLine('Quiere solicitar un Aumento.');
      doc.setFontSize(12);
      y += 5;

      addLine(`¿Cuánto le están aportando de pensión alimenticia actualmente?: ${solicitudData.currentAmount || 'N/A'}`);
      addLine(`¿Cuánto desea solicitar de aumento?: ${solicitudData.increaseAmount || 'N/A'}`);
      addLine(`El monto total que desea recibir es el siguiente: ${solicitudData.totalAmount || 'N/A'}`);
      addLine(`¿Está usted de acuerdo con el monto total que recibirá?: ${solicitudData.agreesWithAmount || 'N/A'}`);

      if (solicitudData.agreesWithAmount === 'No') {
        addLine(`Por favor explique por qué no está de acuerdo con el monto total: ${solicitudData.disagreementReason || 'N/A'}`);
      }

      addLine(`¿Sabe dónde está radicado su expediente actualmente de pensión alimenticia?: ${solicitudData.knowsCaseLocation || 'N/A'}`);

      if (solicitudData.knowsCaseLocation === 'Si') {
        addLine(`Indique Juzgado: ${solicitudData.court || 'N/A'}`);
        addLine(`Indique número de expediente: ${solicitudData.caseNumber || 'N/A'}`);
        addLine(`Indique la fecha de la última sentencia: ${solicitudData.sentenceDate || 'N/A'}`);
      }

      if (solicitudData.knowsCaseLocation === 'No') {
        addLine(`¿Desea que la firma se encargue de investigar dónde se encuentra adjudicado el expediente y la sentencia?: ${solicitudData.wantsInvestigation || 'N/A'}`);

        if (solicitudData.wantsInvestigation === 'Si') {
          addLine(`Especifique la provincia: ${solicitudData.province || 'N/A'}`);
        }
      }

      y += 10;
    } else if (solicitudData.pensionType === 'Rebaja o Suspensión') {
      y += 5; // Espaciado antes de la sección
      doc.setFontSize(14);
      addLine('Quiere solicitar Rebaja o Suspensión');
      doc.setFontSize(12);
      y += 5;

      addLine(`¿Desea Disminuir o Suspender la pensión?: ${solicitudData.pensionSubType || 'N/A'}`);

      if (solicitudData.pensionSubType === 'Disminuir') {
        addLine(`¿Cuánto le está aportando de pensión alimenticia actualmente?: ${solicitudData.currentAmount || 'N/A'}`);
        addLine(`¿Cuánto desea reducir de la pensión asignada?: ${solicitudData.reduceAmount || 'N/A'}`);
        addLine(`¿Sabe dónde está radicado su expediente actualmente de pensión alimenticia?: ${solicitudData.knowsCaseLocation || 'N/A'}`);

        if (solicitudData.knowsCaseLocation === 'No') {
          addLine(`¿Desea que la firma se encargue de investigar dónde se encuentra adjudicado el expediente y la sentencia?: ${solicitudData.wantsInvestigation || 'N/A'}`);

          if (solicitudData.wantsInvestigation === 'Si') {
            addLine(`Especifique la provincia: ${solicitudData.province || 'N/A'}`);
          }
        }

        if (solicitudData.knowsCaseLocation === 'Si') {
          addLine(`Indique Juzgado: ${solicitudData.court || 'N/A'}`);
          addLine(`Indique número de expediente: ${solicitudData.caseNumber || 'N/A'}`);
          addLine(`Indique la fecha de la última sentencia: ${solicitudData.sentenceDate || 'N/A'}`);
        }
      }

      y += 10; // Espaciado antes de la siguiente sección
    } else if (solicitudData.pensionType === 'Desacato') {
      y += 5; // Espaciado antes de la sección
      doc.setFontSize(14);
      addLine('Quiere solicitar un Desacato.');
      doc.setFontSize(12);
      y += 5;

      addLine(`Indique el día de pago asignado por el juez: ${solicitudData.paymentDay || 'N/A'}`);
      addLine(`Indique la fecha en la que recibió la última mensualidad: ${solicitudData.lastPaymentDate || 'N/A'}`);
      addLine(`¿Sabe dónde está radicado su expediente actualmente de pensión alimenticia?: ${solicitudData.knowsCaseLocation || 'N/A'}`);

      if (solicitudData.knowsCaseLocation === 'No') {
        addLine(`¿Desea que la firma se encargue de investigar dónde se encuentra adjudicado el expediente y la sentencia?: ${solicitudData.wantsInvestigation || 'N/A'}`);

        if (solicitudData.wantsInvestigation === 'Si') {
          addLine(`Especifique la provincia: ${solicitudData.province || 'N/A'}`);
        }
      }

      if (solicitudData.knowsCaseLocation === 'Si') {
        addLine(`Indique Juzgado: ${solicitudData.court || 'N/A'}`);
        addLine(`Indique número de expediente: ${solicitudData.caseNumber || 'N/A'}`);
        addLine(`Indique la fecha de la última sentencia: ${solicitudData.sentenceDate || 'N/A'}`);
      }

      y += 10; // Espaciado antes de la siguiente sección
    }

    if (solicitudData.demandante) {
      y += 5; // Espaciado antes de la sección
      doc.setFontSize(16);
      addLine('Información del Demandante');
      doc.setFontSize(12);
      y += 5;

      addLine(`Nombre Completo: ${solicitudData.demandante.nombreCompleto || 'N/A'}`);
      addLine(`Cédula: ${solicitudData.demandante.cedula || 'N/A'}`);
      addLine(`Correo Electrónico: ${solicitudData.demandante.email || 'N/A'}`);
      addLine(`Teléfono: ${solicitudData.demandante.telefonoSolicita || 'N/A'}`);
      addLine(`Dirección: ${solicitudData.demandante.direccion || 'N/A'}`);
      addLine(`Detalle Dirección: ${solicitudData.demandante.detalleDireccion || 'N/A'}`);
      addLine(`Nacionalidad: ${solicitudData.demandante.nacionalidad?.label || 'N/A'}`);
      addLine(`País de Residencia: ${solicitudData.demandante.paisDondeVive?.label || 'N/A'}`);
      addLine(`Provincia: ${solicitudData.demandante.provincia?.label || 'N/A'}`);
      addLine(`Corregimiento: ${solicitudData.demandante.corregimiento?.label || 'N/A'}`);
      addLine(`Estado Civil: ${solicitudData.demandante.estadoCivil?.label || 'N/A'}`);
      addLine(`Relación con el Demandado: ${solicitudData.demandante.relacionDemandado?.label || 'N/A'}`);

      addLine(`¿Mantiene usted ingresos por trabajo o como independiente?: ${solicitudData.demandante.mantieneIngresos?.label || 'N/A'}`);

      if (solicitudData.demandante.mantieneIngresos?.label === 'Sí') {
        addLine(`  Lugar de Trabajo: ${solicitudData.demandante.lugarTrabajo || 'N/A'}`);
        addLine(`  Ocupación: ${solicitudData.demandante.ocupacion || 'N/A'}`);
        addLine(`  Ingresos Mensuales: ${solicitudData.demandante.ingresosMensuales || 'N/A'}`);
        addLine(`  Vive en: ${solicitudData.demandante.viveEn?.label || 'N/A'}`);
      }

      addLine(`Estudia: ${solicitudData.demandante.estudia?.label || 'N/A'}`);

      if (solicitudData.demandante.estudia?.label === 'Sí') {
        addLine(`  Lugar de Estudio: ${solicitudData.demandante.lugarEstudio || 'N/A'}`);
        addLine(`  Año que Cursa: ${solicitudData.demandante.anoCursando || 'N/A'}`);
        addLine(`  Tipo de Estudio: ${solicitudData.demandante.tipoEstudio?.label || 'N/A'}`);
        addLine(`  Tiempo Completo: ${solicitudData.demandante.tiempoCompleto?.label || 'N/A'}`);
        addLine(`  Parentesco con el Pensionado: ${solicitudData.demandante.parentescoPension?.label || 'N/A'}`);
      }

      addLine(`Representa a un Menor: ${solicitudData.demandante.representaMenor?.label || 'N/A'}`);

      y += 10; // Espaciado antes de la siguiente sección
    }

    if (solicitudData.demandado) {
      y += 5; // Espaciado antes de la sección
      doc.setFontSize(16);
      addLine('Información del Demandado');
      doc.setFontSize(12);
      y += 5;

      addLine(`Nombre Completo: ${solicitudData.demandado.nombreCompleto || 'N/A'}`);
      addLine(`Cédula: ${solicitudData.demandado.cedula || 'N/A'}`);
      addLine(`Teléfono: ${solicitudData.demandado.telefono || 'N/A'}`);
      addLine(`Nacionalidad: ${solicitudData.demandado.nacionalidad?.label || 'N/A'}`);
      addLine(`País de Residencia: ${solicitudData.demandado.paisDondeVive?.label || 'N/A'}`);
      addLine(`Provincia: ${solicitudData.demandado.provincia?.label || solicitudData.demandado?.provincia2 || 'N/A'}`);
      addLine(`Corregimiento: ${solicitudData.demandado.corregimiento?.label || solicitudData.demandado?.corregimiento2 || 'N/A'}`);
      addLine(`Estado Civil: ${solicitudData.demandado.estadoCivil?.label || 'N/A'}`);
      addLine(`¿Está Trabajando?: ${solicitudData.demandado.trabajando.label || 'No'}`);

      if (solicitudData.demandado.trabajando.value === 'si') {
        addLine(`  Ocupación: ${solicitudData.demandado.ocupacion || 'N/A'}`);
        addLine(`  Ingresos por Trabajo: ${solicitudData.demandado.ingresosTrabajo || 'N/A'}`);
        addLine(`  Dirección de Trabajo: ${solicitudData.demandado.direccionTrabajo || 'N/A'}`);
        addLine(`  Detalle Dirección de Trabajo: ${solicitudData.demandado.detalleDireccionTrabajo || 'N/A'}`);
      }

      y += 10; // Espaciado antes de la siguiente sección
    }

    if (solicitudData.gastosPensionado) {
      y += 5; // Espaciado antes de la sección
      doc.setFontSize(16);
      addLine('Información sobre Gastos del Pensionado');
      doc.setFontSize(12);
      y += 5;

      addLine(`Agua: ${solicitudData.gastosPensionado.agua || 'N/A'}`);
      addLine(`Luz: ${solicitudData.gastosPensionado.luz || 'N/A'}`);
      addLine(`Teléfono: ${solicitudData.gastosPensionado.telefono || 'N/A'}`);
      addLine(`Supermercado: ${solicitudData.gastosPensionado.supermercado || 'N/A'}`);
      addLine(`Vestuario: ${solicitudData.gastosPensionado.vestuario || 'N/A'}`);
      addLine(`Recreación: ${solicitudData.gastosPensionado.recreacion || 'N/A'}`);
      addLine(`Habitación: ${solicitudData.gastosPensionado.habitacion || 'N/A'}`);
      addLine(`Transporte: ${solicitudData.gastosPensionado.transporte || 'N/A'}`);
      addLine(`Meriendas: ${solicitudData.gastosPensionado.meriendas || 'N/A'}`);
      addLine(`Medicamentos: ${solicitudData.gastosPensionado.medicamentos || 'N/A'}`);
      addLine(`Atención Médica: ${solicitudData.gastosPensionado.atencionMedica || 'N/A'}`);
      addLine(`Cuota de Padres: ${solicitudData.gastosPensionado.cuotaPadres || 'N/A'}`);
      addLine(`Matrícula: ${solicitudData.gastosPensionado.matricula || 'N/A'}`);
      addLine(`Mensualidad Escolar: ${solicitudData.gastosPensionado.mensualidadEscolar || 'N/A'}`);
      addLine(`Útiles Escolares: ${solicitudData.gastosPensionado.utiles || 'N/A'}`);
      addLine(`Uniformes: ${solicitudData.gastosPensionado.uniformes || 'N/A'}`);
      addLine(`Textos o Libros: ${solicitudData.gastosPensionado.textosLibros || 'N/A'}`);
      addLine(`Otros Gastos: ${solicitudData.gastosPensionado.otros || 'N/A'}`);
      addLine(`Gastos Totales del Pensionado: ${solicitudData.gastosPensionado.sumaTotal || 'N/A'}`);

      y += 10; // Espaciado antes de la siguiente sección
    }

    if (solicitudData.firmaYEntrega) {
      y += 5; // Espaciado antes de la sección
      doc.setFontSize(16);
      addLine('Información sobre la Firma y Entrega');
      doc.setFontSize(12);
      y += 5;

      addLine('Por favor indícanos cómo deseas firmar y entregarnos los documentos para el proceso:');

      if (solicitudData.firmaYEntrega.deliveryOption === "home") {
        y += 5;
        addLine('Entrega y firma a domicilio.');
        addLine(`Dirección: ${solicitudData.firmaYEntrega.direccion || 'N/A'}`);
        addLine(`Día: ${solicitudData.firmaYEntrega.dia || 'N/A'}`);
        addLine(`Número de teléfono: ${solicitudData.firmaYEntrega.telefonoSolicita || 'N/A'}`);
        addLine(`Hora (Formato 24 horas): ${solicitudData.firmaYEntrega.hora || 'N/A'}`);
      }

      if (solicitudData.firmaYEntrega.deliveryOption === "office") {
        y += 5;
        addLine('Puedo ir a sus oficinas a firmar y entregar todo.');
      }

      y += 10; // Espaciado antes de la siguiente sección
    }

    if (solicitudData.solicitudAdicional) {
      y += 5; // Espaciado antes de la sección
      doc.setFontSize(16);
      addLine('Solicitud Adicional');
      doc.setFontSize(12);
      y += 5;

      addLine(`Descripción de la solicitud: ${solicitudData.solicitudAdicional.descripcion || 'N/A'}`);

      y += 10; // Espaciado antes de la siguiente sección
    }

    // Costos de la Sociedad
    if (solicitudData?.canasta?.items?.length > 0) {
      doc.setFontSize(16);
      addLine('Costos:');
      doc.setFontSize(12);

      // **Recorrer los ítems y agregarlos como texto**
      solicitudData.canasta.items.forEach((item, index) => {
        addLine(`${index + 1}. ${item.item}: $${(item.precio || 0).toFixed(2)}`);
      });

      // **Subtotal y Total**
      addLine(`Subtotal: $${(solicitudData.canasta.subtotal || 0).toFixed(2)}`);
      addLine(`Total: $${(solicitudData.canasta.total || 0).toFixed(2)}`);

      y += 10; // Espacio después de los costos
    } else {
      addLine('No hay costos registrados.');
    }

    // Guardar el PDF
    doc.save('Resumen_Solicitud.pdf');
  };

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
            {renderField('Provincia', get(solicitudData, 'demandado.provincia.label') || get(solicitudData, 'demandado.provincia2'))}
            {renderField('Corregimiento', get(solicitudData, 'demandado.corregimiento.label') || get(solicitudData, 'demandado.corregimiento2'))}
            {renderField('Estado Civil', get(solicitudData, 'demandado.estadoCivil.label'))}

            {renderField('¿Está Trabajando?', get(solicitudData, 'demandado.trabajando', 'No'))}

            {solicitudData.demandado.trabajando.value === 'si' && (
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

        <button
          onClick={generatePDF}
          className="mt-6 px-4 py-2 bg-profile text-white font-bold rounded hover:bg-profile-600"
        >
          Descargar Resumen PDF
        </button>

      </div>
    </div>
  );
};

export default PensionAlimenticiaResumen;
