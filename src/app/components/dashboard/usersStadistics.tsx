import React, { useEffect, useState } from 'react';
import axios from 'axios';
import TableWithRequests from '@components/TableWithRequests';
import get from 'lodash/get';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import Swal from 'sweetalert2';
import { useRouter } from 'next/navigation'
import Link from 'next/link';

const Actions: React.FC<{ id: string }> = ({ id }) => {
  const handleDelete = async () => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: "Quiere eliminar este Usuario?",
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
        await axios.delete(`/api/delete-user`, { params: { userId: id } });

        Swal.fire({
          title: 'Eliminado',
          text: 'El usuario ha sido eliminado.',
          icon: 'success',
          timer: 2000, // Tiempo en milisegundos (2 segundos)
          showConfirmButton: false, // Oculta el botón "OK"
          willClose: () => {
            // Recarga la página después de que se cierre la alerta
            window.location.reload();
          },
        });
      } catch (error) {
        console.error('Error al eliminar la solicitud:', error);
        Swal.fire('Error', 'No se pudo eliminar la solicitud.', 'error');
      }
    }
  };

  return (
    <div className="flex gap-2">
      <Link href={`dashboard/user?id=${id}`}>
        <EditIcon className="cursor-pointer" titleAccess="Editar" />
      </Link>
      <DeleteIcon className="cursor-pointer" onClick={handleDelete} titleAccess="Eliminar" />
    </div>
  );
};

const UsersStatistics: React.FC = () => {
  const [data, setData] = useState<any[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasPrevPage, setHasPrevPage] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(false);
  const rowsPerPage = 10;

  const router = useRouter()

  const handleClick = () => {
    router.push('/dashboard/user')
  }


  useEffect(() => {
    const fetchAllData = async () => {
      try {
        let allUsers: any[] = [];
        let page = 1;
        const limit = 10;

        // Obtiene todos los usuarios acumulando las páginas
        while (true) {
          const response = await axios.get('/api/user', {
            params: {
              limit,
              page,
            },
          });

          const usuarios = get(response, 'data.usuarios', []);
          allUsers = [...allUsers, ...usuarios];

          if (usuarios.length < limit) break;
          page++;
        }

        const statusLabels = {
          0: "Inactivo",
          1: "Activo",
        };

        const statusClasses = {
          0: "status-rechazada",
          1: "status-confirmando-pago",
        };

        const rolLabels = {
          99: "Super Administrador ",
          90: "Administrador ",
          80: "Auditor ",
          50: "Caja Chica",
          45: "Solicitante de gastos",
          40: "Abogado",
          35: "Asistente",
        };

        // Filtrar usuarios según el rol
        const filteredUsers = allUsers.filter((user: any) => user.rol > 17);

        // Calcula la paginación sobre los registros filtrados
        const startIndex = (currentPage - 1) * rowsPerPage;
        const endIndex = startIndex + rowsPerPage;
        const paginatedData = filteredUsers.slice(startIndex, endIndex);

        // Formatear los datos para mostrarlos en la tabla
        const formattedData = paginatedData.map((user: any) => ({
          usuario: (
            <div>
              <p className="font-bold">{get(user, 'nombre', 'N/A')}</p>
              <p className="text-sm" style={{ color: '#ff007f' }}>
                {get(user, 'email', 'N/A')}
              </p>
            </div>
          ),
          "Rol": rolLabels[get(user, 'rol', 'N/A')] || 'N/A',
          fecha: new Date(user.date._seconds * 1000).toLocaleDateString(),
          estatus: (
            <span className={`status-badge ${statusClasses[get(user, 'status', 'N/A')] || 'status-desconocido'}`}>
              {statusLabels[get(user, 'status', 'N/A')] || 'Desconocido'}
            </span>
          ),
          Opciones: <Actions id={user.id} />,
        }));

        setData(formattedData);
        setTotalRecords(filteredUsers.length);
        setTotalPages(Math.ceil(filteredUsers.length / rowsPerPage));
        setHasPrevPage(currentPage > 1);
        setHasNextPage(currentPage < Math.ceil(filteredUsers.length / rowsPerPage));
      } catch (error) {
        console.error('Error fetching people:', error);
      }
    };

    fetchAllData();
  }, [currentPage]);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  return (
    <>
      <div className="flex flex-col gap-4 p-8 w-full">
        <div className="flex flex-row gap-8 w-full">
          <div className="w-1/2">
            <button
              onClick={handleClick}
              className="bg-pink-600 text-white px-6 py-3 rounded hover:bg-pink-700"
            >
              Nuevo Usuario
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full">
          <div className="lg:col-span-3">
            <TableWithRequests
              data={data}
              rowsPerPage={rowsPerPage}
              title=""
              currentPage={currentPage}
              totalPages={totalPages}
              hasPrevPage={hasPrevPage}
              hasNextPage={hasNextPage}
              onPageChange={handlePageChange}
            />
          </div>
        </div>
      </div>
    </>
  );

};

export default UsersStatistics;
