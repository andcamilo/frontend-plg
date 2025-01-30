import type React from "react";
import { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";

interface ExpenseData {
  expense_id: string; // ID of the expense
  approver_name: string; // Approver name (mapped to Proveedor)
  date: string; // Date of the expense
  bcy_total: number; // Total amount
  paid_through_account_name: string; // Paid through account name
  currency_code: string; // Currency code
  reference_number: string; // Reference number
}

interface ExpenseProps {
  id: string;
}

const Expense: React.FC<ExpenseProps> = ({ id }) => {
  const [expense, setExpense] = useState<ExpenseData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchExpense = async () => {
      setIsLoading(true);
      try {
        console.log("Fetching expense with id:", id);

        // Call the given endpoint
        const response = await axios.get(
          `https://7hzt4b9tck.execute-api.us-east-1.amazonaws.com/chris/getExpense/${id}`
        );

        // Map the response to match the structure
        const expenseData: ExpenseData = {
          expense_id: response.data.data.expense.expense_id,
          approver_name: response.data.data.expense.approver_name,
          date: response.data.data.expense.date,
          bcy_total: response.data.data.expense.bcy_total,
          paid_through_account_name: response.data.data.expense.account_name,
          currency_code: response.data.data.expense.currency_code,
          reference_number: response.data.data.expense.reference_number || "N/A", // Handle missing field
        };

        setExpense(expenseData);
        console.log("Mapped Expense data:", expenseData);
      } catch (error) {
        console.error("Error fetching expense:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "No se pudo cargar la información del gasto.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (id) fetchExpense();
  }, [id]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      console.log("Saving expense data:", expense);
      // Implement actual save logic here
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulating API call
      Swal.fire({
        icon: "success",
        title: "Éxito",
        text: "Los datos del gasto han sido guardados temporalmente.",
      });
    } catch (error) {
      console.error("Error saving expense:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudo guardar el gasto. Intente de nuevo.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="text-white">Cargando datos del gasto...</div>;
  }

  if (!expense) {
    return <div className="text-white">No se encontró información del gasto.</div>;
  }

  return (
    <div className="w-full p-6 bg-gray-900 min-h-screen">
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold text-white mb-6">Detalles del Gasto</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="mb-4">
            <label htmlFor="expense_id" className="block text-gray-300 mb-2">
              ID Gasto
            </label>
            <input
              id="expense_id"
              name="expense_id"
              value={expense.expense_id}
              readOnly
              className="w-full p-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="approver_name" className="block text-gray-300 mb-2">
              Proveedor
            </label>
            <input
              id="approver_name"
              name="approver_name"
              value={expense.approver_name}
              readOnly
              className="w-full p-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="date" className="block text-gray-300 mb-2">
              Fecha
            </label>
            <input
              id="date"
              name="date"
              value={expense.date}
              readOnly
              className="w-full p-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="bcy_total" className="block text-gray-300 mb-2">
              Total
            </label>
            <input
              id="bcy_total"
              name="bcy_total"
              value={expense.bcy_total.toString()} // Convert number to string for input
              readOnly
              className="w-full p-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="paid_through_account_name" className="block text-gray-300 mb-2">
              Cuenta Pagada A Través De
            </label>
            <input
              id="paid_through_account_name"
              name="paid_through_account_name"
              value={expense.paid_through_account_name}
              readOnly
              className="w-full p-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="currency_code" className="block text-gray-300 mb-2">
              Código de Moneda
            </label>
            <input
              id="currency_code"
              name="currency_code"
              value={expense.currency_code}
              readOnly
              className="w-full p-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="reference_number" className="block text-gray-300 mb-2">
              Número de Referencia
            </label>
            <input
              id="reference_number"
              name="reference_number"
              value={expense.reference_number}
              readOnly
              className="w-full p-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <hr className="my-6 border-gray-600" />

        <div className="mt-6 flex justify-end">
          <button
            onClick={handleSave}
            className={`px-6 py-2 font-semibold rounded-lg transition ${
              isSaving
                ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
            disabled={isSaving}
          >
            {isSaving ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Expense;
