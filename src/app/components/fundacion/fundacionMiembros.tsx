import React, { useState, useContext, useEffect } from 'react';
import FundacionContext from '@context/fundacionContext'; 
import ClipLoader from 'react-spinners/ClipLoader';
import ModalMiembros from '@components/modalMiembros'; // Cambiar el modal a miembros
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
                persona.solicitudId === solicitudId && persona.miembro && persona.miembro.esActivo === true
            );

            const formattedClientData = filteredData.map((persona: any) => ({
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
                acciones: '...',
            }));

            const requestData = solicitudes.find((solicitud: any) => String(solicitud.id) === String(solicitudId));
            console.log("Datos de solicitud desde API request:", requestData, "Solicitud ID:", solicitudId);

            let formattedRequestData = [];
            if (requestData && requestData.miembros) {
                formattedRequestData = requestData.miembros
                    .filter((miembro: any) => {
                        console.log("Miembro:", miembro); 
                        return miembro.servicio.trim().toLowerCase() === "miembro nominal"; 
                    })
                    .map((miembro: any) => ({
                        tipo: miembro.servicio,
                        nombre: miembro.nombre || '---', 
                        acciones: '...',
                    }));
            }

            const combinedData: MiembroData[] = [...formattedClientData, ...formattedRequestData];

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
