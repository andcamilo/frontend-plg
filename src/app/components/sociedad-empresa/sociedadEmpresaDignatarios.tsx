import React, { useState, useContext, useEffect } from 'react';
import AppStateContext from '@context/sociedadesContext';
import ClipLoader from 'react-spinners/ClipLoader';
import ModalDignatarios from '@components/modalDignatarios';
import axios from 'axios';
import TableWithRequests from '@components/TableWithRequests';
import BusinessIcon from '@mui/icons-material/Business';
import { getRequests } from '@api/request';
import Swal from 'sweetalert2';

interface DignatarioNominalData {
    tipo: string;
    nombre: React.ReactNode;
    acciones: string;
    posicion: string;
}


const SociedadEmpresaDignatarios: React.FC = () => {
    const context = useContext(AppStateContext);

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
                accionistas: true,
                currentPosition: 7,
            }));
        }
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
    
            // Filtramos los dignatarios de personas (API client)
            const filteredData = personas.filter((persona: any) =>
                persona.solicitudId === solicitudId && persona.dignatario && persona.dignatario.dignatario === true
            );
    
            const formattedClientData = filteredData.map((persona: any) => ({
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
                posicion: persona.dignatario.posiciones.map((posicion: any) => posicion.nombre).join(', '),
                acciones: '...',
            }));            
    
            // Ahora buscamos en `solicitudes` el registro con el `solicitudId`
            const requestData = solicitudes.find((solicitud: any) => String(solicitud.id) === String(solicitudId));
            console.log("Datos de solicitud desde API request:", requestData, "Solicitud ID:", solicitudId);
    
            let formattedRequestData = [];
            if (requestData && requestData.dignatarios) {
                console.log("Dignatarios encontrados en requestData:", requestData.dignatarios);
    
                // Removemos la verificación de `esDignatario` y filtramos solo por servicio.
                formattedRequestData = requestData.dignatarios
                    .filter((dignatario: any) => {
                        console.log("Dignatario:", dignatario); // Verifica si el dignatario es nominal
                        return dignatario.servicio.trim().toLowerCase() === "dignatario nominal";
                    })
                    .map((dignatario: any) => ({
                        nombre: dignatario.servicio, 
                        posicion: dignatario.posiciones.map((posicion: any) => posicion.nombre).join(', '),
                        acciones: '...', 
                    }));
            }
    
            const combinedData: DignatarioNominalData[] = [...formattedClientData, ...formattedRequestData];
    
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
            <h1 className="text-white text-4xl font-bold">Dignatarios de la Sociedad</h1>
            <p className="text-white mt-4">
                Aquí podrás asignar los diferentes dignatarios de la nueva sociedad / empresa.<br></br>
                Recuerde que puede escoger un solo director en más de una posición como dignatario.
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
                        'Nuevo Dignatario'
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

            <ModalDignatarios isOpen={isModalOpen} onClose={closeModal} />
        </div>
    );
};

export default SociedadEmpresaDignatarios;
