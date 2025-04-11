"use client"
import React, { useEffect, useState, useContext } from 'react';
import HomeLayout from '@components/homeLayout';
import AppStateContext from '@context/sociedadesContext';
import SociedadEmpresaBienvenido from '@components/sociedad-empresa/sociedadEmpresaBienvenido';
import SociedadEmpresaSolicitante from '@components/sociedad-empresa/sociedadEmpresaSolicitud';
import SociedadEmpresaEmpresa from '@components/sociedad-empresa/sociedadEmpresaEmpresa';
import SociedadEmpresaPersona from '@components/sociedad-empresa/sociedadEmpresaPersona';
import SociedadEmpresaDirectores from '@components/sociedad-empresa/sociedadEmpresaDirectores';
import SociedadEmpresaDignatarios from '@components/sociedad-empresa/sociedadEmpresaDignatarios';
import SociedadEmpresaAccionistas from '@components/sociedad-empresa/sociedadEmpresaAccionistas';
import SociedadEmpresaCapital from '@components/sociedad-empresa/sociedadEmpresaCapital';
import SociedadEmpresaPoder from '@components/sociedad-empresa/sociedadEmpresaPoder';
import SociedadEmpresaActividades from '@components/sociedad-empresa/sociedadEmpresaActividades';
import SociedadEmpresaIngresos from '@components/sociedad-empresa/sociedadEmpresaIngresos';
import SolicitudAdicional from '@components/sociedad-empresa/solicitudAdicional';
import SociedadEmpresaResumen from '@components/sociedad-empresa/sociedadEmpresaResumen';
import WidgetLoader from '@/src/app/components/widgetLoader';
import SaleComponent from '@/src/app/components/saleComponent';

const SociedadEmpresa: React.FC = () => {
    const [activeStep, setActiveStep] = useState<number>(1);
    console.log("🚀 ~ activeStep:", activeStep)
    const [showPaymentWidget, setShowPaymentWidget] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);

    // Access the context values
    const context = useContext(AppStateContext);

    if (!context) {
        throw new Error('AppStateContext must be used within an AppStateProvider');
    }

    const { store } = context;

    // Use an effect to observe changes in solicitud
    useEffect(() => {
        if (store.currentPosition) {
            setActiveStep(store.currentPosition);
        }
    }, [store.currentPosition]);

    const renderActiveForm = () => {
        switch (activeStep) {
            case 1:
                return <SociedadEmpresaBienvenido />;
            case 2:
                return <SociedadEmpresaSolicitante />;
            case 3:
                return <SociedadEmpresaEmpresa />;
            case 4:
                return <SociedadEmpresaPersona />;
            case 5:
                return <SociedadEmpresaDirectores />;
            case 6:
                return <SociedadEmpresaDignatarios />;
            case 7:
                return <SociedadEmpresaAccionistas />;
            case 8:
                return <SociedadEmpresaCapital />;
            case 9:
                return <SociedadEmpresaPoder />;
            case 10:
                return <SociedadEmpresaActividades />;
            case 11:
                return <SociedadEmpresaIngresos />;
            case 12:
                return <SolicitudAdicional />;
            case 13:
                return <SociedadEmpresaResumen />;
            default:
                return <SociedadEmpresaBienvenido />;
        }
    };

    const handlePaymentClick = () => {
        setLoading(true);
        setShowPaymentWidget(true);
    };

    const dentroPanama = Boolean(store.request?.dentroPanama && store.request?.dentroPanama !== "false");
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const renderSidebar = () => (
        <div className="text-white">
            <h2 className="text-3xl mt-2 text-center font-bold mb-4">Nueva Sociedad / Empresa</h2>
            <p className="mb-8 text-center">Complete cada uno de los siguientes apartados:</p>
            <div className="grid grid-cols-3 gap-4 gap-y-4">

                <button
                    className={`w-full min-h-[50px] text-sm font-medium rounded-lg flex items-center justify-center text-white ${activeStep === 1 ? 'bg-profile' : 'bg-gray-800'}`}
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
                    className={`w-full min-h-[50px] text-sm font-medium rounded-lg flex items-center justify-center ${store.empresa || store.request?.nombreSociedad_1 ? (activeStep === 3 ? 'bg-profile text-white' : 'bg-gray-800 text-white') : 'bg-gray-800 text-gray-500 cursor-not-allowed'}`}
                    onClick={() => handleStepChange(3, !!(store.empresa || store.request?.nombreSociedad_1))}
                    disabled={!(store.empresa || store.request?.nombreSociedad_1)}
                >
                    Empresa
                </button>

                <button
                    className={`w-full min-h-[50px] text-sm font-medium rounded-lg flex items-center justify-center ${store.personas || store.request?.nombreSociedad_1 ? (activeStep === 4 ? 'bg-profile text-white' : 'bg-gray-800 text-white') : 'bg-gray-800 text-gray-500 cursor-not-allowed'}`}
                    onClick={() => handleStepChange(4, !!(store.personas || store.request?.nombreSociedad_1))}
                    disabled={!(store.personas || store.request?.nombreSociedad_1)}
                >
                    Personas
                </button>

                <button
                    className={`w-full min-h-[50px] text-sm font-medium rounded-lg flex items-center justify-center ${store.directores ? (activeStep === 5 ? 'bg-profile text-white' : 'bg-gray-800 text-white') : 'bg-gray-800 text-gray-500 cursor-not-allowed'}`}
                    onClick={() => handleStepChange(5, store.directores)}
                    disabled={!store.directores}
                >
                    Directores
                </button>

                <button
                    className={`w-full min-h-[50px] text-sm font-medium rounded-lg flex items-center justify-center ${store.dignatarios ? (activeStep === 6 ? 'bg-profile text-white' : 'bg-gray-800 text-white') : 'bg-gray-800 text-gray-500 cursor-not-allowed'}`}
                    onClick={() => handleStepChange(6, store.dignatarios)}
                    disabled={!store.dignatarios}
                >
                    Dignatarios
                </button>

                <button
                    className={`w-full min-h-[50px] text-sm font-medium rounded-lg flex items-center justify-center ${store.accionistas ? (activeStep === 7 ? 'bg-profile text-white' : 'bg-gray-800 text-white') : 'bg-gray-800 text-gray-500 cursor-not-allowed'}`}
                    onClick={() => handleStepChange(7, store.accionistas)}
                    disabled={!store.accionistas}
                >
                    Accionistas
                </button>

                <button
                    className={`w-full min-h-[50px] text-sm font-medium rounded-lg flex items-center justify-center ${store.capital ? (activeStep === 8 ? 'bg-profile text-white' : 'bg-gray-800 text-white') : 'bg-gray-800 text-gray-500 cursor-not-allowed'}`}
                    onClick={() => handleStepChange(8, store.capital)}
                    disabled={!store.capital}
                >
                    Capital
                </button>

                <button
                    className={`w-full min-h-[50px] text-sm font-medium rounded-lg flex items-center justify-center ${store.poder ? (activeStep === 9 ? 'bg-profile text-white' : 'bg-gray-800 text-white') : 'bg-gray-800 text-gray-500 cursor-not-allowed'}`}
                    onClick={() => handleStepChange(9, store.poder)}
                    disabled={!store.poder}
                >
                    Poder
                </button>

                <button
                    className={`w-full min-h-[50px] text-sm font-medium rounded-lg flex items-center justify-center ${store.actividades ? (activeStep === 10 ? 'bg-profile text-white' : 'bg-gray-800 text-white') : 'bg-gray-800 text-gray-500 cursor-not-allowed'}`}
                    onClick={() => handleStepChange(10, store.actividades)}
                    disabled={!store.actividades}
                >
                    Actividades
                </button>

                <button
                    className={`w-full min-h-[50px] text-sm font-medium rounded-lg flex items-center justify-center ${store.ingresos ? (activeStep === 11 ? 'bg-profile text-white' : 'bg-gray-800 text-white') : 'bg-gray-800 text-gray-500 cursor-not-allowed'}`}
                    onClick={() => handleStepChange(11, !!(store.ingresos || dentroPanama))}
                    disabled={!(store.ingresos || dentroPanama)}
                >
                    Ingresos
                </button>

                <button
                    className={`w-full min-h-[50px] text-sm font-medium rounded-lg flex items-center justify-center ${store.solicitudAdicional ? (activeStep === 12 ? 'bg-profile text-white' : 'bg-gray-800 text-white') : 'bg-gray-800 text-gray-500 cursor-not-allowed'}`}
                    onClick={() => handleStepChange(12, store.solicitudAdicional)}
                    disabled={!store.solicitudAdicional}
                >
                    Solicitud Adicional
                </button>

                <button
                    className={`w-full min-h-[50px] text-sm font-medium rounded-lg flex items-center justify-center ${store.resumen ? (activeStep === 13 ? 'bg-profile text-white' : 'bg-gray-800 text-white') : 'bg-gray-800 text-gray-500 cursor-not-allowed'}`}
                    onClick={() => handleStepChange(13, store.resumen)}
                    disabled={!store.resumen}
                >
                    Resumen
                </button>
            </div>

            <p className="my-8 text-center">
                * Para poder enviar o pagar la solicitud todos los campos deben estar llenos.
            </p>

            {activeStep >= 12 || store.ingresos && (
                <div className="mt-8">
                    <WidgetLoader />
                </div>
            )}

            {store.token ? (
                <div className="mt-8">
                    <SaleComponent saleAmount={100} />
                </div>
            ) : (
                <div className="mt-8 text-gray-400">
                    Por favor, complete el widget de pago para continuar.
                </div>
            )}

            <div className="mt-8">
                <button className="bg-gray-500 text-white w-full py-3 rounded-lg">Salir</button>
            </div>
        </div>
    );

    const handleStepChange = (step: number, condition: boolean) => {
        if (condition) {
            setActiveStep(step);
            setIsMobileMenuOpen(false); // cerrar menú si está abierto
        }
    };

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

                {/* Menú móvil */}
                {isMobileMenuOpen && (
                    <div className="fixed top-0 left-0 w-full h-full bg-gray-900 z-40 overflow-y-scroll p-6 md:hidden">
                        {renderSidebar()}
                    </div>
                )}
            </div>
        </HomeLayout>
    );
};

export default SociedadEmpresa;