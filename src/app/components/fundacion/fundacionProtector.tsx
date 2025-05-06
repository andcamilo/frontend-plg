import React, { useState, useContext, useEffect } from 'react';
import AppStateContext from '@context/fundacionContext';
import ClipLoader from 'react-spinners/ClipLoader';
import ModalProtector from '@components/modalProtector';
import axios from 'axios';
import TableWithRequests from '@components/TableWithRequests';
import BusinessIcon from '@mui/icons-material/Business';
import { useFetchSolicitud } from '@utils/fetchCurrentRequest';
import get from 'lodash/get';
import '@fortawesome/fontawesome-free/css/all.css';
import DeleteIcon from '@mui/icons-material/Delete';
import Swal from 'sweetalert2';
import { FaPlay } from 'react-icons/fa';

interface ProtectorData {
    nombre: React.ReactNode;
    correo: string;
    cargo: string;
}

const Actions: React.FC<{ id: string, solicitudId: string; }> = ({ id, solicitudId }) => {
    const handleDelete = async () => {
        const result = await Swal.fire({
            title: '¿Estás seguro?',
            text: "Quiere eliminar este protector?",
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
                await axios.post(`/api/update-request-people`, { peopleId: id, solicitudId: solicitudId, cargo: "protectores" });
                await axios.post('/api/update-people-cargo', { peopleId: id, cargo: "protector" });
                Swal.fire({
                    title: 'Eliminado',
                    text: 'El protector ha sido eliminado.',
                    icon: 'success',
                    timer: 4000,
                    showConfirmButton: false,
                });
                // Opcionalmente, puedes recargar la lista de solicitudes después de eliminar
                window.location.reload();
            } catch (error) {
                console.error('Error al eliminar este protector:', error);
                Swal.fire('Error', 'No se pudo eliminar este protector.', 'error');
            }
        }
    };

    return (
        <div className="flex gap-2">
            <DeleteIcon className="cursor-pointer" onClick={handleDelete} titleAccess="Eliminar" />
        </div>
    );
};

const ProtectorFundacion: React.FC = () => {
    const context = useContext(AppStateContext);

    if (!context) {
        throw new Error('AppStateContext must be used within an AppStateProvider');
    }

    const [data, setData] = useState<ProtectorData[]>([]);
    const [totalRecords, setTotalRecords] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [hasPrevPage, setHasPrevPage] = useState(false);
    const [hasNextPage, setHasNextPage] = useState(false);
    const [addProtector, setAddProtector] = useState<string>('no');
    const rowsPerPage = 3;

    const { store, setStore } = context;
    const solicitudId = store.solicitudId;

    const [isLoading, setIsLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        fetchData();
    }, [currentPage, solicitudId, addProtector]);

    const handlePageChange = (newPage: number) => {
        setCurrentPage(newPage);
    };

    const handleContinue = () => {
        setIsLoading(true);
        setStore((prevState) => ({
            ...prevState,
            beneficiarios: true,
            currentPosition: 9,
        }));
    };

    const openModal = () => setIsModalOpen(true);
    const closeModal = (refresh = false) => {
        setIsModalOpen(false);
        if (refresh) fetchData(); // Refresh data after adding a protector
    };

    const fetchData = async () => {
        try {
            const response = await axios.get(`/api/get-people-id`, {
                params: {
                    solicitudId: solicitudId,
                },
            });

            // Filtrar solo las personas que tienen el campo `protector`
            const people = response.data.filter((persona: any) => persona.protector);

            if (!people || people.length === 0) {
                setData([]);
                setTotalRecords(0);
                setTotalPages(1);
                setHasPrevPage(false);
                setHasNextPage(false);
                return;
            }

            const totalRecords = people.length;
            const totalPages = Math.ceil(totalRecords / rowsPerPage);

            const paginatedData = people.slice(
                (currentPage - 1) * rowsPerPage,
                currentPage * rowsPerPage
            );

            const formattedData = paginatedData.map((persona: any) => ({
                nombre: persona.tipoPersona === 'Persona Jurídica' ? (
                    <>
                        {persona.nombreApellido}
                        <br />
                        <span className="text-gray-400 text-sm">
                            <BusinessIcon style={{ verticalAlign: 'middle', marginRight: '5px' }} />
                            {persona.personaJuridica?.nombreJuridico || '---'}
                        </span>
                    </>
                ) : (
                    persona.nombreApellido || '---'
                ),
                correo: persona.email || '---',
                cargo: persona.protector.cargo || '---', // Ahora no es necesario verificar porque solo hay personas con `protector`
                Opciones: <Actions id={persona.id} solicitudId={store.solicitudId} />,
            }));

            setData(formattedData);
            setTotalRecords(totalRecords);
            setTotalPages(totalPages);
            setHasPrevPage(currentPage > 1);
            setHasNextPage(currentPage < totalPages);
        } catch (error) {
            console.error('Error fetching people:', error);
        }
    };

    const handleOptionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        setAddProtector(value);

        // Llamar a fetchData inmediatamente si se selecciona "si"
        if (value === 'si') {
            fetchData();
        }
    };

    const { fetchSolicitud } = useFetchSolicitud(store.solicitudId);
    useEffect(() => {
        if (store.solicitudId) {
            fetchSolicitud(); // Llama a la API para obtener la solicitud
        }
    }, [store.solicitudId]);

    useEffect(() => {
        if (store.request) {
            const protector = get(store.request, 'protectores', '');

            // Actualiza `addProtector` a "si" o "no" según la existencia de protectores
            setAddProtector(protector ? 'si' : 'no');
        }
    }, [store.request]);

    const [showModal, setShowModal] = useState(false); // Estado para manejar el modal

    const toggleModal = () => {
        setShowModal(!showModal); // Alterna el estado del modal
    };

    return (
        <div className="w-full h-full p-8 overflow-y-scroll scrollbar-thin bg-[#070707]">
            <h1 className="text-white text-3xl font-bold flex items-center">
                Protector de la Fundación
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
                            <h2 className="text-white text-xl">Protector de la Fundación</h2>
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
                                src="https://www.youtube.com/embed/6QSnoFsEljs"
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
                El protector (persona jurídica o individual) tiene deberes de supervisión y puede ser designado por el fundador o el consejo de la fundación, y puede ser una persona distinta al Fundador, beneficiarios y el Consejo Fundacional.
            </p>

            <div className="mt-4">
                <label className="text-white texto_justificado">¿Desea agregar la Figura de Protector de la Fundación?</label>
                <select
                    name='protector'
                    value={addProtector}
                    onChange={handleOptionChange}
                    className="w-full p-2 border border-gray-700 rounded bg-gray-800 text-white mt-2"
                >
                    <option value="si">Sí</option>
                    <option value="no">No</option>
                </select>
            </div>

            {addProtector === 'si' && (
                <>
                    <div className="flex items-center w-full mt-5">
                        <div className="w-full max-w-4xl">
                            <TableWithRequests
                                data={data}
                                rowsPerPage={rowsPerPage}
                                title="Protectores"
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
                                        'Nuevo Protector'
                                    )}
                                </button>
                            </>
                        )}
                    </div>
                </>
            )}

            {(store.request.status < 10 || (store.request.status >= 10 && store.rol > 20)) && (
                <>
                    <button
                        className="bg-profile text-white py-2 px-4 rounded-lg inline-block mt-4"
                        type="button"
                        onClick={handleContinue}
                    >
                        {isLoading ? (
                            <div className="flex items-center justify-center">
                                <ClipLoader size={24} color="#ffffff" />
                                <span className="ml-2">Cargando...</span>
                            </div>
                        ) : (
                            'Guardar y continuar'
                        )}
                    </button>
                </>
            )}

            {store.request.status >= 10 && (
                <>
                    <button
                        className="bg-profile text-white w-full py-3 rounded-lg mt-6"
                        type="button"
                        onClick={() => {
                            setStore((prevState) => ({
                                ...prevState,
                                currentPosition: 9,
                            }));
                        }}
                    >
                        Continuar
                    </button>
                </>
            )}

            {isModalOpen && <ModalProtector onClose={() => closeModal(true)} />}
        </div>
    );
};

export default ProtectorFundacion;
