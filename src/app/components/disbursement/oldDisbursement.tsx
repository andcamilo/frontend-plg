"use client"
import React, { useContext } from 'react';
import OldDesembolsoContext from '@context/oldDesembolsoContext';
import { useRouter } from "next/navigation";
import Swal from 'sweetalert2';

interface OldDisbursementProps {
  id: string;
}

const OldDisbursement: React.FC<OldDisbursementProps> = ({ id }) => {
  const context = useContext(OldDesembolsoContext);
  const router = useRouter();

  if (!context) {
    return <div>Error: Context not found</div>;
  }

  const { state, setState } = context;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const [section, field] = name.split('.');
    
    if (section === 'pago') {
      setState(prev => ({
        ...prev,
        pago: {
          ...prev.pago,
          [field]: value
        }
      }));
    } else if (section === 'pagado') {
      setState(prev => ({
        ...prev,
        pagado: {
          ...prev.pagado,
          [field]: value
        }
      }));
    } else if (section === 'cajaChica') {
      setState(prev => ({
        ...prev,
        cajaChica: {
          ...prev.cajaChica,
          [field]: value
        }
      }));
    } else if (section === 'cliente') {
      setState(prev => ({
        ...prev,
        cliente: {
          ...prev.cliente,
          [field]: value
        }
      }));
    } else if (section === 'oficina') {
      setState(prev => ({
        ...prev,
        oficina: {
          ...prev.oficina,
          [field]: value
        }
      }));
    } else {
      setState(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSave = async () => {
    try {
      const response = await fetch(`/api/update-old-disbursement`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...state, id }),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }

      await Swal.fire({
        icon: 'success',
        title: 'Éxito',
        text: '¡El desembolso fue actualizado exitosamente!',
      });

      router.push('/dashboard/see');
    } catch (error) {
      console.error('Error updating disbursement:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo actualizar el desembolso. Intente de nuevo.',
      });
    }
  };

  return (
    <div className="w-full p-6 bg-gray-900 min-h-screen">
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold text-white mb-6">Solicitud</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-300 mb-4">Información General</h3>
            <div>
              <label className="block text-gray-300 mb-2">Tipo</label>
              <input
                type="text"
                name="tipo"
                value={state.tipo}
                onChange={handleInputChange}
                className="w-full p-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-gray-300 mb-2">Solicitante</label>
              <input
                type="text"
                name="solicita"
                value={state.solicita}
                onChange={handleInputChange}
                className="w-full p-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-gray-300 mb-2">Estado</label>
              <input
                type="text"
                name="status"
                value={state.status}
                onChange={handleInputChange}
                className="w-full p-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-gray-300 mb-2">Fecha</label>
              <input
                type="date"
                name="date"
                value={state.date}
                onChange={handleInputChange}
                className="w-full p-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-gray-300 mb-2">Monto</label>
              <input
                type="number"
                name="monto"
                value={state.monto}
                onChange={handleInputChange}
                className="w-full p-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-gray-300 mb-2">Gasto</label>
              <input
                type="text"
                name="gasto"
                value={state.gasto}
                onChange={handleInputChange}
                className="w-full p-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-gray-300 mb-4">Detalles de Pago</h3>
            <div>
              <label className="block text-gray-300 mb-2">Banco</label>
              <input
                type="text"
                name="pago.banco_pago"
                value={state.pago.banco_pago}
                onChange={handleInputChange}
                className="w-full p-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-gray-300 mb-2">Nombre</label>
              <input
                type="text"
                name="pago.nombre_pago"
                value={state.pago.nombre_pago}
                onChange={handleInputChange}
                className="w-full p-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-gray-300 mb-2">Número</label>
              <input
                type="text"
                name="pago.numero_pago"
                value={state.pago.numero_pago}
                onChange={handleInputChange}
                className="w-full p-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-gray-300 mb-2">Fecha de Pago</label>
              <input
                type="date"
                name="pago.fecha_pago"
                value={state.pago.fecha_pago || ''}
                onChange={handleInputChange}
                className="w-full p-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-gray-300 mb-2">Observación</label>
              <textarea
                name="pago.observacion_pago"
                value={state.pago.observacion_pago}
                onChange={handleInputChange}
                className="w-full p-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500 resize-none h-24"
              />
            </div>
          </div>
        </div>

        {state.tipo === 'caja-chica' && (
          <div className="mt-6">
            <h3 className="font-semibold text-gray-300 mb-4">Caja Chica</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-700/50 p-4 rounded-lg">
              <div>
                <label className="block text-gray-300 mb-2">Factura</label>
                <input
                  type="text"
                  name="cajaChica.factura"
                  value={state.cajaChica.factura}
                  onChange={handleInputChange}
                  className="w-full p-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-2">Monto</label>
                <input
                  type="number"
                  name="cajaChica.monto"
                  value={state.cajaChica.monto}
                  onChange={handleInputChange}
                  className="w-full p-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-2">Motivo</label>
                <input
                  type="text"
                  name="cajaChica.motivo"
                  value={state.cajaChica.motivo}
                  onChange={handleInputChange}
                  className="w-full p-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-2">Tipo</label>
                <input
                  type="text"
                  name="cajaChica.tipo_desembolso"
                  value={state.cajaChica.tipo_desembolso}
                  onChange={handleInputChange}
                  className="w-full p-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        )}

        {state.tipo === 'cliente' && (
          <div className="mt-6">
            <h3 className="font-semibold text-gray-300 mb-4">Cliente</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-700/50 p-4 rounded-lg">
              <div>
                <label className="block text-gray-300 mb-2">Abogado</label>
                <input
                  type="text"
                  name="cliente.abogado"
                  value={state.cliente.abogado}
                  onChange={handleInputChange}
                  className="w-full p-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-2">Cliente</label>
                <input
                  type="text"
                  name="cliente.cliente"
                  value={state.cliente.cliente}
                  onChange={handleInputChange}
                  className="w-full p-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-2">Factura</label>
                <input
                  type="text"
                  name="cliente.factura"
                  value={state.cliente.factura}
                  onChange={handleInputChange}
                  className="w-full p-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-2">Gasto</label>
                <input
                  type="text"
                  name="cliente.gasto"
                  value={state.cliente.gasto}
                  onChange={handleInputChange}
                  className="w-full p-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        )}

        {state.tipo === 'oficina' && (
          <div className="mt-6">
            <h3 className="font-semibold text-gray-300 mb-4">Oficina</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-700/50 p-4 rounded-lg">
              <div>
                <label className="block text-gray-300 mb-2">Cliente</label>
                <input
                  type="text"
                  name="oficina.cliente"
                  value={state.oficina.cliente}
                  onChange={handleInputChange}
                  className="w-full p-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-2">Factura</label>
                <input
                  type="text"
                  name="oficina.factura"
                  value={state.oficina.factura}
                  onChange={handleInputChange}
                  className="w-full p-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-2">Gasto</label>
                <input
                  type="text"
                  name="oficina.gasto"
                  value={state.oficina.gasto}
                  onChange={handleInputChange}
                  className="w-full p-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-2">Monto</label>
                <input
                  type="number"
                  name="oficina.monto"
                  value={state.oficina.monto}
                  onChange={handleInputChange}
                  className="w-full p-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-gray-300 mb-2">Tipo de Gasto</label>
                <input
                  type="text"
                  name="oficina.tipo_gasto"
                  value={state.oficina.tipo_gasto}
                  onChange={handleInputChange}
                  className="w-full p-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 flex justify-end gap-4">
          <button
            onClick={() => router.push('/dashboard/see')}
            className="px-6 py-2 font-semibold rounded-lg bg-profile text-white hover:bg-blue-500 transition"
          >
            Salir
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
          >
            Guardar Cambios
          </button>
        </div>
      </div>
    </div>
  );
};

export default OldDisbursement; 