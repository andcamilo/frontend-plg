"use client";
import React, { useState, useContext, useRef, useEffect } from 'react';
import Swal from 'sweetalert2';
import ClipLoader from 'react-spinners/ClipLoader';
import AppStateContext from '@context/fundacionContext'; // Cambiar el contexto a fundaciones
import axios from 'axios';
import { useFetchSolicitud } from '@utils/fetchCurrentRequest';
import get from 'lodash/get';
import '@fortawesome/fontawesome-free/css/all.css';

const PatrimonioInicialFundacion: React.FC = () => {
    const context = useContext(AppStateContext);

    if (!context) {
        throw new Error('AppStateContext must be used dentro de un AppStateProvider');
    }

    const { store, setStore } = context;

    const [formData, setFormData] = useState({
        patrimonioInicial: '',
    });

    const [errors, setErrors] = useState({
        patrimonioInicial: false,
    });

    const [isLoading, setIsLoading] = useState(false);
    const patrimonioRef = useRef<HTMLInputElement>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));

        setErrors((prevErrors) => ({
            ...prevErrors,
            [name]: false, // Resetea el error si el usuario empieza a escribir de nuevo
        }));
    };

    const { fetchSolicitud } = useFetchSolicitud(store.solicitudId);
    useEffect(() => {
        if (store.solicitudId) {
            fetchSolicitud(); // Llama a la API para obtener la solicitud
        }
    }, [store.solicitudId]);

    useEffect(() => {
        if (store.request) {
            const patrimonioInicial = get(store.request, 'patrimonio', '');

            // Actualizar el formData con los campos de la raíz y "fundacion"
            setFormData((prevFormData) => ({
                ...prevFormData,
                patrimonioInicial,
            }));
        }
    }, [store.request]);

    const validateFields = () => {
        const patrimonioValue = parseFloat(formData.patrimonioInicial);

        // Verifica si el campo está vacío o es menor a 10,000.00 USD
        if (!formData.patrimonioInicial || patrimonioValue < 10000) {
            setErrors((prevErrors) => ({ ...prevErrors, patrimonioInicial: true }));

            Swal.fire({
                position: "top-end",
                icon: "warning",
                title: patrimonioValue < 10000
                    ? "El patrimonio inicial debe ser de al menos $10,000.00."
                    : "Por favor, ingrese el patrimonio inicial.",
                showConfirmButton: false,
                timer: 2500,
                timerProgressBar: true,
                toast: true,
                background: '#2c2c3e',
                color: '#fff',
                customClass: {
                    popup: 'custom-swal-popup',
                    title: 'custom-swal-title',
                    icon: 'custom-swal-icon',
                    timerProgressBar: 'custom-swal-timer-bar',
                }
            });

            // Scroll al campo en error
            if (patrimonioRef.current) {
                patrimonioRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
                patrimonioRef.current.focus();
            }

            return false; // Detener la validación en el primer error
        }

        return true; // Si pasa todas las validaciones, devolver verdadero
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        setIsLoading(true);

        // Validar campos
        if (!validateFields()) {
            setIsLoading(false);
            return;
        }

        try {
            // Crear el payload para enviar a la API
            const updatePayload = {
                solicitudId: store.solicitudId, // Identificador de la solicitud desde el contexto
                patrimonio: formData.patrimonioInicial, // Enviar el patrimonio inicial
            };

            // Enviar los datos a la API para actualizar la solicitud
            const response = await axios.patch('/api/update-request-fundacion', updatePayload);

            if (response.status === 200) {
                setStore((prevState) => ({
                    ...prevState,
                    poder: true,
                    currentPosition: 11,
                }));

                Swal.fire({
                    position: "top-end",
                    icon: "success",
                    title: "Patrimonio inicial guardado correctamente.",
                    showConfirmButton: false,
                    timer: 2500,
                    timerProgressBar: true,
                    toast: true,
                    background: '#2c2c3e',
                    color: '#fff',
                    customClass: {
                        popup: 'custom-swal-popup',
                        title: 'custom-swal-title',
                        icon: 'custom-swal-icon',
                        timerProgressBar: 'custom-swal-timer-bar',
                    }
                });
            } else {
                throw new Error('Error al actualizar la solicitud.');
            }
        } catch (error) {
            console.error('Error updating request:', error);
            Swal.fire({
                position: "top-end",
                icon: "error",
                title: "Hubo un problema al actualizar la solicitud. Por favor, inténtelo de nuevo más tarde.",
                showConfirmButton: false,
                timer: 2500
            });
        } finally {
            setIsLoading(false);
        }
    };

    const [showModal, setShowModal] = useState(false); // Estado para manejar el modal

    const toggleModal = () => {
        setShowModal(!showModal); // Alterna el estado del modal
    };

    return (
        <div className="w-full h-full p-8 overflow-y-scroll scrollbar-thin bg-[#070707]">
            <h1 className="text-white text-3xl font-bold flex items-center">
                Patrimonio inicial
                <div className="flex flex-col items-center">
                    <button
                        className="w-10 h-10 bg-white text-black rounded-md border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors"
                        type="button"
                        onClick={toggleModal}
                    >
                        <i className="fa-solid fa-play text-lg"></i> 
                    </button>
                    <span className="hidden md:inline text-white text-xs mt-1">Ver video</span>
                </div>
            </h1>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-gray-800 rounded-lg w-11/12 md:w-3/4 lg:w-1/2">
                        <div className="p-4 border-b border-gray-600 flex justify-between items-center">
                            <h2 className="text-white text-xl">Patrimonio inicial</h2>
                            <button
                                className="text-white"
                                onClick={toggleModal} // Cierra el modal
                            >
                                <i className="fa-solid fa-times"></i>
                            </button>
                        </div>
                        <div className="p-4 text-white">
                            <h5 className="text-lg">Información</h5>
                            <p className="mt-2 texto_justificado">
                                Descubre en este Clip cada detalle que te ayudará a entender el tipo de información que debes anexar en esta sección.
                                <br />
                                <br />
                                ¡No dudes en explorar nuestros videos!
                            </p>
                            <h5 className="text-lg mt-4">Video</h5>
                            <iframe
                                width="100%"
                                height="315"
                                src="https://www.youtube.com/embed/9RKrSbBxrMs"
                                title="YouTube video player"
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                allowFullScreen
                            ></iframe>
                        </div>
                        <div className="p-4 border-t border-gray-600 text-right">
                            <button
                                className="bg-red-600 text-white px-4 py-2 rounded-md"
                                onClick={toggleModal} // Cierra el modal
                            >
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            )}
            <p className="text-gray-300 mt-4 texto_justificado">
                * Será obligatorio que coloque un mínimo de diez mil dólares ($10,000.00), una suma inferior a esta no será permitida.
            </p>

            <form className="mt-4" onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label className="text-white block mb-2">Patrimonio inicial</label>
                    <input
                        ref={patrimonioRef}
                        type="number"
                        name="patrimonioInicial"
                        value={formData.patrimonioInicial}
                        onChange={handleChange}
                        className={`w-full p-4 bg-gray-800 text-white rounded-lg ${errors.patrimonioInicial ? 'border-2 border-red-500' : ''}`}
                        placeholder="Patrimonio inicial en dólares"
                        disabled={store.request.status >= 10 && store.rol < 20}
                    />
                </div>



                {(store.request.status < 10 || (store.request.status >= 10 && store.rol > 20)) && (
                    <>
                        <button
                            className="bg-gray-600 text-white w-full py-3 rounded-lg mt-6 hover:bg-gray-500"
                            type="submit"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <div className="flex items-center justify-center">
                                    <ClipLoader size={24} color="#ffffff" />
                                    <span className="ml-2">Cargando...</span>
                                </div>
                            ) : (
                                'Guardar y continuar'
                            )}
                        </button>
                    </>
                )}

                {store.request.status >= 10 && (
                    <>
                        <button
                            className="bg-profile text-white w-full py-3 rounded-lg mt-6"
                            type="button"
                            onClick={() => {
                                setStore((prevState) => ({
                                    ...prevState,
                                    currentPosition: 11,
                                }));
                            }}
                        >
                            Continuar
                        </button>
                    </>
                )}
            </form>
        </div>
    );
};

export default PatrimonioInicialFundacion;
