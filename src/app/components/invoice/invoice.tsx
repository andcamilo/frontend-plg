import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { backendBaseUrl, backendEnv } from "@utils/env";

interface InvoiceProps {
  id: string;
}

const Invoice: React.FC<InvoiceProps> = ({ id }) => {
  const [invoice, setInvoice] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchInvoice = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(
          `${backendBaseUrl}/${backendEnv}/getInvoice/${id}`
        );
        setInvoice(response.data.data.invoice);
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

    if (id) {
      fetchInvoice();
    }
  }, [id]);

  if (isLoading) {
    return <div className="text-white">Cargando datos de la factura...</div>;
  }

  if (!invoice) {
    return <div className="text-white">No se encontró información de la factura.</div>;
  }

  return (
    <div className="w-full p-6 bg-gray-900 min-h-screen">
      <h1 className="text-3xl text-white mb-4">Ver Factura</h1>
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold text-white mb-6">
          Factura #{invoice.invoice_number}
        </h2>

        {/* Encabezado / Datos principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-gray-300">ID de Factura</label>
            <div className="text-white">{invoice.invoice_id}</div>
          </div>
          <div>
            <label className="block text-gray-300">Fecha de Vencimiento</label>
            <div className="text-white">{invoice.due_date}</div>
          </div>
          <div>
            <label className="block text-gray-300">Fecha de Emisión</label>
            <div className="text-white">{invoice.date}</div>
          </div>
          <div>
            <label className="block text-gray-300">Estado</label>
            <div className="text-white capitalize">{invoice.status}</div>
          </div>
          <div>
            <label className="block text-gray-300">Cliente</label>
            <div className="text-white">{invoice.customer_name}</div>
          </div>
          <div>
            <label className="block text-gray-300">Balance</label>
            <div className="text-white">PAB {invoice.balance}</div>
          </div>
        </div>

        {/* Direcciones */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-gray-300 font-semibold">
              Dirección de Facturación
            </label>
            <div className="text-white">
              {invoice.billing_address?.address}
              {invoice.billing_address?.city
                ? `, ${invoice.billing_address?.city}`
                : ""}
              {invoice.billing_address?.state
                ? `, ${invoice.billing_address?.state}`
                : ""}
              {invoice.billing_address?.country
                ? `, ${invoice.billing_address?.country}`
                : ""}
            </div>
          </div>
          <div>
            <label className="block text-gray-300 font-semibold">
              Dirección de Envío
            </label>
            <div className="text-white">
              {invoice.shipping_address?.address}
              {invoice.shipping_address?.city
                ? `, ${invoice.shipping_address?.city}`
                : ""}
              {invoice.shipping_address?.state
                ? `, ${invoice.shipping_address?.state}`
                : ""}
              {invoice.shipping_address?.country
                ? `, ${invoice.shipping_address?.country}`
                : ""}
            </div>
          </div>
        </div>

        {/* Items / Conceptos */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-white mb-3">
            Items / Conceptos
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left">
              <thead>
                <tr className="bg-gray-700 text-gray-300">
                  <th className="px-4 py-2 font-medium">Nombre</th>
                  <th className="px-4 py-2 font-medium">Descripción</th>
                  <th className="px-4 py-2 font-medium">Cantidad</th>
                  <th className="px-4 py-2 font-medium">Precio Unit.</th>
                  <th className="px-4 py-2 font-medium">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {invoice.line_items?.map((item: any, idx: number) => (
                  <tr key={idx} className="text-white">
                    <td className="px-4 py-2">{item.name}</td>
                    <td className="px-4 py-2">{item.description}</td>
                    <td className="px-4 py-2">{item.quantity}</td>
                    <td className="px-4 py-2">PAB {item.rate}</td>
                    <td className="px-4 py-2">PAB {item.line_total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Totales */}
        <div className="mt-6 flex flex-col items-end space-y-1">
          <div className="flex justify-between w-full md:w-1/2 text-white">
            <span className="text-gray-300">Subtotal:</span>
            <span>PAB {invoice.sub_total}</span>
          </div>

          {invoice.tax_total > 0 && (
            <div className="flex justify-between w-full md:w-1/2 text-white">
              <span className="text-gray-300">Impuestos:</span>
              <span>PAB {invoice.tax_total}</span>
            </div>
          )}

          {invoice.discount_total > 0 && (
            <div className="flex justify-between w-full md:w-1/2 text-white">
              <span className="text-gray-300">Descuentos:</span>
              <span>PAB {invoice.discount_total}</span>
            </div>
          )}

          <div className="flex justify-between w-full md:w-1/2 text-white mt-2 pt-2 border-t border-gray-700">
            <span className="text-gray-200 font-semibold">Total:</span>
            <span className="font-semibold">PAB {invoice.total}</span>
          </div>

          <div className="flex justify-between w-full md:w-1/2 text-white">
            <span className="text-gray-300">Pagos Recibidos:</span>
            <span>PAB {invoice.payment_made || 0}</span>
          </div>

          <div className="flex justify-between w-full md:w-1/2 text-white mt-2 pt-2 border-t border-gray-700">
            <span className="text-gray-200 font-semibold">Balance Pendiente:</span>
            <span className="font-semibold">PAB {invoice.balance}</span>
          </div>
        </div>

        {/* Notas y Términos */}
        {invoice.notes && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-white mb-2">Notas</h3>
            <p className="text-gray-300">{invoice.notes}</p>
          </div>
        )}

        {invoice.terms && (
          <div className="mt-4">
            <h3 className="text-lg font-semibold text-white mb-2">
              Términos y Condiciones
            </h3>
            <p className="text-gray-300">{invoice.terms}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Invoice;
