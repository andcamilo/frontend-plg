import React, { useState, useContext, useEffect } from 'react';
import FundacionContext from '@context/fundacionContext';
import axios from 'axios';
import Swal from 'sweetalert2';

interface ModalProtectorProps {
    isOpen: boolean;
    onClose: () => void;
}

const ModalProtector: React.FC<ModalProtectorProps> = ({ isOpen, onClose }) => {
    // Access the context values
    const context = useContext(FundacionContext);
    if (!context) {
        throw new Error('FundacionContext must be used within a FundacionStateProvider');
    }

    const { store } = context;
    const solicitudId = store.solicitudId;

    const [personas, setPersonas] = useState([]); // Personas sin el campo protector
    const [protectoresExistentes, setProtectoresExistentes] = useState([]); // Protectores ya asignados
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        seleccionar: '', // Persona seleccionada
    });

    // Function to fetch personas from the database
    const fetchPersonas = async () => {
        try {
            const response = await axios.get('/api/client', {
                params: { solicitudId },
            });

            const { personas } = response.data;

            // Filter personas without the `protector` field
            const personasSinProtector = personas.filter((persona: any) =>
                persona.solicitudId === solicitudId && !persona.protector
            );

            // Get all personas that already have the `protector` field
            const protectoresAsignados = personas.filter((persona: any) =>
                persona.solicitudId === solicitudId && persona.protector
            );

            setPersonas(personasSinProtector);
            setProtectoresExistentes(protectoresAsignados);
        } catch (error) {
            console.error('Error fetching personas:', error);
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchPersonas();
        }
    }, [isOpen, solicitudId]);

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
        const { name, value } = e.target;
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

        const existeProtectorPrincipal = protectoresExistentes.some((persona: any) =>
            persona.protector?.cargo === 'Protector Principal'
        );
        const existeProtectorSecundario = protectoresExistentes.some((persona: any) =>
            persona.protector?.cargo === 'Protector Secundario'
        );

        if (existeProtectorPrincipal && existeProtectorSecundario) {
            Swal.fire({
                position: "top-end",
                icon: "warning",
                title: "Ya existen un Protector Principal y un Protector Secundario asignados.",
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
            return;
        }

        setIsLoading(true);

        try {
            const cargoAsignado = existeProtectorPrincipal ? 'Protector Secundario' : 'Protector Principal';

            const updatePayload = {
                solicitudId,
                protectores: {
                    personId: formData.seleccionar || null,
                    cargo: cargoAsignado,
                },
            };

            const response = await axios.patch('/api/update-person', updatePayload);

            if (response.status === 200) {
                onClose();
            } else {
                throw new Error('Error al actualizar el protector.');
            }
        } catch (error) {
            console.error('Error al actualizar el protector:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Conditional rendering based on isOpen, but after all hooks are set up
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-gray-900 p-8 rounded-lg w-1/2 relative">
                <button className="text-white absolute top-2 right-4" onClick={onClose}>
                    X
                </button>

                <h2 className="text-white text-2xl font-bold mb-4">Protector</h2>
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

export default ModalProtector;
