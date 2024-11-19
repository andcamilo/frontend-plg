import React, { useContext, useEffect } from 'react';
import DesembolsoContext from '@context/desembolsoContext';
import DisbursementGastosOficina from './disbursementGastosOficina';
import DisbursementGastosCliente from './disbursementGastosCliente';
import DisbursementCajaChica from './disbursementCajaChica';
import DisbursementTransferOrPaymentDetails from './disbursementTransferOrPaymentDetails';
import DisbursementPaidDisbursementDetails from './disbursementPaidDisbursementDetails';

const Disbursement: React.FC = () => {
    const context = useContext(DesembolsoContext);

    useEffect(() => {
        if (context) {
            console.log("Current state:", context.state);
        }
    }, [context?.state]);

    if (!context) {
        return <div>Context is not available.</div>;
    }

    const { state, setState } = context;

    // Function to call the create-disbursement API
    const handleSave = async () => {
        try {
            const response = await fetch('/api/createDisbursement', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(state), // Send the current state as payload
            });

            if (!response.ok) {
                throw new Error(`Error: ${response.statusText}`);
            }

            const data = await response.json();
            console.log('Disbursement created successfully:', data);
            alert('Disbursement saved successfully!');
        } catch (error) {
            console.error('Error saving disbursement:', error);
            alert('Failed to save disbursement.');
        }
    };

    // Handler to update context state on field change
    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target;
        setState(prevState => ({
            ...prevState,
            [name]: value,
        }));
    };

    return (
        <div className="w-full p-6 bg-gray-900 min-h-screen">
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                <h2 className="text-xl font-semibold text-white mb-6">Solicitud</h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="mb-4">
                        <label htmlFor="disbursementType" className="block text-gray-300 mb-2">
                            Realizarás un
                        </label>
                        <select
                            id="disbursementType"
                            name="disbursementType"
                            value={state.disbursementType}
                            onChange={handleChange}
                            className="w-full p-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
                        >
                            <option value="desembolso-gastos">Desembolso de gastos</option>
                            <option value="desembolso-caja-chica">Desembolso de caja chica</option>
                        </select>
                    </div>

                    <div className="mb-4">
                        <label htmlFor="expenseType" className="block text-gray-300 mb-2">
                            Tipo de gasto
                        </label>
                        <select
                            id="expenseType"
                            name="expenseType"
                            value={state.expenseType}
                            onChange={handleChange}
                            className="w-full p-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
                        >
                            <option value="de-oficina">De oficina</option>
                            <option value="de-cliente">De Cliente</option>
                        </select>
                    </div>

                    <div className="mb-4">
                        <label htmlFor="status" className="block text-gray-300 mb-2">
                            Estatus
                        </label>
                        <select
                            id="status"
                            name="status"
                            value={state.status}
                            onChange={handleChange}
                            className="w-full p-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
                        >
                            <option value="creada">Creada</option>
                            <option value="rechada">Rechada</option>
                            <option value="pre-aprobada">Pre-Aprobada</option>
                            <option value="aprobada">Aprobada</option>
                            <option value="deseembolsado">Deseembolsado</option>
                            <option value="pagado-por-cliente">Pagado por el cliente</option>
                        </select>
                    </div>
                </div>
                <hr className='my-2' />
                {state.disbursementType === 'desembolso-gastos' && state.expenseType === 'de-oficina' ? (
                    <DisbursementGastosOficina />
                ) : state.disbursementType === 'desembolso-gastos' ? (
                    <DisbursementGastosCliente />
                ) : state.disbursementType === 'desembolso-caja-chica' ? (
                    <DisbursementCajaChica />
                ) : null}

                <hr className='my-6' />
                <DisbursementTransferOrPaymentDetails />
                <hr className='my-6' />
                <DisbursementPaidDisbursementDetails />

                <div className="mt-6 flex justify-end">
                    <button
                        onClick={handleSave}
                        className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
                    >
                        Guardar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Disbursement;
