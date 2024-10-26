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
            // Llamada a la API de client
            const clientResponse = await axios.get('/api/client', {
                params: {
                    limit: rowsPerPage,
                    page: currentPage,
                },
            });

            const { personas, pagination: clientPagination } = clientResponse.data;

            // Llamada a la API de request usando `getRequests`
            const { solicitudes, pagination: requestPagination } = await getRequests(rowsPerPage, currentPage);
            console.log("Solicitudes desde API request:", solicitudes); 

            const filteredData = personas.filter((persona: any) =>
                persona.solicitudId === solicitudId && persona.director && persona.director.esActivo === true
            );
            
            const formattedClientData = filteredData.map((persona: any) => ({
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

            // Ahora buscamos en `solicitudes` el registro con el `solicitudId`
            const requestData = solicitudes.find((solicitud: any) => String(solicitud.id) === String(solicitudId));
            console.log("Datos de solicitud desde API request:", requestData, "Solicitud ID:", solicitudId);

            // Si encontramos el registro con `solicitudId` y tiene un campo `directores`
            let formattedRequestData = [];
            if (requestData && requestData.directores) {
                formattedRequestData = requestData.directores
                    .filter((director: any) => {
                        console.log("Director:", director); // Verifica si el director es nominal o propio
                        return director.servicio.includes("Nominal"); // Filtro para directores nominales
                    })
                    .map((director: any) => ({
                        tipo: director.servicio,
                        nombre: '---', 
                        acciones: '...',
                    }));
            }
            

            // Combinamos los datos de client con los Directores Nominales del request
            const combinedData: DirectorNominalData[] = [...formattedClientData, ...formattedRequestData];

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

            <ModalDirectores isOpen={isModalOpen} onClose={closeModal} />
        </div>
    );
};

export default SociedadEmpresaDirectores;
