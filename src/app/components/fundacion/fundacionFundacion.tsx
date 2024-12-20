"use client";
import React, { useState, useContext, useRef, useEffect } from 'react';
import Swal from 'sweetalert2';
import ClipLoader from 'react-spinners/ClipLoader';
import FundacionContext from '@context/fundacionContext'; // Cambiar al contexto de Fundación
import axios from 'axios';
import { useFetchSolicitud } from '@utils/fetchCurrentRequest'; 
import get from 'lodash/get';

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

    return (
        <div className="w-full h-full p-8 overflow-y-scroll scrollbar-thin bg-[#070707]">
            <h1 className="text-white text-4xl font-bold">
                Información de la Fundación de Interés Privado
                <span className="ml-2">
                    <i className="fa fa-info-circle"></i>
                </span>
            </h1>
            <p className="text-gray-300 mt-4">
                TRES POSIBLES NOMBRES DE LA MISMA. DEBE INCLUIR LA PALABRA “FUNDACIÓN” O “FOUNDATION” EN EL NOMBRE.
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
                    />
                    <input
                        ref={nombreFundacion2Ref}
                        type="text"
                        name="nombreFundacion2"
                        value={formData.nombreFundacion2}
                        onChange={handleChange}
                        className={`p-4 bg-gray-800 text-white rounded-lg ${errors.nombreFundacion2 ? 'border-2 border-red-500' : ''}`}
                        placeholder="Nombre Fundación (2)"
                    />
                    <input
                        ref={nombreFundacion3Ref}
                        type="text"
                        name="nombreFundacion3"
                        value={formData.nombreFundacion3}
                        onChange={handleChange}
                        className={`p-4 bg-gray-800 text-white rounded-lg ${errors.nombreFundacion3 ? 'border-2 border-red-500' : ''}`}
                        placeholder="Nombre Fundación (3)"
                    />
                </div>

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
            </form>
        </div>
    );
};

export default FundacionFundacion;
