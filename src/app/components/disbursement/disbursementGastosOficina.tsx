"use client"
import React, { useContext, useEffect, useState } from 'react';
import Select from 'react-select';
import DesembolsoContext from '@context/desembolsoContext';

const DisbursementGastosOficina: React.FC = () => {
    const context = useContext(DesembolsoContext);
    const [vendors, setVendors] = useState<any[]>([]);
    const [invoices, setInvoices] = useState<any[]>([]);

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
                console.log("🚀 ~ fetchVendors ~ response:", response)
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

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
        index: number
    ) => {
        const { name, value } = e.target;

        setState((prevState) => ({
            ...prevState,
            desemboloOficina: prevState.desemboloOficina.map((item, i) =>
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
            expenseType: '',
            otherExpenseType: '',
            expenseDetail: '',
            amount: 0,
            lawyer: '',
            invoiceNumber: '',
            status: true,
        };
        setState(prevState => ({
            ...prevState,
            desemboloOficina: [...prevState.desemboloOficina, newExpense]
        }));
    };

    const handleRemoveLastExpense = () => {
        setState(prevState => ({
            ...prevState,
            desemboloOficina: prevState.desemboloOficina.slice(0, -1)
        }));
    };

    const handleSelectChange = (selectedOption: any, index: number, name: string) => {
        const value = typeof selectedOption === 'string' ? selectedOption : selectedOption?.value || '';
      
        setState((prevState) => ({
          ...prevState,
          desemboloOficina: prevState.desemboloOficina.map((item, i) =>
            i === index
              ? {
                  ...item,
                  [name]: value,
                }
              : item
          ),
        }));
      };
      

    return (
        <div className="p-1">
            <div className="p-1 rounded-lg shadow-lg">
                <h2 className="text-xl font-semibold text-white mb-6">Gastos de Oficina</h2>

                {state.desemboloOficina.map((expense, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div className="mb-4">
                            <label htmlFor={`expenseType-${index}`} className="block text-gray-300 mb-2">
                                Tipo de gasto
                            </label>
                            <select
                                id={`expenseType-${index}`}
                                name="expenseType"
                                value={expense.expenseType}
                                onChange={(e) => handleChange(e, index)}
                                className="w-full p-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
                            >
                                <option value="desembolso-comisiones">Desembolso de comisiones</option>
                                <option value="seguro-privado">Seguro Privado</option>
                                <option value="dhl">DHL</option>
                                <option value="mantenimiento-moto">Mantenimiento de moto</option>
                                <option value="utiles-oficina">Útiles de oficina</option>
                                <option value="supermercado">Supermercado</option>
                                <option value="estacionamiento">Estacionamiento</option>
                                <option value="proconsa">Proconsa</option>
                                <option value="gasolina">Gasolina</option>
                                <option value="estacionamiento-seguimientos">Estacionamiento de seguimientos</option>
                                <option value="caja-chica">Caja chica</option>
                                <option value="abono-notaria">Abono notaría</option>
                                <option value="otros">Otros</option>
                            </select>
                        </div>

                        {expense.expenseType === 'otros' && (
                            <div className="mb-4">
                                <label htmlFor={`otherExpenseType-${index}`} className="block text-gray-300 mb-2">
                                    Otro tipo de gasto
                                </label>
                                <input
                                    type="text"
                                    id={`otherExpenseType-${index}`}
                                    name="otherExpenseType"
                                    value={expense.otherExpenseType || ''}
                                    onChange={(e) => handleChange(e, index)}
                                    className="w-full p-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
                                />
                            </div>
                        )}

                        <div className="mb-4">
                            <label htmlFor={`expenseDetail-${index}`} className="block text-gray-300 mb-2">
                                Detalle del gasto
                            </label>
                            <input
                                type="text"
                                id={`expenseDetail-${index}`}
                                name="expenseDetail"
                                value={expense.expenseDetail}
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
                                value={expense.amount}
                                onChange={(e) => handleChange(e, index)}
                                className="w-full p-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
                            />
                        </div>

                        <div className="mb-4">
                            <label htmlFor={`lawyer-${index}`} className="block text-gray-300 mb-2">
                                A quién se le realiza el desembolso
                            </label>
                            <Select
                                options={vendors}
                                value={vendors.find(vendor => vendor.value === expense.lawyer) || null}
                                onChange={(selectedOption) => handleSelectChange(selectedOption, index, 'lawyer')}
                                placeholder="Selecciona un proveedor"
                                classNamePrefix="react-select"
                                styles={{
                                    control: (provided) => ({
                                    ...provided,
                                    backgroundColor: '#374151', // bg-gray-700
                                    borderColor: '#4B5563', // border-gray-600
                                    color: '#FFFFFF', // text-white
                                    padding: '4px', // Match padding
                                    borderRadius: '0.5rem', // rounded-lg
                                    boxShadow: 'none',
                                    '&:hover': {
                                        borderColor: '#3B82F6', // focus:border-blue-500
                                    },
                                    }),
                                    singleValue: (provided) => ({
                                    ...provided,
                                    color: '#FFFFFF', // text-white
                                    }),
                                    placeholder: (provided) => ({
                                    ...provided,
                                    color: '#9CA3AF', // text-gray-400
                                    }),
                                    menu: (provided) => ({
                                    ...provided,
                                    backgroundColor: '#374151', // bg-gray-700
                                    borderRadius: '0.5rem', // rounded-lg
                                    }),
                                    option: (provided, state) => ({
                                    ...provided,
                                    backgroundColor: state.isFocused ? '#1F2937' : '#374151', // bg-gray-800 on hover
                                    color: '#FFFFFF', // text-white
                                    }),
                                }}
                                />

                        </div>

                        <div className="mb-4">
                            <label htmlFor={`invoiceNumber-${index}`} className="block text-gray-300 mb-2">
                                Número de factura asociada
                            </label>

                                <input
                                id={`invoiceNumber-${index}`}
                                type="text"
                                value={expense.invoiceNumber || ''}  // <- asegúrate que siempre sea string
                                onChange={(e) => handleSelectChange(e.target.value, index, 'invoiceNumber')}
                                placeholder="Buscar número de factura"
                                className="w-full px-3 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />

                        </div>
                    </div>
                ))}

                <button
                    type="button"
                    className="mt-6 bg-profile text-white py-2 px-4 rounded-lg hover:bg-purple-800 transition-colors duration-300"
                    onClick={handleAddExpense}
                >
                    Nuevo Gasto
                </button>
                <button
                    type="button"
                    className="ml-2 mt-6 bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-purple-800 transition-colors duration-300"
                    onClick={handleRemoveLastExpense}
                >
                    Eliminar Gasto
                </button>
            </div>
        </div>
    );
};

export default DisbursementGastosOficina;
