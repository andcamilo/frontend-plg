import React, { useState, useContext, useEffect } from 'react';
import AppStateContext from '@context/sociedadesContext';
import axios from 'axios';
import Swal from 'sweetalert2';

interface ModalDirectoresProps {
    onClose: () => void;
}

const ModalDirectores: React.FC<ModalDirectoresProps> = ({ onClose }) => {

    const context = useContext(AppStateContext);
    if (!context) {
        throw new Error('AppStateContext must be used within an AppStateProvider');
    }

    const { store } = context;
    const solicitudId = store.solicitudId; // Obtenemos el `solicitudId` del contexto

    const [personas, setPersonas] = useState([]); // Estado para guardar las personas de la base de datos
    const [isLoading, setIsLoading] = useState(false); // Estado de carga
    const [formData, setFormData] = useState({
        servicio: 'Director Propio', // Valor por defecto
        seleccionar: '', // Campo vacío por defecto
    });

    // Función para obtener personas desde la base de datos
    const fetchPersonas = async () => {
        try {
            const response = await axios.get(`/api/get-people-id`, {
                params: { solicitudId }
            });

            const personas = response.data || [];
            
            // Extraer los id_persona de los directores actuales
            const idsDirectores = new Set(store.request.directores.map((d: any) => d.id_persona));

            const personasFiltradas = personas.filter((persona: any) =>
                (persona.solicitudId === solicitudId || persona.id_solicitud === solicitudId) &&
                !persona.director &&
                !idsDirectores.has(persona.id) // Excluir si está en dignatariosActuales
            );

            setPersonas(personasFiltradas);
        } catch (error) {
            console.error('Error fetching personas:', error);
        }
    };

    useEffect(() => {
        fetchPersonas();
    }, [solicitudId]);

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.servicio === 'Director Propio' && !formData.seleccionar) {
            Swal.fire({
                position: "top-end",
                icon: "warning",
                title: "Por favor, selecciona una persona.",
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
        let personId = formData.seleccionar || null;

        // Generar un nuevo `personId` si el servicio es "Dignatario Nominal" y no existe `personId`
        if (formData.servicio === 'Director Nominal' && !personId) {
            personId = crypto.randomUUID(); // Generar un UUID seguro y único
        }

        try {
            let updatePayload;

            if (formData.servicio === 'Director Nominal') {
                updatePayload = {
                    solicitudId: store.solicitudId,
                    directores: {
                        personId: personId,
                        servicio: formData.servicio,
                    },
                };
            } else {
                updatePayload = {
                    solicitudId: store.solicitudId,
                    directores: {
                        personId: formData.seleccionar,
                        servicio: formData.servicio,
                        esDirector: true,
                    },
                };
            }

            const response = await axios.patch('/api/update-person', updatePayload);

            if (response.status === 200) {
                Swal.fire({
                    position: "top-end",
                    icon: "success",
                    title: "Director asignado correctamente.",
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
                onClose(); // Cerrar el modal solo si la actualización es exitosa
            } else {
                throw new Error('Error al actualizar el director.');
            }
        } catch (error) {
            Swal.fire({
                position: "top-end",
                icon: "error",
                title: "Error al asignar al director.",
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

                <h2 className="text-white text-2xl font-bold mb-4">Directores</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="text-white block mb-2">Servicio</label>
                        <select
                            name="servicio"
                            value={formData.servicio}
                            onChange={handleChange}
                            className="w-full p-2 border border-gray-700 rounded bg-gray-800 text-white"
                        >
                            <option value="Director Propio">Director Propio</option>
                            <option value="Director Nominal">Director Nominal</option>
                        </select>
                    </div>

                    {formData.servicio === 'Director Propio' && (
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
                                        {(persona.tipoPersona === 'Persona Jurídica' || persona.tipo === 'Persona Jurídica')
                                            ? `${(persona?.personaJuridica?.nombreJuridico || persona?.nombre_PersonaJuridica)} - ${persona?.nombreApellido || persona?.nombre}`
                                            : persona?.nombreApellido || persona?.nombre}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

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

export default ModalDirectores;
