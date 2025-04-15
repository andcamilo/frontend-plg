"use client"
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
import WidgetLoader from '@/src/app/components/widgetLoader';
import SaleComponent from '@/src/app/components/saleComponent';
import AppStateContext from '@context/context';
import { useRouter } from 'next/navigation';

const PensionAlimenticia: React.FC = () => {
  const [activeStep, setActiveStep] = useState<number>(1);
  console.log("🚀 ~ activeStep:", activeStep)
  const [showPaymentWidget, setShowPaymentWidget] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();
  

  const context = useContext(AppStateContext);

  if (!context) {
    throw new Error('AppStateContext must be used within an AppStateProvider');
  }

  const { store } = context;

  useEffect(() => {
    if (store.currentPosition) {
      console.log("🚀 ~ useEffect ~ store.currentPosition:", store.currentPosition)
      setActiveStep(store.currentPosition);
    }
  }, [store.currentPosition]);

  useEffect(() => {
    console.log("🚀 ~ store.token:", store.token)
  }, [store.token]);


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

  // Handle the payment button click
  const handlePaymentClick = () => {
    setLoading(true);
    setShowPaymentWidget(true);
  };
  console.log("🚀 Token ", store.token)

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const handleStepChange = (step: number, condition: boolean) => {
    if (condition) {
      setActiveStep(step);
      setIsMobileMenuOpen(false);
    }
  };

  const renderSidebar = () => (
    <div className="text-white">
      <h2 className="text-2xl text-center font-bold mb-4">Solicitud de Pensión Alimenticia</h2>
      <p className="mb-4 text-center">Complete cada uno de los siguientes apartados:</p>

      <div className="grid grid-cols-3 gap-4 gap-y-4">
        <button className={`w-full min-h-[50px] text-sm font-medium rounded-lg flex items-center justify-center ${activeStep === 1 ? 'bg-profile text-white' : 'bg-gray-800 text-white'}`} onClick={() => handleStepChange(1, store.bienvenido)}>¡Bienvenido!</button>
        <button className={`w-full min-h-[50px] text-sm font-medium rounded-lg flex items-center justify-center ${store.solicitud ? (activeStep === 2 ? 'bg-profile text-white' : 'bg-gray-800 text-white') : 'bg-gray-800 text-gray-500 cursor-not-allowed'}`} onClick={() => handleStepChange(2, store.solicitud)} disabled={!store.solicitud}>Solicitud</button>
        <button className={`w-full min-h-[50px] text-sm font-medium rounded-lg flex items-center justify-center ${store.demandante ? (activeStep === 3 ? 'bg-profile text-white' : 'bg-gray-800 text-white') : 'bg-gray-800 text-gray-500 cursor-not-allowed'}`} onClick={() => handleStepChange(3, store.demandante)} disabled={!store.demandante}>Demandante</button>
        <button className={`w-full min-h-[50px] text-sm font-medium rounded-lg flex items-center justify-center ${store.demandado ? (activeStep === 4 ? 'bg-profile text-white' : 'bg-gray-800 text-white') : 'bg-gray-800 text-gray-500 cursor-not-allowed'}`} onClick={() => handleStepChange(4, store.demandado)} disabled={!store.demandado}>Demandado</button>
        <button className={`w-full min-h-[50px] text-sm font-medium rounded-lg flex items-center justify-center ${store.gastosPensionado ? (activeStep === 5 ? 'bg-profile text-white' : 'bg-gray-800 text-white') : 'bg-gray-800 text-gray-500 cursor-not-allowed'}`} onClick={() => handleStepChange(5, store.gastosPensionado)} disabled={!store.gastosPensionado}>Gastos Pensionado</button>
        <button className={`w-full min-h-[50px] text-sm font-medium rounded-lg flex items-center justify-center ${store.archivosAdjuntos ? (activeStep === 6 ? 'bg-profile text-white' : 'bg-gray-800 text-white') : 'bg-gray-800 text-gray-500 cursor-not-allowed'}`} onClick={() => handleStepChange(6, store.archivosAdjuntos)} disabled={!store.archivosAdjuntos}>Archivos Adjuntos</button>
        <button className={`w-full min-h-[50px] text-sm font-medium rounded-lg flex items-center justify-center ${store.firmaYEntrega ? (activeStep === 7 ? 'bg-profile text-white' : 'bg-gray-800 text-white') : 'bg-gray-800 text-gray-500 cursor-not-allowed'}`} onClick={() => handleStepChange(7, store.firmaYEntrega)} disabled={!store.firmaYEntrega}>Firma y Entrega</button>
        <button className={`w-full min-h-[50px] text-sm font-medium rounded-lg flex items-center justify-center ${store.solicitudAdicional ? (activeStep === 8 ? 'bg-profile text-white' : 'bg-gray-800 text-white') : 'bg-gray-800 text-gray-500 cursor-not-allowed'}`} onClick={() => handleStepChange(8, store.solicitudAdicional)} disabled={!store.solicitudAdicional}>Solicitud Adicional</button>
        <button className={`w-full min-h-[50px] text-sm font-medium rounded-lg flex items-center justify-center ${store.resumen ? (activeStep === 9 ? 'bg-profile text-white' : 'bg-gray-800 text-white') : 'bg-gray-800 text-gray-500 cursor-not-allowed'}`} onClick={() => handleStepChange(9, store.resumen)} disabled={!store.resumen}>Resumen</button>
      </div>

      {(activeStep >= 8 || store.firmaYEntrega || !store.token) && (
        <div className="mt-8"><WidgetLoader /></div>
      )}

      {store.token && (
        <div className="mt-8"><SaleComponent saleAmount={150} /></div>
      )}

      <div className="mt-8">
        <button className="bg-gray-500 text-white w-full py-3 rounded-lg" onClick={() => router.push('/home')}>Salir</button>
      </div>
    </div>
  );

  return (
    <HomeLayout>
      <div className="relative w-full h-screen overflow-hidden">
        {/* Botón móvil que cambia entre "Menú" y "Cerrar" */}
        <button
          className="fixed top-2 right-3 z-50 flex items-center gap-1 px-2 py-1 text-white text-sm md:hidden"
          onClick={() => setIsMobileMenuOpen(prev => !prev)}
        >
          <span>{isMobileMenuOpen ? '' : 'Menú'}</span>
          <span className="text-2xl">{isMobileMenuOpen ? '✕' : '☰'}</span>
        </button>

        {/* Contenido principal */}
        <div className={`h-full transition-all duration-300 ease-in-out ${isMobileMenuOpen ? 'hidden' : 'block md:flex'}`}>
          <div className="w-full md:w-[75%] h-full p-4 md:p-8 overflow-y-scroll bg-gray-900 scrollbar-thin">
            {renderActiveForm()}
          </div>

          {/* Sidebar solo escritorio */}
          <div className="hidden md:block w-[25%] h-full p-8 overflow-y-scroll bg-gray-900 scrollbar-thin">
            {renderSidebar()}
          </div>
        </div>

        {/* Sidebar móvil fullscreen */}
        {isMobileMenuOpen && (
          <div className="fixed top-0 left-0 w-full h-full bg-gray-900 z-40 overflow-y-scroll p-6 md:hidden">
            {renderSidebar()}
          </div>
        )}
      </div>
    </HomeLayout>
  );
};

export default PensionAlimenticia;
