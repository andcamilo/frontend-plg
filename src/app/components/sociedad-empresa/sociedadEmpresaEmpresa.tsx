"use client";
import React, { useState, useContext, useRef, useEffect } from 'react';
import Swal from 'sweetalert2';
import ClipLoader from 'react-spinners/ClipLoader';
import AppStateContext from '@context/sociedadesContext';
import axios from 'axios';
import { useFetchSolicitud } from '@utils/fetchCurrentRequest';
import get from 'lodash/get';

const SociedadEmpresaEmpresa: React.FC = () => {
    const context = useContext(AppStateContext);

    if (!context) {
        throw new Error('AppStateContext must be used within an AppStateProvider');
    }

    const { store, setStore } = context;

    const [formData, setFormData] = useState({
        nombreSociedad1: '',
        nombreSociedad2: '',
        nombreSociedad3: '',
        cuenta: "",
    });

    const [errors, setErrors] = useState({
        nombreSociedad1: false,
        nombreSociedad2: false,
        nombreSociedad3: false,
    });

    const [isLoading, setIsLoading] = useState(false);

    const nombreSociedad1Ref = useRef<HTMLInputElement>(null);
    const nombreSociedad2Ref = useRef<HTMLInputElement>(null);
    const nombreSociedad3Ref = useRef<HTMLInputElement>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
        setErrors((prevErrors) => ({
            ...prevErrors,
            [name]: false // Resetea el error si el usuario empieza a escribir de nuevo
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
            const empresaData = get(store.request, 'empresa', {});
            if (empresaData && Object.keys(empresaData).length > 0) {
                setFormData((prevFormData) => ({
                    ...prevFormData,
                    ...empresaData,
                }));
            }
        }
    }, [store.request]);

    // Define las validaciones para cada campo
    const fieldValidations = [
        { field: "nombreSociedad1", ref: nombreSociedad1Ref, errorMessage: "Por favor, ingrese el nombre de la Sociedad (1)." },
        { field: "nombreSociedad2", ref: nombreSociedad2Ref, errorMessage: "Por favor, ingrese el nombre de la Sociedad (2)." },
        { field: "nombreSociedad3", ref: nombreSociedad3Ref, errorMessage: "Por favor, ingrese el nombre de la Sociedad (3)." },
    ];

    const validateFields = () => {
        for (const { field, ref, errorMessage } of fieldValidations) {
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

            if (field === 'nombreSociedad1' && formData.nombreSociedad1.length < 3) {
                setErrors((prevErrors) => ({ ...prevErrors, [field]: true }));

                Swal.fire({
                    position: "top-end",
                    icon: "warning",
                    title: "El nombre de la Sociedad (1) debe tener al menos 3 caracteres.",
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
                return false;
            }

            if (field === 'nombreSociedad2' && formData.nombreSociedad2.length < 3) {
                setErrors((prevErrors) => ({ ...prevErrors, [field]: true }));

                Swal.fire({
                    position: "top-end",
                    icon: "warning",
                    title: "El nombre de la Sociedad (2) debe tener al menos 3 caracteres.",
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
                return false;
            }

            if (field === 'nombreSociedad3' && formData.nombreSociedad3.length < 3) {
                setErrors((prevErrors) => ({ ...prevErrors, [field]: true }));

                Swal.fire({
                    position: "top-end",
                    icon: "warning",
                    title: "El nombre de la Sociedad (3) debe tener al menos 3 caracteres.",
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
                return false;
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
                solicitudId: store.solicitudId,
                empresa: {
                    nombreSociedad1: formData.nombreSociedad1,
                    nombreSociedad2: formData.nombreSociedad2,
                    nombreSociedad3: formData.nombreSociedad3,
                },
            };

            // Enviar los datos a la API para actualizar la solicitud
            const response = await axios.patch('/api/update-request-sociedad', updatePayload);

            if (response.status === 200) {
                setStore((prevState) => ({
                    ...prevState,
                    personas: true,
                    currentPosition: 4,
                }));

                Swal.fire({
                    position: "top-end",
                    icon: "success",
                    title: "Información de la empresa guardada correctamente.",
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

    return (
        <div className="w-full h-full p-8 overflow-y-scroll scrollbar-thin bg-[#070707]">
            <h1 className="text-white text-4xl font-bold">
                Información de la Sociedad / Empresa
                <span className="ml-2">
                    <i className="fa fa-info-circle"></i>
                </span>
            </h1>
            <p className="text-gray-300 mt-4">
                TRES POSIBLES NOMBRES DE LA MISMA. DEBE TERMINAR EN S.A O PUEDE TERMINAR EN INC, CORP.
            </p>

            <hr className="mt-4 text-gray-600" />

            <p className="text-gray-400 mt-4 text-sm">
                * Es posible que el nombre principal que elija esté tomado en el registro público, por lo que la asignación del nombre seguiría el orden que nos provea.
                <br />
                * Aquí dejamos espacio para tu creatividad, comparte tres opciones de nombre para la sociedad. Tomaremos el orden que nos indicas como prioridad. Esto es porque el nombre que puedes proporcionar, puede que ya esté tomado para otras sociedades. En caso de que los tres estén tomados, nos comunicaremos contigo para indicarte opciones alternas o que tú nos proporciones otras. Pueden terminar en Inc, Corp, o S.A. Si la terminación no se provee en el nombre por parte del cliente, incluiremos S.A.
            </p>

            <form className="mt-4" onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 gap-4">
                    <input
                        ref={nombreSociedad1Ref}
                        type="text"
                        name="nombreSociedad1"
                        value={formData.nombreSociedad1}
                        onChange={handleChange}
                        className={`p-4 bg-gray-800 text-white rounded-lg ${errors.nombreSociedad1 ? 'border-2 border-red-500' : ''}`}
                        placeholder="Nombre Sociedad (1)"
                        disabled={store.request.status >= 10 && store.rol < 20}
                    />
                    <input
                        ref={nombreSociedad2Ref}
                        type="text"
                        name="nombreSociedad2"
                        value={formData.nombreSociedad2}
                        onChange={handleChange}
                        className={`p-4 bg-gray-800 text-white rounded-lg ${errors.nombreSociedad2 ? 'border-2 border-red-500' : ''}`}
                        placeholder="Nombre Sociedad (2)"
                        disabled={store.request.status >= 10 && store.rol < 20}
                    />
                    <input
                        ref={nombreSociedad3Ref}
                        type="text"
                        name="nombreSociedad3"
                        value={formData.nombreSociedad3}
                        onChange={handleChange}
                        className={`p-4 bg-gray-800 text-white rounded-lg ${errors.nombreSociedad3 ? 'border-2 border-red-500' : ''}`}
                        placeholder="Nombre Sociedad (3)"
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

export default SociedadEmpresaEmpresa;
