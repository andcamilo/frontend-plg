import React, { useEffect, useState, useContext } from 'react';
import HomeLayout from '@components/homeLayout';
import PensionAlimenticiaBienvenido from '@components/pension-alimenticia/pensionAlimenticiaBienvenido';
import PensionAlimenticiaSolicitud from '@components/pension-alimenticia/pensionAlimenticiaSolicitud';
import PensionAlimenticiaDemandante from '@components/pension-alimenticia/pensionAlimenticiaDemandante';
import PensionAlimenticiaDemandado from '@components/pension-alimenticia/pensionAlimenticiaDemandado';
import PensionAlimenticiaGastosPensionado from '@components/pension-alimenticia/pensionAlimenticiaGastosPensionado';
import PensionAlimenticiaArchivosAdjuntos from '@components/pension-alimenticia/pensionAlimenticiaArchivosAdjuntos';
import PensionAlimenticiaFirmaYEntrega from '@components/pension-alimenticia/pensionAlimenticiaFirmaYEntrega';
import PensionAlimenticiaSolicitudAdicional from '@components/pension-alimenticia/pensionAlimenticiaSolicitudAdicional';
import PensionAlimenticiaResumen from '@components/pension-alimenticia/pensionAlimenticiaResumen';
import AppStateContext from '@context/context'; // Import the context

const PensionAlimenticia: React.FC = () => {
  const [activeStep, setActiveStep] = useState<string>('Bienvenido');

  // Access the context values
  const context = useContext(AppStateContext);

  if (!context) {
    throw new Error('AppStateContext must be used within an AppStateProvider');
  }

  const { store } = context;

  // Use an effect to observe changes in solicitud
  useEffect(() => {
    console.log('Solicitud state changed:', store.solicitud);
  }, [store.solicitud]);

  const renderActiveForm = () => {
    switch (activeStep) {
      case 'Bienvenido':
        return <PensionAlimenticiaBienvenido />;
      case 'Solicitud':
        return <PensionAlimenticiaSolicitud />;
      case 'Demandante':
        return <PensionAlimenticiaDemandante />;
      case 'Demandado':
        return <PensionAlimenticiaDemandado />;
      case 'Gastos Pensionado':
        return <PensionAlimenticiaGastosPensionado />;
      case 'Archivos Adjuntos':
        return <PensionAlimenticiaArchivosAdjuntos />;
      case 'Firma y Entrega':
        return <PensionAlimenticiaFirmaYEntrega />;
      case 'Solicitud adicional':
        return <PensionAlimenticiaSolicitudAdicional />;
      case 'Resumen':
        return <PensionAlimenticiaResumen />;
      default:
        return <PensionAlimenticiaBienvenido />;
    }
  };

  return (
    <HomeLayout>
      <div className="relative w-full h-screen flex overflow-hidden">
        <div className="w-1/2 h-full p-8 overflow-y-scroll bg-gray-900 scrollbar-thin">
          {renderActiveForm()} {/* Render the active form component */}
        </div>
        <div className="w-1/2 h-full p-8 overflow-y-scroll bg-gray-900 scrollbar-thin">
          <div className="text-white">
            <h2 className="text-3xl text-center font-bold mb-4">Solicitud de Pensión Alimenticia</h2>
            <p className="mb-8 text-center">Complete cada uno de los siguientes apartados:</p>
            <div className="grid grid-cols-3 gap-4">
              {/* Bienvenido button */}
              <button
                className={`p-4 rounded-lg ${
                  activeStep === 'Bienvenido' ? 'bg-profile text-white' : 'bg-gray-800 text-gray-500'
                }`}
                onClick={() => setActiveStep('Bienvenido')}
              >
                ¡Bienvenido!
              </button>

              {/* Solicitud button */}
              <button
                className={`p-4 rounded-lg ${
                  store.solicitud ? (activeStep === 'Solicitud' ? 'bg-profile text-white' : 'bg-gray-800 text-white') : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                }`}
                onClick={() => store.solicitud && setActiveStep('Solicitud')}
                disabled={!store.solicitud}
              >
                Solicitud
              </button>

              {/* Demandante button */}
              <button
                className={`p-4 rounded-lg ${
                  store.demandante ? (activeStep === 'Demandante' ? 'bg-profile text-white' : 'bg-gray-800 text-white') : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                }`}
                onClick={() => store.demandante && setActiveStep('Demandante')}
                disabled={!store.demandante}
              >
                Demandante
              </button>

              {/* Demandado button */}
              <button
                className={`p-4 rounded-lg ${
                  store.demandado ? (activeStep === 'Demandado' ? 'bg-profile text-white' : 'bg-gray-800 text-white') : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                }`}
                onClick={() => store.demandado && setActiveStep('Demandado')}
                disabled={!store.demandado}
              >
                Demandado
              </button>

              {/* Gastos Pensionado button */}
              <button
                className={`p-4 rounded-lg ${
                  store.gastosPensionado ? (activeStep === 'Gastos Pensionado' ? 'bg-profile text-white' : 'bg-gray-800 text-white') : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                }`}
                onClick={() => store.gastosPensionado && setActiveStep('Gastos Pensionado')}
                disabled={!store.gastosPensionado}
              >
                Gastos Pensionado
              </button>

              {/* Archivos Adjuntos button */}
              <button
                className={`p-4 rounded-lg ${
                  store.archivosAdjuntos ? (activeStep === 'Archivos Adjuntos' ? 'bg-profile text-white' : 'bg-gray-800 text-white') : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                }`}
                onClick={() => store.archivosAdjuntos && setActiveStep('Archivos Adjuntos')}
                disabled={!store.archivosAdjuntos}
              >
                Archivos Adjuntos
              </button>

              {/* Firma y Entrega button */}
              <button
                className={`p-4 rounded-lg ${
                  store.firmaYEntrega ? (activeStep === 'Firma y Entrega' ? 'bg-profile text-white' : 'bg-gray-800 text-white') : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                }`}
                onClick={() => store.firmaYEntrega && setActiveStep('Firma y Entrega')}
                disabled={!store.firmaYEntrega}
              >
                Firma y Entrega
              </button>

              {/* Solicitud adicional button */}
              <button
                className={`p-4 rounded-lg ${
                  store.solicitudAdicional ? (activeStep === 'Solicitud adicional' ? 'bg-profile text-white' : 'bg-gray-800 text-white') : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                }`}
                onClick={() => store.solicitudAdicional && setActiveStep('Solicitud adicional')}
                disabled={!store.solicitudAdicional}
              >
                Solicitud adicional
              </button>

              {/* Resumen button */}
              <button
                className={`p-4 rounded-lg ${
                  store.resumen ? (activeStep === 'Resumen' ? 'bg-profile text-white' : 'bg-gray-800 text-white') : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                }`}
                onClick={() => store.resumen && setActiveStep('Resumen')}
                disabled={!store.resumen}
              >
                Resumen
              </button>
            </div>

            <p className="my-8 text-center">
              * Para poder enviar o pagar la solicitud todos los campos deben estar llenos.
            </p>
            <div className="mt-8">
              <button className="bg-gray-500 text-white w-full py-3 rounded-lg">Salir</button>
            </div>
          </div>
        </div>
      </div>
    </HomeLayout>
  );
};

export default PensionAlimenticia;
