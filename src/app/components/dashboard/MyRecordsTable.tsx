import React, { useState, useEffect } from 'react';
import TableWithPagination from '../TableWithPagination';
import { useRouter } from 'next/navigation';
import { auth } from '@configuration/firebase';
import axios from 'axios';
import { onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, query, where, getDocs, DocumentData } from 'firebase/firestore';

const rowsPerPage = 10;

const MyRecordsTable: React.FC = () => {
  const [userEmail, setUserEmail] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState<DocumentData | null>(null);
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

  useEffect(() => {
    if (!userEmail) return;
    fetchUserByEmail(userEmail).then(user => setUserData(user));
  }, [userEmail]);

  const totalPages = Math.ceil(records.length / rowsPerPage);
  const hasPrevPage = currentPage > 1;
  const hasNextPage = currentPage < totalPages;
  const paginatedData = records.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage).map(row => ({
    id: row.id || '',
    Tipo: row.tipoServicio || '',
    Fecha: row.createdAt?._seconds ? new Date(row.createdAt._seconds * 1000).toLocaleDateString() : '',
    Email: row.email || '',
    Expediente: row.solicitudId || row.solicitud || '',
    Abogado: row.lawyer || '',
    Opciones: (
      <div className="flex gap-2">
        <button
          className="bg-green-600 text-white px-4 py-1 rounded hover:bg-green-700 transition-colors"
          onClick={() => router.push(`/dashboard/see-record/${row.id || ''}`)}
        >
          Ver
        </button>
        <button
          className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700 transition-colors"
          onClick={() => router.push(`/dashboard/record/${row.id || ''}`)}
        >
          Actualizar
        </button>
      </div>
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

async function fetchUserByEmail(email: string) {
  console.log("fetchUserByEmail input email:", email);
  const db = getFirestore();
  const usuariosRef = collection(db, 'usuarios');
  const q = query(usuariosRef, where('email', '==', email));
  const querySnapshot = await getDocs(q);
  console.log("🚀 ~ fetchUserByEmail ~ querySnapshot:", querySnapshot)
  if (!querySnapshot.empty) {
    return querySnapshot.docs[0].data();
  }
  return null;
}

export default MyRecordsTable; 