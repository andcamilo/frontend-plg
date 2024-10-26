import React, { useState, useContext, useEffect } from 'react';
import AppStateContext from '@context/sociedadesContext';
import axios from 'axios';
import Swal from 'sweetalert2';  // Importar SweetAlert2 para las alertas

interface ModalAccionistasProps {
    isOpen: boolean;
    onClose: () => void;
}

const ModalAccionistas: React.FC<ModalAccionistasProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    const context = useContext(AppStateContext);
    if (!context) {
        throw new Error('AppStateContext must be used within an AppStateProvider');
    }

    const { store } = context;
    const solicitudId = store.solicitudId; // Obtenemos el `solicitudId` del contexto

    const [personas, setPersonas] = useState([]); // Estado para guardar las personas de la base de datos
    const [accionistasExistentes, setAccionistasExistentes] = useState([]); // Guardar los accionistas ya existentes
    const [isLoading, setIsLoading] = useState(false); // Estado de carga
    const [formData, setFormData] = useState({
        seleccionar: '', // Persona seleccionada
        porcentajeAcciones: '', // Campo para el porcentaje de acciones
    });

    // Función para obtener personas y accionistas actuales desde la base de datos
    const fetchPersonas = async () => {
        try {
            const response = await axios.get('/api/client', {
                params: {
                    solicitudId, // Pasamos el ID de la solicitud como filtro
                },
            });

            // Filtrar y guardar las personas que NO son accionistas
            const { personas } = response.data;

            // Guardar accionistas existentes para calcular el porcentaje de acciones
            const accionistas = personas.filter((persona: any) => persona.accionista);

            setPersonas(personas.filter((persona: any) =>
                persona.solicitudId === solicitudId && (!persona.accionista)
            ));
            

            // Guardar los accionistas actuales con su porcentaje de acciones
            setAccionistasExistentes(accionistas);
        } catch (error) {
            console.error('Error fetching personas:', error);
        }
    };

    useEffect(() => {
        // Llamada a la API cuando se abre el modal
        if (isOpen) {
            fetchPersonas();
        }
    }, [isOpen, solicitudId]);

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
        const { name, value } = e.target;

        // Actualizamos el estado con los valores del formulario
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const porcentajeAccionesNuevo = parseFloat(formData.porcentajeAcciones);

        if (!formData.seleccionar || isNaN(porcentajeAccionesNuevo)) {
            Swal.fire({
                position: "top-end",
                icon: "warning",
                title: "Por favor, selecciona una persona y el porcentaje de participación de acciones.",
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
            return;
        }

        // Calcular el porcentaje total de los accionistas existentes
        const totalPorcentajeExistente = accionistasExistentes.reduce((total, accionista: any) => {
            return total + parseFloat(accionista.accionista.porcentajeAcciones);
        }, 0);

        // Sumar el porcentaje del nuevo accionista
        const porcentajeTotalConNuevo = totalPorcentajeExistente + porcentajeAccionesNuevo;

        // Validar que el porcentaje total no exceda el 100%
        if (porcentajeTotalConNuevo > 100) {
            Swal.fire({
                position: "top-end",
                icon: "warning",
                title: `El porcentaje total de acciones no puede exceder el 100%.`,
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
            return;
        }

        setIsLoading(true); // Activar el estado de carga

        try {
            // Construimos el payload para enviar a la API
            const updatePayload = {
                solicitudId: store.solicitudId,
                accionista: {
                    personId: formData.seleccionar || null,
                    porcentajeAcciones: formData.porcentajeAcciones,
                },
            };

            // Enviar solicitud a la API para actualizar la persona seleccionada como accionista
            const response = await axios.patch('/api/update-personAccionista', updatePayload);

            if (response.status === 200) {
                console.log("Accionista actualizado");
                onClose(); // Cerrar el modal solo si la actualización es exitosa
            } else {
                throw new Error('Error al actualizar el accionista.');
            }
        } catch (error) {
            console.error('Error al actualizar el accionista:', error);
        } finally {
            setIsLoading(false); // Desactivar el estado de carga
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-gray-900 p-8 rounded-lg w-1/2 relative">
                <button className="text-white absolute top-2 right-4" onClick={onClose}>
                    X
                </button>

                <h2 className="text-white text-2xl font-bold mb-4">Accionistas</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="text-white block mb-2">Seleccionar</label>
                        <select
                            name="seleccionar"
                            value={formData.seleccionar}
                            onChange={handleChange}
                            className="w-full p-2 border border-gray-700 rounded bg-gray-800 text-white"
                        >
                            <option value="">Seleccione una persona</option>
                            {personas.map((persona: any) => (
                                <option key={persona.id} value={persona.id}>
                                    {persona.tipoPersona === 'Persona Jurídica'
                                        ? `${persona.personaJuridica.nombreJuridico} - ${persona.nombreApellido}`
                                        : persona.nombreApellido}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="mb-4">
                        <label className="text-white block mb-2">% de participación de Acciones</label>
                        <input
                            type="number"
                            name="porcentajeAcciones"
                            value={formData.porcentajeAcciones}
                            onChange={handleChange}
                            className="w-full p-2 border border-gray-700 rounded bg-gray-800 text-white"
                            placeholder="Ingrese el porcentaje de acciones"
                        />
                    </div>

                    <div className="flex justify-end space-x-4">
                        <button
                            className="bg-gray-500 text-white py-2 px-4 rounded-lg"
                            type="button"
                            onClick={onClose}
                        >
                            Cerrar
                        </button>
                        <button
                            className="bg-profile text-white py-2 px-4 rounded-lg inline-block"
                            type="submit"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Guardando...' : 'Guardar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ModalAccionistas;