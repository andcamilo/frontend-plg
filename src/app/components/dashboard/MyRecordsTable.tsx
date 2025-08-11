import React, { useState, useEffect } from 'react';
import TableWithPagination from '../TableWithPagination';
import { useRouter } from 'next/navigation';
import { auth } from '@configuration/firebase';
import axios from 'axios';
import { onAuthStateChanged } from 'firebase/auth';
import "@configuration/firebase";
import { getFirestore, collection, query, where, getDocs, DocumentData } from 'firebase/firestore';
import cookie from "js-cookie";

const rowsPerPage = 10;

const MyRecordsTable: React.FC = () => {
  const [userEmail, setUserEmail] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState<DocumentData | null>(null);
  const [role, setRole] = useState<number | null>(null);
  const [permisos, setPermisos] = useState<string | null>(null);
  // Filters
  const [filterEmail, setFilterEmail] = useState('');
  const [filterLawyer, setFilterLawyer] = useState('');
  const [filterName, setFilterName] = useState('');
  const [filterSolicitud, setFilterSolicitud] = useState('');
  const [filterType, setFilterType] = useState('');
  const router = useRouter();

  const decodeJWT = (token: string) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Error decoding JWT:', error);
      return null;
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      const authToken = cookie.get('AuthToken');
      
      if (authToken) {
        const decodedToken = decodeJWT(authToken);
        console.log("🚀 ~ fetchUserData ~ decodedToken:", decodedToken)
        
        if (decodedToken) {
          setUserEmail(decodedToken.email);
          
          try {
            console.log("entreeee")
            const db = getFirestore();
            const q = query(collection(db, "usuarios"), where("email", "==", decodedToken.email));

            const querySnapshot = await getDocs(q);
            console.log("🚀 ~ fetchUserData ~ querySnapshot:", querySnapshot)
            
            if (!querySnapshot.empty) {
              const doc = querySnapshot.docs[0];
              const data = doc.data();
              setRole(data.rol || null);
              setPermisos(data.permisos || null);
            } else {
              setRole(null);
            }
          } catch (error) {
            console.error("Error fetching user role:", error);
          }
        } else {
          setUserEmail('');
          setRole(null);
        }
      } else {
        setUserEmail('');
        setRole(null);
      }
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    const fetchRecords = async () => {
      if (!userEmail) {
        console.log('No user email found');
        return;
      }
      setLoading(true);
      try {
        // Build params: admin can query global; non-admin must include email or lawyer base
        const isAdmin = (role ?? 0) > 34 || permisos === 'expediente' || permisos === 'administrador';
        const params: Record<string, any> = {};
        if (role !== null) params.role = role;
        if (permisos) params.permisos = permisos;

        // Apply filters only if provided
        if (filterEmail.trim()) params.email = filterEmail.trim();
        if (filterLawyer.trim()) params.lawyer = filterLawyer.trim();
        if (filterName.trim()) params.name = filterName.trim();
        if (filterSolicitud.trim()) params.solicitud = filterSolicitud.trim();
        if (filterType.trim()) params.type = filterType.trim();

        // For non-admin default base to current user (lawyer) if user didn't set base filters
        if (!isAdmin) {
          if (!params.email && !params.lawyer) {
            params.lawyer = userEmail;
          }
        }

        const response = await axios.get('/api/list-records', { params });
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
  }, [userEmail, role, permisos, filterEmail, filterLawyer, filterName, filterSolicitud, filterType]);

  useEffect(() => {
    if (!userEmail) return;
    fetchUserByEmail(userEmail).then(user => setUserData(user));
  }, [userEmail]);

  const totalPages = Math.ceil(records.length / rowsPerPage);
  const hasPrevPage = currentPage > 1;
  const hasNextPage = currentPage < totalPages;
  const paginatedData = records.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage).map(row => ({
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
        {row.lawyer === userEmail && (
          <button
            className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700 transition-colors"
            onClick={() => router.push(`/dashboard/record/${row.id || ''}`)}
          >
            Actualizar
          </button>
        )}
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
      controls={(
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <input
            placeholder="Email"
            value={filterEmail}
            onChange={(e) => setFilterEmail(e.target.value)}
            className="py-2 px-3 bg-[#1B1B29] text-white border border-gray-600 rounded"
          />
          <input
            placeholder="Abogado"
            value={filterLawyer}
            onChange={(e) => setFilterLawyer(e.target.value)}
            className="py-2 px-3 bg-[#1B1B29] text-white border border-gray-600 rounded"
          />
          <input
            placeholder="Nombre"
            value={filterName}
            onChange={(e) => setFilterName(e.target.value)}
            className="py-2 px-3 bg-[#1B1B29] text-white border border-gray-600 rounded"
          />
          <input
            placeholder="Solicitud"
            value={filterSolicitud}
            onChange={(e) => setFilterSolicitud(e.target.value)}
            className="py-2 px-3 bg-[#1B1B29] text-white border border-gray-600 rounded"
          />
          <input
            placeholder="Tipo"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="py-2 px-3 bg-[#1B1B29] text-white border border-gray-600 rounded"
          />
        </div>
      )}
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