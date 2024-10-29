import React, { useEffect, useState, useContext } from 'react';
import HomeLayout from '@components/homeLayout';
import AppStateContext from '@context/sociedadesContext'; // Import the context
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

const SociedadEmpresa: React.FC = () => {
    const [activeStep, setActiveStep] = useState<number>(1);

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
                                className={`p-4 rounded-lg ${activeStep === 1 ? 'bg-profile text-white' : 'bg-gray-800 text-gray-500'
                                    }`}
                                onClick={() => store.bienvenido && setActiveStep(1)}
                                disabled={!store.bienvenido}
                            >
                                ¡Bienvenido!
                            </button>

                            {/* Solicitante button */}
                            <button
                                className={`p-4 rounded-lg ${store.solicitante ? (activeStep === 2 ? 'bg-profile text-white' : 'bg-gray-800 text-white') : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                                    }`}
                                onClick={() => store.solicitante && setActiveStep(2)}
                                disabled={!store.solicitante}
                            >
                                Solicitante
                            </button>

                            {/* Empresa button */}
                            <button
                                className={`p-4 rounded-lg ${store.empresa ? (activeStep === 3 ? 'bg-profile text-white' : 'bg-gray-800 text-white') : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                                    }`}
                                onClick={() => store.empresa && setActiveStep(3)}
                                disabled={!store.empresa}
                            >
                                Empresa
                            </button>

                            {/* Personas button */}
                            <button
                                className={`p-4 rounded-lg ${store.personas ? (activeStep === 4 ? 'bg-profile text-white' : 'bg-gray-800 text-white') : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                                    }`}
                                onClick={() => store.personas && setActiveStep(4)}
                                disabled={!store.personas}
                            >
                                Personas
                            </button>

                            {/* Directores button */}
                            <button
                                className={`p-4 rounded-lg ${store.directores ? (activeStep === 5 ? 'bg-profile text-white' : 'bg-gray-800 text-white') : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                                    }`}
                                onClick={() => store.directores && setActiveStep(5)}
                                disabled={!store.directores}
                            >
                                Directores
                            </button>

                            {/* Dignatarios button */}
                            <button
                                className={`p-4 rounded-lg ${store.dignatarios ? (activeStep === 6 ? 'bg-profile text-white' : 'bg-gray-800 text-white') : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                                    }`}
                                onClick={() => store.dignatarios && setActiveStep(6)}
                                disabled={!store.dignatarios}
                            >
                                Dignatarios
                            </button>

                            {/* Accionistas button */}
                            <button
                                className={`p-4 rounded-lg ${store.accionistas ? (activeStep === 7 ? 'bg-profile text-white' : 'bg-gray-800 text-white') : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                                    }`}
                                onClick={() => store.accionistas && setActiveStep(7)}
                                disabled={!store.accionistas}
                            >
                                Accionistas
                            </button>

                            {/* Capital button */}
                            <button
                                className={`p-4 rounded-lg ${store.capital ? (activeStep === 8 ? 'bg-profile text-white' : 'bg-gray-800 text-white') : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                                    }`}
                                onClick={() => store.capital && setActiveStep(8)}
                                disabled={!store.capital}
                            >
                                Capital
                            </button>

                            {/* Poder button */}
                            <button
                                className={`p-4 rounded-lg ${store.poder ? (activeStep === 9 ? 'bg-profile text-white' : 'bg-gray-800 text-white') : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                                    }`}
                                onClick={() => store.poder && setActiveStep(9)}
                                disabled={!store.poder}
                            >
                                Poder
                            </button>

                            {/* Actividades button */}
                            <button
                                className={`p-4 rounded-lg ${store.actividades ? (activeStep === 10 ? 'bg-profile text-white' : 'bg-gray-800 text-white') : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                                    }`}
                                onClick={() => store.actividades && setActiveStep(10)}
                                disabled={!store.actividades}
                            >
                                Actividades
                            </button>

                            {/* Ingresos button */}
                            <button
                                className={`p-4 rounded-lg ${store.ingresos ? (activeStep === 11 ? 'bg-profile text-white' : 'bg-gray-800 text-white') : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                                    }`}
                                onClick={() => store.ingresos && setActiveStep(11)}
                                disabled={!store.ingresos}
                            >
                                Ingresos
                            </button>

                            {/* Solicitud adicional button */}
                            <button
                                className={`p-4 rounded-lg ${store.solicitudAdicional ? (activeStep === 12 ? 'bg-profile text-white' : 'bg-gray-800 text-white') : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                                    }`}
                                onClick={() => store.solicitudAdicional && setActiveStep(12)}
                                disabled={!store.solicitudAdicional}
                            >
                                Solicitud adicional
                            </button>

                            {/* Resumen button */}
                            <button
                                className={`p-4 rounded-lg ${store.resumen ? (activeStep === 13 ? 'bg-profile text-white' : 'bg-gray-800 text-white') : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                                    }`}
                                onClick={() => store.resumen && setActiveStep(13)}
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