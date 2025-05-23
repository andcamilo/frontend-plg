import React, { useState, useContext, useEffect } from 'react';
import AppStateContext from '@context/sociedadesContext';
import ClipLoader from 'react-spinners/ClipLoader';
import ModalDirectores from '@components/modalDirectores';
import axios from 'axios';
import TableWithRequests from '@components/TableWithRequests';
import BusinessIcon from '@mui/icons-material/Business';
import Swal from 'sweetalert2';
import DeleteIcon from '@mui/icons-material/Delete';
import '@fortawesome/fontawesome-free/css/all.css';
import { FaPlay } from 'react-icons/fa';

// Define el tipo de datos que manejarás en el estado `data`
interface DirectorNominalData {
    tipo: string;
    nombre: React.ReactNode; // Porque algunos campos contienen JSX
    acciones: string;
}

const Actions: React.FC<{ id: string, solicitudId: string; }> = ({ id, solicitudId }) => {
    const handleDelete = async () => {
        const result = await Swal.fire({
            title: '¿Estás seguro?',
            text: "Quiere eliminar este director?",
            icon: 'warning',
            showCancelButton: true,
            background: '#2c2c3e',
            color: '#fff',
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí, eliminar',
        });

        if (result.isConfirmed) {
            try {
                await axios.post(`/api/update-request-people`, { peopleId: id, solicitudId: solicitudId, cargo: "directores" });
                await axios.post('/api/update-people-cargo', { peopleId: id, cargo: "director" });
                Swal.fire({
                    title: 'Eliminado',
                    text: 'El director ha sido eliminado.',
                    icon: 'success',
                    timer: 4000,
                    showConfirmButton: false,
                });
                // Opcionalmente, puedes recargar la lista de solicitudes después de eliminar
                window.location.reload();
            } catch (error) {
                console.error('Error al eliminar este director:', error);
                Swal.fire('Error', 'No se pudo eliminar este director.', 'error');
            }
        }
    };

    return (
        <div className="flex gap-2">
            <DeleteIcon className="cursor-pointer" onClick={handleDelete} titleAccess="Eliminar" />
        </div>
    );
};

const SociedadEmpresaDirectores: React.FC = () => {
    const context = useContext(AppStateContext);

    if (!context) {
        throw new Error('AppStateContext must be used within an AppStateProvider');
    }

    const [data, setData] = useState<DirectorNominalData[]>([]); // Especificamos que `data` es un array de objetos `DirectorData`
    const [totalRecords, setTotalRecords] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [hasPrevPage, setHasPrevPage] = useState(false);
    const [hasNextPage, setHasNextPage] = useState(false);
    const rowsPerPage = 3;

    const { store, setStore } = context;
    const solicitudId = store.solicitudId; // Aquí obtienes el `solicitudId` actual del store
    
    useEffect(() => {
        fetchData();
    }, [currentPage, solicitudId]); // Se agrega solicitudId como dependencia para actualizar si cambia

    const handlePageChange = (newPage: number) => {
        setCurrentPage(newPage);
    };

    const [isLoading, setIsLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false); // Controla la visibilidad del modal

    const handleContinue = () => {
        if (data.length < 3) {
            Swal.fire({
                position: "top-end",
                icon: "warning",
                title: "Debe agregar al menos 3 directores.",
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
        setStore((prevState) => ({
            ...prevState,
            dignatarios: true,
            currentPosition: 6,
        }));
    };


    const openModal = () => setIsModalOpen(true);
    const closeModal = () => {
        setIsModalOpen(false);
        fetchData();
    };

    const fetchData = async () => {
        try {
            let formattedData: any[] = [];
            let formattedRequestData: any[] = [];

            // 1. Llamada a la API para obtener datos de personas
            const response = await axios.get(`/api/get-people-id`, {
                params: { solicitudId }
            }).catch((error) => {
                if (axios.isAxiosError(error) && error.response?.status === 404) {
                    console.warn('No se encontraron registros para la solicitud.');
                    return { data: [] };
                }
                throw error;
            });

            const solicitudes = await axios.get('/api/get-request-id', {
                params: { solicitudId }
            });

            const people = response?.data || [];
            const requestData = solicitudes?.data;

            // 3. Obtener los directores nominales de requestData y almacenar sus id_persona
            let idPersonasDirectoresPropios: string[] = [];
            if (requestData && requestData.directores) {
                idPersonasDirectoresPropios = requestData.directores
                    .filter((director: any) => director.servicio.trim().toLowerCase() === "director propio")
                    .map((director: any) => director.id_persona); // Extraemos solo los id_persona
            }

            // 4. Filtrar los registros de `people` que coincidan con los id_persona de los directores propios
            const directoresPropios = people.filter((persona: any) =>
                idPersonasDirectoresPropios.includes(persona.id)
            );

            // 5. Formatear la información de los directores propios para mostrar en la tabla
            const formattedDirectoresPropios = directoresPropios.map((persona: any) => ({
                tipo: "Director Propio",
                nombre: persona.tipo === 'Persona Jurídica'
                    ? (
                        <>
                            {persona.nombre}
                            <br />
                            <span className="text-gray-400 text-sm">
                                <BusinessIcon style={{ verticalAlign: 'middle', marginRight: '5px' }} />
                                {persona.nombre_PersonaJuridica || '---'}
                            </span>
                        </>
                    )
                    : persona.nombre || '---',
                Opciones: <Actions id={persona.id} solicitudId={store.solicitudId} />,
            }));

            // 6. Obtener los directores nominales de requestData para mostrar en la tabla
            if (requestData && requestData.directores) {
                formattedRequestData = requestData.directores
                    .filter((director: any) => director.servicio.trim().toLowerCase() === "director nominal")
                    .map((director: any) => ({
                        tipo: director.servicio,
                        nombre: director.nombre || '---',
                        Opciones: <Actions id={director.personId || director.id_persona} solicitudId={store.solicitudId} />,
                    }));
            }

            // 7. Filtrar y formatear la información de los directores ya existentes en `people`
            if (Array.isArray(people) && people.length > 0) {
                const directores = people.filter((persona: any) => persona.director);

                // Calcular paginación
                const totalRecords = directores.length;
                const totalPages = Math.ceil(totalRecords / rowsPerPage);

                const paginatedData = directores.slice(
                    (currentPage - 1) * rowsPerPage,
                    currentPage * rowsPerPage
                );

                formattedData = paginatedData.map((persona: any) => ({
                    tipo: persona.director?.servicio || '---',
                    nombre: persona?.tipoPersona === 'Persona Jurídica' || persona?.tipo === 'Persona Jurídica'
                        ? (
                            <>
                                {persona?.nombreApellido || persona?.nombre}
                                <br />
                                <span className="text-gray-400 text-sm">
                                    <BusinessIcon style={{ verticalAlign: 'middle', marginRight: '5px' }} />
                                    {persona.personaJuridica?.nombreJuridico || persona?.nombre_PersonaJuridica || '---'}
                                </span>
                            </>
                        )
                        : persona?.nombreApellido || persona?.nombre || '---',
                    Opciones: <Actions id={persona.id} solicitudId={store.solicitudId} />,
                }));

                // 8. Combinar todos los datos
                const combinedData: DirectorNominalData[] = [
                    ...formattedData,          // Directores ya registrados en `people`
                    ...formattedRequestData,   // Directores nominales de `requestData`
                    ...formattedDirectoresPropios, // Directores propios extraídos de `requestData`
                ];

                // 9. Establecer los datos combinados en el estado
                setData(combinedData);
                setTotalRecords(combinedData.length);
                setTotalPages(totalPages);
                setHasPrevPage(currentPage > 1);
                setHasNextPage(currentPage < totalPages);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const [showModal, setShowModal] = useState(false); // Estado para manejar el modal

    const toggleModal = () => {
        setShowModal(!showModal); // Alterna el estado del modal
    };

    return (
        <div className="w-full h-full p-8 overflow-y-scroll scrollbar-thin bg-[#070707]">
            <h1 className="text-white text-3xl font-bold flex items-center">
                Directores de la Sociedad
                <div className="flex flex-col items-center">
                    <button
                        className="w-10 h-10 bg-white text-black rounded-md border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors"
                        type="button"
                        onClick={toggleModal}
                    >
                        <FaPlay className="text-sm" /> 
                    </button>
                    <span className="hidden md:inline text-white text-xs mt-1">Ver video</span>
                </div>
            </h1>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-gray-800 rounded-lg w-11/12 md:w-3/4 lg:w-1/2">
                        <div className="p-4 border-b border-gray-600 flex justify-between items-center">
                            <h2 className="text-white text-xl">Directores de la Sociedad</h2>
                            <button
                                className="text-white"
                                onClick={toggleModal} // Cierra el modal
                            >
                                <i className="fa-solid fa-times"></i>
                            </button>
                        </div>
                        <div className="p-4 text-white">
                            <h5 className="text-lg">Información</h5>
                            <p className="mt-2 texto_justificado">
                                Descubre en este Clip cada detalle que te ayudará a entender el tipo de información que debes anexar en esta sección.
                                <br />
                                <br />
                                ¡No dudes en explorar nuestros videos!
                            </p>
                            <h5 className="text-lg mt-4">Video</h5>
                            <iframe
                                width="100%"
                                height="315"
                                src="https://www.youtube.com/embed/JHZo6H9htwg"
                                title="YouTube video player"
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                allowFullScreen
                            ></iframe>
                        </div>
                        <div className="p-4 border-t border-gray-600 text-right">
                            <button
                                className="bg-red-600 text-white px-4 py-2 rounded-md"
                                onClick={toggleModal} // Cierra el modal
                            >
                                Cerrar
                            </button>
                        </div>
                    </div>
                </div>
            )}
            <p className="text-white mt-4 texto_justificado">
                * Los directores de una sociedad en Panamá son individuos designados para formar parte de la junta directiva. Aquí podrás asignar los diferentes Directores de la misma, de la cual deben ser personas independientes, es decir, tiene que asignar al menos TRES (3) personas distintas como Director. Recuerde que si requiere que la firma le preste el servicio de Director, indique “Director Nominal”. Si usted va a asignar a los Directores, indique “Director Propio”. Podrás asignar a Directores como Dignatarios, o pueden ser distintos de igual forma.
            </p>

            <div className="flex items-center w-full mt-5">
                <div className="w-full max-w-4xl">
                    <TableWithRequests
                        data={data}
                        rowsPerPage={rowsPerPage}
                        title="Directores"
                        currentPage={currentPage}
                        totalPages={totalPages}
                        hasPrevPage={hasPrevPage}
                        hasNextPage={hasNextPage}
                        onPageChange={handlePageChange}
                    />
                </div>
            </div>

            <div className="flex space-x-2 mt-4">

                {(store.request.status < 10 || (store.request.status >= 10 && store.rol > 19)) && (
                    <>
                        <button
                            className="bg-profile text-white py-2 px-4 rounded-lg inline-block"
                            type="button"
                            onClick={openModal}
                        >
                            {isLoading ? (
                                <div className="flex items-center justify-center">
                                    <ClipLoader size={24} color="#ffffff" />
                                    <span className="ml-2">Cargando...</span>
                                </div>
                            ) : (
                                'Nuevo Director'
                            )}
                        </button>
                    </>
                )}

                <button
                    className="bg-profile text-white py-2 px-4 rounded-lg inline-block"
                    type="button"
                    disabled={isLoading}
                    onClick={handleContinue}
                >
                    {isLoading ? (
                        <div className="flex items-center justify-center">
                            <ClipLoader size={24} color="#ffffff" />
                            <span className="ml-2">Cargando...</span>
                        </div>
                    ) : (
                        'Continuar'
                    )}
                </button>
            </div>

            {isModalOpen
                && <ModalDirectores onClose={closeModal} />
            }
        </div>
    );
};

export default SociedadEmpresaDirectores;
