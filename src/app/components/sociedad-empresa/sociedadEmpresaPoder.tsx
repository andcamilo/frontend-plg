import React, { useState, useContext, useEffect } from 'react';
import AppStateContext from '@context/sociedadesContext';
import ClipLoader from 'react-spinners/ClipLoader';
import ModalPoder from '@components/modalPoder'; // Cambiar el modal por el de poderes
import axios from 'axios';
import TableWithRequests from '@components/TableWithRequests';
import BusinessIcon from '@mui/icons-material/Business';
import '@fortawesome/fontawesome-free/css/all.css';
import DeleteIcon from '@mui/icons-material/Delete';
import Swal from 'sweetalert2';
import { FaPlay } from 'react-icons/fa';

interface PoderData {
    nombre: React.ReactNode;
    correo: string;
    accion: string;
}

const Actions: React.FC<{ id: string, solicitudId: string; }> = ({ id, solicitudId }) => {
    const handleDelete = async () => {
        const result = await Swal.fire({
            title: '¿Estás seguro?',
            text: "Quiere eliminar este poder?",
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
                await axios.post(`/api/update-request-people`, { peopleId: id, solicitudId: solicitudId, cargo: "poder" });
                await axios.post('/api/update-people-cargo', { peopleId: id, cargo: "poder" });
                Swal.fire({
                    title: 'Eliminado',
                    text: 'El poder ha sido eliminado.',
                    icon: 'success',
                    timer: 4000,
                    showConfirmButton: false,
                });
                // Opcionalmente, puedes recargar la lista de solicitudes después de eliminar
                window.location.reload();
            } catch (error) {
                console.error('Error al eliminar este poder:', error);
                Swal.fire('Error', 'No se pudo eliminar este poder.', 'error');
            }
        }
    };

    return (
        <div className="flex gap-2">
            <DeleteIcon className="cursor-pointer" onClick={handleDelete} titleAccess="Eliminar" />
        </div>
    );
};

const SociedadEmpresaPoder: React.FC = () => {
    const context = useContext(AppStateContext);

    if (!context) {
        throw new Error('AppStateContext must be used within an AppStateProvider');
    }

    const [data, setData] = useState<PoderData[]>([]);
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
    }, [currentPage, solicitudId]);

    const handlePageChange = (newPage: number) => {
        setCurrentPage(newPage);
    };

    const [isLoading, setIsLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleContinue = () => {
        setIsLoading(true);
        setStore((prevState) => ({
            ...prevState,
            actividades: true,
            currentPosition: 10,
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
            const requestData = solicitudes.data;

            // 2. Obtener los poderes de requestData y almacenar sus id_persona
            let idPersonasPoder: string[] = [];
            if (requestData && requestData.poder) {
                idPersonasPoder = requestData.poder.map((poder: any) => poder.id_persona);
            }

            // 3. Filtrar los registros de `people` que coincidan con los id_persona de los poderes
            const poderesData = people.filter((persona: any) =>
                idPersonasPoder.includes(persona.id)
            );

            // 4. Formatear la información de los poderes extraídos de `requestData`
            const formattedPoderesRequest = poderesData.map((persona: any) => ({
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
                correo: persona.email || '---',
                Opciones: <Actions id={persona.id} solicitudId={store.solicitudId} />,
            }));

            // 5. Verificar si no hay personas registradas
            if (!people || people.length === 0) {
                setData([]);
                setTotalRecords(0);
                setTotalPages(1);
                setHasPrevPage(false);
                setHasNextPage(false);
                return;
            }

            // 6. Filtrar las personas que ya tienen un poder registrado en `people`
            const personasConPoder = people.filter((persona: any) => persona.poder);

            // 7. Calcular paginación solo con los registros filtrados
            const totalRecords = personasConPoder.length;
            const totalPages = Math.ceil(totalRecords / rowsPerPage);

            const paginatedData = personasConPoder.slice(
                (currentPage - 1) * rowsPerPage,
                currentPage * rowsPerPage
            );

            // 8. Formatear los datos de los poderes ya existentes en `people`
            const formattedDataPoderes = paginatedData.map((persona: any) => ({
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
                correo: persona.email || '---',
                Opciones: <Actions id={persona.id} solicitudId={store.solicitudId} />,
            }));

            // 9. Combinar los datos de `requestData.poderes` con `people`
            const combinedData: PoderData[] = [
                ...formattedDataPoderes,   // Poderes ya registrados en `people`
                ...formattedPoderesRequest // Poderes extraídos de `requestData`
            ];

            // 10. Establecer los datos combinados en el estado
            setData(combinedData);
            setTotalRecords(combinedData.length);
            setTotalPages(totalPages);
            setHasPrevPage(currentPage > 1);
            setHasNextPage(currentPage < totalPages);

        } catch (error) {
            console.error('Error fetching people:', error);
        }
    };

    const [showModal, setShowModal] = useState(false); // Estado para manejar el modal

    const toggleModal = () => {
        setShowModal(!showModal); // Alterna el estado del modal
    };

    return (
        <div className="w-full h-full p-8 overflow-y-scroll scrollbar-thin bg-[#070707]">
            <h1 className="text-white text-3xl font-bold flex items-center">
                Poder de la Sociedad
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
                            <h2 className="text-white text-xl">Poder de la Sociedad</h2>
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
                                src="https://www.youtube.com/embed/SYfbDTZwcE8"
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
                ¿Va a asignar poder general a una tercera persona?
                <br />
                * Se utiliza para personas que no están como representante legal o en la junta directiva, y donde usted requiere que tengan poder de representar a la sociedad, firmar, comprometerte, etc. tal como un representante legal. Si usted ya asignó a esta persona como Representante legal, NO es necesario incluir poder general.
            </p>

            <div className="flex items-center w-full mt-5">
                <div className="w-full max-w-4xl">
                    <TableWithRequests
                        data={data}
                        rowsPerPage={rowsPerPage}
                        title="Poderes Asignados"
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
                                'Nuevo Poder'
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
                && <ModalPoder onClose={closeModal} />
            }
        </div>
    );
};

export default SociedadEmpresaPoder;
