"use client";
import React, { useState, useContext, useEffect } from 'react';
import ClipLoader from 'react-spinners/ClipLoader';
import AppStateContext from '@context/fundacionContext';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useFetchSolicitud } from '@utils/fetchCurrentRequest';
import get from 'lodash/get';
import '@fortawesome/fontawesome-free/css/all.css';

const IngresosFundacion: React.FC = () => {
    const context = useContext(AppStateContext);

    if (!context) {
        throw new Error('AppStateContext debe ser usado dentro de un AppStateProvider');
    }

    const { store, setStore } = context;

    // Inicializar el estado para los ingresos
    const [formData, setFormData] = useState({
        ingresos: [] as string[], // Aquí se almacenarán los ingresos seleccionados
        otroIngreso: '', // Para el campo "Otro"
    });

    const [mostrarOtro, setMostrarOtro] = useState(false); // Estado para controlar si mostrar el campo "Otro"
    const [isLoading, setIsLoading] = useState(false);

    // Manejar los cambios en los checkboxes de ingresos
    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value, checked } = e.target;
        setFormData((prevData) => {
            if (checked) {
                // Si el checkbox está seleccionado, agregar el ingreso
                return {
                    ...prevData,
                    ingresos: [...prevData.ingresos, value],
                };
            } else {
                // Si se deselecciona, remover el ingreso del array
                return {
                    ...prevData,
                    ingresos: prevData.ingresos.filter((item) => item !== value),
                };
            }
        });
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const { fetchSolicitud } = useFetchSolicitud(store.solicitudId);
    useEffect(() => {
        if (store.solicitudId) {
            fetchSolicitud();
        }
    }, [store.solicitudId]);

    useEffect(() => {
        if (store.request) {
            const ingresosData = get(store.request, 'ingresos', {}); // Acceder al campo "ingresos"
            const selectedIngresos = get(ingresosData, 'ingresos', []); // Extraer el arreglo de ingresos seleccionados

            // Si existen datos de ingresos en la solicitud, actualizar el formulario con estos valores
            if (ingresosData && Object.keys(ingresosData).length > 0) {
                setFormData((prevFormData) => ({
                    ...prevFormData,
                    ingresos: selectedIngresos, // Asignar los ingresos seleccionados
                    otroIngreso: ingresosData.otroIngreso || '', // Si existe, cargar el campo "otroIngreso"
                }));

                // Si el campo "otroIngreso" tiene un valor, mostrar el campo "Otro"
                if (ingresosData.otroIngreso) {
                    setMostrarOtro(true);
                }
            }
        }
    }, [store.request]);

    const [inputError, setInputError] = useState(false);

    // Validar que al menos un activo esté seleccionado
    const validateSelection = () => {
        const isAnySelected = formData.ingresos.length > 0;

        if (!isAnySelected) {
            Swal.fire({
                position: "top-end",
                icon: "warning",
                title: "Debe seleccionar al menos un ingreso",
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
                },
            });
            return false;
        }

        if (mostrarOtro && formData.otroIngreso.trim() === '') {
            Swal.fire({
                position: "top-end",
                icon: "warning",
                title: "Debe especificar el ingreso en la opción 'Otro'.",
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
                },
            });

            // Marcar el campo como erróneo
            setInputError(true);

            // Focalizar automáticamente en el campo
            setTimeout(() => {
                const otroIngresoInput = document.querySelector('input[name="otroIngreso"]') as HTMLInputElement;
                if (otroIngresoInput) {
                    otroIngresoInput.focus();
                }
            }, 100);

            return false;
        }


        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        // Validar que se haya seleccionado al menos un activo
        if (!validateSelection()) {
            setIsLoading(false);
            return;
        }

        try {
            const updatePayload = {
                solicitudId: store?.solicitudId,  // Asegúrate de que solicitudId exista
                ingresos: {
                    ingresos: formData.ingresos,
                    ...(mostrarOtro && { otroIngreso: formData.otroIngreso }), // Si se ha seleccionado "Otro", incluirlo
                },
            };

            const response = await axios.patch('/api/update-request-fundacion', updatePayload);

            if (response.status === 200) {
                setStore((prevState) => ({
                    ...prevState,
                    activos: true,
                    currentPosition: 14,
                }));
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
                timer: 2500,
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
                Fuentes de Ingresos
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
                            <h2 className="text-white text-xl">Fuentes de Ingresos</h2>
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
                                src="https://www.youtube.com/embed/WN8vlX9zw9Q"
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
                Aquí podrás agregar la información de la fuente de ingresos de la nueva Fundación de Interés Privado.
            </p>
            <hr />
            <form className="mt-4" onSubmit={handleSubmit}>
                <p className="text-gray-300 mb-2 texto_justificado">
                    Indique la fuente de ingresos de la cual se manejará la fundación:
                </p>
                <div className="flex flex-col space-y-4 mb-4">
                    {[
                        { label: 'Propiedad', value: 'propiedad' },
                        { label: 'Vehículo', value: 'vehiculo' },
                        { label: 'Inmuebles', value: 'inmuebles' },
                        { label: 'Cuentas Bancarias', value: 'cuentasBancarias' },
                        { label: 'Inversiones', value: 'inversiones' },
                    ].map((ingreso) => (
                        <label key={ingreso.value} className="flex items-center text-white">
                            <input
                                type="checkbox"
                                value={ingreso.value}
                                checked={formData.ingresos.includes(ingreso.value)} // Comprobar si está seleccionado
                                onChange={handleCheckboxChange} // Maneja los cambios en los checkboxes
                                className="mr-3"
                                disabled={store.request.status >= 10 && store.rol < 20}
                            />
                            {ingreso.label}
                        </label>
                    ))}

                    {/* Campo para ingresar otro activo */}
                    <label className="flex items-center text-white">
                        <input
                            type="checkbox"
                            name="mostrarOtro"
                            checked={mostrarOtro}
                            onChange={(e) => setMostrarOtro(e.target.checked)}
                            className="mr-3"
                            disabled={store.request.status >= 10 && store.rol < 20}
                        />
                        Otro
                    </label>

                    {mostrarOtro && (
                        <input
                            type="text"
                            name="otroIngreso"
                            value={formData.otroIngreso}
                            onChange={(e) => {
                                handleInputChange(e);
                                setInputError(e.target.value.trim() === '');
                            }}
                            className={`w-full p-4 bg-gray-800 text-white rounded-lg ${inputError ? 'border border-red-500' : ''}`}
                            placeholder="Especifique el ingreso"
                            disabled={store.request.status >= 10 && store.rol < 20}
                        />
                    )}
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
                                    currentPosition: 14,
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

export default IngresosFundacion;