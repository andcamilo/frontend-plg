"use client"
import React, { useEffect, useState, useContext } from 'react';
import HomeLayout from '@components/homeLayout';
import AppStateContext from '@context/actaSociedadFundacionContext';
import ActaBienvenido from '@/src/app/components/acta-sociedadFundacion/actaBienvenido';
import ActaSolicitud from '@/src/app/components/acta-sociedadFundacion/actaSolicitud';
import WidgetLoader from '@/src/app/components/widgetLoader';
import SaleComponent from '@/src/app/components/saleComponent';
import PaymentModal from '@/src/app/components/PaymentModal';
import RegisterPaymentForm from '@/src/app/components/RegisterPaymentForm';
import Cookies from 'js-cookie';
import { useRouter } from 'next/navigation';

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

    const context = useContext(AppStateContext);

    if (!context) {
        throw new Error('AppStateContext must be used within an AppStateProvider');
    }

    const { store } = context;

    useEffect(() => {
        setIsLoggedIn(!!Cookies.get('AuthToken'));
    }, []);

    useEffect(() => {
        if (store.currentPosition) {
            setActiveStep(store.currentPosition);
        }
    }, [store.currentPosition]);

    const renderActiveForm = () => {
        switch (activeStep) {
            case 1:
                return <ActaBienvenido />;
            case 2:
                return <ActaSolicitud />;
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

    const renderSidebar = () => (
        <div className="text-white">
            <h2 className="text-3xl mt-2 text-center font-bold mb-4">Cambios Sociedad / Fundacion</h2>
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
                    className={`w-full min-h-[50px] text-sm font-medium rounded-lg flex items-center justify-center text-white ${activeStep === 2 ? 'bg-profile' : 'bg-gray-800'}`}
                    onClick={() => handleStepChange(2, store.solicitud)}
                    disabled={!store.solicitud}
                >
                    Solicitud
                </button>

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

    const handleStepChange = (step: number, condition: boolean) => {
        if (condition) {
            setActiveStep(step);
            setIsMobileMenuOpen(false);
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