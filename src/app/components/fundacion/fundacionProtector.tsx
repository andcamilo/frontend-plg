import React, { useState, useContext, useEffect } from 'react';
import AppStateContext from '@context/fundacionContext';
import ClipLoader from 'react-spinners/ClipLoader';
import ModalProtector from '@components/modalProtector'; // Cambiar el modal por el de protector
import axios from 'axios';
import TableWithRequests from '@components/TableWithRequests';
import BusinessIcon from '@mui/icons-material/Business';

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
    const [addProtector, setAddProtector] = useState<string>('no'); // Controla la opción de sí/no
    const rowsPerPage = 3;

    const { store, setStore } = context;
    const solicitudId = store.solicitudId; 

    useEffect(() => {
        if (addProtector === 'si') {
            fetchData();
        }
    }, [currentPage, solicitudId, addProtector]);

    const handlePageChange = (newPage: number) => {
        setCurrentPage(newPage);
    };

    const [isLoading, setIsLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleContinue = () => {
        setIsLoading(true);
        setStore((prevState) => ({
            ...prevState,
            beneficiarios: true,
            currentPosition: 9,
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

            // Filtramos los protectores de personas
            const filteredData = personas.filter((persona: any) =>
                persona.solicitudId === solicitudId && persona.protector
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
                correo: persona.email || '---',
                cargo: persona.protector.cargo || '---',
                accion: '...',
            }));

            const combinedData: ProtectorData[] = [...formattedClientData];

            setData(combinedData);
            setTotalRecords(combinedData.length);
            setTotalPages(Math.ceil(combinedData.length / rowsPerPage));
            setHasPrevPage(clientPagination.hasPrevPage);
            setHasNextPage(clientPagination.hasNextPage);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const handleOptionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setAddProtector(e.target.value);
    };

    return (
        <div className="w-full h-full p-8 overflow-y-scroll scrollbar-thin bg-[#070707]">
            <h1 className="text-white text-4xl font-bold">Protector de la Fundación</h1>
            <p className="text-white mt-4">
                El protector (persona jurídica o individual) tiene deberes de supervisión y puede ser designado por el fundador o el consejo de la fundación, y puede ser una persona distinta al Fundador, beneficiarios y el Consejo Fundacional.
            </p>

            <div className="mt-4">
                <label className="text-white">¿Desea agregar la Figura de Protector de la Fundación?</label>
                <select
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

                        {/* <button
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
                                'Asignar Protector Sustituto'
                            )}
                        </button> */}
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

            <ModalProtector isOpen={isModalOpen} onClose={closeModal} />
        </div>
    );
};

export default ProtectorFundacion;