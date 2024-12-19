import React, { useContext, useEffect, useState } from 'react';
import DesembolsoContext from '@context/desembolsoContext';
import Select from 'react-select';

const DisbursementGastosCliente: React.FC = () => {
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

                const vendorNames = data?.data?.map((vendor: any) => vendor.contact_name) || [];
                console.log("Fetched Vendor Names:", vendorNames);
                setVendors(vendorNames);
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
            desembolsoCliente: prevState.desembolsoCliente.map((item, i) =>
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
            invoiceNumber: '',
            amount: 0,
            expenseObject: '',
            otherExpenses: '',
            billedExpensesSent: '',
            clientPaidExpensesSent: '',
            associatedExpenseDetail: '',
            lawyer: '',
            status: true,
        };
        setState((prevState) => ({
            ...prevState,
            desembolsoCliente: [...prevState.desembolsoCliente, newExpense]
        }));
    };

    const handleRemoveLastExpense = () => {
        setState((prevState) => ({
            ...prevState,
            desembolsoCliente: prevState.desembolsoCliente.slice(0, -1)
        }));
    };

    const handleSelectChange = (selectedOption: any, index: number, name: string) => {
        setState((prevState) => ({
            ...prevState,
            desembolsoCliente: prevState.desembolsoCliente.map((item, i) =>
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
                <h2 className="text-xl font-semibold text-white mb-6">Gastos Cliente</h2>

                {state.desembolsoCliente.map((expense, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div className="mb-4">
                            <label htmlFor={`invoiceNumber-${index}`} className="block text-gray-300 mb-2">
                                Número de factura
                            </label>
                            <Select
                                options={invoices}
                                value={invoices.find(invoice => invoice.value === expense.invoiceNumber) || null}
                                onChange={(selectedOption) => handleSelectChange(selectedOption, index, 'invoiceNumber')}
                                placeholder="Buscar número de factura"
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
                                    input: (provided) => ({
                                        ...provided,
                                        color: '#FFFFFF',
                                    }),
                                    menu: (provided) => ({
                                        ...provided,
                                        backgroundColor: '#374151',
                                        borderRadius: '0.5rem',
                                    }),
                                    option: (provided, state) => ({
                                        ...provided,
                                        backgroundColor: state.isFocused ? '#1F2937' : '#374151',
                                        color: state.isFocused ? '#FFFFFF' : '#D1D5DB',
                                    }),
                                }}
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
                            <label htmlFor={`expenseObject-${index}`} className="block text-gray-300 mb-2">
                                Objeto de gasto
                            </label>
                            <select
                                id={`expenseObject-${index}`}
                                name="expenseObject"
                                value={expense.expenseObject}
                                onChange={(e) => handleChange(e, index)}
                                className="w-full p-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
                            >
                                <option value="certificado-registro-publico">Certificado de registro público</option>
                                <option value="copias">Copias</option>
                                <option value="carnet-trabajo">Carnet de trabajo</option>
                                <option value="carnet-residente">Carnet de residente</option>
                                <option value="carnet-tramite">Carnet de trámite</option>
                                <option value="cheques-gerencia">Cheques de gerencia</option>
                                <option value="cheque-tesoro-nacional">Cheque al tesoro nacional</option>
                                <option value="cheque-servicio-migracion">Cheque a servicio nacional de migración</option>
                                <option value="gastos-institucion-tramite">Gastos institución por trámite</option>
                                <option value="tasa-unica">Tasa única</option>
                                <option value="inscripcion-registro-publico">Inscripción de registro público</option>
                                <option value="timbre">Timbre</option>
                                <option value="notaria">Notaría</option>
                                <option value="otros">Otros</option>
                            </select>
                        </div>

                        {expense.expenseObject === 'otros' && (
                            <div className="mb-4">
                                <label htmlFor={`otherExpenses-${index}`} className="block text-gray-300 mb-2">
                                    Otros gastos
                                </label>
                                <input
                                    type="text"
                                    id={`otherExpenses-${index}`}
                                    name="otherExpenses"
                                    value={expense.otherExpenses || ''}
                                    onChange={(e) => handleChange(e, index)}
                                    className="w-full p-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
                                />
                            </div>
                        )}

                        <div className="mb-4">
                            <label htmlFor={`billedExpensesSent-${index}`} className="block text-gray-300 mb-2">
                                Gastos facturados enviados
                            </label>
                            <select
                                id={`billedExpensesSent-${index}`}
                                name="billedExpensesSent"
                                value={expense.billedExpensesSent}
                                onChange={(e) => handleChange(e, index)}
                                className="w-full p-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
                            >
                                <option value="">Seleccione</option>
                                <option value="si">Sí</option>
                                <option value="no">No</option>
                            </select>
                        </div>

                        <div className="mb-4">
                            <label htmlFor={`clientPaidExpensesSent-${index}`} className="block text-gray-300 mb-2">
                                Gastos enviados pagados por el cliente
                            </label>
                            <select
                                id={`clientPaidExpensesSent-${index}`}
                                name="clientPaidExpensesSent"
                                value={expense.clientPaidExpensesSent}
                                onChange={(e) => handleChange(e, index)}
                                className="w-full p-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
                            >
                                <option value="">Seleccione</option>
                                <option value="si">Sí</option>
                                <option value="no">No</option>
                            </select>
                        </div>

                        <div className="mb-4">
                            <label htmlFor={`lawyer-${index}`} className="block text-gray-300 mb-2">
                                Abogado
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
                                        <option key={i} value={vendor}>
                                            {vendor}
                                        </option>
                                    ))}
                                </select>
                            )}
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
                        disabled={state.desembolsoCliente.length === 0}
                    >
                        Eliminar gasto
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DisbursementGastosCliente;
