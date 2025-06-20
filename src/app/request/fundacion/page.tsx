"use client"
import React, { useEffect, useState, useContext } from 'react';
import HomeLayout from '@components/homeLayout';
import AppStateContext from '@context/fundacionContext';
import FundacionBienvenido from '@components/fundacion/fundacionBienvenido';
import FundacionSolicitante from '@components/fundacion/fundacionSolicitud';
import FundacionFundacion from '@components/fundacion/fundacionFundacion';
import FundacionPersonas from '@components/fundacion/fundacionPersona';
import FundacionFundadores from '@components/fundacion/fundacionFundadores';
import FundacionDignatarios from '@components/fundacion/fundacionDignatarios';
import FundacionMiembros from '@components/fundacion/fundacionMiembros';
import FundacionProtector from '@components/fundacion/fundacionProtector';
import FundacionBeneficiarios from '@components/fundacion/fundacionBeneficiarios';
import FundacionPatrimonio from '@components/fundacion/fundacionPatrimonio';
import FundacionPoder from '@components/fundacion/fundacionPoder';
import FundacionObjetivos from '@components/fundacion/fundacionObjetivos';
import FundacionIngresos from '@components/fundacion/fundacionIngresos';
import FundacionActivos from '@components/fundacion/fundacionActivos';
import FundacionSolicitudAdicional from '@components/fundacion/solicitudAdicional';
import FundacionResumen from '@components/fundacion/fundacionResumen';
import WidgetLoader from '@/src/app/components/widgetLoader';
import { useRouter } from 'next/navigation';
import SaleComponent from '@/src/app/components/saleComponent';

const Fundacion: React.FC = () => {
    const [activeStep, setActiveStep] = useState<number>(1);
    const [showPaymentWidget, setShowPaymentWidget] = useState<boolean>(false);
    const [showPaymentButtons, setShowPaymentButtons] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const router = useRouter();


    // Access the context values
    const context = useContext(AppStateContext);

    if (!context) {
        throw new Error('FundacionContext must be used within a FundacionStateProvider');
    }

    const { store } = context;

    // Use an effect to observe changes in solicitud
    useEffect(() => {
        if (store.currentPosition) {
            setActiveStep(store.currentPosition);
        }
    }, [store.currentPosition]);

    // Show payment buttons when user reaches the appropriate step
    useEffect(() => {
        if (!store.token && (activeStep >= 14 || store.activos)) {
            setShowPaymentButtons(true);
        } else {
            setShowPaymentButtons(false);
        }
    }, [store.token, activeStep, store.activos]);

    const renderActiveForm = () => {
        switch (activeStep) {
            case 1:
                return <FundacionBienvenido />;
            case 2:
                return <FundacionSolicitante />;
            case 3:
                return <FundacionFundacion />;
            case 4:
                return <FundacionPersonas />;
            case 5:
                return <FundacionFundadores />;
            case 6:
                return <FundacionDignatarios />;
            case 7:
                return <FundacionMiembros />;
            case 8:
                return <FundacionProtector />;
            case 9:
                return <FundacionBeneficiarios />;
            case 10:
                return <FundacionPatrimonio />;
            case 11:
                return <FundacionPoder />;
            case 12:
                return <FundacionObjetivos />;
            case 13:
                return <FundacionIngresos />;
            case 14:
                return <FundacionActivos />;
            case 15:
                return <FundacionSolicitudAdicional />;
            case 16:
                return <FundacionResumen />;
            default:
                return <FundacionBienvenido />;
        }
    };

    // Handle the payment button click
    const handlePaymentClick = () => {
        setLoading(true);
        setShowPaymentWidget(true);
        setShowPaymentButtons(false);
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

    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleStepChange = (step: number, condition: boolean) => {
        if (condition) {
            setActiveStep(step);
            setIsMobileMenuOpen(false); // cierra el menú si está abierto
        }
    };

    const renderSidebar = () => (
        <div className="text-white">
            <h2 className="text-3xl text-center font-bold mb-4">Nueva Fundación</h2>
            <p className="mb-8 text-center">Complete cada uno de los siguientes apartados:</p>

            <div className="grid grid-cols-3 gap-4 gap-y-4">
                <button
                    className={`w-full min-h-[50px] text-sm font-medium rounded-lg flex items-center justify-center ${activeStep === 1 ? 'bg-profile text-white' : 'bg-gray-800 text-white'}`}
                    onClick={() => handleStepChange(1, store.bienvenido)}
                    disabled={!store.bienvenido}
                >
                    ¡Bienvenido!
                </button>

                <button
                    className={`w-full min-h-[50px] text-sm font-medium rounded-lg flex items-center justify-center ${store.solicitante ? (activeStep === 2 ? 'bg-profile text-white' : 'bg-gray-800 text-white') : 'bg-gray-800 text-gray-500 cursor-not-allowed'}`}
                    onClick={() => handleStepChange(2, store.solicitante)}
                    disabled={!store.solicitante}
                >
                    Solicitante
                </button>

                <button
                    className={`w-full min-h-[50px] text-sm font-medium rounded-lg flex items-center justify-center ${store.fundacion ? (activeStep === 3 ? 'bg-profile text-white' : 'bg-gray-800 text-white') : 'bg-gray-800 text-gray-500 cursor-not-allowed'}`}
                    onClick={() => handleStepChange(3, store.fundacion)}
                    disabled={!store.fundacion}
                >
                    Fundación
                </button>

                <button
                    className={`w-full min-h-[50px] text-sm font-medium rounded-lg flex items-center justify-center ${store.personas ? (activeStep === 4 ? 'bg-profile text-white' : 'bg-gray-800 text-white') : 'bg-gray-800 text-gray-500 cursor-not-allowed'}`}
                    onClick={() => handleStepChange(4, store.personas)}
                    disabled={!store.personas}
                >
                    Personas
                </button>

                <button
                    className={`w-full min-h-[50px] text-sm font-medium rounded-lg flex items-center justify-center ${store.fundadores ? (activeStep === 5 ? 'bg-profile text-white' : 'bg-gray-800 text-white') : 'bg-gray-800 text-gray-500 cursor-not-allowed'}`}
                    onClick={() => handleStepChange(5, store.fundadores)}
                    disabled={!store.fundadores}
                >
                    Fundadores
                </button>

                <button
                    className={`w-full min-h-[50px] text-sm font-medium rounded-lg flex items-center justify-center ${store.dignatarios ? (activeStep === 6 ? 'bg-profile text-white' : 'bg-gray-800 text-white') : 'bg-gray-800 text-gray-500 cursor-not-allowed'}`}
                    onClick={() => handleStepChange(6, store.dignatarios)}
                    disabled={!store.dignatarios}
                >
                    Dignatarios
                </button>

                <button
                    className={`w-full min-h-[50px] text-sm font-medium rounded-lg flex items-center justify-center ${store.miembros ? (activeStep === 7 ? 'bg-profile text-white' : 'bg-gray-800 text-white') : 'bg-gray-800 text-gray-500 cursor-not-allowed'}`}
                    onClick={() => handleStepChange(7, store.miembros)}
                    disabled={!store.miembros}
                >
                    Miembros
                </button>

                <button
                    className={`w-full min-h-[50px] text-sm font-medium rounded-lg flex items-center justify-center ${store.protector ? (activeStep === 8 ? 'bg-profile text-white' : 'bg-gray-800 text-white') : 'bg-gray-800 text-gray-500 cursor-not-allowed'}`}
                    onClick={() => handleStepChange(8, store.protector)}
                    disabled={!store.protector}
                >
                    Protector
                </button>

                <button
                    className={`w-full min-h-[50px] text-sm font-medium rounded-lg flex items-center justify-center ${store.beneficiarios ? (activeStep === 9 ? 'bg-profile text-white' : 'bg-gray-800 text-white') : 'bg-gray-800 text-gray-500 cursor-not-allowed'}`}
                    onClick={() => handleStepChange(9, store.beneficiarios)}
                    disabled={!store.beneficiarios}
                >
                    Beneficiarios
                </button>

                <button
                    className={`w-full min-h-[50px] text-sm font-medium rounded-lg flex items-center justify-center ${store.patrimonio ? (activeStep === 10 ? 'bg-profile text-white' : 'bg-gray-800 text-white') : 'bg-gray-800 text-gray-500 cursor-not-allowed'}`}
                    onClick={() => handleStepChange(10, store.patrimonio)}
                    disabled={!store.patrimonio}
                >
                    Patrimonio
                </button>

                <button
                    className={`w-full min-h-[50px] text-sm font-medium rounded-lg flex items-center justify-center ${store.poder ? (activeStep === 11 ? 'bg-profile text-white' : 'bg-gray-800 text-white') : 'bg-gray-800 text-gray-500 cursor-not-allowed'}`}
                    onClick={() => handleStepChange(11, store.poder)}
                    disabled={!store.poder}
                >
                    Poder
                </button>

                <button
                    className={`w-full min-h-[50px] text-sm font-medium rounded-lg flex items-center justify-center ${store.objetivos ? (activeStep === 12 ? 'bg-profile text-white' : 'bg-gray-800 text-white') : 'bg-gray-800 text-gray-500 cursor-not-allowed'}`}
                    onClick={() => handleStepChange(12, store.objetivos)}
                    disabled={!store.objetivos}
                >
                    Objetivos
                </button>

                <button
                    className={`w-full min-h-[50px] text-sm font-medium rounded-lg flex items-center justify-center ${store.ingresos ? (activeStep === 13 ? 'bg-profile text-white' : 'bg-gray-800 text-white') : 'bg-gray-800 text-gray-500 cursor-not-allowed'}`}
                    onClick={() => handleStepChange(13, store.ingresos)}
                    disabled={!store.ingresos}
                >
                    Ingresos
                </button>

                <button
                    className={`w-full min-h-[50px] text-sm font-medium rounded-lg flex items-center justify-center ${store.activos ? (activeStep === 14 ? 'bg-profile text-white' : 'bg-gray-800 text-white') : 'bg-gray-800 text-gray-500 cursor-not-allowed'}`}
                    onClick={() => handleStepChange(14, store.activos)}
                    disabled={!store.activos}
                >
                    Activos
                </button>

                <button
                    className={`w-full min-h-[50px] text-sm font-medium rounded-lg flex items-center justify-center ${store.solicitudAdicional ? (activeStep === 15 ? 'bg-profile text-white' : 'bg-gray-800 text-white') : 'bg-gray-800 text-gray-500 cursor-not-allowed'}`}
                    onClick={() => handleStepChange(15, store.solicitudAdicional)}
                    disabled={!store.solicitudAdicional}
                >
                    Solicitud Adicional
                </button>

                <button
                    className={`w-full min-h-[50px] text-sm font-medium rounded-lg flex items-center justify-center ${store.resumen ? (activeStep === 16 ? 'bg-profile text-white' : 'bg-gray-800 text-white') : 'bg-gray-800 text-gray-500 cursor-not-allowed'}`}
                    onClick={() => handleStepChange(16, store.resumen)}
                    disabled={!store.resumen}
                >
                    Resumen
                </button>
            </div>

            <p className="my-8 text-center">
                * Para poder enviar o pagar la solicitud todos los campos deben estar llenos.
            </p>

            {showPaymentButtons && (
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
                    </div>
                </div>
            )}

            {showPaymentWidget && <WidgetLoader />}

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

                    {/* Submenú visible solo en escritorio */}
                    <div className="hidden md:block w-[25%] h-full p-8 overflow-y-scroll bg-gray-900 scrollbar-thin">
                        {renderSidebar()}
                    </div>
                </div>

                {/* Menú móvil fullscreen */}
                {isMobileMenuOpen && (
                    <div className="fixed top-0 left-0 w-full h-full bg-gray-900 z-40 overflow-y-scroll p-6 md:hidden">
                        {renderSidebar()}
                    </div>
                )}
            </div>
        </HomeLayout>
    );
};

export default Fundacion;