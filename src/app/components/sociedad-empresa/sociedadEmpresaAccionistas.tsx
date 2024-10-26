import React, { useState, useContext, useEffect } from 'react';
import AppStateContext from '@context/sociedadesContext';
import ClipLoader from 'react-spinners/ClipLoader';
import ModalAccionistas from '@components/modalAccionista'; 
import axios from 'axios';
import TableWithRequests from '@components/TableWithRequests';
import { getRequests } from '@api/request';
import BusinessIcon from '@mui/icons-material/Business';
import Swal from 'sweetalert2';

interface AccionistaData {
    numero: number;
    nombre: React.ReactNode;
    porcentajeAcciones: string;
    acciones: string;
}

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
            const clientResponse = await axios.get('/api/client', {
                params: {
                    limit: rowsPerPage,
                    page: currentPage,
                },
            });

            const { personas, pagination: clientPagination } = clientResponse.data;

            const { solicitudes, pagination: requestPagination } = await getRequests(rowsPerPage, currentPage);
            console.log("Solicitudes desde API request:", solicitudes);

            const filteredData = personas.filter((persona: any) =>
                persona.solicitudId === solicitudId && persona.accionista
            );

            const formattedClientData = filteredData.map((persona: any, index: number) => ({
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
                '% de Acciones': persona.accionista.porcentajeAcciones || '---',
                acciones: '...', 
            }));

            const combinedData: AccionistaData[] = [...formattedClientData];

            setData(combinedData);
            setTotalRecords(combinedData.length);
            setTotalPages(Math.ceil(combinedData.length / rowsPerPage));
            setHasPrevPage(clientPagination.hasPrevPage || requestPagination.hasPrevPage);
            setHasNextPage(clientPagination.hasNextPage || requestPagination.hasNextPage);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    return (
        <div className="w-full h-full p-8 overflow-y-scroll scrollbar-thin bg-[#070707]">
            <h1 className="text-white text-4xl font-bold">Accionistas de la Sociedad</h1>
            <p className="text-white mt-4">
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

            <ModalAccionistas isOpen={isModalOpen} onClose={closeModal} />
        </div>
    );
};

export default SociedadEmpresaAccionistas;
