"use client";
import React, { useState, useContext, useRef, useEffect } from 'react';
import Swal from 'sweetalert2';
import ClipLoader from 'react-spinners/ClipLoader';
import FundacionContext from '@context/fundacionContext'; // Cambiar al contexto de Fundación
import axios from 'axios';
import { useFetchSolicitud } from '@utils/fetchCurrentRequest';
import get from 'lodash/get';
import '@fortawesome/fontawesome-free/css/all.css';
import { FaPlay } from 'react-icons/fa';

const FundacionFundacion: React.FC = () => {
    const context = useContext(FundacionContext);

    if (!context) {
        throw new Error('FundacionContext must be used within a FundacionStateProvider');
    }

    const { store, setStore } = context;


    const [formData, setFormData] = useState({
        nombreFundacion1: '',
        nombreFundacion2: '',
        nombreFundacion3: '',
    });

    const [errors, setErrors] = useState({
        nombreFundacion1: false,
        nombreFundacion2: false,
        nombreFundacion3: false,
    });

    const [isLoading, setIsLoading] = useState(false);

    const nombreFundacion1Ref = useRef<HTMLInputElement>(null);
    const nombreFundacion2Ref = useRef<HTMLInputElement>(null);
    const nombreFundacion3Ref = useRef<HTMLInputElement>(null);

    const { fetchSolicitud } = useFetchSolicitud(store.solicitudId); // Función para obtener la solicitud

    // Actualiza los campos del formulario con la solicitud
    useEffect(() => {
        if (store.solicitudId) {
            fetchSolicitud(); // Llama a la API para obtener la solicitud
        }
    }, [store.solicitudId]);

    // Cuando se actualiza store.request, extrae los datos relevantes
    useEffect(() => {
        if (store.request) {
            const fundacionData = get(store.request, 'fundacion', {}); // Acceder al campo "fundacion"
            if (fundacionData && Object.keys(fundacionData).length > 0) {
                setFormData((prevFormData) => ({
                    ...prevFormData,
                    ...fundacionData,
                }));
            }
        }
    }, [store.request]);

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

    // Validación de campos
    const fieldValidations = [
        { field: "nombreFundacion1", ref: nombreFundacion1Ref, errorMessage: "Por favor, ingrese el nombre de la Fundación (1)." },
        { field: "nombreFundacion2", ref: nombreFundacion2Ref, errorMessage: "Por favor, ingrese el nombre de la Fundación (2)." },
        { field: "nombreFundacion3", ref: nombreFundacion3Ref, errorMessage: "Por favor, ingrese el nombre de la Fundación (3)." },
    ];

    const validateFields = () => {
        for (const { field, ref, errorMessage } of fieldValidations) {
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

                if (ref.current) {
                    ref.current.scrollIntoView({ behavior: "smooth", block: "center" });
                    ref.current.focus();
                }

                return false; // Detener la validación en el primer error
            }

            if (formData[field].length < 3) {
                setErrors((prevErrors) => ({ ...prevErrors, [field]: true }));

                Swal.fire({
                    position: "top-end",
                    icon: "warning",
                    title: `El nombre de la Fundación (${field.charAt(field.length - 1)}) debe tener al menos 3 caracteres.`,
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

                if (ref.current) {
                    ref.current.scrollIntoView({ behavior: "smooth", block: "center" });
                    ref.current.focus();
                }
                return false;
            }
        }

        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        if (!validateFields()) {
            setIsLoading(false);
            return;
        }

        try {
            const updatePayload = {
                solicitudId: store.solicitudId,
                fundacion: {
                    nombreFundacion1: formData.nombreFundacion1,
                    nombreFundacion2: formData.nombreFundacion2,
                    nombreFundacion3: formData.nombreFundacion3,
                },
            };

            const response = await axios.patch('/api/update-request-fundacion', updatePayload);

            if (response.status === 200) {
                setStore((prevState) => ({
                    ...prevState,
                    personas: true,
                    currentPosition: 4,
                }));

                Swal.fire({
                    position: "top-end",
                    icon: "success",
                    title: "Información de la fundación guardada correctamente.",
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
            <h1 className="text-white text-3xl font-bold flex items-center">
                Información de la Fundación de Interés Privado
                <div className="flex flex-col items-center">
                    <button
                        className="w-10 h-10 bg-white text-black rounded-md border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors"
                        type="button"
                        onClick={toggleModal}
                    >
                        <FaPlay className="text-sm" /> 
                    </button>
                    <span className="hidden md:inline text-white text-xs mt-1">Ver video</span>
                </div>
            </h1>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-gray-800 rounded-lg w-11/12 md:w-3/4 lg:w-1/2">
                        <div className="p-4 border-b border-gray-600 flex justify-between items-center">
                            <h2 className="text-white text-xl">Información del Solicitante</h2>
                            <button
                                className="text-white"
                                onClick={toggleModal} // Cierra el modal
                            >
                                <i className="fa-solid fa-times"></i>
                            </button>
                        </div>
                        <div className="p-4 text-white">
                            <h5 className="text-lg">Información</h5>
                            <p className="mt-2">
                                Descubre en este Clip cada detalle que te ayudará a entender el tipo de información que debes anexar en esta sección.
                                <br />
                                <br />
                                ¡No dudes en explorar nuestros videos!
                            </p>
                            <h5 className="text-lg mt-4">Video</h5>
                            <iframe
                                width="100%"
                                height="315"
                                src="https://www.youtube.com/embed/vClekJ4n0qo"
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
                TRES POSIBLES NOMBRES DE LA MISMA. DEBE INCLUIR LA PALABRA “FUNDACIÓN” O “FOUNDATION” EN EL NOMBRE.
            </p>
            <br></br>

            <p className="text-gray-300 mt-4 texto_justificado">
                * Es posible que el nombre principal que elija esté tomado en el registro público, por lo que
                la asignación del nombre seguiría el orden que nos provea.
            </p>
            <p className="text-gray-300 mt-4 texto_justificado">
                * Aquí dejamos espacio para tu creatividad, comparte tres opciones de nombre para la
                fundación. Tomaremos el orden que nos indicas como prioridad. Esto es porque el nombre que puedes proporcionar, puede que ya esté tomado
                para otras fundaciones. En caso de que los tres estén tomados, nos comunicaremos contigo para indicarte opciones alternas o que tú nos
                proporciones otras. Pueden terminar en Inc. Corp. o S.A. Si la terminación no se provee en el nombre por parte del cliente, incluiremos S.A.
            </p>

            <hr className="mt-4 text-gray-600" />

            <form className="mt-4" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 gap-4">
                    <input
                        ref={nombreFundacion1Ref}
                        type="text"
                        name="nombreFundacion1"
                        value={formData.nombreFundacion1}
                        onChange={handleChange}
                        className={`p-4 bg-gray-800 text-white rounded-lg ${errors.nombreFundacion1 ? 'border-2 border-red-500' : ''}`}
                        placeholder="Nombre Fundación (1)"
                        disabled={store.request.status >= 10 && store.rol < 20}
                    />
                    <input
                        ref={nombreFundacion2Ref}
                        type="text"
                        name="nombreFundacion2"
                        value={formData.nombreFundacion2}
                        onChange={handleChange}
                        className={`p-4 bg-gray-800 text-white rounded-lg ${errors.nombreFundacion2 ? 'border-2 border-red-500' : ''}`}
                        placeholder="Nombre Fundación (2)"
                        disabled={store.request.status >= 10 && store.rol < 20}
                    />
                    <input
                        ref={nombreFundacion3Ref}
                        type="text"
                        name="nombreFundacion3"
                        value={formData.nombreFundacion3}
                        onChange={handleChange}
                        className={`p-4 bg-gray-800 text-white rounded-lg ${errors.nombreFundacion3 ? 'border-2 border-red-500' : ''}`}
                        placeholder="Nombre Fundación (3)"
                        disabled={store.request.status >= 10 && store.rol < 20}
                    />
                </div>
                {(store.request.status < 10 || (store.request.status >= 10 && store.rol > 19)) && (
                    <>
                        <button
                            className="bg-gray-600 text-white w-full py-3 rounded-lg mt-4 hover:bg-gray-500"
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
                                    currentPosition: 4,
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

export default FundacionFundacion;
