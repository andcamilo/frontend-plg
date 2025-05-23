import React, { useState, useContext, useEffect } from 'react';
import FundacionContext from '@context/fundacionContext'; 
import axios from 'axios';
import Swal from 'sweetalert2';

interface ModalFundadoresProps {
    onClose: () => void;
}

const ModalFundadores: React.FC<ModalFundadoresProps> = ({  onClose }) => {

    const context = useContext(FundacionContext); 
    if (!context) {
        throw new Error('FundacionContext must be used within a FundacionStateProvider');
    }

    const { store } = context;
    const solicitudId = store.solicitudId; // Obtenemos el `solicitudId` del contexto
    console.log("ID ss ", solicitudId)
    const [personas, setPersonas] = useState([]); // Estado para guardar las personas de la base de datos
    const [isLoading, setIsLoading] = useState(false); // Estado de carga
    const [formData, setFormData] = useState({
        servicio: 'Fundador Propio', // Valor por defecto
        seleccionar: '', // Campo vacío por defecto
    });

    console.log("ModalFundadores mounted");

    // Función para obtener personas desde la base de datos
    const fetchPersonas = async () => {
        console.log("Calling fetchPersonas");
        try {
            const response = await axios.get('/api/get-people-id', {
                params: { solicitudId },
            });
            // Log the response to debug
            console.log('Modal personas response:', response.data);

            setPersonas(response.data.filter((persona: any) => persona.solicitudId === solicitudId));

        } catch (error) {
            console.error('Error fetching personas:', error);
        } finally {
            console.log("fetchPersonas finished");
        }
    };

    useEffect(() => {
            fetchPersonas();
    }, []);



    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.servicio === 'Fundador Propio' && !formData.seleccionar) {
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

        setIsLoading(true); 

        let personId = formData.seleccionar || null;

        // Generar un nuevo `personId` si el servicio es "Dignatario Nominal" y no existe `personId`
        if (formData.servicio === 'Fundador Nominal' && !personId) {
            personId = crypto.randomUUID(); // Generar un UUID seguro y único
        }

        try {
            let updatePayload;

            if (formData.servicio === 'Fundador Nominal') {
                updatePayload = {
                    solicitudId: store.solicitudId,
                    fundadores: {
                        personId: personId,
                        servicio: formData.servicio,
                    },
                };
            } else {
                updatePayload = {
                    solicitudId: store.solicitudId,
                    fundadores: {
                        personId: formData.seleccionar,
                        servicio: formData.servicio,
                        esFundador: true,
                    },
                };
            }

            const response = await axios.patch('/api/update-person', updatePayload);

            if (response.status === 200) {
                Swal.fire({
                    position: "top-end",
                    icon: "success",
                    title: "Fundador asignado correctamente.",
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
                onClose(); 
            } else {
                throw new Error('Error al actualizar el fundador.');
            }
        } catch (error) {
            Swal.fire({
                position: "top-end",
                icon: "error",
                title: "Error al asignar al fundador.",
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
            setIsLoading(false); 
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-gray-900 p-8 rounded-lg w-1/2 relative">
                <button className="text-white absolute top-2 right-4" onClick={onClose}>
                    X
                </button>

                <h2 className="text-white text-2xl font-bold mb-4">Fundadores</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="text-white block mb-2">Servicio</label>
                        <select
                            name="servicio"
                            value={formData.servicio}
                            onChange={handleChange}
                            className="w-full p-2 border border-gray-700 rounded bg-gray-800 text-white"
                        >
                            <option value="Fundador Propio">Fundador Propio</option>
                            <option value="Fundador Nominal">Fundador Nominal</option>
                        </select>
                    </div>

                    {formData.servicio === 'Fundador Propio' && (
                        <div className="mb-4">
                            <label className="text-white block mb-2">Seleccionar</label>
                            <select
                                name="seleccionar"
                                value={formData.seleccionar}
                                onChange={handleChange}
                                className="w-full p-2 border border-gray-700 rounded bg-gray-800 text-white"
                            >
                                <option value="">Seleccione una persona</option>
                                {personas.map((persona: any) => {
                                    console.log('Rendering persona option:', persona);
                                    return (
                                        <option key={persona.id} value={persona.id}>
                                            {persona.tipoPersona === 'Persona Jurídica'
                                                ? `${persona.personaJuridica.nombreJuridico} - ${persona.nombreApellido}`
                                                : persona.nombreApellido}
                                        </option>
                                    );
                                })}
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

export default ModalFundadores;
