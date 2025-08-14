"use client"
import React, { useEffect, useState, useContext } from 'react';
import HomeLayout from '@components/homeLayout';
import RegistroMarcaBienvenido from '@components/registro-marca/registroMarcaBienvenido';
import PensionAlimenticiaSolicitud from '@components/pension-alimenticia/pensionAlimenticiaSolicitud';
import RegistroPersonaNatural from '@components/registro-marca/registroPersonaNatural';
import RegistroPersonaJuridica from '@components/registro-marca/registroPersonaJuridica';
import PensionAlimenticiaDemandado from '@components/pension-alimenticia/pensionAlimenticiaDemandado';
import PensionAlimenticiaGastosPensionado from '@components/pension-alimenticia/pensionAlimenticiaGastosPensionado';
import PensionAlimenticiaArchivosAdjuntos from '@components/pension-alimenticia/pensionAlimenticiaArchivosAdjuntos';
import PensionAlimenticiaFirmaYEntrega from '@components/pension-alimenticia/pensionAlimenticiaFirmaYEntrega';
import PensionAlimenticiaSolicitudAdicional from '@components/pension-alimenticia/pensionAlimenticiaSolicitudAdicional';
import PensionAlimenticiaResumen from '@components/pension-alimenticia/pensionAlimenticiaResumen';
import AppStateContext from '@context/context';
import { useRouter, useParams } from 'next/navigation';
import PaymentModal from '@/src/app/components/PaymentModal';
import Cookies from 'js-cookie';
import RegisterPaymentForm from '../../components/RegisterPaymentForm';

interface RegistroMarcaFormProps {
  requestId?: string;
}

const RegistroMarcaForm: React.FC<RegistroMarcaFormProps> = () => {
  const [activeStep, setActiveStep] = useState<number>(1);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState<boolean>(false);
  const [mostrarModalTipo, setMostrarModalTipo] = useState(false);
  const [tipoSeleccionado, setTipoSeleccionado] = useState('');
  const [showPaymentButtons, setShowPaymentButtons] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();

  const context = useContext(AppStateContext);

  if (!context) {
    throw new Error('AppStateContext must be used within an AppStateProvider');
  }

  const { store, setStore } = context;
  const params = useParams();
  const id = (params as any)?.id as string | undefined;

  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    if (store.currentPosition) {
      console.log("🚀 ~ useEffect ~ store.currentPosition:", store.currentPosition)
      setActiveStep(store.currentPosition);
    }
  }, [store.currentPosition]);

  // Ensure the store contains the solicitudId from the route for payment flow
  useEffect(() => {
    if (id) {
      setStore(prev => ({ ...prev, solicitudId: id }));
    }
  }, [id, setStore]);

  useEffect(() => {
    console.log("🚀 ~ store.token:", store.token)
  }, [store.token]);

  useEffect(() => {
    setIsLoggedIn(!!Cookies.get('AuthToken'));
  }, []);

  // Show payment buttons when user reaches the appropriate step
  useEffect(() => {
    if (!store.token && (activeStep >= 1 /* 8 */ || store.firmaYEntrega)) {
      setShowPaymentButtons(true);
    } else {
      setShowPaymentButtons(false);
    }
  }, [store.token, activeStep, store.firmaYEntrega]);

  const renderActiveForm = () => {
    switch (activeStep) {
      case 1:
        return <RegistroMarcaBienvenido/>;
      case 2:
        return <PensionAlimenticiaSolicitud />;
      case 3:
        return <RegistroPersonaNatural />;
      case 4:
        return <RegistroPersonaJuridica />;
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
        return <RegistroMarcaBienvenido/>;
    }
  };

  // Handle the payment button click
  const handlePaymentClick = () => {
    setLoading(true);
    setIsPaymentModalOpen(true);
    setShowPaymentButtons(false);
  };

  const handleClosePaymentModal = () => {
    setIsPaymentModalOpen(false);
    setLoading(false);
    // Show payment buttons again if modal is closed and no token is present
    if (!store.token) {
      setShowPaymentButtons(true);
    }
  };

  // Handle "Enviar y pagar más tarde" button click
  const handleSendAndPayLater = async () => {
    setLoading(true);
    try {
      // Update the solicitudId status to 10 using the update-request-all endpoint
      if (store.solicitudId) {
        const response = await fetch('/api/update-request-all', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            solicitudId: store.solicitudId,
            status: 10
          }),
        });

        if (response.ok) {
          console.log('Solicitud status updated to 10 successfully');
          // Redirect to login page on success
          router.push('/login');
        } else {
          console.error('Failed to update solicitud status');
        }
      } else {
        console.error('No solicitudId found in store');
      }
    } catch (error) {
      console.error('Error updating solicitud status:', error);
    } finally {
      setLoading(false);
    }
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

      <h2 className="text-2xl text-center font-bold mb-4">Solicitud de Registro de Marcas</h2>
      <p className="mb-4 text-center">Complete cada uno de los siguientes apartados:</p>

      <div className="grid grid-cols-3 gap-4 gap-y-4">
        <button className={`w-full min-h-[50px] text-sm font-medium rounded-lg flex items-center justify-center ${activeStep === 1 ? 'bg-profile text-white' : 'bg-gray-800 text-white'}`} onClick={() => handleStepChange(1, store.bienvenido)}>¡Bienvenido!</button>
        <button className={`w-full min-h-[50px] text-sm font-medium rounded-lg flex items-center justify-center ${store.solicitud ? (activeStep === 2 ? 'bg-profile text-white' : 'bg-gray-800 text-white') : 'bg-gray-800 text-gray-500 cursor-not-allowed'}`} onClick={() => handleStepChange(2, store.solicitud)} disabled={!store.solicitud}>Nuevo Registro </button>
        <button className={`w-full min-h-[50px] text-sm font-medium rounded-lg flex items-center justify-center bg-gray-800 text-white hover:bg-profile transition-colors`}  onClick={() => setMostrarModalTipo(true)}>  Tipo Solicitud</button>
        <button className={`w-full min-h-[50px] text-sm font-medium rounded-lg flex items-center justify-center ${store.demandante ? (activeStep === 3 ? 'bg-profile text-white' : 'bg-gray-800 text-white') : 'bg-gray-800 text-gray-500 cursor-not-allowed'}`} onClick={() => handleStepChange(3, store.demandante)} disabled={!store.demandante}>Demandante</button>
        <button className={`w-full min-h-[50px] text-sm font-medium rounded-lg flex items-center justify-center ${store.demandado ? (activeStep === 4 ? 'bg-profile text-white' : 'bg-gray-800 text-white') : 'bg-gray-800 text-gray-500 cursor-not-allowed'}`} onClick={() => handleStepChange(4, store.demandado)} disabled={!store.demandado}>Demandado</button>
        <button className={`w-full min-h-[50px] text-sm font-medium rounded-lg flex items-center justify-center ${store.gastosPensionado ? (activeStep === 5 ? 'bg-profile text-white' : 'bg-gray-800 text-white') : 'bg-gray-800 text-gray-500 cursor-not-allowed'}`} onClick={() => handleStepChange(5, store.gastosPensionado)} disabled={!store.gastosPensionado}>Gastos Pensionado</button>
        <button className={`w-full min-h-[50px] text-sm font-medium rounded-lg flex items-center justify-center ${store.archivosAdjuntos ? (activeStep === 6 ? 'bg-profile text-white' : 'bg-gray-800 text-white') : 'bg-gray-800 text-gray-500 cursor-not-allowed'}`} onClick={() => handleStepChange(6, store.archivosAdjuntos)} disabled={!store.archivosAdjuntos}>Archivos Adjuntos</button>
        <button className={`w-full min-h-[50px] text-sm font-medium rounded-lg flex items-center justify-center ${store.firmaYEntrega ? (activeStep === 7 ? 'bg-profile text-white' : 'bg-gray-800 text-white') : 'bg-gray-800 text-gray-500 cursor-not-allowed'}`} onClick={() => handleStepChange(7, store.firmaYEntrega)} disabled={!store.firmaYEntrega}>Firma y Entrega</button>
        <button className={`w-full min-h-[50px] text-sm font-medium rounded-lg flex items-center justify-center ${store.solicitudAdicional ? (activeStep === 8 ? 'bg-profile text-white' : 'bg-gray-800 text-white') : 'bg-gray-800 text-gray-500 cursor-not-allowed'}`} onClick={() => handleStepChange(8, store.solicitudAdicional)} disabled={!store.solicitudAdicional}>Solicitud Adicional</button>
        <button className={`w-full min-h-[50px] text-sm font-medium rounded-lg flex items-center justify-center ${store.resumen ? (activeStep === 9 ? 'bg-profile text-white' : 'bg-gray-800 text-white') : 'bg-gray-800 text-gray-500 cursor-not-allowed'}`} onClick={() => handleStepChange(9, store.resumen)} disabled={!store.resumen}>Resumen</button>
      </div>

      {showPaymentButtons && isLoggedIn && (
        <div className="mt-8">
          <div className="flex flex-col gap-4">
            <button
              onClick={handlePaymentClick}
              disabled={loading}
              className="bg-profile hover:bg-profile disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
            >
              {loading ? 'Cargando...' : 'Pagar en línea'}
            </button>

            <button
              onClick={handleSendAndPayLater}
              disabled={loading}
              className="bg-profile hover:bg-profile disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
            >
              {loading ? 'Procesando...' : 'Enviar y pagar más tarde'}
            </button>

            <button
              onClick={() => setIsRegisterPaymentModalOpen(true)}
              disabled={loading}
              className="bg-profile hover:bg-profile disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200"
            >
              Registrar Pago
            </button>
          </div>
        </div>
      )}

{mostrarModalTipo && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
    <div className="bg-gray-900 rounded-lg w-11/12 max-w-md p-6 relative text-white">
      <button
        className="absolute top-2 right-2 text-white text-xl"
        onClick={() => setMostrarModalTipo(false)}
      >
        ✕
      </button>
      <h2 className="text-2xl font-bold text-center mb-6">¿El dueño de la marca será una persona Natural o Jurídica?</h2>
      <div className="flex flex-col gap-4">
        <button
          className="bg-profile py-3 rounded-md font-semibold hover:bg-profile/90"
          onClick={() => handleSeleccion('natural')}
        >
          Persona Natural
        </button>
        <button
          className="bg-profile py-3 rounded-md font-semibold hover:bg-profile/90"
          onClick={() => handleSeleccion('juridica')}
        >
          Persona Jurídica
        </button>
        <button
          className="mt-2 underline text-center text-sm text-gray-300"
          onClick={() => setMostrarModalTipo(false)}
        >
          Cancelar
        </button>
      </div>
    </div>
  </div>
)}
      <div className="mt-8">
        <button className="bg-gray-500 text-white w-full py-3 rounded-lg" onClick={() => router.push('/home')}>Salir</button>
      </div>
    </div>
  );

  const [isRegisterPaymentModalOpen, setIsRegisterPaymentModalOpen] = useState(false);
  const [registerPaymentForm, setRegisterPaymentForm] = useState({
    factura: '',
    monto: '',
    fecha: '',
    correo: '',
    customer_id: '',
    payment_mode: '',
    amount: '',
    invoice_id: '',
    amount_applied: '',
  });

  const handleRegisterPaymentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setRegisterPaymentForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleRegisterPaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: handle submit logic
    setIsRegisterPaymentModalOpen(false);
  };

  const handleSeleccion = (tipo: string) => {
  setTipoSeleccionado(tipo);
  setMostrarModalTipo(false);
  // Ir al paso correspondiente
  if (tipo === 'natural') {
    setActiveStep(3); // Paso para Persona Natural
  } else {
    setActiveStep(4); // Paso para Persona Jurídica
  }
};

  return (
    <HomeLayout>
      <div className="relative w-full h-screen overflow-hidden">
        <button
          className="fixed top-2 right-3 z-50 flex items-center gap-1 px-2 py-1 text-white text-sm md:hidden"
          onClick={() => setIsMobileMenuOpen(prev => !prev)}
        >
          <span>{isMobileMenuOpen ? '' : 'Menú'}</span>
          <span className="text-2xl">{isMobileMenuOpen ? '✕' : '☰'}</span>
        </button>

        <div className={`h-full transition-all duration-300 ease-in-out ${isMobileMenuOpen ? 'hidden' : 'block md:flex'}`}>
          <div className="w-full md:w-[75%] h-full p-4 md:p-8 overflow-y-scroll bg-gray-900 scrollbar-thin">
            {renderActiveForm()}
          </div>
          
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
      {isPaymentModalOpen && (
        <PaymentModal 
            isOpen={isPaymentModalOpen}
            onClose={handleClosePaymentModal}
            saleAmount={150}
        />
      )}
      {isRegisterPaymentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-gray-900 rounded-lg w-11/12 max-w-md p-6 relative">
            <button
              className="absolute top-2 right-2 text-white text-xl"
              onClick={() => setIsRegisterPaymentModalOpen(false)}
            >
              ✕
            </button>
            <h2 className="text-white text-2xl font-bold mb-4">Registrar Pago</h2>
            <RegisterPaymentForm
              onClose={() => setIsRegisterPaymentModalOpen(false)}
            />
          </div>
        </div>
      )}
    </HomeLayout>
  );
};

export default RegistroMarcaForm; 