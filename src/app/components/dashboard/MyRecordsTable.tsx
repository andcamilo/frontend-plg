import React, { useState, useEffect } from 'react';
import TableWithPagination from '../TableWithPagination';
import { useRouter } from 'next/navigation';
import { auth } from '@configuration/firebase';
import axios from 'axios';
import { onAuthStateChanged } from 'firebase/auth';

const rowsPerPage = 10;

const MyRecordsTable: React.FC = () => {
  const [userEmail, setUserEmail] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserEmail(user.email || '');
      } else {
        setUserEmail('');
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchRecords = async () => {
      if (!userEmail) {
        console.log('No user email found');
        return;
      }
      setLoading(true);
      try {
        const response = await axios.get('/api/list-records', {
          params: { lawyer: userEmail },
        });
        console.log('API response:', response.data);
        setRecords(response.data.records || []);
      } catch (error) {
        console.error('Error fetching records:', error);
        setRecords([]);
      } finally {
        setLoading(false);
      }
    };
    fetchRecords();
  }, [userEmail]);

  const totalPages = Math.ceil(records.length / rowsPerPage);
  const hasPrevPage = currentPage > 1;
  const hasNextPage = currentPage < totalPages;
  const paginatedData = records.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage).map(row => ({
    Tipo: row.tipoServicio || '',
    Fecha: row.createdAt?._seconds ? new Date(row.createdAt._seconds * 1000).toLocaleDateString() : '',
    Email: row.email || '',
    Estatus: row.status || '',
    Expediente: row.id  || '',
    Abogado: row.lawyer || '',
    Opciones: (
      <button
        className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700 transition-colors"
        onClick={() => router.push(`/dashboard/record/${row.id || ''}`)}
      >
        Actualizar
      </button>
    )
  }));

  if (loading) {
    return <div className="text-center py-8 text-white">Cargando expedientes...</div>;
  }

  return (
    <TableWithPagination
      data={paginatedData}
      rowsPerPage={rowsPerPage}
      title="Mis expedientes"
      currentPage={currentPage}
      totalPages={totalPages}
      hasPrevPage={hasPrevPage}
      hasNextPage={hasNextPage}
      onPageChange={setCurrentPage}
    />
  );
};

export default MyRecordsTable; 