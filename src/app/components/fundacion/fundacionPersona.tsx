import React, { useState, useContext, useEffect } from 'react';
import AppStateContext from '@context/fundacionContext';
import ClipLoader from 'react-spinners/ClipLoader';
import ModalPersona from '@components/modalPersona';
import axios from 'axios';
import TableWithRequests from '@components/TableWithRequests';
import BusinessIcon from '@mui/icons-material/Business';
import Swal from 'sweetalert2';

const SociedadEmpresaPersona: React.FC = () => {
    const context = useContext(AppStateContext);

    if (!context) {
        throw new Error('AppStateContext must be used within an AppStateProvider');
    }

    const [data, setData] = useState([]);
    const [totalRecords, setTotalRecords] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [hasPrevPage, setHasPrevPage] = useState(false);
    const [hasNextPage, setHasNextPage] = useState(false);
    const rowsPerPage = 10;


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

        if (data.length < 1) {
            Swal.fire({
                position: "top-end",
                icon: "warning",
                title: "Debe agregar al menos una persona.",
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
            fundadores: true,
            currentPosition: 5,
        }));
    };

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => {
        setIsModalOpen(false);
        fetchData();
    };

    const fetchData = async () => {
        try {
            const response = await axios.get('/api/client', {
                params: {
                    limit: rowsPerPage,
                    page: currentPage,
                },
            });

            const { personas, totalRecords, pagination } = response.data;

            // Filtramos las personas que coincidan con el `solicitudId`
            const filteredData = personas.filter((persona: any) => persona.solicitudId === solicitudId);

            const formattedData = filteredData.map((persona: any) => ({
                tipo: persona.tipoPersona,
                nombre: persona.tipoPersona === 'Persona Jurídica'
                    ? (
                        <>
                            {persona.nombreApellido}
                            <br />
                            <span className="text-gray-400 text-sm">
                                <BusinessIcon style={{ verticalAlign: 'middle', marginRight: '5px' }} />
                                {persona.personaJuridica.nombreJuridico}
                            </span>
                        </>
                    )
                    : persona.nombreApellido, // Mostrar solo el nombre si no es Persona Jurídica
                Correo: persona.email,
                acciones: '...',
            }));

            setData(formattedData);
            setTotalRecords(filteredData.length); // Solo cuenta los registros filtrados
            setTotalPages(Math.ceil(filteredData.length / rowsPerPage));
            setHasPrevPage(pagination.hasPrevPage);
            setHasNextPage(pagination.hasNextPage);
        } catch (error) {
            console.error('Error fetching people:', error);
        }
    };


    return (
        <div className="w-full h-full p-8 overflow-y-scroll scrollbar-thin bg-[#070707]">
            <h1 className="text-white text-4xl font-bold">Integrantes de la Fundación</h1>
            <p className="text-white mt-4">
                Aquí necesitamos que incluyas la información previamente de todas las personas que van a estar involucradas en la Fundación, incluyendo a Fundadores, Dignatarios, Miembros del consejo, Apoderados, Protectores y Beneficiarios Finales. Esto es porque más adelante te vamos a pedir que los asignes en las posiciones que corresponde. Toma en cuenta que si vas a solicitar los servicios de Fundadores nominales (servicio donde la firma te proporciona a estas personas), no debes incluir estos nombres en esta sección. Únicamente debes agregar a los que estarías asignando tu. Debido a que nosotros no brindamos el servicio de accionistas ni testaferros, debes agregar como mínimo a los miembros del consejo y beneficiarios finales de la fundación.
            </p>

            <div className="flex items-center w-full mt-5">
                <div className="w-full max-w-4xl">
                    <TableWithRequests
                        data={data}
                        rowsPerPage={rowsPerPage}
                        title="Personas"
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
                        'Nueva Persona'
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

            <ModalPersona isOpen={isModalOpen} onClose={closeModal} />
        </div>
    );
};

export default SociedadEmpresaPersona;
