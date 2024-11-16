import React, { useContext, useEffect } from 'react';
import DesembolsoContext from '@context/desembolsoContext';

const DisbursementGastosCliente: React.FC = () => {
    const context = useContext(DesembolsoContext);

    useEffect(() => {
        if (context) {
            console.log("Current Gastos Cliente State:", context.state);
        }
    }, [context?.state]);

    if (!context) {
        return <div>Context is not available.</div>;
    }

    const { state, setState } = context;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>, index: number) => {
        const { name, value } = e.target;
        setState(prevState => ({
            ...prevState,
            desembolsoCliente: prevState.desembolsoCliente.map((item, i) =>
                i === index ? { ...item, [name]: value } : item
            )
        }));
    };

    const handleAddExpense = () => {
        const newExpense = {
            invoiceNumber: '',
            client: '',
            amount: 0,
            expenseObject: '',
            otherExpenses: '',
            billedExpensesSent: '',
            clientPaidExpensesSent: '',
            associatedExpenseDetail: '',
            lawyer: '',
        };
        setState(prevState => ({
            ...prevState,
            desembolsoCliente: [...prevState.desembolsoCliente, newExpense]
        }));
    };

    const handleRemoveLastExpense = () => {
        setState(prevState => ({
            ...prevState,
            desembolsoCliente: prevState.desembolsoCliente.slice(0, -1)
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
                            <input
                                type="text"
                                id={`invoiceNumber-${index}`}
                                name="invoiceNumber"
                                value={expense.invoiceNumber}
                                onChange={(e) => handleChange(e, index)}
                                className="w-full p-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
                            />
                        </div>

                        <div className="mb-4">
                            <label htmlFor={`client-${index}`} className="block text-gray-300 mb-2">
                                Cliente
                            </label>
                            <select
                                id={`client-${index}`}
                                name="client"
                                value={expense.client}
                                onChange={(e) => handleChange(e, index)}
                                className="w-full p-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
                            >
                                <option value="">Selecciona un cliente</option>
                                <option value="client1">Client 1</option>
                                <option value="client2">Client 2</option>
                                {/* Add more options as necessary */}
                            </select>
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
                            <select
                                id={`lawyer-${index}`}
                                name="lawyer"
                                value={expense.lawyer}
                                onChange={(e) => handleChange(e, index)}
                                className="w-full p-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
                            >
                                <option value="">Selecciona un abogado</option>
                                <option value="lawyer1">Lawyer 1</option>
                                <option value="lawyer2">Lawyer 2</option>
                                {/* Add more options as necessary */}
                            </select>
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
