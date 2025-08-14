"use client"
import React, { useEffect, useState, useContext } from 'react';
import HomeLayout from '@components/homeLayout';
import AppStateContext from '@context/actaSociedadFundacionContext';
import ActaBienvenido from '@/src/app/components/acta-sociedadFundacion/actaBienvenido';
import ActaSolicitud from '@/src/app/components/acta-sociedadFundacion/actaSolicitud';
import ActaAgenteResidente from "@/src/app/components/acta-sociedadFundacion/actaAgenteResidente";
import ActaJuntaDirectiva from "@/src/app/components/acta-sociedadFundacion/actaJuntaDirectiva";
import ActaCambioDeNombre from "@/src/app/components/acta-sociedadFundacion/actaCambioDeNombre";
import ActaDisolucion from "@/src/app/components/acta-sociedadFundacion/actaDisolucion";
import ActaPoderGeneral from "@/src/app/components/acta-sociedadFundacion/actaPoderGeneral";
import ActaRenunciaDirectoresDignatarios from "@/src/app/components/acta-sociedadFundacion/actaRenunciaDirectoresDignatarios";
import ActaPactoSocial from "@/src/app/components/acta-sociedadFundacion/actaPactoSocial";
import ActaConsejoFundacional from "@/src/app/components/acta-sociedadFundacion/actaConsejoFundacional";
import ActaPatrimonioCapital from "@/src/app/components/acta-sociedadFundacion/actaCambioPatrimonioCapital";
import ActaSociosSociedadCivil from "@/src/app/components/acta-sociedadFundacion/actaSociosSociedadCivil";
import ActaRemocionMiembrosSociedadCivil from "@/src/app/components/acta-sociedadFundacion/actaRemocionMiembrosSociedadCivil";
import WidgetLoader from '@/src/app/components/widgetLoader';
import SaleComponent from '@/src/app/components/saleComponent';
import PaymentModal from '@/src/app/components/PaymentModal';
import RegisterPaymentForm from '@/src/app/components/RegisterPaymentForm';
import Cookies from 'js-cookie';
import axios from "axios";
import { useRouter, usePathname, useParams } from 'next/navigation';
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { initializeApp, getApps, getApp } from "firebase/app";
import {
    firebaseApiKey,
    firebaseAuthDomain,
    firebaseProjectId,
    firebaseStorageBucket,
    firebaseMessagingSenderId,
    firebaseAppId,
} from "@utils/env";

const firebaseConfig = {
    apiKey: firebaseApiKey,
    authDomain: firebaseAuthDomain,
    projectId: firebaseProjectId,
    storageBucket: firebaseStorageBucket,
    messagingSenderId: firebaseMessagingSenderId,
    appId: firebaseAppId,
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore();

const CAMBIOS_COMPONENTES = {
    "Cambio de Agente Residente": { label: "Agente Residente", componente: 3 },
    "Cambio de Junta Directiva y/o Dignatarios": { label: "Junta Directiva", componente: 4 },
    "Cambio de Consejo Fundacional y/o Dignatarios": { label: "Consejo Fundacional", componente: 5 },
    "Cambio de nombre de la Sociedad/Fundación": { label: "Nombre de la Entidad", componente: 6 },
    /* "Cambio de objeto de la sociedad": { label: "Objeto de la Sociedad", componente: 8 }, */
    "Asignación de Poder General": { label: "Poder General", componente: 8 },
    "Renuncia de Directores y/o Dignatarios": { label: "Renuncia de Cargos", componente: 9 },
    "Renuncia de Miembros de la Fundación y/o Dignatarios": { label: "Renuncia de Cargos", componente: 9 },
    "Cambio de cláusulas del pacto social": { label: "Pacto Social", componente: 10 }, 
    "Cambio de cláusulas del Acta Fundacional": { label: "Acta Fundacional", componente: 10 }, 
    "Aumento y disminución del Patrimonio Fundacional": { label: "Patrimonio Fundacional", componente: 11 },
    "Disolución": { label: "Disolución", componente: 12 },
    "Adición de socios sociedad Civil": { label: "Socios de la Sociedad", componente: 13 },
    "Remoción de socios Sociedad Civil": { label: "Remoción de Socios", componente: 14 },
};

const ActaSociedadFundacionBase: React.FC = () => {
    const [activeStep, setActiveStep] = useState<number>(1);
    const [showPaymentWidget, setShowPaymentWidget] = useState<boolean>(false);
    const [showPaymentButtons, setShowPaymentButtons] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState<boolean>(false);
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
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const router = useRouter();
    const pathname = usePathname();
    const params = useParams();
    const routeId = (params as any)?.id as string | undefined;
    const solicitudId = pathname?.split('/').filter(Boolean).pop();
    const [cambiosSeleccionados, setCambiosSeleccionados] = useState<string[]>([]);

    const context = useContext(AppStateContext);

    if (!context) {
        throw new Error('AppStateContext must be used within an AppStateProvider');
    }

    const { store, setStore } = context;

    useEffect(() => {
        setIsLoggedIn(!!Cookies.get('AuthToken'));
    }, []);

    // Ensure the store contains the solicitudId from the route for payment flow
    useEffect(() => {
        const idFromPath = routeId || pathname?.split('/').filter(Boolean).pop();
        if (idFromPath) {
            setStore(prev => ({ ...prev, solicitudId: idFromPath }));
        }
    }, [routeId, pathname, setStore]);

    useEffect(() => {
        if (store.currentPosition) {
            setActiveStep(store.currentPosition);
        }
    }, [store.currentPosition]);

    useEffect(() => {
        const cargarCambiosSeleccionados = async () => {
            try {
                const finalSolicitudId = store.solicitudId || pathname?.split("/").filter(Boolean).pop();
                if (!finalSolicitudId) return;

                const response = await axios.get('/api/get-request-id', {
                    params: { solicitudId: finalSolicitudId },
                });

                const data = response.data;

                if (Array.isArray(data.cambiosSeleccionados)) {
                    setCambiosSeleccionados(data.cambiosSeleccionados);
                } else {
                    setCambiosSeleccionados([]);
                    console.warn("El campo cambiosSeleccionados no es un arreglo.");
                }

                setStore(prev => ({
                    ...prev,
                    solicitudId: finalSolicitudId,
                    solicitud: true,
                }));

            } catch (error: any) {
                console.error("Error al obtener solicitud desde la API:", error);
            }
        };

        if (pathname) {
            cargarCambiosSeleccionados();
        }
    }, [pathname, setStore, store.solicitudId]);

    const renderActiveForm = () => {
        switch (activeStep) {
            case 1:
                return <ActaBienvenido />;
            case 2:
                return <ActaSolicitud />;
            case 3:
                return <ActaAgenteResidente />;
            case 4:
                return <ActaJuntaDirectiva />;
            case 5:
                return <ActaConsejoFundacional />;
            case 6:
                return <ActaCambioDeNombre />;
            case 8:
                return <ActaPoderGeneral />;
            case 9:
                return <ActaRenunciaDirectoresDignatarios />; 
            case 10:
                return <ActaPactoSocial />;
            case 11:
                return <ActaPatrimonioCapital />;
            case 12:
                return <ActaDisolucion />;
            case 13:
                return <ActaSociosSociedadCivil />;
            case 14:
                return <ActaRemocionMiembrosSociedadCivil />;
            default:
                return <ActaBienvenido />;
        }
    };

    const handlePaymentClick = () => {
        setLoading(true);
        setIsPaymentModalOpen(true);
        setShowPaymentButtons(false);
    };

    const handleClosePaymentModal = () => {
        setIsPaymentModalOpen(false);
        setLoading(false);
        if (!store.token) {
            setShowPaymentButtons(true);
        }
    };

    const handleSendAndPayLater = async () => {
        setLoading(true);
        try {
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
                    router.push('/login');
                }
            }
        } catch (error) {
            console.error('Error updating solicitud status:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRegisterPaymentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setRegisterPaymentForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleRegisterPaymentSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // TODO: handle submit logic
        setIsRegisterPaymentModalOpen(false);
    };

    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleStepChange = (step: number) => {
        setActiveStep(step);
        setIsMobileMenuOpen(false);
    };

    const renderSidebar = () => (
        <div className="text-white">
            <h2 className="text-3xl mt-2 text-center font-bold mb-4">Cambios Sociedad / Fundacion</h2>
            <p className="mb-8 text-center">Complete cada uno de los siguientes apartados:</p>
            <div className="grid grid-cols-3 gap-4 gap-y-4">

                <button
                    className={`w-full min-h-[50px] text-sm font-medium rounded-lg flex items-center justify-center text-white ${activeStep === 1 ? 'bg-profile' : 'bg-gray-800'}`}
                    onClick={() => handleStepChange(1)}
                >
                    ¡Bienvenido!
                </button>

                <button
                    className={`w-full min-h-[50px] text-sm font-medium rounded-lg flex items-center justify-center text-white ${activeStep === 2 ? 'bg-profile' : 'bg-gray-800'}`}
                    onClick={() => handleStepChange(2)}
                >
                    Solicitud
                </button>

                {cambiosSeleccionados.map((cambio, index) => {
                    const config = CAMBIOS_COMPONENTES[cambio];
                    if (!config) return null;

                    return (
                        <button
                            key={index}
                            className={`w-full min-h-[50px] text-sm font-medium rounded-lg flex items-center justify-center text-white ${activeStep === config.componente ? 'bg-profile' : 'bg-gray-800'
                                }`}
                            onClick={() => handleStepChange(config.componente)}
                        >
                            {config.label}
                        </button>
                    );
                })}

            </div>

            <p className="my-8 text-center">
                * Para poder enviar o pagar la solicitud todos los campos deben estar llenos.
            </p>

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
                        {/* <RegisterPaymentForm
                            onClose={() => setIsRegisterPaymentModalOpen(false)}
                        /> */}
                    </div>
                </div>
            )}
        </HomeLayout>
    );
};

export default ActaSociedadFundacionBase; 