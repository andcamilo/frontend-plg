import React, { useState, useEffect, useMemo } from 'react';
import { getSpanishTitle } from '../utils/translateColumnTitle';
import { LAWYERS_EMAILS } from '../utils/lawyers';
import cookie from "js-cookie";
import { db } from "@utils/firebase-upload";
import { collection, query, where, getDocs } from "firebase/firestore";
import jwt_decode from "jwt-decode";

interface TableForDisbursementProps {
  data: { [key: string]: any }[];
  rowsPerPage: number;
  onChangeRowsPerPage: (value: number) => void;
  title: string;
  hasPrevPage: boolean;
  hasNextPage: boolean;
  showActionButtons: boolean;
  onPageChangeNext: () => void;
  onPageChangePrev: () => void;
  onEdit: (row: { [key: string]: any }) => void;
  onGetSelectedIds: (selectedIds: string[], action?: 'update' | 'delete', selectedStatus?: number) => void;
  buttonText?: string;
  deleteButtonText?: string;
  loading?: boolean;
  onDelete?: (row: { [key: string]: any }) => void;
  role?: number;
  lawyerFilter: string;
  setLawyerFilter: (value: string) => void;
}

const formatCellValue = (value: any) => {
  if (typeof value === 'boolean') return value.toString();
  if (value === null || value === undefined || value === '') return '-';
  if (typeof value === 'object') return JSON.stringify(value);
  return value;
};

const TableForDisbursement: React.FC<TableForDisbursementProps> = ({
  data,
  rowsPerPage,
  onChangeRowsPerPage,
  title,
  hasPrevPage,
  hasNextPage,
  showActionButtons,
  onPageChangeNext,
  onPageChangePrev,
  onEdit,
  onGetSelectedIds,
  buttonText = 'Editar',
  deleteButtonText = 'Eliminar',
  loading = false,
  onDelete,
  lawyerFilter,
  setLawyerFilter,
}) => {
  const columns = data.length > 0 ? Object.keys(data[0]).filter(col => col !== 'id') : [];
  const [selectedRows, setSelectedRows] = useState<{ [key: number]: boolean }>({});
  const [selectAll, setSelectAll] = useState(false);
  const [role, setRole] = useState<number>(0);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<number>(0);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const statusLabels: Record<number, string> = {
    0: "Rechazada",
    1: "Borrador",
    10: "Enviada",
    11: "Pre-aprobada",
    12: "Aprobada",
    19: "Confirmando pago",
    20: "Pagada",
    30: "En proceso",
    70: "Finalizada",
  };

  // 👇 Filtros
  const [statusFilter, setStatusFilter] = useState<string>('');

  const lawyerValues = LAWYERS_EMAILS;

  const statusValues = useMemo(() => {
    return Array.from(new Set(data.map(row => row['status']).filter(val => val)));
  }, [data]);

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

  const filteredData = useMemo(() => {
    return data.filter(row => {
      const matchesLawyer = lawyerFilter ? row['lawyer'] === lawyerFilter : true;
      const matchesStatus = statusFilter ? row['status'] === statusFilter : true;
      return matchesLawyer && matchesStatus;
    });
  }, [data, lawyerFilter, statusFilter]);

  useEffect(() => {
    setSelectedRows({});
    setSelectAll(false);
  }, [data]);

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const token = cookie.get("AuthToken");
        console.log("🚀 ~ fetchUserRole ~ token:", token)
        if (!token) return;

        const decodedToken = decodeJWT(token);
        const email = decodedToken.email;
        if (!email) return;

        const q = query(collection(db, "usuarios"), where("email", "==", email));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const doc = querySnapshot.docs[0];
          console.log("🚀 ~ fetchUserRole ~ doc:", doc)
          setRole(doc.data().rol || 0);
        }
      } catch (err) {
        console.error("Error fetching user role from Firestore:", err);
      }
    };

    fetchUserRole();
  }, []);

  const handleRowSelect = (rowIndex: number) => {
    setSelectedRows((prev) => ({
      ...prev,
      [rowIndex]: !prev[rowIndex],
    }));
  };

  const handleSelectAll = () => {
    const allSelected = !selectAll;
    setSelectAll(allSelected);

    const newSelectedRows = filteredData.reduce<{ [key: number]: boolean }>((acc, _, index) => {
      acc[index] = allSelected;
      return acc;
    }, {});
    setSelectedRows(newSelectedRows);
  };

  const handleGetSelectedIds = (action: 'update' | 'delete' = 'update') => {
    if (action === 'update') {
      setShowStatusModal(true);
    } else {
      const selectedIndexes = Object.keys(selectedRows).filter((key) => selectedRows[Number(key)]);
      const selectedIds = selectedIndexes.map((key) => filteredData[Number(key)].invoice_id ?? filteredData[Number(key)].id);
      onGetSelectedIds(selectedIds, action);
    }
  };

  const handleUpdateStatus = async () => {
    const selectedIndexes = Object.keys(selectedRows).filter((key) => selectedRows[Number(key)]);
    const selectedIds = selectedIndexes.map((key) => filteredData[Number(key)].invoice_id ?? filteredData[Number(key)].id);
    
    setUpdatingStatus(true);
    try {
      await onGetSelectedIds(selectedIds, 'update', selectedStatus);
      setShowStatusModal(false);
      setSelectedRows({});
      setSelectAll(false);
    } catch (error) {
      console.error('Error updating status:', error);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleCloseModal = () => {
    setShowStatusModal(false);
    setSelectedStatus(0);
  };

  const canDelete = role !== undefined && [50, 90, 99].includes(role);

  return (
    <div className="bg-component p-4 rounded-lg shadow-lg w-full max-w-8xl mb-4">
      <div className="mb-4">
        <h2 className="text-lg font-bold text-white mb-2">
          {getSpanishTitle(title)}
        </h2>

        {/* Filtros */}
        <div className="flex flex-col sm:flex-row flex-wrap items-center gap-4 text-white w-full">
          {/* Filtro por abogado */}
          {lawyerValues.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
              <label htmlFor="lawyer-filter" className="text-sm">Filtrar por Abogado:</label>
              <select
                id="lawyer-filter"
                value={lawyerFilter}
                onChange={(e) => setLawyerFilter(e.target.value)}
                className="bg-gray-700 text-white px-2 py-1 rounded w-full sm:w-auto"
              >
                <option value="">Todos</option>
                {lawyerValues.map((val, idx) => (
                  <option key={idx} value={val}>
                    {val}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Filtro por estado */}
          {statusValues.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
              <label htmlFor="status-filter" className="text-sm">Filtrar por Estado:</label>
              <select
                id="status-filter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-gray-700 text-white px-2 py-1 rounded w-full sm:w-auto"
              >
                <option value="">Todos</option>
                {statusValues.map((val, idx) => (
                  <option key={idx} value={val}>
                    {val}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
        
        {canDelete && (
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => handleGetSelectedIds('update')}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Actualizar seleccionados
            </button>
            <button
              onClick={() => handleGetSelectedIds('delete')}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Eliminar seleccionados
            </button>
          </div>
        )}
      </div>

      {/* Status Update Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-gray-800 rounded-lg shadow-lg w-11/12 max-w-md p-6 relative">
            <button
              className="absolute top-2 right-2 text-white text-xl hover:text-gray-300"
              onClick={handleCloseModal}
            >
              ✕
            </button>
            <h2 className="text-white text-2xl font-bold mb-4">Actualizar Estado</h2>
            <p className="text-gray-300 mb-4">
              Selecciona el nuevo estado para los elementos seleccionados:
            </p>
            
            <div className="mb-6">
              <label htmlFor="status-select" className="block text-gray-300 mb-2">
                Estado:
              </label>
              <select
                id="status-select"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(Number(e.target.value))}
                className="w-full p-3 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
              >
                {Object.entries(statusLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={handleCloseModal}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleUpdateStatus}
                disabled={updatingStatus}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  updatingStatus
                    ? 'bg-gray-500 text-gray-300 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {updatingStatus ? 'Actualizando...' : 'Actualizar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <p className="text-gray-300">Cargando desembolsos...</p>
      ) : filteredData.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-gray-400 table-auto">
            <thead>
              <tr>
                {canDelete && (
                  <th className="py-2 px-2">
                    <input
                      type="checkbox"
                      checked={selectAll}
                      onChange={handleSelectAll}
                      className="w-4 h-4"
                    />
                  </th>
                )}
                {columns.map((column, index) => (
                  <th key={index} className="py-2 px-2 text-white whitespace-nowrap">
                    {getSpanishTitle(column)}
                  </th>
                ))}
                <th className="py-2 px-2 text-white min-w-[160px]">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((row, rowIndex) => (
                <tr key={rowIndex} className="border-t border-gray-700">
                  {canDelete && (
                    <td className="py-2 px-2">
                      <input
                        type="checkbox"
                        checked={!!selectedRows[rowIndex]}
                        onChange={() => handleRowSelect(rowIndex)}
                        className="w-4 h-4"
                      />
                    </td>
                  )}
                  {columns.map((column, colIndex) => (
                    <td key={colIndex} className="py-2 px-2 whitespace-nowrap">
                      {formatCellValue(row[column])}
                    </td>
                  ))}
                  <td className="py-2 px-2 min-w-[160px]">
                    <div className="flex gap-2">
                      {(role > 49 || row.status === 'creada') && (
                        <button
                          onClick={() => onEdit(row)}
                          className="bg-profile text-white px-3 py-1 rounded-lg hover:bg-blue-500"
                        >
                          {buttonText}
                        </button>
                      )}
                      {canDelete && onDelete && (
                        <button
                          onClick={() => onDelete(row)}
                          className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600"
                        >
                          {deleteButtonText}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-gray-400">No hay datos disponibles.</p>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4 w-full">
        <div className="flex items-center gap-2 text-white w-full sm:w-auto">
          <label htmlFor="limit" className="text-sm">Resultados por página:</label>
          <select
            id="limit"
            value={rowsPerPage}
            onChange={(e) => onChangeRowsPerPage(Number(e.target.value))}
            className="bg-gray-700 text-white px-2 py-1 rounded"
          >
            {[5, 10, 20, 50].map((val) => (
              <option key={val} value={val}>
                {val}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-4 w-full sm:w-auto justify-end">
          <button
            onClick={onPageChangePrev}
            disabled={!hasPrevPage}
            className="bg-gray-700 text-white px-4 py-2 rounded-lg disabled:opacity-50"
          >
            Anterior
          </button>
          <button
            onClick={onPageChangeNext}
            disabled={!hasNextPage}
            className="bg-gray-700 text-white px-4 py-2 rounded-lg disabled:opacity-50"
          >
            Siguiente
          </button>
        </div>
      </div>
    </div>
  );
};

export default TableForDisbursement;
