import React, { useContext, useState, useEffect } from 'react';
import DesembolsoContext from '@context/desembolsoContext';
import DisbursementGastosOficina from './disbursementGastosOficina';
import DisbursementGastosCliente from './disbursementGastosCliente';
import DisbursementCajaChica from './disbursementCajaChica';
import { useRouter } from "next/navigation"; 
import DisbursementTransferOrPaymentDetails from './disbursementTransferOrPaymentDetails';
import DisbursementPaidDisbursementDetails from './disbursementPaidDisbursementDetails';
import Swal from 'sweetalert2';
import { onAuthStateChanged } from "firebase/auth";
import { getFirestore, collection, query, where, getDocs } from "firebase/firestore";
import { auth } from "@configuration/firebase";

interface DisbursementProps {
  id: string; 
}

const Disbursement: React.FC<DisbursementProps> = ({ id }) => {
  console.log("🚀 ~ id:", id)
  const context = useContext(DesembolsoContext);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    if (!context) {
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser && firebaseUser.email) {
        try {
          const db = getFirestore();
          const q = query(collection(db, "usuarios"), where("email", "==", firebaseUser.email));
          const querySnapshot = await getDocs(q);
          if (!querySnapshot.empty) {
            const doc = querySnapshot.docs[0];
            const data = doc.data();
            setRole(data.rol || null);
          } else {
            setRole(null);
          }
        } catch (error) {
          console.error("Error fetching user role:", error);
        }
      } else {
        setRole(null);
      }
    });
    return () => unsubscribe();
  }, [context]);

  useEffect(() => {
    if (role) {
     console.log("🚀 ~ useEffect ~ role:", role)
     
    }
  }, [role]);

  if (!context) {
    return <div>Context is not available.</div>;
  }

  const { state, setState } = context;
  console.log("🚀 ~ state:", state)

  const handleSave = async () => {
    // Check if at least one amount is different from 0
    const hasNonZeroAmount =
      (state.desemboloOficina && state.desemboloOficina.some(item => Number(item.amount) !== 0)) ||
      (state.desembolsoCliente && state.desembolsoCliente.some(item => Number(item.amount) !== 0)) ||
      (state.desembolsoCajaChica && state.desembolsoCajaChica.some(item => Number(item.amount) !== 0));

    if (!hasNonZeroAmount) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'El monto debe ser diferente de 0 para guardar el desembolso.',
      });
      return;
    }

    setIsLoading(true);
    try {
      const endpoint = id 
        ? `/api/update-disbursement-id` 
        : `/api/create-disbursement`;
      const method = id ? 'PATCH' : 'POST';

      const requestBody = id ? { ...state, id } : state;
      console.log("🚀 Request Body:", requestBody);

      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      const data = await response.json();
      console.log(`Disbursement ${id ? 'updated' : 'created'} successfully:`, data);

      // Optionally update the context with the new data (if needed)
      setState(prev => ({ ...prev, ...data }));

      // Show success alert and then navigate
      Swal.fire({
        icon: 'success',
        title: 'Éxito',
        text: `¡El desembolso fue ${id ? 'actualizado' : 'guardado'} exitosamente!`,
      }).then(() => {
        // Navigate to the dashboard page after the alert is confirmed.
        router.push('/dashboard/see');
      });
    } catch (error) {
      console.error(`Error ${id ? 'updating' : 'saving'} disbursement:`, error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: `No se pudo ${id ? 'actualizar' : 'guardar'} el desembolso. Intente de nuevo.`,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    setState(prevState => ({
      ...prevState,
      [name]: value,
    }));
  };

  // Convert role to a number for comparison
  const numericRole = role ? Number(role) : null;

  // Lock selects if already set
  const lockDisbursementType = !!(state.solicita && state.solicita !== '');
  const lockExpenseType = !!(state.solicita && state.solicita !== '');
  const lockStatus = !!(state.solicita && state.solicita !== '' && (!numericRole || numericRole <= 49));

  return (
    <div className="w-full p-6 bg-gray-900 min-h-screen">
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold text-white mb-6">Solicitud</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="mb-4">
            <label htmlFor="disbursementType" className="block text-gray-300 mb-2">
              Realizarás un
            </label>
            <select
              id="disbursementType"
              name="disbursementType"
              value={state.disbursementType || ''}
              onChange={handleChange}
              className="w-full p-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
              disabled={lockDisbursementType}
            >
              <option value="" disabled>Selecciona una opción</option>
              <option value="desembolso-gastos">Desembolso de gastos</option>
              <option value="desembolso-caja-chica">Desembolso de caja chica</option>
            </select>
          </div>

          <div className="mb-4">
            <label htmlFor="expenseType" className="block text-gray-300 mb-2">
              Tipo de gasto
            </label>
            <select
              id="expenseType"
              name="expenseType"
              value={state.expenseType || ''}
              onChange={handleChange}
              className="w-full p-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
              disabled={lockExpenseType}
            >
              <option value="" disabled>Selecciona una opción</option>
              <option value="de-oficina">De oficina</option>
              <option value="de-cliente">De Cliente</option>
            </select>
          </div>

          <div className="mb-4">
            <label htmlFor="status" className="block text-gray-300 mb-2">
              Estatus
            </label>
            <select
              id="status"
              name="status"
              value={numericRole === 50 || numericRole === 99 || numericRole === 90 ? state.status : 'Creada'}
              onChange={handleChange}
              className="w-full p-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
              disabled={lockStatus || !(numericRole === 50 || numericRole === 99 || numericRole === 90)}
            >
              <option value="Creada">Creada</option>
              <option value="Rechazada">Rechazada</option>
              <option value="Borrador">Borrador</option>
              <option value="Enviada">Enviada</option>
              <option value="Aprobada">Aprobada</option>
              <option value="Confirmando pago">Confirmando pago</option>
              <option value="Pagada">Pagada</option>
              <option value="En proceso">En proceso</option>
              <option value="Finalizada">Finalizada</option>
            </select>
          </div>

        </div>
        <hr className="my-2" />
        {state.disbursementType === 'desembolso-gastos' && state.expenseType === 'de-oficina' ? (
          <DisbursementGastosOficina />
        ) : state.disbursementType === 'desembolso-gastos' ? (
          <DisbursementGastosCliente />
        ) : state.disbursementType === 'desembolso-caja-chica' ? (
          <DisbursementCajaChica />
        ) : null}

        {state.disbursementType === 'desembolso-gastos' && (
          <>
            <hr className="my-6" />
            <DisbursementTransferOrPaymentDetails />
          </>
        )}

        <hr className="my-6" />
        <DisbursementPaidDisbursementDetails />

        <div className="mt-6 flex justify-end gap-4">
          <button
            onClick={() => router.push('/dashboard/see')}
            className="px-6 py-2 font-semibold rounded-lg bg-profile text-white hover:bg-blue-500 transition"
          >
            Salir
          </button>

          <button
            onClick={handleSave}
            className={`px-6 py-2 font-semibold rounded-lg transition ${
              isLoading
                ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
            disabled={isLoading}
          >
            {isLoading ? 'Cargando...' : 'Guardar'}
          </button>
        </div>

      </div>
    </div>
  );
};

export default Disbursement;
