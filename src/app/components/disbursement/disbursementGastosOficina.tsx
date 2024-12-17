"use client"
import React, { useContext, useEffect, useState } from 'react';
import DesembolsoContext from '@context/desembolsoContext';

const DisbursementGastosOficina: React.FC = () => {
    const context = useContext(DesembolsoContext);
    const [vendors, setVendors] = useState<any[]>([]);

    useEffect(() => {
        const fetchVendors = async () => {
          try {
            const response = await fetch("/api/list-vendors"); 
            const data = await response.json();
            
      
            const vendorNames = data?.data?.map((vendor: any) => vendor.contact_name) || [];
            console.log("🚀 ~ fetchVendors ~ vendorNames:", vendorNames)
            setVendors(vendorNames);
            
            console.log("Fetched Vendor Names:", vendorNames);
          } catch (error) {
            console.error("Error fetching vendors:", error);
          }
        };
      
        fetchVendors();
      }, []);

    useEffect(() => {
        if (context) {
    
        }
    }, [context?.state]);

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
            client: '',
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
                                    Otro tipos de gasto
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
                            {vendors.length === 0 ? ( // Conditional check for vendors array
                                <div className="text-gray-400">Cargando proveedores...</div>
                            ) : (
                                <select
                                id={`lawyer-${index}`}
                                name="lawyer"
                                value={expense.lawyer}
                                onChange={(e) => handleChange(e, index)}
                                className="w-full p-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
                                >
                                <option value="">Selecciona un proveedor</option>
                                {vendors.map((vendor, i) => (
                                    <option key={i} value={vendor}>
                                    {vendor}
                                    </option>
                                ))}
                                </select>
                            )}
                        </div>



                        <div className="mb-4">
                            <label htmlFor={`invoiceNumber-${index}`} className="block text-gray-300 mb-2">
                                Número de factura asociada
                            </label>
                            <input
                                type="text"
                                id={`invoiceNumber-${index}`}
                                name="invoiceNumber"
                                value={expense.invoiceNumber || ''}
                                onChange={(e) => handleChange(e, index)}
                                className="w-full p-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
                            />
                        </div>

                        <div className="mb-4">
                            <label htmlFor={`client-${index}`} className="block text-gray-300 mb-2">
                                Cliente
                            </label>
                            <input
                                type="text"
                                id={`client-${index}`}
                                name="client"
                                value={expense.client}
                                onChange={(e) => handleChange(e, index)}
                                className="w-full p-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
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
