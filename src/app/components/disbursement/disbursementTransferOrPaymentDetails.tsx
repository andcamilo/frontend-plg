import React, { useContext, useEffect } from 'react';
import DesembolsoContext from '@context/desembolsoContext';

const DisbursementTransferOrPaymentDetails: React.FC = () => {
    const context = useContext(DesembolsoContext);

    useEffect(() => {
        if (context) {
            console.log("Current Transfer or Payment Details State:", context.state);
        }
    }, [context?.state]);

    if (!context) {
        return <div>Context is not available.</div>;
    }

    const { state, setState } = context;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setState(prevState => ({
            ...prevState,
            detalleTransferenciaPago: {
                ...prevState.detalleTransferenciaPago,
                [name]: value
            }
        }));
    };

    return (
        <div className="p-1">
            <div className="p-1 rounded-lg shadow-lg">
                <h2 className="text-xl font-semibold text-white mb-6">Detalles de la transferencia o pago</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="mb-4">
                        <label htmlFor="selectOption" className="block text-gray-300 mb-2">
                            Seleccionar
                        </label>
                        <select
                            id="selectOption"
                            name="selectOption"
                            value={state.detalleTransferenciaPago.selectOption}
                            onChange={handleChange}
                            className="w-full p-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
                        >
                            <option value="">A nombre de</option>
                            {/* Add more options as necessary */}
                        </select>
                    </div>

                    <div className="mb-4">
                        <label htmlFor="name" className="block text-gray-300 mb-2">
                            Nombre
                        </label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={state.detalleTransferenciaPago.name}
                            onChange={handleChange}
                            className="w-full p-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
                        />
                    </div>

                    <div className="mb-4">
                        <label htmlFor="number" className="block text-gray-300 mb-2">
                            Número
                        </label>
                        <input
                            type="text"
                            id="number"
                            name="number"
                            value={state.detalleTransferenciaPago.number}
                            onChange={handleChange}
                            className="w-full p-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
                        />
                    </div>

                    <div className="mb-4">
                        <label htmlFor="bank" className="block text-gray-300 mb-2">
                            Banco
                        </label>
                        <input
                            type="text"
                            id="bank"
                            name="bank"
                            value={state.detalleTransferenciaPago.bank}
                            onChange={handleChange}
                            className="w-full p-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
                        />
                    </div>

                    <div className="mb-4">
                        <label htmlFor="observation" className="block text-gray-300 mb-2">
                            Observación
                        </label>
                        <textarea
                            id="observation"
                            name="observation"
                            value={state.detalleTransferenciaPago.observation || ''}
                            onChange={handleChange}
                            className="w-full p-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
                        ></textarea>
                    </div>

                    <div className="mb-4">
                        <label htmlFor="paymentDate" className="block text-gray-300 mb-2">
                            Fecha de pago
                        </label>
                        <input
                            type="date"
                            id="paymentDate"
                            name="paymentDate"
                            value={state.detalleTransferenciaPago.paymentDate}
                            onChange={handleChange}
                            className="w-full p-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DisbursementTransferOrPaymentDetails;
