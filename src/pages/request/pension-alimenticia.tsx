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
  const [activeStep, setActiveStep] = useState<number>(1);

  // Access the context values
  const context = useContext(AppStateContext);

  if (!context) {
    throw new Error('AppStateContext must be used within an AppStateProvider');
  }

  const { store } = context;

  // Use an effect to observe changes in store.currentPosition and update the activeStep
  useEffect(() => {
    if (store.currentPosition) {
      setActiveStep(store.currentPosition);
    }
  }, [store.currentPosition]);

  // Function to render the active form based on the current position
  const renderActiveForm = () => {
    switch (activeStep) {
      case 1:
        return <PensionAlimenticiaBienvenido />;
      case 2:
        return <PensionAlimenticiaSolicitud />;
      case 3:
        return <PensionAlimenticiaDemandante />;
      case 4:
        return <PensionAlimenticiaDemandado />;
      case 5:
        return <PensionAlimenticiaGastosPensionado />;
      case 6:
        return <PensionAlimenticiaArchivosAdjuntos />;
      case 7:
        return <PensionAlimenticiaFirmaYEntrega />;
      case 8:
        return <PensionAlimenticiaSolicitudAdicional />;
      case 9:
        return <PensionAlimenticiaResumen />;
      default:
        return <PensionAlimenticiaBienvenido />;
    }
  };

  return (
    <HomeLayout>
      <div className="relative w-full h-screen flex overflow-hidden">
        <div className="w-1/2 h-full p-8 overflow-y-scroll bg-gray-900 scrollbar-thin">
          {renderActiveForm()}
        </div>
        <div className="w-1/2 h-full p-8 overflow-y-scroll bg-gray-900 scrollbar-thin">
          <div className="text-white">
            <h2 className="text-3xl text-center font-bold mb-4">Solicitud de Pensión Alimenticia</h2>
            <p className="mb-8 text-center">Complete cada uno de los siguientes apartados:</p>
            <div className="grid grid-cols-3 gap-4">
              {/* Bienvenido button */}
              <button
                className={`p-4 rounded-lg ${
                  store.bienvenido ? (activeStep === 1 ? 'bg-profile text-white' : 'bg-gray-800 text-white') : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                }`}
                onClick={() => setActiveStep(1)}
              >
                ¡Bienvenido!
              </button>

              {/* Solicitud button */}
              <button
                className={`p-4 rounded-lg ${
                  store.solicitud ? (activeStep === 2 ? 'bg-profile text-white' : 'bg-gray-800 text-white') : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                }`}
                onClick={() => store.solicitud && setActiveStep(2)}
                disabled={!store.solicitud}
              >
                Solicitud
              </button>

              {/* Demandante button */}
              <button
                className={`p-4 rounded-lg ${
                  store.demandante ? (activeStep === 3 ? 'bg-profile text-white' : 'bg-gray-800 text-white') : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                }`}
                onClick={() => store.demandante && setActiveStep(3)}
                disabled={!store.demandante}
              >
                Demandante
              </button>

              {/* Demandado button */}
              <button
                className={`p-4 rounded-lg ${
                  store.demandado ? (activeStep === 4 ? 'bg-profile text-white' : 'bg-gray-800 text-white') : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                }`}
                onClick={() => store.demandado && setActiveStep(4)}
                disabled={!store.demandado}
              >
                Demandado
              </button>

              {/* Gastos Pensionado button */}
              <button
                className={`p-4 rounded-lg ${
                  store.gastosPensionado ? (activeStep === 5 ? 'bg-profile text-white' : 'bg-gray-800 text-white') : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                }`}
                onClick={() => store.gastosPensionado && setActiveStep(5)}
                disabled={!store.gastosPensionado}
              >
                Gastos Pensionado
              </button>

              {/* Archivos Adjuntos button */}
              <button
                className={`p-4 rounded-lg ${
                  store.archivosAdjuntos ? (activeStep === 6 ? 'bg-profile text-white' : 'bg-gray-800 text-white') : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                }`}
                onClick={() => store.archivosAdjuntos && setActiveStep(6)}
                disabled={!store.archivosAdjuntos}
              >
                Archivos Adjuntos
              </button>

              {/* Firma y Entrega button */}
              <button
                className={`p-4 rounded-lg ${
                  store.firmaYEntrega ? (activeStep === 7 ? 'bg-profile text-white' : 'bg-gray-800 text-white') : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                }`}
                onClick={() => store.firmaYEntrega && setActiveStep(7)}
                disabled={!store.firmaYEntrega}
              >
                Firma y Entrega
              </button>

              {/* Solicitud adicional button */}
              <button
                className={`p-4 rounded-lg ${
                  store.solicitudAdicional ? (activeStep === 8 ? 'bg-profile text-white' : 'bg-gray-800 text-white') : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                }`}
                onClick={() => store.solicitudAdicional && setActiveStep(8)}
                disabled={!store.solicitudAdicional}
              >
                Solicitud adicional
              </button>

              {/* Resumen button */}
              <button
                className={`p-4 rounded-lg ${
                  store.resumen ? (activeStep === 9 ? 'bg-profile text-white' : 'bg-gray-800 text-white') : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                }`}
                onClick={() => store.resumen && setActiveStep(9)}
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