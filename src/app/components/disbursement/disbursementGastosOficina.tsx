"use client";
import React, { useContext, useEffect, useState } from 'react';
import Select from 'react-select';
import DesembolsoContext from '@context/desembolsoContext';
import axios from 'axios';

const DisbursementGastosOficina: React.FC = () => {
    const context = useContext(DesembolsoContext);
    const [vendors, setVendors] = useState<any[]>([]);
    const [invoices, setInvoices] = useState<any[]>([]);
    const [isLoadingVendor, setIsLoadingVendor] = useState(false);

    console.log("Context state:", context?.state);
    console.log("Current vendors:", vendors);

    // First, fetch the vendor name if it exists in context
    useEffect(() => {
        const fetchVendorName = async () => {
            if (!context?.state.solicita) {
                console.log("No solicita in context");
                return;
            }

            console.log("Fetching vendor name for ID:", context.state.solicita);
            setIsLoadingVendor(true);
            try {
                const response = await axios.get('/api/get-user-id', {
                    params: { userId: context.state.solicita }
                });
                
                console.log("Vendor response:", response.data);
                if (response.data.user && response.data.user.nombre) {
                    setVendors([{
                        label: response.data.user.nombre,
                        value: response.data.user.email
                    }]);
                }
            } catch (error) {
                console.error('Error fetching vendor name:', error);
            } finally {
                setIsLoadingVendor(false);
            }
        };

        fetchVendorName();
    }, [context?.state.solicita]);

    // Then, fetch all vendors if no vendor in context
    useEffect(() => {
        const fetchVendors = async () => {
            if (context?.state.solicita) {
                console.log("Skipping vendors fetch because we have a solicita in context");
                return;
            }

            console.log("Fetching all vendors");
            try {
                const response = await fetch("/api/list-vendors");
                const data = await response.json();
                console.log("All vendors response:", data);

                const formattedVendors = data?.data?.map((vendor: any) => ({
                    label: vendor.nombre,
                    value: vendor.email,
                })) || [];

                setVendors(formattedVendors);
            } catch (error) {
                console.error("Error fetching vendors:", error);
            }
        };

        fetchVendors();
    }, [context?.state.solicita]);

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

    if (!context) return <div>Context is not available.</div>;

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

                {/* ✅ solicita Select (Global) */}
                <div className="mb-6">
                    <label htmlFor="solicita" className="block text-gray-300 mb-2">
                        Abogado 
                    </label>
                    {isLoadingVendor ? (
                        <div className="text-gray-400">Cargando proveedor...</div>
                    ) : (
                        <Select
                            inputId="solicita"
                            options={vendors}
                            value={vendors.find(v => v.value === state.solicita) || null}
                            onChange={(selectedOption) =>
                                setState((prevState) => ({
                                    ...prevState,
                                    solicita: selectedOption?.value || '',
                                }))
                            }
                            isDisabled={!!state.solicita}
                            placeholder="Selecciona un abogado"
                            classNamePrefix="react-select"
                            styles={{
                                control: (provided) => ({
                                    ...provided,
                                    backgroundColor: '#374151',
                                    borderColor: '#4B5563',
                                    color: '#FFFFFF',
                                    padding: '4px',
                                    borderRadius: '0.5rem',
                                    boxShadow: 'none',
                                    '&:hover': {
                                        borderColor: '#3B82F6',
                                    },
                                }),
                                singleValue: (provided) => ({
                                    ...provided,
                                    color: '#FFFFFF',
                                }),
                                placeholder: (provided) => ({
                                    ...provided,
                                    color: '#9CA3AF',
                                }),
                                menu: (provided) => ({
                                    ...provided,
                                    backgroundColor: '#374151',
                                    borderRadius: '0.5rem',
                                }),
                                option: (provided, state) => ({
                                    ...provided,
                                    backgroundColor: state.isFocused ? '#1F2937' : '#374151',
                                    color: '#FFFFFF',
                                }),
                            }}
                        />
                    )}
                </div>

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
                            <label htmlFor={`invoiceNumber-${index}`} className="block text-gray-300 mb-2">
                                Número de factura asociada
                            </label>
                            <input
                                id={`invoiceNumber-${index}`}
                                type="text"
                                value={expense.invoiceNumber || ''}
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
