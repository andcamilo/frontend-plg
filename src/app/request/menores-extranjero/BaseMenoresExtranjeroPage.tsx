"use client"
import React, { useContext, useState } from 'react';
import MenoresAlExtranjero from '@components/menores-extranjero/menoresAlExtranjero';
import MenoresContext from '@context/menoresContext';
import HomeLayout from '@components/homeLayout';
import WidgetLoader from "@components/widgetLoader";
import SaleComponent from "@components/saleComponent";
import PaymentModal from "@/src/app/components/PaymentModal";
import { useRouter } from 'next/navigation';

const BaseMenoresExtranjeroPage: React.FC = () => {
    const menoresContext = useContext(MenoresContext);
    const router = useRouter();
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [isRegisterPaymentModalOpen, setIsRegisterPaymentModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [registerPaymentForm, setRegisterPaymentForm] = useState({
        factura: '',
        monto: '',
        fecha: '',
        correo: '',
    });

    if (!menoresContext) {
        throw new Error('ConsultaContext must be used within a ConsultaStateProvider');
    }
    const { store } = menoresContext;

    const handlePaymentClick = () => {
        setLoading(true);
        setIsPaymentModalOpen(true);
    };

    const handleClosePaymentModal = () => {
        setIsPaymentModalOpen(false);
        setLoading(false);
    };

    const handleRegisterPaymentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setRegisterPaymentForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleRegisterPaymentSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsRegisterPaymentModalOpen(false);
    };

    const handleSendAndPayLater = async () => {
        setLoading(true);
        // TODO: Implement logic for sending and paying later
        setLoading(false);
    };

    return (
        <HomeLayout>
            <div className="h-full flex items-center justify-center bg-gray-100">
                <MenoresAlExtranjero />

                {store.solicitudId && (
                    <>
                        <WidgetLoader />
                        {store.token && (
                            <SaleComponent saleAmount={0} />
                        )}
                    </>
                )}
                {/* Sidebar payment buttons, only if user is logged in */}
                {store.token && (
                    <div className="fixed right-0 top-0 h-full w-full md:w-[25%] p-8 flex flex-col justify-center items-center bg-gray-900 z-30">
                        <div className="flex flex-col gap-4 w-full">
                            <button
                                onClick={handlePaymentClick}
                                disabled={loading}
                                className="bg-profile hover:bg-profile disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 w-full"
                            >
                                {loading ? 'Cargando...' : 'Pagar en línea'}
                            </button>
                            <button
                                onClick={handleSendAndPayLater}
                                disabled={loading}
                                className="bg-profile hover:bg-profile disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 w-full"
                            >
                                {loading ? 'Procesando...' : 'Enviar y pagar más tarde'}
                            </button>
                            <button
                                onClick={() => setIsRegisterPaymentModalOpen(true)}
                                disabled={loading}
                                className="bg-profile hover:bg-profile disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 w-full"
                            >
                                Registrar Pago
                            </button>
                            <button
                                className="bg-gray-500 text-white w-full py-3 rounded-lg"
                                onClick={() => router.push('/home')}
                            >
                                Salir
                            </button>
                        </div>
                    </div>
                )}
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
                            <form onSubmit={handleRegisterPaymentSubmit} className="flex flex-col gap-4">
                                <input
                                    type="text"
                                    name="factura"
                                    value={registerPaymentForm.factura}
                                    onChange={handleRegisterPaymentChange}
                                    className="p-3 rounded bg-gray-800 text-white"
                                    placeholder="No Factura"
                                    required
                                />
                                <input
                                    type="number"
                                    name="monto"
                                    value={registerPaymentForm.monto}
                                    onChange={handleRegisterPaymentChange}
                                    className="p-3 rounded bg-gray-800 text-white"
                                    placeholder="Monto"
                                    required
                                />
                                <input
                                    type="date"
                                    name="fecha"
                                    value={registerPaymentForm.fecha}
                                    onChange={handleRegisterPaymentChange}
                                    className="p-3 rounded bg-gray-800 text-white"
                                    placeholder="Fecha de Pago"
                                    required
                                />
                                <input
                                    type="email"
                                    name="correo"
                                    value={registerPaymentForm.correo}
                                    onChange={handleRegisterPaymentChange}
                                    className="p-3 rounded bg-gray-800 text-white"
                                    placeholder="Correo Usuario"
                                    required
                                />
                                <button
                                    type="submit"
                                    className="bg-profile text-white py-3 rounded-lg font-semibold mt-2 hover:bg-profile/90 transition-colors"
                                >
                                    Registrar
                                </button>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </HomeLayout>
    );
};

export default BaseMenoresExtranjeroPage; 