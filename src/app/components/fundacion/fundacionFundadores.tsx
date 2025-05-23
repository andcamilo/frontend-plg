import React, { useState, useContext, useEffect } from 'react';
import FundacionContext from '@context/fundacionContext'; // Cambiar al contexto de Fundación
import ClipLoader from 'react-spinners/ClipLoader';
import ModalFundadores from '@components/modalFundadores'; // Cambiar el modal a fundadores si existe
import axios from 'axios';
import TableWithRequests from '@components/TableWithRequests';
import BusinessIcon from '@mui/icons-material/Business';
import Swal from 'sweetalert2';
import '@fortawesome/fontawesome-free/css/all.css';
import DeleteIcon from '@mui/icons-material/Delete';
import { FaPlay } from 'react-icons/fa';

// Define el tipo de datos que manejarás en el estado `data`
interface FundadorData {
    tipo: string;
    nombre: React.ReactNode;
    acciones: string;
}

const Actions: React.FC<{ id: string, solicitudId: string; }> = ({ id, solicitudId }) => {
    const handleDelete = async () => {
        const result = await Swal.fire({
            title: '¿Estás seguro?',
            text: "Quiere eliminar este fundador?",
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
                await axios.post(`/api/update-request-people`, { peopleId: id, solicitudId: solicitudId, cargo: "fundadores" });
                await axios.post('/api/update-people-cargo', { peopleId: id, cargo: "fundador" });
                Swal.fire({
                    title: 'Eliminado',
                    text: 'El fundador ha sido eliminado.',
                    icon: 'success',
                    timer: 4000,
                    showConfirmButton: false,
                });
                // Opcionalmente, puedes recargar la lista de solicitudes después de eliminar
                window.location.reload();
            } catch (error) {
                console.error('Error al eliminar este fundador:', error);
                Swal.fire('Error', 'No se pudo eliminar este fundador.', 'error');
            }
        }
    };

    return (
        <div className="flex gap-2">
            <DeleteIcon className="cursor-pointer" onClick={handleDelete} titleAccess="Eliminar" />
        </div>
    );
};

const FundacionFundadores: React.FC = () => {
    const context = useContext(FundacionContext);

    if (!context) {
        throw new Error('FundacionContext must be used within a FundacionStateProvider');
    }

    const [data, setData] = useState<FundadorData[]>([]); // Cambiar DirectorData a FundadorData
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
        if (data.length === 0) { // Verifica si no hay fundadores en la lista
            Swal.fire({
                position: "top-end",
                icon: "warning",
                title: "Debe agregar al menos (1) fundador.",
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
            const response = await axios.get(`/api/get-people-id`, {
                params: {
                    solicitudId: solicitudId
                }
            });

            const people = response.data;
            console.log("🚀 ~ fetchData ~ people:", people)

            if (!people || people.length === 0) {
                setData([]);
                setTotalRecords(0);
                setTotalPages(1);
                setHasPrevPage(false);
                setHasNextPage(false);
                return;
            }

            // Filtrar solo las personas que tienen el campo fundador
            const fundadores = people.filter((persona: any) => persona.fundador);

            // Calcular paginación solo con los registros filtrados
            const totalRecords = fundadores.length;
            const totalPages = Math.ceil(totalRecords / rowsPerPage);

            const paginatedData = fundadores.slice(
                (currentPage - 1) * rowsPerPage,
                currentPage * rowsPerPage
            );

            const formattedData = paginatedData.map((persona: any) => ({
                tipo: persona.fundador?.servicio || '---', // Cambiar a fundador
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
                    Opciones: <Actions id={persona.id} solicitudId={store.solicitudId} />,
            }));

            // Lógica para combinar los datos adicionales de fundadores nominales
            const solicitudes = await axios.get('/api/get-request-id', {
                params: { solicitudId }
            });

            const requestData = solicitudes.data;
            let formattedRequestData = [];
            if (requestData && requestData.fundadores) {
                formattedRequestData = requestData.fundadores
                    .filter((fundador: any) =>
                        fundador.servicio.trim().toLowerCase() === "fundador nominal"
                    )
                    .map((fundador: any) => ({
                        tipo: fundador.servicio,
                        nombre: fundador.nombre || '---', // Mostrar el nombre del fundador
                        Opciones: <Actions id={fundador.personId} solicitudId={store.solicitudId} />,
                    }));
            }

            const combinedData: FundadorData[] = [...formattedData, ...formattedRequestData];
            console.log("🚀 ~ fetchData ~ combinedData:", combinedData)
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
            <h1 className="text-white text-3xl font-bold flex items-center">
                Fundadores de la Fundación
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
                            <h2 className="text-white text-xl">Fundadores de la Fundación</h2>
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
                                src="https://www.youtube.com/embed/-xJbl1QCxns"
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
                * El Fundador o Fundadores en una Fundación de interés privado en Panamá son personas naturales o jurídicas que establecen el acto de fundar o iniciar dicha Fundación. En esta sección podrás asignar al Fundador o Fundadores que desees. Recuerda que si requiere que la firma le preste el servicio de Fundador, Elija “Fundador Nominal”. Si usted va a asignar a los Fundadores, indique “Fundador Propio”.
            </p>

            <div className="flex items-center w-full mt-5">
                <div className="w-full max-w-4xl">
                    <TableWithRequests
                        data={data}
                        rowsPerPage={rowsPerPage}
                        title="Fundadores"
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
                                'Nuevo Fundador'
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
            {isModalOpen &&
                <ModalFundadores onClose={closeModal} />
            }

        </div>
    );
};

export default FundacionFundadores;
