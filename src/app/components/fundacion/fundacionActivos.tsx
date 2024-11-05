"use client";
import React, { useState, useContext, useRef, useEffect } from 'react';
import ClipLoader from 'react-spinners/ClipLoader';
import AppStateContext from '@context/fundacionContext';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useFetchSolicitud } from '@utils/fetchCurrentRequest';
import get from 'lodash/get';

const ActivosFundacion: React.FC = () => {
    const context = useContext(AppStateContext);

    if (!context) {
        throw new Error('AppStateContext debe ser usado dentro de un AppStateProvider');
    }

    const { store, setStore } = context;

    const [formData, setFormData] = useState({
        activos: [
            { nombre: '', ubicacion: '' }, // Activo 1
            { nombre: '', ubicacion: '' },
            { nombre: '', ubicacion: '' },
            { nombre: '', ubicacion: '' },
            { nombre: '', ubicacion: '' },
        ]
    });

    const [errors, setErrors] = useState({
        activos: [
            { nombre: false, ubicacion: false }, // Error en Activo 1
            { nombre: false, ubicacion: false },
            { nombre: false, ubicacion: false },
            { nombre: false, ubicacion: false },
            { nombre: false, ubicacion: false },
        ]
    });

    const [isLoading, setIsLoading] = useState(false);

    // Cambiar el tipo de formRefs a un array que maneje elementos HTMLInputElement o null
    const formRefs = useRef<(HTMLInputElement | null)[]>([]);

    const setRef = (el: HTMLInputElement | null, index: number, field: 'nombre' | 'ubicacion') => {
        // Multiplicamos por 2 porque el índice de `nombre` y `ubicacion` están relacionados
        formRefs.current[index * 2 + (field === 'ubicacion' ? 1 : 0)] = el;
    };

    // Manejador de cambio de los campos de activo
    const handleInputChange = (index: number, field: string, value: string) => {
        setFormData((prevData) => {
            const newActivos = [...prevData.activos];
            newActivos[index][field] = value;
            return { ...prevData, activos: newActivos };
        });

        // Limpiar el error cuando el usuario empieza a llenar
        setErrors((prevErrors) => {
            const newErrors = [...prevErrors.activos];
            newErrors[index][field] = false;
            return { activos: newErrors };
        });
    };

    const { fetchSolicitud } = useFetchSolicitud(store.solicitudId);
    useEffect(() => {
        if (store.solicitudId) {
            fetchSolicitud();
        }
    }, [store.solicitudId]);

    useEffect(() => {
        if (store.request) {
            const activosData = get(store.request, 'activos.activos', []);
    
            // Rellena hasta tener siempre 5 elementos en el array de activos
            const completosActivos = [...activosData];
            while (completosActivos.length < 5) {
                completosActivos.push({ nombre: '', ubicacion: '' });
            }
    
            // Asignar los valores de activos completados al formData
            setFormData((prevFormData) => ({
                ...prevFormData,
                activos: completosActivos
            }));
        }
    }, [store.request]);    

    // Validación de los campos
    const validateFields = () => {
        let isValid = true;
        const newErrors = [...errors.activos];

        // Validar que el primer activo y su ubicación sean obligatorios
        if (formData.activos[0].nombre.trim() === '') {
            newErrors[0].nombre = true;
            isValid = false;
            Swal.fire({
                position: "top-end",
                icon: "warning",
                title: "Debe ingresar el nombre del Activo 1.",
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

            // Hacer scroll hacia el campo con error y enfocarlo
            formRefs.current[0]?.scrollIntoView({ behavior: 'smooth' });
            formRefs.current[0]?.focus();
            setErrors({ activos: newErrors });
            return false;
        }

        if (formData.activos[0].ubicacion.trim() === '') {
            newErrors[0].ubicacion = true;
            isValid = false;
            Swal.fire({
                position: "top-end",
                icon: "warning",
                title: "Debe ingresar la ubicación del Activo 1.",
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

            // Hacer scroll hacia el campo con error y enfocarlo
            formRefs.current[1]?.scrollIntoView({ behavior: 'smooth' });
            formRefs.current[1]?.focus();
            setErrors({ activos: newErrors });
            return false;
        }

        // Validar los campos adicionales (opcional) si se ha ingresado un valor en alguno de ellos
        for (let i = 1; i < formData.activos.length; i++) {
            const activo = formData.activos[i];

            // Si un activo tiene nombre, debe tener ubicación (solo si se ha llenado uno de los dos)
            if (activo.nombre.trim() !== '' && activo.ubicacion.trim() === '') {
                newErrors[i].ubicacion = true;
                isValid = false;
                Swal.fire({
                    position: "top-end",
                    icon: "warning",
                    title: `Debe ingresar la ubicación del Activo ${i + 1}.`,
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

                formRefs.current[i * 2 + 1]?.scrollIntoView({ behavior: 'smooth' });
                formRefs.current[i * 2 + 1]?.focus();
                break;
            }

            // Si un activo tiene ubicación, debe tener nombre (solo si se ha llenado uno de los dos)
            if (activo.ubicacion.trim() !== '' && activo.nombre.trim() === '') {
                newErrors[i].nombre = true;
                isValid = false;
                Swal.fire({
                    position: "top-end",
                    icon: "warning",
                    title: `Debe ingresar el nombre del Activo ${i + 1}.`,
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

                formRefs.current[i * 2]?.scrollIntoView({ behavior: 'smooth' });
                formRefs.current[i * 2]?.focus();
                break;
            }
        }

        setErrors({ activos: newErrors });
        return isValid;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        // Validar los campos antes de enviar
        if (!validateFields()) {
            setIsLoading(false);
            return;
        }

        try {
            // Filtrar los activos para eliminar aquellos que no tienen nombre ni ubicación
            const activosFiltrados = formData.activos.filter(
                (activo) => activo.nombre.trim() !== '' && activo.ubicacion.trim() !== ''
            );

            const updatePayload = {
                solicitudId: store.solicitudId,
                activos: {
                    activos: activosFiltrados, // Solo enviar los activos con información
                }
            };

            // Enviar la solicitud a la API para actualizar los activos de la Fundación
            const response = await axios.patch('/api/update-request-fundacion', updatePayload);

            if (response.status === 200) {
                setStore((prevState) => ({
                    ...prevState,
                    solicitudAdicional: true,
                    currentPosition: 15,
                }));
                Swal.fire({
                    position: "top-end",
                    icon: "success",
                    title: "Activos guardados correctamente.",
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
            } else {
                throw new Error('Error al actualizar los activos.');
            }
        } catch (error) {
            console.error('Error al actualizar los activos:', error);
            Swal.fire({
                position: "top-end",
                icon: "error",
                title: "Hubo un problema al actualizar los activos. Por favor, inténtelo de nuevo más tarde.",
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
                Activos de la Fundación
                <span className="ml-2">
                    <i className="fa fa-info-circle"></i>
                </span>
            </h1>
            <p className="text-gray-300 mt-4">
                En esta sección, debes listar los activos que tendrá la Fundación y dónde están ubicados. Si aún no los tienes definidos, simplemente escribe &apos;No Aplica&apos; en el primer campo y podrás continuar.
            </p>


            <form className="mt-4" onSubmit={handleSubmit}>
                {formData.activos.map((activo, index) => (
                    <div key={index} className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="text-white block mb-2">Nombre del Activo ({index + 1})</label>
                            <input
                                type="text"
                                value={activo.nombre}
                                onChange={(e) => handleInputChange(index, 'nombre', e.target.value)}
                                className={`w-full p-4 bg-gray-800 text-white rounded-lg ${errors.activos[index].nombre ? 'border-2 border-red-500' : ''}`}
                                placeholder="Ingrese el nombre del activo"
                                ref={(el) => setRef(el, index, 'nombre')} // Usando setRef para manejar la referencia
                            />

                        </div>
                        <div>
                            <label className="text-white block mb-2">Ubicación del Activo ({index + 1})</label>
                            <input
                                type="text"
                                value={activo.ubicacion}
                                onChange={(e) => handleInputChange(index, 'ubicacion', e.target.value)}
                                className={`w-full p-4 bg-gray-800 text-white rounded-lg ${errors.activos[index].ubicacion ? 'border-2 border-red-500' : ''}`}
                                placeholder="Ingrese la ubicación del activo"
                                ref={(el) => setRef(el, index, 'ubicacion')}
                            />

                        </div>
                    </div>
                ))}

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

export default ActivosFundacion;
