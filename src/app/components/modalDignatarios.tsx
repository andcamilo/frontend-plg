import React, { useState, useContext, useEffect } from 'react';
import AppStateContext from '@context/sociedadesContext';
import AppStateContextFundacion from '@context/fundacionContext';
import axios from 'axios';
import Swal from 'sweetalert2';

interface ModalDignatariosProps {
    onClose: () => void;
    id?: string | null;
}

const ModalDignatarios: React.FC<ModalDignatariosProps> = ({ onClose, id }) => {

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
    const [solicitudData, setSolicitudData] = useState<any>(null);
    const [isSolicitudDataProcessed, setIsSolicitudDataProcessed] = useState(false);
    const [assignedPositions, setAssignedPositions] = useState<string[]>([]); // Guardar las posiciones asignadas de los dignatarios
    const [isLoading, setIsLoading] = useState(false); // Estado de carga
    const [userData, setUserData] = useState<any>(null);
    const [formData, setFormData] = useState({
        servicio: 'Dignatario Propio',
        seleccionar: '', // Campo vacío por defecto
    });
    const [selectedPositions, setSelectedPositions] = useState<string[]>([]); // Estado para las posiciones seleccionadas

    // Función para obtener la solicitud con los dignatarios
    const fetchSolicitudData = async () => {
        try {
            const response = await axios.get('/api/get-request-id', {
                params: { solicitudId }, // Pasamos el ID de la solicitud como filtro
            });

            const solicitudData = response.data;
            console.log('Datos de solicitud:', solicitudData);

            // Extraemos las posiciones ya asignadas de los dignatarios existentes
            const dignatarios = solicitudData.dignatarios || [];
            const posicionesAsignadas = dignatarios.flatMap((dignatario: any) =>
                dignatario.posiciones
                    ? dignatario.posiciones
                    : dignatario.positions || [] // Si `positions` existe, usarlo directamente
            );

            console.log("Posiciones asignadas:", posicionesAsignadas);

            setSolicitudData(solicitudData);
            setAssignedPositions(posicionesAsignadas);
        } catch (error) {
            console.error('Error al obtener los datos de la solicitud:', error);
        }
    };

    useEffect(() => {
        fetchSolicitudData(); // Cargar datos de la solicitud (incluyendo dignatarios y sus posiciones)
    }, [solicitudId]);

    useEffect(() => {
        if (id) {
            setFormData((prevData) => ({
                ...prevData,
                seleccionar: id, // Establece el id como valor seleccionado
            }));
        }
    }, [id]);

    useEffect(() => {
        if (!solicitudData) {
            console.log("solicitudData es null o undefined");
            return; // Evita continuar si solicitudData no está definido
        }
    
        console.log("Dignatarios actuales:", solicitudData.dignatarios);
    
        if (!solicitudData.dignatarios || solicitudData.dignatarios.length === 0) {
            console.log("No hay dignatarios en solicitudData");
            setIsSolicitudDataProcessed(true); // Permitir que el segundo useEffect se ejecute
            return;
        }
    
        const dignatario = solicitudData.dignatarios.find(
            (dignatario: any) => dignatario.personId === id || dignatario.id_persona === id
        );
    
        if (!dignatario) {
            console.log("No se encontró un dignatario con ID:", id);
            setIsSolicitudDataProcessed(true); // Permitir que el segundo useEffect se ejecute
            return;
        }
    
        console.log("Dignatario encontrado:", dignatario);
    
        // Extraer posiciones
        const posiciones = dignatario.posiciones
            ? dignatario.posiciones
            : dignatario.positions || [];
    
        console.log("Posiciones extraídas:", posiciones);
        setSelectedPositions(posiciones);
        setIsSolicitudDataProcessed(true); // Marcar que el primer useEffect terminó
    }, [solicitudData, id, solicitudId]);

    useEffect(() => {
        if (!isSolicitudDataProcessed) return; // Esperar a que el primer useEffect termine
        fetchPersonas(); // Cargar las personas
    }, [isSolicitudDataProcessed]);

    useEffect(() => {
        if (!id || !isSolicitudDataProcessed) {
            console.log("Esperando que se procese solicitudData o que exista un ID válido.");
            return; // Si no hay ID o no se ha procesado solicitudData, no hacemos nada
        }

        console.log("Servicio actual: ", formData.servicio);

        if (formData.servicio !== "Dignatario Propio") {
            console.log("No se realiza la consulta porque el servicio no es 'Dignatario Propio'.");
            return; // Salimos temprano si el servicio no es 'Dignatario Propio'
        }

        // Realizamos la consulta solo si es 'Dignatario Propio'
        const fetchUser = async () => {
            try {
                console.log("Realizando consulta al API para Dignatario Propio");
                const response = await axios.get('/api/get-people-userId', {
                    params: { userId: id },
                });
                setUserData(response.data);
            } catch (error) {
                console.error('Error fetching solicitud:', error);
            }
        };
        fetchUser();
    }, [id, isSolicitudDataProcessed, formData.servicio]);

    // Función para obtener personas desde la base de datos
    const fetchPersonas = async () => {
        try {
            const response = await axios.get(`/api/get-people-id`, {
                params: { solicitudId }
            });

            // Asegurar que personas sea un array vacío si no existe
            const personas = response.data || [];
            
            // Extraer los id_persona de los dignatarios actuales
            const idsDignatarios = new Set(
                Array.isArray(store.request?.dignatarios) ? solicitudData.dignatarios.map((d: any) => d.id_persona) : []
            );

            // Filtrar personas que tengan solicitudId igual a solicitudId
            // y que no sean dignatarios ni estén en la lista de dignatarios actuales
            const personasFiltradas = personas.filter((persona: any) =>
                (persona.solicitudId === solicitudId || persona.id_solicitud === solicitudId) &&
                !persona.dignatario &&
                !idsDignatarios.has(persona.id) // Excluir si está en dignatariosActuales
            );

            setPersonas(personasFiltradas);
        } catch (error) {
            console.error('Error fetching personas:', error);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;

        if (type === 'checkbox') {
            const { checked } = e.target as HTMLInputElement;
            setSelectedPositions((prev) =>
                checked ? [...prev, value] : prev.filter((pos) => pos !== value)
            );
        } else {
            setFormData((prevData) => ({
                ...prevData,
                [name]: value,
            }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Verificar si no se ha seleccionado un dignatario
        if (formData.servicio === 'Dignatario Propio' && !formData.seleccionar) {
            Swal.fire({
                position: "top-end",
                icon: "warning",
                title: "Debe seleccionar un dignatario.",
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

        // Verificar si no se ha seleccionado ninguna posición
        if (selectedPositions.length === 0) {
            Swal.fire({
                position: "top-end",
                icon: "warning",
                title: "Debe asignar al menos una posición.",
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

        // Verificar si alguna de las posiciones seleccionadas ya está asignada
        const posicionesDuplicadas = selectedPositions.filter((pos) => assignedPositions.includes(pos));
        if (posicionesDuplicadas.length > 0 && !id) {
            Swal.fire({
                position: "top-end",
                icon: "warning",
                title: `Las siguientes posiciones ya están asignadas: ${posicionesDuplicadas.join(", ")}`,
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
        if (formData.servicio === 'Dignatario Nominal' && !personId) {
            personId = crypto.randomUUID(); // Generar un UUID seguro y único
        }
        console.log("Person ID ", personId)
        try {
            const updatePayload = {
                solicitudId: store.solicitudId,
                dignatario: {
                    personId: personId,
                    servicio: formData.servicio,
                    ...(solicitudData?.nombreSociedad_1 && {
                        positions: selectedPositions.map((pos) => pos),
                    }),
                    ...(solicitudData?.empresa && {
                        posiciones: selectedPositions.map((pos) => pos),
                    }),
                    ...(solicitudData?.fundacion && {
                        posiciones: selectedPositions.map((pos) => pos),
                    }),
                },
            };

            console.log("DATA FRONT updatePayload ", updatePayload)

            // Enviar solicitud a la API para actualizar la persona seleccionada o agregar el dignatario
            const response = await axios.patch('/api/update-personDignatario', updatePayload);

            if (response.status === 200) {
                console.log("Campo dignatario actualizado");
                onClose(); // Cerrar el modal solo si la actualización es exitosa
            } else {
                throw new Error('Error al actualizar la persona.');
            }
        } catch (error) {
            console.error('Error al actualizar la persona:', error);
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

                <h2 className="text-white text-2xl font-bold mb-4">Dignatarios</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="text-white block mb-2">Servicio</label>
                        <select
                            name="servicio"
                            value={formData.servicio}
                            onChange={handleChange}
                            className="w-full p-2 border border-gray-700 rounded bg-gray-800 text-white"
                            disabled={!!id}
                        >
                            <option value="Dignatario Propio">Dignatario Propio</option>
                            <option value="Dignatario Nominal">Dignatario Nominal</option>
                        </select>
                    </div>

                    {formData.servicio === 'Dignatario Propio' && (
                        <>
                            <div className="mb-4">
                                <label className="text-white block mb-2">Seleccionar</label>
                                <select
                                    name="seleccionar"
                                    value={formData.seleccionar}
                                    onChange={handleChange}
                                    className="w-full p-2 border border-gray-700 rounded bg-gray-800 text-white"
                                    disabled={!!id} // Deshabilita el select si se está editando
                                >
                                    {!id && <option value="">Seleccione una persona</option>}
                                    {id ? (
                                        personas
                                            .filter((persona: any) => persona.id === id) // Solo permite la opción con el id actual
                                            .map((persona: any) => (
                                                <option key={persona.id} value={persona.id}>
                                                    {(persona.tipoPersona === 'Persona Jurídica' || persona.tipo === 'Persona Jurídica')
                                                        ? `${(persona?.personaJuridica?.nombreJuridico || persona?.nombre_PersonaJuridica)} - ${persona?.nombreApellido || persona?.nombre}`
                                                        : persona?.nombreApellido || persona?.nombre}
                                                </option>
                                            ))
                                    ) : (
                                        personas.map((persona: any) => (
                                            <option key={persona.id} value={persona.id}>
                                                {(persona.tipoPersona === 'Persona Jurídica' || persona.tipo === 'Persona Jurídica')
                                                    ? `${(persona?.personaJuridica?.nombreJuridico || persona?.nombre_PersonaJuridica)} - ${persona?.nombreApellido || persona?.nombre}`
                                                    : persona?.nombreApellido || persona?.nombre}
                                            </option>
                                        ))
                                    )}
                                </select>
                            </div>
                            <p className="text-gray-300 mt-4 texto_justificado">
                                * Los Dignatarios son los que ocupan algún cargo dentro de la sociedad como Presidente, Secretario o Tesorero. Una sola persona puede ocupar varias posiciones de Dignatario, y puedes establecer otras posiciones, tal y como Vocales, Vice Presidentes, Sub Secretarios, y Sub Tesoreros. Si ha escogido Director Nominal, puede incluir de igual forma aquí “Dignatario Nominal”.
                            </p>
                        </>
                    )}

                    {formData.servicio !== 'Dignatario Propio' && (
                        <>
                            <p className="text-gray-300 mt-4 texto_justificado">
                                El costo de servicio de Dignatario Nominal anual es de $US200.00. Le incorporaremos un servicio adicional de Dignatario Nominal.
                            </p>
                        </>
                    )}

                    <div className="mb-4 mt-4">
                        <label className="text-white block mb-2">Posición</label>
                        <div className="flex flex-col space-y-2">
                            <label className="text-white">
                                <input
                                    type="checkbox"
                                    value="Presidente"
                                    onChange={handleChange}
                                    checked={selectedPositions.includes('Presidente')}
                                /> Presidente
                            </label>
                            <label className="text-white">
                                <input
                                    type="checkbox"
                                    value="Representante Legal"
                                    onChange={handleChange}
                                    checked={selectedPositions.includes('Representante Legal')}
                                /> Representante Legal
                            </label>
                            <label className="text-white">
                                <input
                                    type="checkbox"
                                    value="Tesorero"
                                    onChange={handleChange}
                                    checked={selectedPositions.includes('Tesorero')}
                                /> Tesorero
                            </label>
                            <label className="text-white">
                                <input
                                    type="checkbox"
                                    value="Secretario"
                                    onChange={handleChange}
                                    checked={selectedPositions.includes('Secretario')}
                                /> Secretario
                            </label>
                            <label className="text-white">
                                <input
                                    type="checkbox"
                                    value="Otro"
                                    onChange={handleChange}
                                    checked={selectedPositions.includes('Otro')}
                                /> Otro
                            </label>
                        </div>
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

export default ModalDignatarios;
