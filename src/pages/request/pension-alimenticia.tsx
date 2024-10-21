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
import TokenizationWidget from '@components/tokenizationWidget'; // Import your TokenizationWidget component
import AppStateContext from '@context/context';

const PensionAlimenticia: React.FC = () => {
  const [activeStep, setActiveStep] = useState<number>(1);
  const [showPaymentWidget, setShowPaymentWidget] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false); // Loading state for the payment button

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
      case 4:
        return <PensionAlimenticiaBienvenido />;
      case 2:
        return <PensionAlimenticiaSolicitud />;
      case 3:
        return <PensionAlimenticiaDemandante />;
      case 1:
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

  // Handle the payment button click
  const handlePaymentClick = () => {
    setLoading(true);
    setShowPaymentWidget(true);
  };

  return (
    <HomeLayout>
      <div className="relative w-full h-screen flex flex-col lg:flex-row overflow-hidden">
        <div className="w-full lg:w-[60%] h-full p-8 overflow-y-scroll bg-gray-900 scrollbar-thin">
          {renderActiveForm()}
        </div>

        <div className="w-full lg:w-[40%] h-full p-8 overflow-y-scroll bg-gray-900 scrollbar-thin">
          <div className="text-white">
            <h2 className="text-3xl text-center font-bold mb-4">Solicitud de Pensión Alimenticia</h2>
            <p className="mb-8 text-center">Complete cada uno de los siguientes apartados:</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Buttons for different sections */}
              <button
                className={`p-4 rounded-lg ${
                  store.bienvenido ? (activeStep === 1 ? 'bg-profile text-white' : 'bg-gray-800 text-white') : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                }`}
                onClick={() => setActiveStep(1)}
              >
                ¡Bienvenido!
              </button>

              <button
                className={`p-4 rounded-lg ${
                  store.solictud ? (activeStep === 2 ? 'bg-profile text-white' : 'bg-gray-800 text-white') : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                }`}
                onClick={() => store.solictud && setActiveStep(2)}
                disabled={!store.solictud}
              >
                Solicitud
              </button>

              <button
                className={`p-4 rounded-lg ${
                  store.demandante ? (activeStep === 3 ? 'bg-profile text-white' : 'bg-gray-800 text-white') : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                }`}
                onClick={() => store.demandante && setActiveStep(3)}
                disabled={!store.demandante}
              >
                Demandante
              </button>

              <button
                className={`p-4 rounded-lg ${
                  store.demandado ? (activeStep === 1 ? 'bg-profile text-white' : 'bg-gray-800 text-white') : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                }`}
                onClick={() => store.demandado && setActiveStep(4)}
                disabled={!store.demandado}
              >
                Demandado
              </button>

              <button
                className={`p-4 rounded-lg ${
                  store.gastosPensionado ? (activeStep === 5 ? 'bg-profile text-white' : 'bg-gray-800 text-white') : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                }`}
                onClick={() => store.gastosPensionado && setActiveStep(5)}
                disabled={!store.gastosPensionado}
              >
                Gastos Pensionado
              </button>

              <button
                className={`p-4 rounded-lg ${
                  store.archivosAdjuntos ? (activeStep === 6 ? 'bg-profile text-white' : 'bg-gray-800 text-white') : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                }`}
                onClick={() => store.archivosAdjuntos && setActiveStep(6)}
                disabled={!store.archivosAdjuntos}
              >
                Archivos Adjuntos
              </button>

              <button
                className={`p-4 rounded-lg ${
                  store.firmaYEntrega ? (activeStep === 7 ? 'bg-profile text-white' : 'bg-gray-800 text-white') : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                }`}
                onClick={() => store.firmaYEntrega && setActiveStep(7)}
                disabled={!store.firmaYEntrega}
              >
                Firma y Entrega
              </button>

              <button
                className={`p-4 rounded-lg ${
                  store.solicitudAdicional ? (activeStep === 8 ? 'bg-profile text-white' : 'bg-gray-800 text-white') : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                }`}
                onClick={() => store.solicitudAdicional && setActiveStep(8)}
                disabled={!store.solicitudAdicional}
              >
                Solicitud adicional
              </button>

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

          
            {activeStep > 1 && (
              <div className="mt-8">
                <button
                  className={`bg-green-500 text-white w-full py-3 rounded-lg ${loading ? 'cursor-not-allowed opacity-50' : ''}`}
                  onClick={handlePaymentClick}
                  disabled={loading}
                >
                  {loading ? 'Cargando...' : 'Pagar'}
                </button>
              </div>
            )}


            {/* Payment Widget */}
            {showPaymentWidget && <TokenizationWidget />}

            {/* Exit button */}
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
