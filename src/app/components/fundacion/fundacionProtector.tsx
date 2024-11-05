import React, { useState, useContext, useEffect } from 'react';
import AppStateContext from '@context/fundacionContext';
import ClipLoader from 'react-spinners/ClipLoader';
import ModalProtector from '@components/modalProtector';
import axios from 'axios';
import TableWithRequests from '@components/TableWithRequests';
import BusinessIcon from '@mui/icons-material/Business';
import { useFetchSolicitud } from '@utils/fetchCurrentRequest';
import get from 'lodash/get';

interface ProtectorData {
    nombre: React.ReactNode;
    correo: string;
    cargo: string;
}

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

    return (
        <div className="w-full h-full p-8 overflow-y-scroll scrollbar-thin bg-[#070707]">
            <h1 className="text-white text-4xl font-bold">Protector de la Fundación</h1>
            <p className="text-white mt-4">
                El protector (persona jurídica o individual) tiene deberes de supervisión y puede ser designado por el fundador o el consejo de la fundación, y puede ser una persona distinta al Fundador, beneficiarios y el Consejo Fundacional.
            </p>

            <div className="mt-4">
                <label className="text-white">¿Desea agregar la Figura de Protector de la Fundación?</label>
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
                    </div>
                </>
            )}

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

            {isModalOpen && <ModalProtector onClose={() => closeModal(true)} />}
        </div>
    );
};

export default ProtectorFundacion;
