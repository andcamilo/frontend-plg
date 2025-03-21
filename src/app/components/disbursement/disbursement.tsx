import React, { useContext, useState } from 'react';
import DesembolsoContext from '@context/desembolsoContext';
import DisbursementGastosOficina from './disbursementGastosOficina';
import DisbursementGastosCliente from './disbursementGastosCliente';
import DisbursementCajaChica from './disbursementCajaChica';
import { useRouter } from "next/navigation"; 
import DisbursementTransferOrPaymentDetails from './disbursementTransferOrPaymentDetails';
import DisbursementPaidDisbursementDetails from './disbursementPaidDisbursementDetails';
import Swal from 'sweetalert2';

interface DisbursementProps {
  id: string; 
}

const Disbursement: React.FC<DisbursementProps> = ({ id }) => {
  const context = useContext(DesembolsoContext);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  if (!context) {
    return <div>Context is not available.</div>;
  }

  const { state, setState } = context;

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const endpoint = id 
        ? `/api/update-disbursement-id` 
        : `/api/create-disbursement`;
      const method = id ? 'PATCH' : 'POST';

      // Construct the request body. If updating, include the id.
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
              value={state.status || ''}
              onChange={handleChange}
              className="w-full p-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
            >
              <option value="" disabled>Selecciona una opción</option>
              <option value="creada">Creada</option>
              <option value="rechazada">Rechazada</option>
              <option value="pre-aprobada">Pre-Aprobada</option>
              <option value="aprobada">Aprobada</option>
              <option value="deseembolsado">Deseembolsado</option>
              <option value="pagado-por-cliente">Pagado por el cliente</option>
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

        <div className="mt-6 flex justify-end">
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
