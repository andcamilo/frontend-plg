import React, { useEffect, useState } from 'react';
import axios from 'axios';
import get from 'lodash/get';
import TableWithPagination from './TableWithPagination';
import NewUserComponent from './newUserComponent';
import TableWithRequests from '@components/TableWithRequests';

const UsersStatistics: React.FC = () => {
  const [data, setData] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasPrevPage, setHasPrevPage] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [isNewUserFormVisible, setIsNewUserFormVisible] = useState(false); // State to control visibility
  const rowsPerPage = 5;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('/api/user', {
          params: {
            limit: rowsPerPage,
            page: currentPage,
          },
        });

        const usuarios = get(response, 'data.usuarios', []);
        const totalUsers = get(response, 'data.totalUsers', 0);
        const pagination = get(response, 'data.pagination', {});

        const formattedData = usuarios.map((user: any) => ({
          usuario: get(user, 'nombre', 'N/A'),
          email: get(user, 'email', 'N/A'),
          rol: get(user, 'rol', 'N/A'),
          status: get(user, 'status', 0) === 1 ? 'Activo' : 'Inactivo',
          actions: '...',
        }));

        setData(formattedData);
        setTotalUsers(totalUsers);
        setTotalPages(Math.ceil(totalUsers / rowsPerPage));
        setHasPrevPage(get(pagination, 'hasPrevPage', false));
        setHasNextPage(get(pagination, 'hasNextPage', false));
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchData();
  }, [currentPage]);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  const toggleNewUserForm = () => {
    setIsNewUserFormVisible(!isNewUserFormVisible);
  };

  return (
    <div className="flex flex-col p-8 w-full min-h-screen">
      <div className="flex items-center w-full">
        <div className="flex items-center w-full max-w-4xl">
          <div className="bg-component text-[#b8b8b8] py-4 px-10 rounded-lg w-full">
            <button
              className="bg-[#AE1B73] text-white px-4 py-2 rounded-lg"
              onClick={toggleNewUserForm}
            >
              Nuevo Usuario
            </button>
          </div>
        </div>
      </div>

      {isNewUserFormVisible && (
        <div className="mt-5 w-full max-w-4xl">
          <NewUserComponent />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full mt-4">
        <div className="lg:col-span-3">
          <TableWithRequests
            data={data}
            rowsPerPage={rowsPerPage}
            title="Usuarios"
            currentPage={currentPage}
            totalPages={totalPages}
            hasPrevPage={hasPrevPage}
            hasNextPage={hasNextPage}
            onPageChange={handlePageChange}
          />
        </div>
      </div>
    </div>
  );
};

export default UsersStatistics;
