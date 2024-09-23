import React, { useEffect, useState, useContext } from 'react';
import HomeLayout from '@components/homeLayout';
import AppStateContext from '@context/sociedadesContext'; // Import the context
import SociedadEmpresaBienvenido from '@components/sociedad-empresa/sociedadEmpresaBienbenido';
import SociedadEmpresaSolicitante from '@components/sociedad-empresa/sociedadEmpresaSolicitante';
import SociedadEmpresaEmpresa from '@components/sociedad-empresa/sociedadEmpresaEmpresa';

const SociedadEmpresa: React.FC = () => {
  const [activeStep, setActiveStep] = useState<string>('Bienvenido');

  // Access the context values
  const context = useContext(AppStateContext);

  if (!context) {
    throw new Error('AppStateContext must be used within an AppStateProvider');
  }

  const { store } = context;

  // Use an effect to observe changes in solicitud
  useEffect(() => {
    if (store.solicitante) {
      setActiveStep('Solicitante');
    }
  }, [store.solicitante]);

  const renderActiveForm = () => {
    switch (activeStep) {
      case 'Bienvenido':
        return <SociedadEmpresaBienvenido />;
      case 'Solicitante':
        return <SociedadEmpresaSolicitante />;
      case 'Empresa':
        return <SociedadEmpresaEmpresa />;
      default:
        return <SociedadEmpresaBienvenido />;
    }
  };

  return (
    <HomeLayout>
      <div className="relative w-full h-screen flex overflow-hidden">
        <div className="w-3/5 h-full p-8 overflow-y-scroll bg-gray-900 scrollbar-thin">
          {renderActiveForm()} {/* Render the active form component */}
        </div>
        <div className="w-2/5 h-full p-8 overflow-y-scroll bg-gray-900 scrollbar-thin">
          <div className="text-white">
            <h2 className="text-3xl text-center font-bold mb-4">Nueva Sociedad / Empresa</h2>
            <p className="mb-8 text-center">Complete cada uno de los siguientes apartados:</p>
            <div className="grid grid-cols-3 gap-4">
              {/* Bienvenido button */}
              <button
                className={`p-4 rounded-lg ${activeStep === 'Bienvenido' ? 'bg-profile text-white' : 'bg-gray-800 text-gray-500'
                  }`}
                onClick={() => setActiveStep('Bienvenido')}
              >
                ¡Bienvenido!
              </button>

              {/* Solicitante button */}
              <button
                className={`p-4 rounded-lg ${store.solicitante ? (activeStep === 'Solicitante' ? 'bg-profile text-white' : 'bg-gray-800 text-white') : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                  }`}
                onClick={() => store.solicitante && setActiveStep('Solicitante')}
                disabled={!store.solicitante}
              >
                Solicitante
              </button>

              {/* Empresa button */}
              <button
                className={`p-4 rounded-lg ${store.empresa ? (activeStep === 'Empresa' ? 'bg-profile text-white' : 'bg-gray-800 text-white') : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                  }`}
                onClick={() => store.empresa && setActiveStep('Empresa')}
                disabled={!store.empresa}
              >
                Empresa
              </button>

              {/* Personas button */}
              <button
                className={`p-4 rounded-lg ${store.personas ? (activeStep === 'Personas' ? 'bg-profile text-white' : 'bg-gray-800 text-white') : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                  }`}
                onClick={() => store.personas && setActiveStep('Personas')}
                disabled={!store.personas}
              >
                Personas
              </button>

              {/* Directores button */}
              <button
                className={`p-4 rounded-lg ${store.directores ? (activeStep === 'Directores' ? 'bg-profile text-white' : 'bg-gray-800 text-white') : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                  }`}
                onClick={() => store.directores && setActiveStep('Directores')}
                disabled={!store.directores}
              >
                Directores
              </button>

              {/* Dignatarios button */}
              <button
                className={`p-4 rounded-lg ${store.dignatarios ? (activeStep === 'Dignatarios' ? 'bg-profile text-white' : 'bg-gray-800 text-white') : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                  }`}
                onClick={() => store.dignatarios && setActiveStep('Dignatarios')}
                disabled={!store.dignatarios}
              >
                Dignatarios
              </button>

              {/* Accionistas button */}
              <button
                className={`p-4 rounded-lg ${store.accionistas ? (activeStep === 'Accionistas' ? 'bg-profile text-white' : 'bg-gray-800 text-white') : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                  }`}
                onClick={() => store.accionistas && setActiveStep('Accionistas')}
                disabled={!store.accionistas}
              >
                Accionistas
              </button>

              {/* Capital button */}
              <button
                className={`p-4 rounded-lg ${store.capital ? (activeStep === 'Capital' ? 'bg-profile text-white' : 'bg-gray-800 text-white') : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                  }`}
                onClick={() => store.capital && setActiveStep('Capital')}
                disabled={!store.capital}
              >
                Capital
              </button>

              {/* Poder button */}
              <button
                className={`p-4 rounded-lg ${store.poder ? (activeStep === 'Poder' ? 'bg-profile text-white' : 'bg-gray-800 text-white') : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                  }`}
                onClick={() => store.poder && setActiveStep('Poder')}
                disabled={!store.poder}
              >
                Poder
              </button>

              {/* Actividades button */}
              <button
                className={`p-4 rounded-lg ${store.actividades ? (activeStep === 'Actividades' ? 'bg-profile text-white' : 'bg-gray-800 text-white') : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                  }`}
                onClick={() => store.actividades && setActiveStep('Actividades')}
                disabled={!store.actividades}
              >
                Actividades
              </button>

              {/* Ingresos button */}
              <button
                className={`p-4 rounded-lg ${store.ingresos ? (activeStep === 'Ingresos' ? 'bg-profile text-white' : 'bg-gray-800 text-white') : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                  }`}
                onClick={() => store.ingresos && setActiveStep('Ingresos')}
                disabled={!store.ingresos}
              >
                Ingresos
              </button>

              {/* Solicitud adicional button */}
              <button
                className={`p-4 rounded-lg ${store.solicitudAdicional ? (activeStep === 'Solicitud adicional' ? 'bg-profile text-white' : 'bg-gray-800 text-white') : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                  }`}
                onClick={() => store.solicitudAdicional && setActiveStep('Solicitud adicional')}
                disabled={!store.solicitudAdicional}
              >
                Solicitud adicional
              </button>

              {/* Resumen button */}
              <button
                className={`p-4 rounded-lg ${store.resumen ? (activeStep === 'Resumen' ? 'bg-profile text-white' : 'bg-gray-800 text-white') : 'bg-gray-800 text-gray-500 cursor-not-allowed'
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

export default SociedadEmpresa;
