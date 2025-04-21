import React, { useContext, useEffect, useState } from 'react';
import DesembolsoContext from '@context/desembolsoContext';
import Select from 'react-select';
import axios from 'axios';
import { ref, uploadBytes, getStorage } from 'firebase/storage';
import { v4 as uuidv4 } from 'uuid';

const DisbursementCajaChica: React.FC = () => {
    const context = useContext(DesembolsoContext);
    const [vendors, setVendors] = useState<any[]>([]);
    const [invoices, setInvoices] = useState<any[]>([]);
    const [isLoadingVendor, setIsLoadingVendor] = useState(false);
    const [uploading, setUploading] = useState<{ [key: number]: boolean }>({});
    const storage = getStorage();

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
                        value: context.state.solicita
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
                    value: vendor.cuenta,
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

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(prev => ({ ...prev, [index]: true }));

        try {
            // Create a reference to the file in Firebase Storage
            const fileName = `${uuidv4()}_${file.name}`;
            const storageRef = ref(storage, `paid_disbursements/${fileName}`);

            // Upload the file
            await uploadBytes(storageRef, file);

            // Update the state with the file reference
            setState((prevState) => ({
                ...prevState,
                desembolsoCajaChica: prevState.desembolsoCajaChica.map((item, i) =>
                    i === index
                        ? {
                            ...item,
                            fileRef: `paid_disbursements/${fileName}`,
                            status: true,
                        }
                        : item
                ),
            }));
        } catch (error) {
            console.error('Error uploading file:', error);
            alert('Error al subir el archivo. Por favor, intente de nuevo.');
        } finally {
            setUploading(prev => ({ ...prev, [index]: false }));
        }
    };

    return (
        <div className="p-1">
            <div className="p-1 rounded-lg shadow-lg">
                <h2 className="text-xl font-semibold text-white mb-6">Caja Chica</h2>

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

                {state.desembolsoCajaChica.map((expense, index) => (
                    <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
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

                        <div className="mb-4">
                            <label htmlFor={`file-${index}`} className="block text-gray-300 mb-2">
                                Adjuntar comprobante
                            </label>
                            <input
                                type="file"
                                id={`file-${index}`}
                                accept="image/*,.pdf"
                                onChange={(e) => handleFileUpload(e, index)}
                                className="w-full p-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
                                disabled={uploading[index]}
                            />
                            {uploading[index] && (
                                <div className="text-sm text-gray-400 mt-1">
                                    Subiendo archivo...
                                </div>
                            )}
                            {expense.fileRef && !uploading[index] && (
                                <div className="text-sm text-green-400 mt-1">
                                    ✓ Archivo subido
                                </div>
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
