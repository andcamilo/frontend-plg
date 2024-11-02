import React, { useState, useContext, useEffect } from 'react';
import FundacionContext from '@context/fundacionContext'; // Cambiar al contexto de Fundación
import ClipLoader from 'react-spinners/ClipLoader';
import ModalFundadores from '@components/modalFundadores'; // Cambiar el modal a fundadores si existe
import axios from 'axios';
import TableWithRequests from '@components/TableWithRequests';
import BusinessIcon from '@mui/icons-material/Business';
import Swal from 'sweetalert2';

// Define el tipo de datos que manejarás en el estado `data`
interface FundadorData {
    tipo: string;
    nombre: React.ReactNode;
    acciones: string;
}

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

        // Si ya hay al menos un beneficiario, procede con la lógica de continuar
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
                acciones: '...',
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
                        acciones: '...',
                    }));
            }
    
            const combinedData: FundadorData[] = [...formattedData, ...formattedRequestData];
    
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
            <h1 className="text-white text-4xl font-bold">Fundadores de la Fundación</h1>
            <p className="text-white mt-4">
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
