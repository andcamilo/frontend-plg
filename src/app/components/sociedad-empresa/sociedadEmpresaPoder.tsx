import React, { useState, useContext, useEffect } from 'react';
import AppStateContext from '@context/sociedadesContext';
import ClipLoader from 'react-spinners/ClipLoader';
import ModalPoder from '@components/modalPoder'; // Cambiar el modal por el de poderes
import axios from 'axios';
import TableWithRequests from '@components/TableWithRequests';
import { getRequests } from '@api/request';
import BusinessIcon from '@mui/icons-material/Business';

interface PoderData {
    nombre: React.ReactNode;
    correo: string;
    accion: string;
}

const SociedadEmpresaPoder: React.FC = () => {
    const context = useContext(AppStateContext);

    if (!context) {
        throw new Error('AppStateContext must be used within an AppStateProvider');
    }

    const [data, setData] = useState<PoderData[]>([]);
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
        setIsLoading(true);
        setStore((prevState) => ({
            ...prevState,
            actividades: true,
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
    
            // Filtrar solo las personas que tienen el campo `poder`
            const personasConPoder = people.filter((persona: any) => persona.poder);
    
            // Calcular paginación solo con los registros filtrados
            const totalRecords = personasConPoder.length;
            const totalPages = Math.ceil(totalRecords / rowsPerPage);
    
            const paginatedData = personasConPoder.slice(
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
    
            setData(formattedData); // Asigna los registros filtrados y formateados
            setTotalRecords(totalRecords); // Total de registros filtrados
            setTotalPages(totalPages); // Páginas totales después del filtro
            setHasPrevPage(currentPage > 1); // Verifica si hay página anterior
            setHasNextPage(currentPage < totalPages); // Verifica si hay página siguiente
        } catch (error) {
            console.error('Error fetching people:', error);
        }
    };        

    return (
        <div className="w-full h-full p-8 overflow-y-scroll scrollbar-thin bg-[#070707]">
            <h1 className="text-white text-4xl font-bold">Poder de la Sociedad</h1>
            <p className="text-white mt-4">
                ¿Va a asignar poder general a una tercera persona?
                <br />
                * Se utiliza para personas que no están como representante legal o en la junta directiva, y donde usted requiere que tengan poder de representar a la sociedad, firmar, comprometerte, etc. tal como un representante legal. Si usted ya asignó a esta persona como Representante legal, NO es necesario incluir poder general.
            </p>

            <div className="flex items-center w-full mt-5">
                <div className="w-full max-w-4xl">
                    <TableWithRequests
                        data={data}
                        rowsPerPage={rowsPerPage}
                        title="Poderes Asignados"
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
                        'Nuevo Poder'
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
                && <ModalPoder onClose={closeModal} />
            }
        </div>
    );
};

export default SociedadEmpresaPoder;
