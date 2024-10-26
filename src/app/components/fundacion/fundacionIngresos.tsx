"use client";
import React, { useState, useContext } from 'react';
import ClipLoader from 'react-spinners/ClipLoader';
import AppStateContext from '@context/fundacionContext';
import axios from 'axios';
import Swal from 'sweetalert2';

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
                // Si el checkbox está seleccionado, agregar el activo
                return {
                    ...prevData,
                    ingresos: [...prevData.ingresos, value],
                };
            } else {
                // Si se deselecciona, remover el activo del array
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

    // Validar que al menos un activo esté seleccionado
    const validateSelection = () => {
        const isAnySelected = formData.ingresos.length > 0 || (mostrarOtro && formData.otroIngreso.trim() !== '');

        if (!isAnySelected) {
            Swal.fire({
                position: "top-end",
                icon: "warning",
                title: "Debe seleccionar al menos un activo.",
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

    return (
        <div className="w-full h-full p-8 overflow-y-scroll scrollbar-thin bg-[#070707]">
            <h1 className="text-white text-4xl font-bold">
                Fuentes de Ingresos
                <span className="ml-2">
                    <i className="fa fa-info-circle"></i>
                </span>
            </h1>
            <p className="text-gray-300 mt-4">
                Aquí podrás agregar la información de la fuente de ingresos de la nueva Fundación de Interés Privado.
            </p>
            <hr />
            <form className="mt-4" onSubmit={handleSubmit}>
                <p className="text-gray-300 mb-2">
                    Indique la fuente de ingresos de la cual se manejará la fundación:
                </p>
                <div className="flex flex-col space-y-4 mb-4">
                    {[ 
                        { label: 'Propiedad', value: 'propiedad' },
                        { label: 'Vehículo', value: 'vehiculo' },
                        { label: 'Inmuebles', value: 'inmuebles' },
                        { label: 'Cuentas Bancarias', value: 'cuentasBancarias' },
                        { label: 'Inversiones', value: 'inversiones' }
                    ].map((activo) => (
                        <label key={activo.value} className="flex items-center text-white">
                            <input
                                type="checkbox"
                                value={activo.value}
                                checked={formData.ingresos.includes(activo.value)}
                                onChange={handleCheckboxChange}
                                className="mr-3"
                            />
                            {activo.label}
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
                        />
                        Otro
                    </label>
                    {mostrarOtro && (
                        <input
                            type="text"
                            name="otroActivo"
                            value={formData.otroIngreso}
                            onChange={handleInputChange}
                            className="w-full p-4 bg-gray-800 text-white rounded-lg"
                            placeholder="Especifique el activo"
                        />
                    )}
                </div>

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
            </form>
        </div>
    );
};

export default IngresosFundacion;