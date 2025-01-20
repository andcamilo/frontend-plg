"use client";
import React, { useState, useContext, useRef, useEffect } from 'react';
import Swal from 'sweetalert2';
import ClipLoader from 'react-spinners/ClipLoader';
import AppStateContext from '@context/sociedadesContext';
import axios from 'axios';
import { useFetchSolicitud } from '@utils/fetchCurrentRequest';
import get from 'lodash/get';
import '@fortawesome/fontawesome-free/css/all.css';

const CapitalDivisionAcciones: React.FC = () => {
    const context = useContext(AppStateContext);

    if (!context) {
        throw new Error('AppStateContext must be used dentro de un AppStateProvider');
    }

    const { store, setStore } = context;

    const [formData, setFormData] = useState({
        capital: '',
        cantidadAcciones: '',
        accionesSinValorNominal: 'No', // Opción por defecto
        valorPorAccion: '',
    });

    const [errors, setErrors] = useState({
        capital: false,
        cantidadAcciones: false,
        valorPorAccion: false,
    });

    const [isLoading, setIsLoading] = useState(false);

    const capitalRef = useRef<HTMLInputElement>(null);
    const cantidadAccionesRef = useRef<HTMLInputElement>(null);
    const valorPorAccionRef = useRef<HTMLInputElement>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;

        setFormData((prevData) => {
            const newFormData = {
                ...prevData,
                [name]: value,
            };

            // Calcular automáticamente el valor por acción solo si "accionesSinValorNominal" es "No"
            if (name === 'capital' || name === 'cantidadAcciones' || name === 'accionesSinValorNominal') {
                const { capital, cantidadAcciones } = newFormData;

                if (newFormData.accionesSinValorNominal === 'No' && capital && cantidadAcciones) {
                    newFormData.valorPorAccion = (Number(capital) / Number(cantidadAcciones)).toFixed(2);
                } else if (newFormData.accionesSinValorNominal === 'Sí') {
                    newFormData.valorPorAccion = ''; // Limpiar el campo si se selecciona "Sí"
                }
            }

            return newFormData;
        });

        setErrors((prevErrors) => ({
            ...prevErrors,
            [name]: false, // Resetea el error si el usuario empieza a escribir de nuevo
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
            const capitalData = get(store.request, 'capital', {});
            if (capitalData && Object.keys(capitalData).length > 0) {
                setFormData((prevFormData) => ({
                    ...prevFormData,
                    ...capitalData,
                }));
            }
        }
    }, [store.request]);

    // Define las validaciones para cada campo
    const fieldValidations = [
        { field: "capital", ref: capitalRef, errorMessage: "Por favor, ingrese el capital social." },
        { field: "cantidadAcciones", ref: cantidadAccionesRef, errorMessage: "Por favor, ingrese la cantidad de acciones." },
        { field: "valorPorAccion", ref: valorPorAccionRef, errorMessage: "Por favor, ingrese el valor por acción.", conditional: formData.accionesSinValorNominal === 'Sí' },
    ];

    const validateFields = () => {
        for (const { field, ref, errorMessage, conditional } of fieldValidations) {
            // Si existe una condición, validar solo si es verdadera
            if (conditional !== undefined && !conditional) continue;

            // Verifica si el campo está vacío
            if (!formData[field]) {
                setErrors((prevErrors) => ({ ...prevErrors, [field]: true }));

                Swal.fire({
                    position: "top-end",
                    icon: "warning",
                    title: errorMessage,
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
                        timerProgressBar: 'custom-swal-timer-bar'
                    }
                });

                // Scroll al campo en error
                if (ref.current) {
                    ref.current.scrollIntoView({ behavior: "smooth", block: "center" });
                    ref.current.focus();
                }

                return false; // Detener la validación en el primer error
            }
        }

        // Si pasa todas las validaciones, devolver verdadero
        return true;
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
                capital: {
                    capital: formData.capital,
                    cantidadAcciones: formData.cantidadAcciones,
                    accionesSinValorNominal: formData.accionesSinValorNominal,
                    valorPorAccion: formData.valorPorAccion,
                },
            };

            // Enviar los datos a la API para actualizar la solicitud
            const response = await axios.patch('/api/update-sociedad-capital', updatePayload);

            if (response.status === 200) {
                setStore((prevState) => ({
                    ...prevState,
                    poder: true, // Marcar que la sección "accionistas" ya está lista
                    currentPosition: 9, // Avanzar al siguiente paso
                }));

                Swal.fire({
                    position: "top-end",
                    icon: "success",
                    title: "Capital y división de acciones guardado correctamente.",
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
                        timerProgressBar: 'custom-swal-timer-bar'
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
            <h1 className="text-white text-4xl font-bold flex items-center">
                Capital y división de Acciones
                <button
                    className="ml-2 flex items-center justify-center w-10 h-10 bg-white text-black rounded-md border border-gray-300"
                    type="button"
                    onClick={toggleModal}
                >
                    <span className="flex items-center justify-center w-7 h-7 bg-black text-white rounded-full">
                        <i className="fa-solid fa-info text-sm"></i>
                    </span>
                </button>
            </h1>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-gray-800 rounded-lg w-11/12 md:w-3/4 lg:w-1/2">
                        <div className="p-4 border-b border-gray-600 flex justify-between items-center">
                            <h2 className="text-white text-xl">Capital y división de Acciones</h2>
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
                                src="https://www.youtube.com/embed/0SQORn-hQz4"
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
                * Según la cantidad de accionistas, favor definir cuál sería el capital inicial de la sociedad y la división, por ejemplo:
                <br />
                &quot;CAPITAL SOCIAL DE US$10,000. DIVIDIDO EN DOS ACCIONES (Cantidad de Acciones) DE US$5,000.00 (Valor de Cada Acción)&quot;.
            </p>

            <form className="mt-4" onSubmit={handleSubmit}>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-white block mb-2">Capital social en dólares</label>
                        <input
                            ref={capitalRef}
                            type="number"
                            name="capital"
                            value={formData.capital}
                            onChange={handleChange}
                            className={`w-full p-4 bg-gray-800 text-white rounded-lg ${errors.capital ? 'border-2 border-red-500' : ''}`}
                            placeholder="Capital social en dólares"
                            disabled={store.request.status >= 10 && store.rol < 20}
                        />
                    </div>

                    <div>
                        <label className="text-white block mb-2">Cantidad de Acciones</label>
                        <input
                            ref={cantidadAccionesRef}
                            type="number"
                            name="cantidadAcciones"
                            value={formData.cantidadAcciones}
                            onChange={handleChange}
                            className={`w-full p-4 bg-gray-800 text-white rounded-lg ${errors.cantidadAcciones ? 'border-2 border-red-500' : ''}`}
                            placeholder="Cantidad de Acciones"
                            disabled={store.request.status >= 10 && store.rol < 20}
                        />
                    </div>

                    <div>
                        <label className="text-white block mb-2">Acciones sin Valor Nominal</label>
                        <select
                            name="accionesSinValorNominal"
                            value={formData.accionesSinValorNominal}
                            onChange={handleChange}
                            className="w-full p-4 bg-gray-800 text-white rounded-lg"
                        >
                            <option value="No">No</option>
                            <option value="Sí">Sí</option>
                        </select>
                        <small className="text-gray-400 texto_justificado">
                            * Significa que debe poner la cantidad de acciones pero no tendrán un valor asignado.
                        </small>
                    </div>

                    <div>
                        <label className="text-white block mb-2 texto_justificado">Valor de cada acción (debe totalizar el capital social)</label>
                        <input
                            ref={valorPorAccionRef}
                            type="number"
                            name="valorPorAccion"
                            value={formData.valorPorAccion}
                            onChange={handleChange}
                            className={`w-full p-4 bg-gray-800 text-white rounded-lg ${errors.valorPorAccion ? 'border-2 border-red-500' : ''}`}
                            placeholder="Valor de cada acción"
                            disabled={formData.accionesSinValorNominal === 'No'}
                        />
                    </div>
                </div>

                {(store.request.status < 10 || (store.request.status >= 10 && store.rol > 19)) && (
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
                                    currentPosition: 9,
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

export default CapitalDivisionAcciones;
