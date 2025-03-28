import React, { useEffect, useState } from 'react';
import axios from 'axios';
import TableWithRequests from '@components/TableWithRequests';
import get from 'lodash/get';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import Swal from 'sweetalert2';
import Link from 'next/link';

const Actions: React.FC<{ id: string }> = ({ id }) => {
  const handleDelete = async () => {
    const result = await Swal.fire({
      title: '¿Estás seguro?',
      text: "Quiere eliminar este Cliente?",
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
          text: 'La solicitud ha sido eliminada.',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false,
          willClose: () => window.location.reload(),
        });
      } catch (error) {
        console.error('Error al eliminar la solicitud:', error);
        Swal.fire('Error', 'No se pudo eliminar la solicitud.', 'error');
      }
    }
  };

  return (
    <div className="flex gap-2">
      <Link href={`/dashboard/client/${id}`}>
        <EditIcon className="cursor-pointer" titleAccess="Editar" />
      </Link>
      <DeleteIcon className="cursor-pointer" onClick={handleDelete} titleAccess="Eliminar" />
    </div>
  );
};

const ClientsStatistics: React.FC = () => {
  const [data, setData] = useState<any[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasPrevPage, setHasPrevPage] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(false);
  const rowsPerPage = 10;

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        let allUsers: any[] = [];
        let page = 1;
        const limit = 10;

        // Acumula todos los registros de la API usando el `while`
        while (true) {
          const response = await axios.get('/api/user', {
            params: {
              limit,
              page,
            },
          });

          const usuarios = get(response, 'data.usuarios', []);
          allUsers = [...allUsers, ...usuarios];

          if (usuarios.length < limit) break; // Detiene el loop si no hay más registros
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

        // Filtra los usuarios con rol <= 17
        const filteredUsers = allUsers.filter(
          (user: any) => user.rol <= 17 || user.rol === "cliente"
        );

        // Aplica la paginación localmente
        const startIndex = (currentPage - 1) * rowsPerPage;
        const endIndex = startIndex + rowsPerPage;
        const paginatedData = filteredUsers.slice(startIndex, endIndex);

        // Formatea los datos para la tabla
        const formattedData = paginatedData.map((user: any) => ({
          cliente: (
            <div>
              <p className="font-bold">{get(user, 'nombre', 'N/A')}</p>
              <p className="text-sm" style={{ color: '#ff007f' }}>
                {get(user, 'email', 'N/A')}
              </p>
            </div>
          ),
          "Cedula/Pasaporte": user.cedulaPasaporte || "N/A",
          fecha: new Date(user.date._seconds * 1000).toLocaleDateString(),
          estatus: (
            <span
              className={`status-badge ${
                statusClasses[get(user, 'status', 'N/A')] || 'status-desconocido'
              }`}
            >
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
            <div className="bg-component text-[#b8b8b8] px-10 py-4 rounded-lg w-full flex flex-col justify-center items-center">
              <select className="py-3 px-5 pe-9 block w-full bg-[#1B1B29] text-white border-2 border-white rounded-lg text-sm">
                <option>Clientes</option>
                <option>Zoho - Clientes</option>
              </select>
            </div>
          </div>

          <div className="w-1/2">
            <div className="bg-component text-[#b8b8b8] px-10 py-4 rounded-lg w-full flex flex-col justify-center items-center">
              <h2 className="text-sm">Clientes</h2>
              <h3 className="text-2xl font-bold text-white">{totalRecords}</h3>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full">
          <div className="lg:col-span-3">
            <TableWithRequests
              data={data}
              rowsPerPage={rowsPerPage}
              title="Clientes"
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

export default ClientsStatistics;
