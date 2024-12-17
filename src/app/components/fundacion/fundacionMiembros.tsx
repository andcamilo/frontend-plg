import React, { useState, useContext, useEffect } from 'react';
import FundacionContext from '@context/fundacionContext';
import ClipLoader from 'react-spinners/ClipLoader';
import ModalMiembros from '@components/modalMiembros';
import axios from 'axios';
import TableWithRequests from '@components/TableWithRequests';
import BusinessIcon from '@mui/icons-material/Business';
import { getRequests } from '@api/request';
import Swal from 'sweetalert2';

// Define el tipo de datos que manejarás en el estado `data`
interface MiembroData {
    tipo: string;
    nombre: React.ReactNode;
    acciones: string;
}

const FundacionMiembros: React.FC = () => {
    const context = useContext(FundacionContext);

    if (!context) {
        throw new Error('FundacionContext must be used within a FundacionStateProvider');
    }

    const [data, setData] = useState<MiembroData[]>([]);
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
        if (data.length < 3) {
            Swal.fire({
                position: "top-end",
                icon: "warning",
                title: "Debe agregar al menos 3 miembros.",
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
            protector: true,
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

            // Filtrar solo las personas que tienen el campo `miembro`
            const miembros = people.filter((persona: any) => persona.miembro);

            // Calcular paginación solo con los registros filtrados
            const totalRecords = miembros.length;
            const totalPages = Math.ceil(totalRecords / rowsPerPage);

            const paginatedData = miembros.slice(
                (currentPage - 1) * rowsPerPage,
                currentPage * rowsPerPage
            );

            const formattedData = paginatedData.map((persona: any) => ({
                tipo: persona.miembro?.servicio || '---',
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
                Opciones: '...',
            }));

            const solicitudes = await axios.get('/api/get-request-id', {
                params: {
                    solicitudId
                },
            });

            const requestData = solicitudes.data;
            let formattedRequestData = [];
            if (requestData && requestData.miembros) {
                formattedRequestData = requestData.miembros
                    .filter((miembro: any) => miembro.servicio.trim().toLowerCase() === "miembro nominal")
                    .map((miembro: any) => ({
                        tipo: miembro.servicio,
                        nombre: miembro.nombre || '---',
                        Opciones: '...',
                    }));
            }

            const combinedData: MiembroData[] = [...formattedData, ...formattedRequestData];

            setData(combinedData);
            setTotalRecords(combinedData.length);
            setTotalPages(Math.ceil(combinedData.length / rowsPerPage));
            setHasPrevPage(currentPage > 1);
            setHasNextPage(currentPage < totalPages);

        } catch (error) {
            console.error('Error fetching people:', error);
        }
    };

    return (
        <div className="w-full h-full p-8 overflow-y-scroll scrollbar-thin bg-[#070707]">
            <h1 className="text-white text-4xl font-bold">Miembros de la Fundación</h1>
            <p className="text-white mt-4">
                * Los Miembros en una Fundación de interés privado son personas naturales o jurídicas que se encargan de las decisiones. En esta sección podrás asignar los Miembros que desees. Si requiere que la firma le preste el servicio de Miembro, Elija “Miembro Nominal”. Si usted va a asignar a los Miembros, indique “Miembro Propio”.
            </p>

            <div className="flex items-center w-full mt-5">
                <div className="w-full max-w-4xl">
                    <TableWithRequests
                        data={data}
                        rowsPerPage={rowsPerPage}
                        title="Miembros"
                        currentPage={currentPage}
                        totalPages={totalPages}
                        hasPrevPage={hasPrevPage}
                        hasNextPage={hasNextPage}
                        onPageChange={handlePageChange}
                    />
                </div>
            </div>

            <div className="flex space-x-2 mt-4">
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
                        'Nuevo Miembro'
                    )}
                </button>

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
                && <ModalMiembros onClose={closeModal} />
            }

        </div>
    );
};

export default FundacionMiembros;
