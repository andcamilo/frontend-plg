import React, { useState, useContext, useEffect } from 'react';
import AppStateContext from '@context/sociedadesContext';
import ClipLoader from 'react-spinners/ClipLoader';
import ModalDirectores from '@components/modalDirectores';
import axios from 'axios';
import TableWithRequests from '@components/TableWithRequests';
import BusinessIcon from '@mui/icons-material/Business';
import { getRequests } from '@api/request';
import Swal from 'sweetalert2';

// Define el tipo de datos que manejarás en el estado `data`
interface DirectorNominalData {
    tipo: string;
    nombre: React.ReactNode; // Porque algunos campos contienen JSX
    acciones: string;
}

const SociedadEmpresaDirectores: React.FC = () => {
    const context = useContext(AppStateContext);

    if (!context) {
        throw new Error('AppStateContext must be used within an AppStateProvider');
    }

    const [data, setData] = useState<DirectorNominalData[]>([]); // Especificamos que `data` es un array de objetos `DirectorData`
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
        if (data.length < 3) {
            Swal.fire({
                position: "top-end",
                icon: "warning",
                title: "Debe agregar al menos 3 directores.",
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
    
            if (!people || people.length === 0) {
                setData([]);
                setTotalRecords(0);
                setTotalPages(1);
                setHasPrevPage(false);
                setHasNextPage(false);
                return;
            }
    
            // Filtrar solo las personas que tienen el campo `director`
            const directores = people.filter((persona: any) => persona.director);
    
            // Calcular paginación solo con los registros filtrados
            const totalRecords = directores.length;
            const totalPages = Math.ceil(totalRecords / rowsPerPage);
    
            const paginatedData = directores.slice(
                (currentPage - 1) * rowsPerPage,
                currentPage * rowsPerPage
            );
    
            const formattedData = paginatedData.map((persona: any) => ({
                tipo: persona.director?.servicio || '---',
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
    
            const solicitudes = await axios.get('/api/get-request-id', {
                params: {
                    solicitudId
                },
            });
    
            const requestData = solicitudes.data;
    
            let formattedRequestData = [];
            if (requestData && requestData.directores) {
                formattedRequestData = requestData.directores
                    .filter((director: any) => director.servicio.trim().toLowerCase() === "director nominal")
                    .map((director: any) => ({
                        tipo: director.servicio,
                        nombre: director.nombre || '---',
                        acciones: '...',
                    }));
            }
    
            const combinedData: DirectorNominalData[] = [...formattedData, ...formattedRequestData];
    
            setData(combinedData);
            setTotalRecords(combinedData.length);
            setTotalPages(totalPages);
            setHasPrevPage(currentPage > 1);
            setHasNextPage(currentPage < totalPages);
        } catch (error) {
            console.error('Error fetching people:', error);
        }
    };    

    return (
        <div className="w-full h-full p-8 overflow-y-scroll scrollbar-thin bg-[#070707]">
            <h1 className="text-white text-4xl font-bold">Directores de la Sociedad</h1>
            <p className="text-white mt-4">
                * Los directores de una sociedad en Panamá son individuos designados para formar parte de la junta directiva. Aquí podrás asignar los diferentes Directores de la misma, de la cual deben ser personas independientes, es decir, tiene que asignar al menos TRES (3) personas distintas como Director. Recuerde que si requiere que la firma le preste el servicio de Director, indique “Director Nominal”. Si usted va a asignar a los Directores, indique “Director Propio”. Podrás asignar a Directores como Dignatarios, o pueden ser distintos de igual forma.
            </p>

            <div className="flex items-center w-full mt-5">
                <div className="w-full max-w-4xl">
                    <TableWithRequests
                        data={data}
                        rowsPerPage={rowsPerPage}
                        title="Directores"
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
                        'Nuevo Director'
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
                && <ModalDirectores onClose={closeModal} />
            }
        </div>
    );
};

export default SociedadEmpresaDirectores;
