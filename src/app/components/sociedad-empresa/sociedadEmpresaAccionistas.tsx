import React, { useState, useContext, useEffect } from 'react';
import AppStateContext from '@context/sociedadesContext';
import ClipLoader from 'react-spinners/ClipLoader';
import ModalAccionistas from '@components/modalAccionista';
import axios from 'axios';
import TableWithRequests from '@components/TableWithRequests';
import BusinessIcon from '@mui/icons-material/Business';
import Swal from 'sweetalert2';
import '@fortawesome/fontawesome-free/css/all.css';
import DeleteIcon from '@mui/icons-material/Delete';

interface AccionistaData {
    numero: number;
    nombre: React.ReactNode;
    porcentajeAcciones: string;
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
                /* await axios.delete(`/api/delete-people`, { params: { peopleId: id } }); */
                await axios.post(`/api/update-request-people`, { peopleId: id, solicitudId: solicitudId, cargo: "accionistas" });
                await axios.post('/api/update-people-cargo', { peopleId: id, cargo: "accionista" });
                Swal.fire({
                    title: 'Eliminado',
                    text: 'La persona ha sido eliminada.',
                    icon: 'success',
                    timer: 4000,
                    showConfirmButton: false,
                });
                // Opcionalmente, puedes recargar la lista de solicitudes después de eliminar
                window.location.reload();
            } catch (error) {
                console.error('Error al eliminar esta persona:', error);
                Swal.fire('Error', 'No se pudo eliminar esta persona.', 'error');
            }
        }
    };

    return (
        <div className="flex gap-2">
            <DeleteIcon className="cursor-pointer" onClick={handleDelete} titleAccess="Eliminar" />
        </div>
    );
};

const SociedadEmpresaAccionistas: React.FC = () => {
    const context = useContext(AppStateContext);

    if (!context) {
        throw new Error('AppStateContext must be used within an AppStateProvider');
    }

    const [data, setData] = useState<AccionistaData[]>([]);
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
        // Validar si hay accionistas asignados
        if (data.length === 0) {
            Swal.fire({
                position: "top-end",
                icon: "warning",
                title: "Debe asignar al menos un accionista para continuar.",
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
            capital: true,
            currentPosition: 8,
        }));
    };

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => {
        setIsModalOpen(false);
        fetchData();
    };

    const fetchData = async () => {
        try {
            const response = await axios.get(`/api/get-people-id`, {
                params: { solicitudId }
            });

            const people = response.data;
            const requestData = store.request;

            // 1. Obtener los accionistas desde requestData y mapear su id_persona con su porcentajeAcciones
            let accionistasMap: Record<string, number> = {};
            if (requestData && requestData.accionistas) {
                accionistasMap = requestData.accionistas.reduce((acc: Record<string, number>, accionista: any) => {
                    acc[accionista.id_persona] = accionista.porcentaje;
                    return acc;
                }, {});
            }

            // 2. Filtrar los registros de `people` que coincidan con los id_persona de los accionistas
            const accionistasData = people.filter((persona: any) =>
                accionistasMap.hasOwnProperty(persona.id)
            );

            // 3. Formatear la información de los accionistas extraídos de `requestData`
            const formattedAccionistas = accionistasData.map((persona: any) => ({
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
                '% de Acciones': accionistasMap[persona.id] || '---',  // Se toma del map
                Opciones: <Actions id={persona.id} solicitudId={store.solicitudId} />,
            }));

            if (!people || people.length === 0) {
                setData([]);
                setTotalRecords(0);
                setTotalPages(1);
                setHasPrevPage(false);
                setHasNextPage(false);
                return;
            }

            // 4. Filtrar las personas que ya tienen información de accionistas en `people`
            const accionistas = people.filter((persona: any) => persona.accionista);

            // 5. Calcular paginación solo con los registros filtrados
            const totalRecords = accionistas.length;
            const totalPages = Math.ceil(totalRecords / rowsPerPage);

            const paginatedData = accionistas.slice(
                (currentPage - 1) * rowsPerPage,
                currentPage * rowsPerPage
            );

            // 6. Formatear los datos de los accionistas ya existentes en `people`
            const formattedData = paginatedData.map((persona: any) => ({
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
                '% de Acciones': persona.accionista.porcentajeAcciones || '---',
                Opciones: <Actions id={persona.id} solicitudId={store.solicitudId} />,
            }));

            // 7. Combinar los datos de `formattedData` (accionistas en `people`) con `formattedAccionistas`
            const combinedData: AccionistaData[] = [
                ...formattedData,
                ...formattedAccionistas,
            ];

            // 8. Actualizar los estados con los datos combinados
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
            <h1 className="text-white text-4xl font-bold flex items-center">
                Accionistas de la Sociedad
                <button
                    className="ml-2 flex items-center justify-center w-10 h-10 bg-white text-black rounded-md border border-gray-300"
                    type="button"
                    onClick={toggleModal}
                >
                    <span className="flex items-center justify-center w-7 h-7 bg-black text-white rounded-full">
                        <i className="fa-solid fa-info text-sm"></i>
                    </span>
                </button>
            </h1>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-gray-800 rounded-lg w-11/12 md:w-3/4 lg:w-1/2">
                        <div className="p-4 border-b border-gray-600 flex justify-between items-center">
                            <h2 className="text-white text-xl">Accionistas de la Sociedad</h2>
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
                                src="https://www.youtube.com/embed/bND1jqKk1p8"
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
                Aquí podrás asignar los diferentes accionistas de la nueva sociedad / empresa.
            </p>

            <div className="flex items-center w-full mt-5">
                <div className="w-full max-w-4xl">
                    <TableWithRequests
                        data={data}
                        rowsPerPage={rowsPerPage}
                        title="Accionistas"
                        currentPage={currentPage}
                        totalPages={totalPages}
                        hasPrevPage={hasPrevPage}
                        hasNextPage={hasNextPage}
                        onPageChange={handlePageChange}
                    />
                </div>
            </div>

            <div className="flex space-x-2 mt-4">

                {(store.request.status < 10 || (store.request.status >= 10 && store.rol > 20)) && (
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
                                'Nuevo Accionista'
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
                && <ModalAccionistas onClose={closeModal} />
            }
        </div>
    );
};

export default SociedadEmpresaAccionistas;
