import React, { useState, useContext, useEffect } from 'react';
import AppStateContext from '@context/fundacionContext';
import ClipLoader from 'react-spinners/ClipLoader';
import ModalPersona from '@components/modalPersona';
import axios from 'axios';
import TableWithRequests from '@components/TableWithRequests';
import BusinessIcon from '@mui/icons-material/Business';
import Swal from 'sweetalert2';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const Actions: React.FC<{ id: string, solicitudId: string; onEdit: (id: string, solicitudId: string) => void }> = ({ id, solicitudId, onEdit }) => {
    const handleDelete = async () => {
        const result = await Swal.fire({
            title: '¿Estás seguro?',
            text: "Quiere eliminar esta persona?",
            icon: 'warning',
            showCancelButton: true,
            background: '#2c2c3e',
            color: '#fff',
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí, eliminar',
        });

        if (result.isConfirmed) {
            try { 
                await axios.delete(`/api/delete-people`, { params: { peopleId: id } });
                await axios.post(`/api/update-request-people`, { peopleId: id, solicitudId: solicitudId });
                Swal.fire({
                    title: 'Eliminado',
                    text: 'La persona ha sido eliminada.',
                    icon: 'success',
                    timer: 4000,
                    showConfirmButton: false,
                });
                // Opcionalmente, puedes recargar la lista de solicitudes después de eliminar
                window.location.reload();
            } catch (error) {
                console.error('Error al eliminar esta persona:', error);
                Swal.fire('Error', 'No se pudo eliminar esta persona.', 'error');
            }
        }
    };

    return (
        <div className="flex gap-2">
            <EditIcon
                className="cursor-pointer"
                titleAccess="Editar"
                onClick={() => onEdit(id, solicitudId)}
            />
            <DeleteIcon className="cursor-pointer" onClick={handleDelete} titleAccess="Eliminar" />
        </div>
    );
};

const SociedadEmpresaPersona: React.FC = () => {
    const context = useContext(AppStateContext);
    const [selectedId, setSelectedId] = useState<string | null>(null);

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

    const openModal = (id?: string) => {
        setSelectedId(id || null); 
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedId(null); 
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
    
            // Calcular paginación
            const totalRecords = people.length;
            const totalPages = Math.ceil(totalRecords / rowsPerPage);
    
            const paginatedData = people.slice(
                (currentPage - 1) * rowsPerPage,
                currentPage * rowsPerPage
            );
    
            // Formatear los datos con la lógica para mostrar el nombre
            const formattedData = paginatedData.map((persona: any) => ({
                tipo: persona.tipoPersona,
                nombre: persona.tipoPersona === 'Persona Jurídica'
                    ? (
                        <>
                            {persona.nombreApellido}
                            <br />
                            <span className="text-gray-400 text-sm">
                                <BusinessIcon style={{ verticalAlign: 'middle', marginRight: '5px' }} />
                                {persona.personaJuridica?.nombreJuridico || 'N/A'}
                            </span>
                        </>
                    )
                    : persona.nombreApellido, // Mostrar solo el nombre si no es Persona Jurídica
                Correo: persona.email,
                Opciones: <Actions id={persona.id} solicitudId={store.solicitudId} onEdit={openModal} />,
            }));
    
            setData(formattedData); // Aquí se asignan los registros formateados
            setTotalRecords(totalRecords); // Establece el número total de registros
            setTotalPages(totalPages); // Calcula las páginas totales
            setHasPrevPage(currentPage > 1); // Verifica si hay página anterior
            setHasNextPage(currentPage < totalPages); // Verifica si hay página siguiente
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
                    onClick={() => openModal()}
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
            
            {isModalOpen && (
                <ModalPersona
                    onClose={closeModal}
                    id={selectedId} 
                />
            )}
        </div>
    );
};

export default SociedadEmpresaPersona;
