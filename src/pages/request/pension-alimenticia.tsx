import React, { useState } from 'react';
import HomeLayout from '@components/homeLayout';
import PensionAlimenticiaForm from '@components/pensionAlimenticiaForm';

const PensionAlimenticia: React.FC = () => {
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);

  const isStepCompleted = (step: string) => completedSteps.includes(step);

  const handleCompleteStep = (step: string) => {
    if (!isStepCompleted(step)) {
      setCompletedSteps([...completedSteps, step]);
    }
  };

  return (
    <HomeLayout>
      <div className="relative w-full h-screen flex overflow-hidden">
        <PensionAlimenticiaForm />
        <div className="w-1/2 h-full p-8 overflow-y-scroll bg-gray-900 scrollbar-thin">
          <div className="text-white">
            <h2 className="text-3xl text-center font-bold mb-4">Solicitud de Pensión Alimenticia</h2>
            <p className="mb-8 text-center">Complete cada uno de los siguientes apartados:</p>
            <div className="grid grid-cols-3 gap-4">
              <button
                className="bg-profile text-white p-4 rounded-lg"
                onClick={() => handleCompleteStep('Bienvenido')}
              >
                ¡Bienvenido!
              </button>

              <button
                className={`p-4 rounded-lg ${
                  isStepCompleted('Solicitud') ? 'bg-gray-600 text-white' : 'bg-gray-800 text-gray-500'
                }`}
                disabled={!isStepCompleted('Bienvenido')}
                onClick={() => handleCompleteStep('Solicitud')}
              >
                Solicitud
              </button>

              <button
                className={`p-4 rounded-lg ${
                  isStepCompleted('Demandante') ? 'bg-gray-600 text-white' : 'bg-gray-800 text-gray-500'
                }`}
                disabled={!isStepCompleted('Solicitud')}
                onClick={() => handleCompleteStep('Demandante')}
              >
                Demandante
              </button>

              <button
                className={`p-4 rounded-lg ${
                  isStepCompleted('Demandado') ? 'bg-gray-600 text-white' : 'bg-gray-800 text-gray-500'
                }`}
                disabled={!isStepCompleted('Demandante')}
                onClick={() => handleCompleteStep('Demandado')}
              >
                Demandado
              </button>

              <button
                className={`p-4 rounded-lg ${
                  isStepCompleted('Gastos Pensionado') ? 'bg-gray-600 text-white' : 'bg-gray-800 text-gray-500'
                }`}
                disabled={!isStepCompleted('Demandado')}
                onClick={() => handleCompleteStep('Gastos Pensionado')}
              >
                Gastos Pensionado
              </button>

              <button
                className={`p-4 rounded-lg ${
                  isStepCompleted('Archivos Adjuntos') ? 'bg-gray-600 text-white' : 'bg-gray-800 text-gray-500'
                }`}
                disabled={!isStepCompleted('Gastos Pensionado')}
                onClick={() => handleCompleteStep('Archivos Adjuntos')}
              >
                Archivos Adjuntos
              </button>

              <button
                className={`p-4 rounded-lg ${
                  isStepCompleted('Firma y Entrega') ? 'bg-gray-600 text-white' : 'bg-gray-800 text-gray-500'
                }`}
                disabled={!isStepCompleted('Archivos Adjuntos')}
                onClick={() => handleCompleteStep('Firma y Entrega')}
              >
                Firma y Entrega
              </button>

              <button
                className={`p-4 rounded-lg ${
                  isStepCompleted('Solicitud adicional') ? 'bg-gray-600 text-white' : 'bg-gray-800 text-gray-500'
                }`}
                disabled={!isStepCompleted('Firma y Entrega')}
                onClick={() => handleCompleteStep('Solicitud adicional')}
              >
                Solicitud adicional
              </button>

              <button
                className={`p-4 rounded-lg ${
                  isStepCompleted('Resumen') ? 'bg-gray-600 text-white' : 'bg-gray-800 text-gray-500'
                }`}
                disabled={!isStepCompleted('Solicitud adicional')}
                onClick={() => handleCompleteStep('Resumen')}
              >
                Resumen
              </button>
            </div>
            <p className="my-8 text-center">* Para poder enviar o pagar la solicitud todos los campos deben estar llenos.</p>
            <div className="mt-8">
              <button className="bg-profile text-white w-full py-3 rounded-lg mb-4">Enviar Solicitud y Pagar más Tarde</button>
              <button className="bg-gray-700 text-white w-full py-3 rounded-lg mb-4">Pagar en Línea</button>
              <button className="bg-gray-500 text-white w-full py-3 rounded-lg">Salir</button>
            </div>
          </div>
        </div>
      </div>
    </HomeLayout>
  );
};

export default PensionAlimenticia;
