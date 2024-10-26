import React, { useState, useContext, useRef } from 'react';
import ClipLoader from 'react-spinners/ClipLoader';
import AppStateContext from '@context/sociedadesContext';
import axios from 'axios';
import Swal from 'sweetalert2';  // Importar SweetAlert2

const SolicitudAdicional: React.FC = () => {
    const context = useContext(AppStateContext);

    if (!context) {
        throw new Error('AppStateContext debe ser utilizado dentro de un AppStateProvider');
    }

    const { store, setStore } = context;

    const [formData, setFormData] = useState({
        solicitudAdicional: '',
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setInputError] = useState(false); // Estado para marcar el campo en rojo si hay error

    const solicitudAdicionalRef = useRef<HTMLTextAreaElement>(null); 

    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));

        // Remover el color rojo cuando se empieza a escribir
        if (value.length >= 3) {
            setInputError(false);
        }
    };

    const validateField = () => {
        // Validar que solicitudAdicional tenga al menos 3 caracteres
        if (formData.solicitudAdicional.trim().length < 3) {
            setInputError(true);

            Swal.fire({
                position: "top-end",
                icon: "warning",
                title: "Por favor, especifique su solicitud",
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

            // Hacer foco en el campo con error
            if (solicitudAdicionalRef.current) {
                solicitudAdicionalRef.current.focus();
            }

            return false;
        }

        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        // Validar el campo antes de enviar el formulario
        if (!validateField()) {
            setIsLoading(false);
            return;
        }

        try {
            const updatePayload = {
                solicitudId: store.solicitudId,
                solicitudAdicional: formData.solicitudAdicional,
            };

            // Enviar los datos a la API
            const response = await axios.post('/api/update-solicitud-adicional', updatePayload);

            if (response.status === 200) {
                setStore((prevState) => ({
                    ...prevState,
                    resumen: true,
                    currentPosition: 13, 
                }));
            } else {
                throw new Error('Error al actualizar la solicitud.');
            }
        } catch (error) {
            console.error('Error al enviar la solicitud adicional:', error);
            alert('Hubo un problema al enviar la solicitud. Por favor, inténtelo de nuevo más tarde.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full h-full p-8 overflow-y-scroll scrollbar-thin bg-[#070707]">
            <h1 className="text-white text-4xl font-bold">
                Solicitud Adicional
                <span className="ml-2">
                    <i className="fa fa-info-circle"></i>
                </span>
            </h1>
            <p className="text-gray-300 mt-4">
                Si requiere algún otro proceso no incluido en esta solicitud, por favor detallar y nuestro equipo se contactará contigo en no más de 48 horas laborales.
            </p>
            <hr />
            <form className="mt-4" onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label className="text-white block mb-2">Solicitud adicional:</label>
                    <textarea
                        ref={solicitudAdicionalRef}  // Referencia al textarea
                        name="solicitudAdicional"
                        value={formData.solicitudAdicional}
                        onChange={handleInputChange}
                        className={`w-full p-4 bg-gray-800 text-white rounded-lg ${error ? 'border-2 border-red-500' : ''}`}
                        placeholder="Describe tu solicitud adicional"
                    />
                </div>

                <div className="mb-4">
                    <label className="text-white block mb-2">Adjuntar algún documento adicional que desee. *</label>
                    <input
                        type="file"
                        name="archivo"
                        onChange={handleInputChange}
                        className="w-full p-2 bg-gray-800 text-white rounded-lg"
                    />
                </div>

                <button
                    className="bg-gray-600 text-white w-full py-3 rounded-lg mt-6 hover:bg-pink-500"
                    type="submit"
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <div className="flex items-center justify-center">
                            <ClipLoader size={24} color="#ffffff" />
                            <span className="ml-2">Cargando...</span>
                        </div>
                    ) : (
                        'Guardar y Continuar'
                    )}
                </button>
            </form>
        </div>
    );
};

export default SolicitudAdicional;
