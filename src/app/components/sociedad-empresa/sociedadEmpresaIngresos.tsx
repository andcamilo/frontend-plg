"use client";
import React, { useState, useContext, useEffect } from 'react';
import ClipLoader from 'react-spinners/ClipLoader';
import AppStateContext from '@context/sociedadesContext';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useFetchSolicitud } from '@utils/fetchCurrentRequest';
import get from 'lodash/get';

const FuentesDeIngresos: React.FC = () => {
    const context = useContext(AppStateContext);

    if (!context) {
        throw new Error('AppStateContext must be used dentro de un AppStateProvider');
    }

    const { store, setStore } = context;

    const [formData, setFormData] = useState({
        ingresoNegocios: false,
        herencia: false,
        ahorrosPersonales: false,
        ventaActivos: false,
        ingresoInmueble: false,
        otroFuente: '', // Para el campo de texto de "Otro"
    });

    const [mostrarOtro, setMostrarOtro] = useState(false); // Estado para controlar si mostrar el campo "Otro"
    const [isLoading, setIsLoading] = useState(false);

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = e.target;

        // Si el checkbox es "otro", controlamos mostrar el campo de texto
        if (name === 'mostrarOtro') {
            setMostrarOtro(checked);
            // Si se deselecciona el checkbox "Otro", vaciamos el campo "otroFuente"
            if (!checked) {
                setFormData((prevData) => ({
                    ...prevData,
                    otroFuente: '',
                }));
            }
        } else {
            setFormData((prevData) => ({
                ...prevData,
                [name]: checked,
            }));
        }
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
            const ingresosData = get(store.request, 'fuentesIngresos', {});

            // Actualizar el estado de formData con los valores obtenidos de la base de datos
            setFormData((prevFormData) => ({
                ...prevFormData,
                ingresoNegocios: ingresosData.ingresoNegocios || false,
                herencia: ingresosData.herencia || false,
                ahorrosPersonales: ingresosData.ahorrosPersonales || false,
                ventaActivos: ingresosData.ventaActivos || false,
                ingresoInmueble: ingresosData.ingresoInmueble || false,
                otroFuente: ingresosData.otro || '', // Asigna el valor de "otro" a otroFuente
            }));

            // Mostrar el campo "Otro" si tiene algún valor en la base de datos
            if (ingresosData.otro) {
                setMostrarOtro(true);
            }
        }
    }, [store.request]);

    const validateSelection = () => {
        // Verifica si se ha seleccionado al menos una fuente de ingreso
        const isAnySelected =
            formData.ingresoNegocios ||
            formData.herencia ||
            formData.ahorrosPersonales ||
            formData.ventaActivos ||
            formData.ingresoInmueble ||
            (mostrarOtro && formData.otroFuente.trim() !== '');

        if (!isAnySelected) {
            Swal.fire({
                position: "top-end",
                icon: "warning",
                title: "Debe seleccionar al menos una fuente de ingreso.",
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
        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        // Validar que se haya seleccionado al menos una fuente de ingreso
        if (!validateSelection()) {
            setIsLoading(false);
            return;
        }

        try {
            const updatePayload = {
                solicitudId: store.solicitudId,
                fuentesIngresos: {
                    ...formData,
                    otro: mostrarOtro ? formData.otroFuente : '',
                },
            };

            const response = await axios.patch('/api/update-sociedad-ingresos', updatePayload);

            if (response.status === 200) {
                setStore((prevState) => ({
                    ...prevState,
                    solicitudAdicional: true,
                    currentPosition: 12, // Avanzar al siguiente paso
                }));
            } else {
                throw new Error('Error al actualizar la solicitud.');
            }
        } catch (error) {
            console.error('Error updating request:', error);
            alert('Hubo un problema al actualizar la solicitud. Por favor, inténtelo de nuevo más tarde.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full h-full p-8 overflow-y-scroll scrollbar-thin bg-[#070707]">
            <h1 className="text-white text-4xl font-bold">
                Fuentes de Ingresos
                <span className="ml-2">
                    <i className="fa fa-info-circle"></i>
                </span>
            </h1>
            <p className="text-gray-300 mt-4">
                Aquí podrás agregar la información de la fuente de ingresos de la nueva sociedad / empresa.
            </p>
            <hr />
            <form className="mt-4" onSubmit={handleSubmit}>
                <p className="text-gray-300 mb-2">
                    Indique la fuente de ingresos de la cual se manejará la sociedad o sus activos:
                </p>
                <div className="flex flex-col space-y-4 mb-4">
                    <label className="flex items-center text-white">
                        <input
                            type="checkbox"
                            name="ingresoNegocios"
                            checked={formData.ingresoNegocios}
                            onChange={handleCheckboxChange}
                            className="mr-3"
                            disabled={store.request.status >= 10 && store.rol < 20}
                        />
                        Ingreso de Negocios
                    </label>
                    <label className="flex items-center text-white">
                        <input
                            type="checkbox"
                            name="herencia"
                            checked={formData.herencia}
                            onChange={handleCheckboxChange}
                            className="mr-3"
                            disabled={store.request.status >= 10 && store.rol < 20}
                        />
                        Herencia
                    </label>
                    <label className="flex items-center text-white">
                        <input
                            type="checkbox"
                            name="ahorrosPersonales"
                            checked={formData.ahorrosPersonales}
                            onChange={handleCheckboxChange}
                            className="mr-3"
                            disabled={store.request.status >= 10 && store.rol < 20}
                        />
                        Ahorros Personales
                    </label>
                    <label className="flex items-center text-white">
                        <input
                            type="checkbox"
                            name="ventaActivos"
                            checked={formData.ventaActivos}
                            onChange={handleCheckboxChange}
                            className="mr-3"
                            disabled={store.request.status >= 10 && store.rol < 20}
                        />
                        Venta de activos
                    </label>
                    <label className="flex items-center text-white">
                        <input
                            type="checkbox"
                            name="ingresoInmueble"
                            checked={formData.ingresoInmueble}
                            onChange={handleCheckboxChange}
                            className="mr-3"
                            disabled={store.request.status >= 10 && store.rol < 20}
                        />
                        Ingreso por alquiler de inmueble
                    </label>
                    <label className="flex items-center text-white">
                        <input
                            type="checkbox"
                            name="mostrarOtro"
                            checked={mostrarOtro}
                            onChange={handleCheckboxChange} // Maneja mostrar el campo "Otro"
                            className="mr-3"
                            disabled={store.request.status >= 10 && store.rol < 20}
                        />
                        Otro
                    </label>
                    {mostrarOtro && (
                        <input
                            type="text"
                            name="otroFuente"
                            value={formData.otroFuente}
                            onChange={handleInputChange} // Maneja el valor de "Otro" en el campo de texto
                            className="w-full p-4 bg-gray-800 text-white rounded-lg"
                            placeholder="Especifique la fuente de ingresos"
                            disabled={store.request.status >= 10 && store.rol < 20}
                        />
                    )}
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
                                    currentPosition: 12,
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

export default FuentesDeIngresos;

