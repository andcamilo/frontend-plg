import type React from "react";
import { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";

interface InvoiceData {
  invoice_id: string; // Invoice ID
  invoice_number: string; // Invoice Number
  date: string; // Date of the Invoice
  due_date: string; // Due Date
  customer_name: string; // Customer Name
}

interface InvoiceProps {
  id: string;
}

const Invoice: React.FC<InvoiceProps> = ({ id }) => {
  const [invoice, setInvoice] = useState<InvoiceData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchInvoice = async () => {
      setIsLoading(true);
      try {
        console.log("Fetching invoice with id:", id);

        // Call the getInvoice endpoint
        const response = await axios.get(
          `https://7hzt4b9tck.execute-api.us-east-1.amazonaws.com/dev/getInvoice/${id}`
        );

        // Map the response to match the component's structure
        const invoiceData: InvoiceData = {
          invoice_id: response.data.data.invoice.invoice_id,
          invoice_number: response.data.data.invoice.invoice_number,
          date: response.data.data.invoice.date,
          due_date: response.data.data.invoice.due_date,
          customer_name: response.data.data.invoice.customer_name,
        };

        setInvoice(invoiceData);
        console.log("Mapped Invoice data:", invoiceData);
      } catch (error) {
        console.error("Error fetching invoice:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "No se pudo cargar la información de la factura.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (id) fetchInvoice();
  }, [id]);

  if (isLoading) {
    return <div className="text-white">Cargando datos de la factura...</div>;
  }

  if (!invoice) {
    return <div className="text-white">No se encontró información de la factura.</div>;
  }

  return (
    <div className="w-full p-6 bg-gray-900 min-h-screen">
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold text-white mb-6">Detalles de la Factura</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="mb-4">
            <label htmlFor="invoice_id" className="block text-gray-300 mb-2">
              ID de Factura
            </label>
            <input
              id="invoice_id"
              name="invoice_id"
              value={invoice.invoice_id}
              readOnly
              className="w-full p-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="invoice_number" className="block text-gray-300 mb-2">
              Número de Factura
            </label>
            <input
              id="invoice_number"
              name="invoice_number"
              value={invoice.invoice_number}
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
              value={invoice.date}
              readOnly
              className="w-full p-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="due_date" className="block text-gray-300 mb-2">
              Fecha de Vencimiento
            </label>
            <input
              id="due_date"
              name="due_date"
              value={invoice.due_date}
              readOnly
              className="w-full p-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="customer_name" className="block text-gray-300 mb-2">
              Cliente
            </label>
            <input
              id="customer_name"
              name="customer_name"
              value={invoice.customer_name}
              readOnly
              className="w-full p-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Invoice;
