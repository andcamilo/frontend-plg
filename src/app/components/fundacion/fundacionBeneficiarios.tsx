import React, { useState, useContext, useEffect } from 'react';
import AppStateContext from '@context/fundacionContext'; // Cambiar al contexto de Fundaciones
import ClipLoader from 'react-spinners/ClipLoader';
import ModalBeneficiario from '@components/modalBeneficiarios'; // Cambiar el modal por el de Beneficiarios
import axios from 'axios';
import TableWithRequests from '@components/TableWithRequests';
import BusinessIcon from '@mui/icons-material/Business';
import Swal from 'sweetalert2';
import '@fortawesome/fontawesome-free/css/all.css';

interface BeneficiarioData {
    nombre: React.ReactNode;
    correo: string;
    accion: string;
}

const FundacionBeneficiarios: React.FC = () => {
    const context = useContext(AppStateContext);

    if (!context) {
        throw new Error('AppStateContext must be used within an AppStateProvider');
    }

    const [data, setData] = useState<BeneficiarioData[]>([]);
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

        if (data.length === 0) { // Verifica si no hay beneficiarios en la lista
            Swal.fire({
                position: "top-end",
                icon: "warning",
                title: "Debe agregar al menos (1) beneficiario.",
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
            return; // Detiene la ejecución si no hay beneficiarios
        }

        setIsLoading(true);
        setStore((prevState) => ({
            ...prevState,
            patrimonio: true,
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
            const response = await axios.get(`/api/get-people-id`, {
                params: {
                    solicitudId: solicitudId
                }
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

            // Filtrar solo las personas que tienen el campo `beneficiariosFundacion`
            const beneficiarios = people.filter((persona: any) => persona.beneficiariosFundacion);

            // Calcular paginación solo con los registros filtrados
            const totalRecords = beneficiarios.length;
            const totalPages = Math.ceil(totalRecords / rowsPerPage);

            const paginatedData = beneficiarios.slice(
                (currentPage - 1) * rowsPerPage,
                currentPage * rowsPerPage
            );

            const formattedData = paginatedData.map((persona: any) => ({
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
                correo: persona.email || '---',
                accion: '...',
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

    const [showModal, setShowModal] = useState(false); // Estado para manejar el modal

    const toggleModal = () => {
        setShowModal(!showModal); // Alterna el estado del modal
    };

    return (
        <div className="w-full h-full p-8 overflow-y-scroll scrollbar-thin bg-[#070707]">
            <h1 className="text-white text-4xl font-bold flex items-center">
                Beneficiarios de la Fundación
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
                            <h2 className="text-white text-xl">Beneficiarios de la Fundación</h2>
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
                                src="https://www.youtube.com/embed/CQEn4th6gbg"
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
                ¿Va a asignar beneficiarios a la fundación?
            </p>
            <p className="text-white mt-4 texto_justificado">
                * Se utilizan para designar las personas que recibirán beneficios o control de los bienes de la fundación.
            </p>

            <div className="flex items-center w-full mt-5">
                <div className="w-full max-w-4xl">
                    <TableWithRequests
                        data={data}
                        rowsPerPage={rowsPerPage}
                        title="Beneficiarios Asignados"
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
                                'Nuevo Beneficiario'
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
                && <ModalBeneficiario onClose={closeModal} />
            }

        </div>
    );
};

export default FundacionBeneficiarios;
