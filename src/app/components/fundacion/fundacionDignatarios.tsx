import React, { useState, useContext, useEffect } from 'react';
import AppStateContext from '@context/fundacionContext';
import ClipLoader from 'react-spinners/ClipLoader';
import ModalDignatarios from '@components/modalDignatarios';
import axios from 'axios';
import TableWithRequests from '@components/TableWithRequests';
import BusinessIcon from '@mui/icons-material/Business';
import { getRequests } from '@api/request';
import Swal from 'sweetalert2';
import '@fortawesome/fontawesome-free/css/all.css';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

interface DignatarioNominalData {
    tipo: string;
    nombre: React.ReactNode;
    acciones: string;
    posicion: string;
}

const Actions: React.FC<{ id: string, solicitudId: string; onEdit: (id: string, solicitudId: string) => void }> = ({ id, solicitudId, onEdit }) => {
    const handleDelete = async () => {
        const result = await Swal.fire({
            title: '¿Estás seguro?',
            text: "Quiere eliminar este dignatario?",
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
                await axios.post(`/api/update-request-people`, { peopleId: id, solicitudId: solicitudId, cargo: 'dignatarios' });
                await axios.post('/api/update-people-cargo', { peopleId: id, cargo: "dignatario" });
                Swal.fire({
                    title: 'Eliminado',
                    text: 'El dignatario ha sido eliminada.',
                    icon: 'success',
                    timer: 4000,
                    showConfirmButton: false,
                });
                // Opcionalmente, puedes recargar la lista de solicitudes después de eliminar
                window.location.reload();
            } catch (error) {
                console.error('Error al eliminar este dignatario:', error);
                Swal.fire('Error', 'No se pudo eliminar este dignatario.', 'error');
            }
        }
    };

    return (
        <div className="flex gap-2">
            <EditIcon
                className="cursor-pointer"
                titleAccess="Editar"
                onClick={() => onEdit(id, solicitudId)} // Llamar a la función para abrir el modal
            />
            <DeleteIcon className="cursor-pointer" onClick={handleDelete} titleAccess="Eliminar" />
        </div>
    );
};

const FundacionDignatarios: React.FC = () => {
    const context = useContext(AppStateContext);
    const [selectedId, setSelectedId] = useState<string | null>(null);

    if (!context) {
        throw new Error('AppStateContext must be used within an AppStateProvider');
    }

    const [data, setData] = useState<DignatarioNominalData[]>([]);
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
        const posicionesRequeridas = ["Presidente", "Tesorero", "Secretario"];
        const posicionesEncontradas = new Set<string>();

        data.forEach((dignatario) => {
            posicionesRequeridas.forEach((posicionRequerida) => {
                if (dignatario.posicion.includes(posicionRequerida)) {
                    posicionesEncontradas.add(posicionRequerida);
                }
            });
        });

        const faltanPosiciones = posicionesRequeridas.filter(pos => !posicionesEncontradas.has(pos));

        if (faltanPosiciones.length > 0) {
            Swal.fire({
                position: "top-end",
                icon: "warning",
                title: `Faltan las siguientes posiciones: ${faltanPosiciones.join(", ")}`,
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
            setIsLoading(true);
            setStore((prevState) => ({
                ...prevState,
                miembros: true,
                currentPosition: 7,
            }));
        }
    };

    const openModal = (id?: string) => {
        setSelectedId(id || null);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedId(null);
        fetchData();
    };

    const fetchData = async () => {
        try {
            const response = await axios.get(`/api/get-people-id`, {
                params: { solicitudId: solicitudId }
            });

            const people = response.data;

            if (!people || people.length === 0) {
                setData([]);
                setTotalRecords(0);
                setTotalPages(1);
                setHasPrevPage(false);
                setHasNextPage(false);
                return;
            }

            // Filtrar solo las personas que tienen el campo `dignatario`
            const dignatarios = people.filter((persona: any) => persona.dignatario);

            // Calcular paginación solo con los registros filtrados
            const totalRecords = dignatarios.length;
            const totalPages = Math.ceil(totalRecords / rowsPerPage);

            const paginatedData = dignatarios.slice(
                (currentPage - 1) * rowsPerPage,
                currentPage * rowsPerPage
            );

            const formattedData = paginatedData.map((persona: any) => ({
                tipo: persona?.dignatario?.dignatarioTipo,
                nombre: persona.tipoPersona === 'Persona Jurídica'
                    ? (
                        <>
                            {persona.nombreApellido}
                            <br />
                            <span className="text-gray-400 text-sm">
                                <BusinessIcon style={{ verticalAlign: 'middle', marginRight: '5px' }} />
                                {persona.personaJuridica?.nombreJuridico || '---'}
                            </span>
                        </>
                    )
                    : persona.nombreApellido || '---',
                posicion: persona?.dignatario?.posiciones.map((posicion: any) => posicion.nombre).join(', '),
                Opciones: <Actions id={persona.id} solicitudId={store.solicitudId} onEdit={openModal} />,
            }));

            const solicitudes = await axios.get('/api/get-request-id', {
                params: { solicitudId }
            });

            const requestData = solicitudes.data;
            let formattedRequestData = [];
            if (requestData && requestData.dignatarios) {
                formattedRequestData = requestData.dignatarios
                    .filter((dignatario: any) =>
                        dignatario.servicio.trim().toLowerCase() === "dignatario nominal"
                    )
                    .map((dignatario: any) => ({
                        tipo: dignatario.servicio,
                        nombre: dignatario.nombre || '---',
                        posicion: dignatario.posiciones.map((posicion: any) => posicion.nombre).join(', '),
                        Opciones: <Actions id={dignatario.personId} solicitudId={store.solicitudId} onEdit={openModal} />,
                    }));
            }

            const combinedData: DignatarioNominalData[] = [...formattedData, ...formattedRequestData];

            setData(combinedData);
            setTotalRecords(combinedData.length);
            setTotalPages(Math.ceil(combinedData.length / rowsPerPage));
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
                Dignatarios de la Fundación
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
                            <h2 className="text-white text-xl">Dignatarios de la Fundación</h2>
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
                                src="https://www.youtube.com/embed/lO1kI9E7SiI"
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
                La Fundación podrá contar con la figura de Dignatarios, cuyas responsabilidades estarán establecidas en el Acta Fundacional o sus Reglamentos. Los dignatarios están desglosados en: Presidente, Secretario y Tesorero. A la vez, una misma persona puede figurar en los tres cargos”. Recuerda si deseas que la Firma te preste el servicio de Dignatario elija la opción de “Dignatario Nominal” en caso contrario elija la opción de “Dignatario Propio.
            </p>

            <div className="flex items-center w-full mt-5">
                <div className="w-full max-w-4xl">
                    <TableWithRequests
                        data={data}
                        rowsPerPage={rowsPerPage}
                        title="Dignatarios"
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
                            onClick={() => openModal()}
                        >
                            {isLoading ? (
                                <div className="flex items-center justify-center">
                                    <ClipLoader size={24} color="#ffffff" />
                                    <span className="ml-2">Cargando...</span>
                                </div>
                            ) : (
                                'Nuevo Dignatario'
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

            {isModalOpen && (
                <ModalDignatarios
                    onClose={closeModal}
                    id={selectedId}
                />
            )}
        </div>
    );
};

export default FundacionDignatarios;
