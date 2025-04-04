import React, { useContext, useEffect, useState } from 'react';
import DesembolsoContext from '@context/desembolsoContext';
import Select from 'react-select';

const DisbursementCajaChica: React.FC = () => {
    const context = useContext(DesembolsoContext);
    const [vendors, setVendors] = useState<any[]>([]);
    const [invoices, setInvoices] = useState<any[]>([]);

    useEffect(() => {
        if (context) {

        }
    }, [context?.state]);

    useEffect(() => {
        const fetchInvoices = async () => {
            try {
                const response = await fetch("/api/list-invoices");
                const data = await response.json();

                const formattedInvoices = data?.data?.map((invoice: any) => ({
                    label: `${invoice.invoice_number} - ${invoice.customer_name}`,
                    value: invoice.invoice_number,
                })) || [];

                setInvoices(formattedInvoices);
            } catch (error) {
                console.error("Error fetching invoices:", error);
            }
        };

        fetchInvoices();
    }, []);

    useEffect(() => {
        const fetchVendors = async () => {
            try {
                const response = await fetch("/api/list-vendors");
                const data = await response.json();

                const formattedVendors = data?.data?.map((vendor: any) => ({
                    label: vendor.contact_name,
                    value: vendor.contact_name,
                })) || [];

                setVendors(formattedVendors);
            } catch (error) {
                console.error("Error fetching vendors:", error);
            }
        };

        fetchVendors();
    }, []);


    if (!context) {
        return <div>Context is not available.</div>;
    }

    const { state, setState } = context;
    console.log("🚀 ~ state:", state)

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
        index: number
      ) => {
        const { name, value } = e.target;
      
        setState((prevState) => ({
          ...prevState,
          desembolsoCajaChica: prevState.desembolsoCajaChica.map((item, i) =>
            i === index
              ? {
                  ...item,
                  [name]: value,
                  status: true,
                }
              : item
          ),
        }));
      };
      

    const handleAddExpense = () => {
        const newExpense = {
            lawyer: '',
            date: '',
            amount: 0,
            invoiceNumber: '',
            disbursementType: 'Transferencia',
            reason: '',
            observation: '',
            status: true,
        };
        setState(prevState => ({
            ...prevState,
            desembolsoCajaChica: [...prevState.desembolsoCajaChica, newExpense]
        }));
    };

    const handleRemoveLastExpense = () => {
        setState(prevState => ({
            ...prevState,
            desembolsoCajaChica: prevState.desembolsoCajaChica.slice(0, -1)
        }));
    };

    const handleSelectChange = (selectedOption: any, index: number, name: string) => {
        setState((prevState) => ({
            ...prevState,
            desemboloOficina: prevState.desemboloOficina.map((item, i) =>
                i === index
                    ? {
                        ...item,
                        [name]: selectedOption?.value || '',
                    }
                    : item
            ),
        }));
    };

    return (
        <div className="p-1">
            <div className="p-1 rounded-lg shadow-lg">
                <h2 className="text-xl font-semibold text-white mb-6">Caja Chica</h2>

                {state.desembolsoCajaChica.map((expense, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div className="mb-4">
                            <label htmlFor={`lawyer-${index}`} className="block text-gray-300 mb-2">
                                A quién se le realiza el desembolso
                            </label>
                            {vendors.length === 0 ? (
                                <div className="text-gray-400">Cargando proveedores...</div>
                            ) : (
                                <select
                                    id={`lawyer-${index}`}
                                    name="lawyer"
                                    value={expense.lawyer}
                                    onChange={(e) => handleChange(e, index)}
                                    className="w-full p-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
                                >
                                    <option value="">Selecciona un abogado</option>
                                    {vendors.map((vendor, i) => (
                                        <option key={i} value={vendor.value}>
                                            {vendor.label}
                                        </option>
                                    ))}

                                </select>
                            )}
                        </div>

                        <div className="mb-4">
                            <label htmlFor={`date-${index}`} className="block text-gray-300 mb-2">
                                Fecha
                            </label>
                            <input
                                type="date"
                                id={`date-${index}`}
                                name="date"
                                value={expense.date || ''}
                                onChange={(e) => handleChange(e, index)}
                                className="w-full p-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
                            />
                        </div>

                        <div className="mb-4">
                            <label htmlFor={`amount-${index}`} className="block text-gray-300 mb-2">
                                Monto ($)
                            </label>
                            <input
                                type="number"
                                id={`amount-${index}`}
                                name="amount"
                                value={expense.amount || ''}
                                onChange={(e) => handleChange(e, index)}
                                className="w-full p-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
                            />
                        </div>

                        <div className="mb-4">
                            <label htmlFor={`invoiceNumber-${index}`} className="block text-gray-300 mb-2">
                                Número de factura
                            </label>
                            <input
                                type="text"
                                id={`invoiceNumber-${index}`}
                                name="invoiceNumber"
                                value={expense.invoiceNumber || ''}
                                onChange={(e) => handleChange(e, index)}
                                placeholder="Buscar número de factura"
                                className="w-full px-3 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />

                        </div>

                        <div className="mb-4">
                            <label htmlFor={`disbursementType-${index}`} className="block text-gray-300 mb-2">
                                Tipo de desembolso
                            </label>
                            <select
                                id={`disbursementType-${index}`}
                                name="disbursementType"
                                value={expense.disbursementType || ''}
                                onChange={(e) => handleChange(e, index)}
                                className="w-full p-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
                            >
                                <option value="Transferencia">Transferencia</option>
                                <option value="Efectivo">Efectivo</option>
                                <option value="Cheque">Cheque</option>
                            </select>
                        </div>

                        <div className="mb-4">
                            <label htmlFor={`reason-${index}`} className="block text-gray-300 mb-2">
                                Motivo
                            </label>
                            <input
                                type="text"
                                id={`reason-${index}`}
                                name="reason"
                                value={expense.reason || ''}
                                onChange={(e) => handleChange(e, index)}
                                className="w-full p-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
                            />
                        </div>

                        <div className="mb-4">
                            <label htmlFor={`observation-${index}`} className="block text-gray-300 mb-2">
                                Observación
                            </label>
                            <textarea
                                id={`observation-${index}`}
                                name="observation"
                                value={expense.observation || ''}
                                onChange={(e) => handleChange(e, index)}
                                className="w-full p-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
                            ></textarea>
                        </div>
                    </div>
                ))}

                <div className="flex space-x-4 mt-6">
                    <button
                        type="button"
                        className="bg-profile text-white py-2 px-4 rounded-lg hover:bg-purple-800 transition-colors duration-300"
                        onClick={handleAddExpense}
                    >
                        Nuevo gasto
                    </button>
                    <button
                        type="button"
                        className="bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-800 transition-colors duration-300"
                        onClick={handleRemoveLastExpense}
                        disabled={state.desembolsoCajaChica.length === 0}
                    >
                        Eliminar gasto
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DisbursementCajaChica;
