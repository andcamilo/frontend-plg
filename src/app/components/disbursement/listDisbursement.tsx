import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import TableForDisbursement from '../TableForDisbursement';
import axios from 'axios';
import { auth } from "@configuration/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { getFirestore, collection, query, where, getDocs } from "firebase/firestore";

const ListDisbursement: React.FC = () => {
  const router = useRouter();

  const [data, setData] = useState<{ [key: string]: any }[]>([]);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const [role, setRole] = useState<number>(0);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [lastDate, setLastDate] = useState<string | null>(null);
  const [lastDateStack, setLastDateStack] = useState<string[]>([]);
  const [lawyerFilter, setLawyerFilter] = useState<string>('');
  const [hasMorePages, setHasMorePages] = useState<boolean>(false);

  // Auth listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser && firebaseUser.email) {
        setEmail(firebaseUser.email);
        try {
          const db = getFirestore();
          const q = query(collection(db, "usuarios"), where("email", "==", firebaseUser.email));
          const querySnapshot = await getDocs(q);
          if (!querySnapshot.empty) {
            const doc = querySnapshot.docs[0];
            setRole(doc.data().rol || 0);
          } else {
            setRole(0);
          }
        } catch (error) {
          console.error("Error fetching user role:", error);
        }
      } else {
        setEmail(null);
        setRole(0);
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchDisbursements = async (
    limit: number,
    lastDateParam?: string,
    filterEmail?: string,
    filterActive?: boolean
  ) => {
    try {
      if (!email || role === null) return;
      setLoading(true);

      let params: any = { limit, role };
      if (lastDateParam !== undefined && lastDateParam !== null) params.lastDate = lastDateParam;
      if (filterEmail) {
        params.email = filterEmail;
        if (filterActive) params.filter = true;
      } else {
        params.email = email;
      }

      console.log("🚀 ~ fetchDisbursements ~ params:", params);
      const response = await axios.get('/api/list-disbursements', { params });
      const { disbursements, nextCursor: backendNextCursor, hasMorePages: backendHasMorePages } = response.data;

      setData(disbursements || []);
      setNextCursor(backendNextCursor || null);
      setHasMorePages(backendHasMorePages !== undefined ? backendHasMorePages : !!backendNextCursor);
    } catch (error) {
      console.error('Error fetching disbursements:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (email && role !== null) {
      if (lawyerFilter) {
        fetchDisbursements(rowsPerPage, lastDate ?? undefined, lawyerFilter, true);
      } else {
        fetchDisbursements(rowsPerPage, lastDate ?? undefined);
      }
    }
  }, [rowsPerPage, email, role, lastDate, lawyerFilter]);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const handleRowsPerPageChange = (value: number) => {
    setRowsPerPage(value);
    setCurrentPage(1); // Reset to first page when limit changes
  };

  const handleEdit = (row: { [key: string]: any }) => {
    const id = row.id;
    router.push(`/dashboard/see/${id}`);
  };

  const handleDelete = async (row: { [key: string]: any }) => {
    try {
      await axios.post('/api/delete-disbursements', { ids: [row.id] });
      alert('Desembolso eliminado correctamente.');
      if (lawyerFilter) {
        fetchDisbursements(rowsPerPage, lastDate ?? undefined, lawyerFilter, true);
      } else {
        fetchDisbursements(rowsPerPage, lastDate ?? undefined);
      }
    } catch (error) {
      console.error('Error deleting disbursement:', error);
      alert('Error al eliminar el desembolso.');
    }
  };

  const handleBulkDelete = async (selectedIds: string[]) => {
    if (selectedIds.length === 0) {
      alert('No se han seleccionado desembolsos para eliminar.');
      return;
    }

    try {
      await axios.post('/api/delete-disbursements', { ids: selectedIds });
      alert('Desembolsos eliminados correctamente.');
      if (lawyerFilter) {
        fetchDisbursements(rowsPerPage, lastDate ?? undefined, lawyerFilter, true);
      } else {
        fetchDisbursements(rowsPerPage, lastDate ?? undefined);
      }
    } catch (error) {
      console.error('Error deleting disbursements:', error);
      alert('Error al eliminar los desembolsos.');
    }
  };

  const handleGetSelectedIds = async (selectedIds: string[], action: 'update' | 'delete' = 'update') => {
    if (selectedIds.length === 0) {
      alert('No se han seleccionado desembolsos.');
      return;
    }

    try {
      if (action === 'delete') {
        await axios.post('/api/delete-disbursements', { ids: selectedIds });
        alert('Desembolsos eliminados correctamente.');
      } else {
        const response = await axios.patch('/api/update-disbursements', {
          fieldUpdate: { status: 'pre-aprobada' },
          ids: selectedIds,
        });
        alert('Desembolsos actualizados correctamente.');
      }
      if (lawyerFilter) {
        fetchDisbursements(rowsPerPage, lastDate ?? undefined, lawyerFilter, true);
      } else {
        fetchDisbursements(rowsPerPage, lastDate ?? undefined);
      }
    } catch (error) {
      console.error(`Error ${action === 'delete' ? 'deleting' : 'updating'} disbursements:`, error);
      alert(`Error al ${action === 'delete' ? 'eliminar' : 'actualizar'} los desembolsos.`);
    }
  };

  const handleNextPage = () => {
    if (nextCursor) {
      setLastDateStack(prev => [...prev, lastDate || '']);
      setLastDate(nextCursor);
    }
  };

  const handlePrevPage = () => {
    if (lastDateStack.length > 0) {
      const prevStack = [...lastDateStack];
      const prevLastDate = prevStack.pop();
      setLastDateStack(prevStack);
      setLastDate(prevLastDate || null);
    }
  };

  return (
    <div className="w-full p-6 bg-gray-900 min-h-screen">
      <h1 className="text-2xl font-bold text-white mb-6">Listado de Desembolsos</h1>

      <TableForDisbursement
        data={data}
        rowsPerPage={rowsPerPage}
        onChangeRowsPerPage={handleRowsPerPageChange}
        title="Desembolsos"
        showActionButtons={false}
        hasPrevPage={lastDateStack.length > 0}
        hasNextPage={hasMorePages}
        onPageChangeNext={handleNextPage}
        onPageChangePrev={handlePrevPage}
        onEdit={handleEdit}
        role={role}
        onDelete={handleDelete}
        onGetSelectedIds={handleGetSelectedIds}
        loading={loading}
        lawyerFilter={lawyerFilter}
        setLawyerFilter={setLawyerFilter}
      />
    </div>
  );
};

export default ListDisbursement;
