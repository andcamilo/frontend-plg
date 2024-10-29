import React, { useState, useContext, useEffect } from 'react';
import AppStateContext from '@context/sociedadesContext';
import AppStateContextFundacion from '@context/fundacionContext';
import axios from 'axios';

interface ModalPoderProps {
    isOpen: boolean;
    onClose: () => void;
}

const ModalPoder: React.FC<ModalPoderProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    const sociedadContext = useContext(AppStateContext);
    const fundacionContext = useContext(AppStateContextFundacion);

    // Verificar si estamos trabajando con sociedad o fundación
    const context = sociedadContext?.store.solicitudId ? sociedadContext : fundacionContext;
    if (!context) {
        throw new Error('AppStateContext must be used within an AppStateProvider');
    }

    const { store } = context;
    const solicitudId = store.solicitudId; // Obtenemos el `solicitudId` del contexto

    const [personas, setPersonas] = useState([]); // Estado para guardar las personas de la base de datos
    const [isLoading, setIsLoading] = useState(false); // Estado de carga
    const [formData, setFormData] = useState({
        seleccionar: '', // Persona seleccionada
    });

    // Función para obtener personas desde la base de datos
    const fetchPersonas = async () => {
        try {
            const response = await axios.get('/api/client', {
                params: {
                    solicitudId, // Pasamos el ID de la solicitud como filtro
                },
            });
    
            // Filtrar las personas que NO tienen el campo `poder` como `true` o que no lo tienen definido
            const { personas } = response.data;
            setPersonas(personas.filter((persona: any) =>
                persona.solicitudId === solicitudId && (!persona.poder)
            ));
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

        if (!formData.seleccionar) {
            alert('Por favor, selecciona una persona.');
            return;
        }

        setIsLoading(true); // Activar el estado de carga

        try {
            // Construimos el payload para enviar a la API
            const updatePayload = {
                solicitudId: store.solicitudId,
                poder: {
                    personId: formData.seleccionar || null,
                },
            };

            // Enviar solicitud a la API para actualizar la persona seleccionada como poder
            const response = await axios.patch('/api/update-personPoder', updatePayload);

            if (response.status === 200) {
                console.log("Poder actualizado");
                onClose(); // Cerrar el modal solo si la actualización es exitosa
            } else {
                throw new Error('Error al actualizar el poder.');
            }
        } catch (error) {
            console.error('Error al actualizar el poder:', error);
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

                <h2 className="text-white text-2xl font-bold mb-4">Poder</h2>
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

export default ModalPoder;
