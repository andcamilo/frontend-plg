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
import SaleComponent from '@/src/app/components/saleComponent';

const Fundacion: React.FC = () => {
    const [activeStep, setActiveStep] = useState<number>(1);

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

    return (
        <HomeLayout>
            <div className="relative w-full h-screen flex overflow-hidden">
                <div className="w-3/5 h-full p-8 overflow-y-scroll bg-gray-900 scrollbar-thin">
                    {renderActiveForm()} {/* Render the active form component */}
                </div>
                <div className="w-2/5 h-full p-8 overflow-y-scroll bg-gray-900 scrollbar-thin">
                    <div className="text-white">
                        <h2 className="text-3xl text-center font-bold mb-4">Nueva Fundación</h2>
                        <p className="mb-8 text-center">Complete cada uno de los siguientes apartados:</p>
                        <div className="grid grid-cols-3 gap-4">
                            {/* Bienvenido button */}
                            <button
                                className={`p-4 rounded-lg text-white ${activeStep === 1 ? 'bg-profile' : 'bg-gray-800'}`}
                                onClick={() => store.bienvenido && setActiveStep(1)}
                                disabled={!store.bienvenido}
                            >
                                ¡Bienvenido!
                            </button>

                            {/* Solicitante button */}
                            <button
                                className={`p-4 rounded-lg ${store.solicitante ? (activeStep === 2 ? 'bg-profile text-white' : 'bg-gray-800 text-white') : 'bg-gray-800 text-gray-500 cursor-not-allowed'}`}
                                onClick={() => store.solicitante && setActiveStep(2)}
                                disabled={!store.solicitante}
                            >
                                Solicitante
                            </button>

                            {/* Fundacion button */}
                            <button
                                className={`p-4 rounded-lg ${store.fundacion ? (activeStep === 3 ? 'bg-profile text-white' : 'bg-gray-800 text-white') : 'bg-gray-800 text-gray-500 cursor-not-allowed'}`}
                                onClick={() => store.fundacion && setActiveStep(3)}
                                disabled={!store.fundacion}
                            >
                                Fundación
                            </button>

                            {/* Personas button */}
                            <button
                                className={`p-4 rounded-lg ${store.personas ? (activeStep === 4 ? 'bg-profile text-white' : 'bg-gray-800 text-white') : 'bg-gray-800 text-gray-500 cursor-not-allowed'}`}
                                onClick={() => store.personas && setActiveStep(4)}
                                disabled={!store.personas}
                            >
                                Personas
                            </button>

                            {/* Fundadores button */}
                            <button
                                className={`p-4 rounded-lg ${store.fundadores ? (activeStep === 5 ? 'bg-profile text-white' : 'bg-gray-800 text-white') : 'bg-gray-800 text-gray-500 cursor-not-allowed'}`}
                                onClick={() => store.fundadores && setActiveStep(5)}
                                disabled={!store.fundadores}
                            >
                                Fundadores
                            </button>

                            {/* Dignatarios button */}
                            <button
                                className={`p-4 rounded-lg ${store.dignatarios ? (activeStep === 6 ? 'bg-profile text-white' : 'bg-gray-800 text-white') : 'bg-gray-800 text-gray-500 cursor-not-allowed'}`}
                                onClick={() => store.dignatarios && setActiveStep(6)}
                                disabled={!store.dignatarios}
                            >
                                Dignatarios
                            </button>

                            {/* Miembros button */}
                            <button
                                className={`p-4 rounded-lg ${store.miembros ? (activeStep === 7 ? 'bg-profile text-white' : 'bg-gray-800 text-white') : 'bg-gray-800 text-gray-500 cursor-not-allowed'}`}
                                onClick={() => store.miembros && setActiveStep(7)}
                                disabled={!store.miembros}
                            >
                                Miembros
                            </button>

                            {/* Protector button */}
                            <button
                                className={`p-4 rounded-lg ${store.protector ? (activeStep === 8 ? 'bg-profile text-white' : 'bg-gray-800 text-white') : 'bg-gray-800 text-gray-500 cursor-not-allowed'}`}
                                onClick={() => store.protector && setActiveStep(8)}
                                disabled={!store.protector}
                            >
                                Protector
                            </button>

                            {/* Beneficiarios button */}
                            <button
                                className={`p-4 rounded-lg ${store.beneficiarios ? (activeStep === 9 ? 'bg-profile text-white' : 'bg-gray-800 text-white') : 'bg-gray-800 text-gray-500 cursor-not-allowed'}`}
                                onClick={() => store.beneficiarios && setActiveStep(9)}
                                disabled={!store.beneficiarios}
                            >
                                Beneficiarios
                            </button>

                            {/* Patrimonio button */}
                            <button
                                className={`p-4 rounded-lg ${store.patrimonio ? (activeStep === 10 ? 'bg-profile text-white' : 'bg-gray-800 text-white') : 'bg-gray-800 text-gray-500 cursor-not-allowed'}`}
                                onClick={() => store.patrimonio && setActiveStep(10)}
                                disabled={!store.patrimonio}
                            >
                                Patrimonio
                            </button>

                            {/* Poder button */}
                            <button
                                className={`p-4 rounded-lg ${store.poder ? (activeStep === 11 ? 'bg-profile text-white' : 'bg-gray-800 text-white') : 'bg-gray-800 text-gray-500 cursor-not-allowed'}`}
                                onClick={() => store.poder && setActiveStep(11)}
                                disabled={!store.poder}
                            >
                                Poder
                            </button>

                            {/* Objetivos button */}
                            <button
                                className={`p-4 rounded-lg ${store.objetivos ? (activeStep === 12 ? 'bg-profile text-white' : 'bg-gray-800 text-white') : 'bg-gray-800 text-gray-500 cursor-not-allowed'}`}
                                onClick={() => store.objetivos && setActiveStep(12)}
                                disabled={!store.objetivos}
                            >
                                Objetivos
                            </button>

                            {/* Ingresos button */}
                            <button
                                className={`p-4 rounded-lg ${store.ingresos ? (activeStep === 13 ? 'bg-profile text-white' : 'bg-gray-800 text-white') : 'bg-gray-800 text-gray-500 cursor-not-allowed'}`}
                                onClick={() => store.ingresos && setActiveStep(13)}
                                disabled={!store.ingresos}
                            >
                                Ingresos
                            </button>

                            {/* Activos button */}
                            <button
                                className={`p-4 rounded-lg ${store.activos ? (activeStep === 14 ? 'bg-profile text-white' : 'bg-gray-800 text-white') : 'bg-gray-800 text-gray-500 cursor-not-allowed'}`}
                                onClick={() => store.activos && setActiveStep(14)}
                                disabled={!store.activos}
                            >
                                Activos
                            </button>

                            {/* Solicitud adicional button */}
                            <button
                                className={`p-4 rounded-lg ${store.solicitudAdicional ? (activeStep === 15 ? 'bg-profile text-white' : 'bg-gray-800 text-white') : 'bg-gray-800 text-gray-500 cursor-not-allowed'}`}
                                onClick={() => store.solicitudAdicional && setActiveStep(15)}
                                disabled={!store.solicitudAdicional}
                            >
                                Solicitud adicional
                            </button>

                            {/* Resumen button */}
                            <button
                                className={`p-4 rounded-lg ${store.resumen ? (activeStep === 16 ? 'bg-profile text-white' : 'bg-gray-800 text-white') : 'bg-gray-800 text-gray-500 cursor-not-allowed'}`}
                                onClick={() => store.resumen && setActiveStep(16)}
                                disabled={!store.resumen}
                            >
                                Resumen
                            </button>
                        </div>

                        <p className="my-8 text-center">
                            * Para poder enviar o pagar la solicitud todos los campos deben estar llenos.
                        </p>
                        {activeStep >= 15 && (
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
                </div>
            </div>
        </HomeLayout>
    );

};

export default Fundacion;