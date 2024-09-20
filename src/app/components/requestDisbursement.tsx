import React, { useEffect, useState } from 'react';
import axios from 'axios';

const RequestDisbursement: React.FC = () => {
    const [formData, setFormData] = useState({
        realizaras: 'Desembolso de gastos',
        tipoGasto: 'De oficina',
        estatus: 'Creada',
        tipoGastoDetalle: 'Desembolso de comisiones',
        otroTipoGasto: '',
        detalleGasto: '',
        monto: '',
        numeroFactura: '',
        abogado: '',
        cliente: '',
        transferencia: '',
        nombreTransferencia: '',
        numeroTransferencia: '',
        bancoTransferencia: '',
        observacion: '',
        fechaPago: '',
        numeroTransaccion: '',
        archivoRecibo: null,
    });

    const [abogados, setAbogados] = useState<any[]>([]);  // Almacenar los abogados (usuarios con rol 40)
    const [clientes, setClientes] = useState<any[]>([]);  // Almacenar los clientes (usuarios con rol 17 o 10)

    useEffect(() => {
        const fetchAllUsers = async () => {
            let allUsers: any[] = [];
            let currentPage = 1;
            let hasNextPage = true;

            try {
                while (hasNextPage) {
                    const response = await axios.get('/api/user', {
                        params: {
                            limit: 100,  // Ajusta el límite por página según lo que consideres óptimo
                            page: currentPage,
                        },
                    });

                    const usuarios = response.data.usuarios;
                    allUsers = [...allUsers, ...usuarios];  // Agregar los usuarios obtenidos a la lista total

                    hasNextPage = response.data.pagination.hasNextPage;  // Verificar si hay más páginas
                    currentPage += 1;  // Pasar a la siguiente página
                }

                // Filtrar usuarios con rol 40 (Abogados)
                const abogadosFiltrados = allUsers.filter((user: any) => user.rol === 40 || user.rol === 35 || user.rol === 'abogado' || user.rol === 'asistente');
                setAbogados(abogadosFiltrados);

                // Filtrar usuarios con rol 17 o 10 (Clientes)
                const clientesFiltrados = allUsers.filter((user: any) => user.rol === 17 || user.rol === 10 || user.rol === 'cliente' || user.rol === 'cliente recurrente');
                setClientes(clientesFiltrados);

            } catch (error) {
                console.error('Error fetching users:', error);
            }
        };

        fetchAllUsers();
    }, []);  // Ejecutar solo una vez cuando el componente se monta

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Lógica para enviar los datos
        console.log('Formulario enviado:', formData);
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col p-8 w-full min-h-screen">
            <div className="bg-[#1F1F2E] p-4 rounded-lg shadow-lg w-full mb-4">
                <h2 className="text-lg font-bold text-white mb-4">Solicitud</h2>

                {/* Primera fila: Realizarás un, Tipo de gasto, Estatus */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
                    <div className="col-span-1">
                        <label className="text-gray-400">Realizarás un</label>
                        <select
                            name="realizaras"
                            value={formData.realizaras}
                            onChange={handleInputChange}
                            className="p-2 bg-gray-700 text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 w-full"
                        >
                            <option value="Desembolso de gastos">Desembolso de gastos</option>
                            <option value="Otro">Otro</option>
                        </select>
                    </div>

                    <div className="col-span-1">
                        <label className="text-gray-400">Tipo de gasto</label>
                        <select
                            name="tipoGasto"
                            value={formData.tipoGasto}
                            onChange={handleInputChange}
                            className="p-2 bg-gray-700 text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 w-full"
                        >
                            <option value="De oficina">De oficina</option>
                            <option value="Otro tipo de gasto">Otro tipo de gasto</option>
                        </select>
                    </div>

                    <div className="col-span-1">
                        <label className="text-gray-400">Estatus</label>
                        <select
                            name="estatus"
                            value={formData.estatus}
                            onChange={handleInputChange}
                            className="p-2 bg-gray-700 text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 w-full"
                        >
                            <option value="Creada">Creada</option>
                            <option value="En progreso">En progreso</option>
                            <option value="Completada">Completada</option>
                        </select>
                    </div>
                </div>

                {/* Segunda fila: Tipo de gasto detalle, Otro tipo de gasto */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                    <div className="col-span-1">
                        <label className="text-gray-400">Tipo de gasto detalle</label>
                        <select
                            name="tipoGastoDetalle"
                            value={formData.tipoGastoDetalle}
                            onChange={handleInputChange}
                            className="p-2 bg-gray-700 text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 w-full"
                        >
                            <option value="Desembolso de comisiones">Desembolso de comisiones</option>
                            <option value="Otro tipo de gasto detalle">Otro tipo de gasto detalle</option>
                        </select>
                    </div>

                    <div className="col-span-1">
                        <label className="text-gray-400">Otro tipo de gasto</label>
                        <input
                            type="text"
                            name="otroTipoGasto"
                            value={formData.otroTipoGasto}
                            onChange={handleInputChange}
                            className="p-2 bg-gray-700 text-white border border-gray-600 rounded-md focus:outline-none w-full"
                            placeholder="Especificar si aplica"
                        />
                    </div>
                </div>

                {/* Tercera fila: Detalle del gasto, Monto, Número de factura */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
                    <div className="col-span-2">
                        <label className="text-gray-400">Detalle del gasto <span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            name="detalleGasto"
                            value={formData.detalleGasto}
                            onChange={handleInputChange}
                            className="p-2 bg-gray-700 text-white border border-gray-600 rounded-md focus:outline-none w-full"
                        />
                    </div>

                    <div className="col-span-1">
                        <label className="text-gray-400">Monto ($) <span className="text-red-500">*</span></label>
                        <input
                            type="text"
                            name="monto"
                            value={formData.monto}
                            onChange={handleInputChange}
                            className="p-2 bg-gray-700 text-white border border-gray-600 rounded-md focus:outline-none w-full"
                        />
                    </div>
                </div>

                {/* Cuarta fila: A quién se le realiza el desembolso, Cliente */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
                    <div className="col-span-1">
                        <label className="text-gray-400">A quién se le realiza el desembolso</label>
                        <select
                            name="abogado"
                            value={formData.abogado}
                            onChange={handleInputChange}
                            className="p-2 bg-gray-700 text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 w-full"
                        >
                            <option value="">Selecciona un abogado</option>
                            {abogados.map((abogado) => (
                                <option key={abogado.id} value={abogado.id}>
                                    {abogado.nombre}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="col-span-1">
                        <label className="text-gray-400">Número de factura asociada</label>
                        <input
                            type="text"
                            name="numeroFactura"
                            value={formData.numeroFactura}
                            onChange={handleInputChange}
                            className="p-2 bg-gray-700 text-white border border-gray-600 rounded-md focus:outline-none w-full"
                        />
                    </div>

                    <div className="col-span-1">
                        <label className="text-gray-400">Cliente</label>
                        <select
                            name="cliente"
                            value={formData.cliente}
                            onChange={handleInputChange}
                            className="p-2 bg-gray-700 text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 w-full"
                        >
                            <option value="">Selecciona un cliente</option>
                            {clientes.map((cliente) => (
                                <option key={cliente.id} value={cliente.id}>
                                    {cliente.nombre}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Botón para asociar un nuevo gasto */}
                <button className="bg-pink-600 text-white px-4 py-2 rounded-md mb-4">Asociar nuevo gasto a la solicitud</button>
            </div>

            {/* Detalles de la transferencia o pago */}
            <div className="bg-[#1F1F2E] p-4 rounded-lg shadow-lg w-full mb-4">
                <h2 className="text-lg font-bold text-white mb-4">Detalles de la transferencia o pago</h2>

                <div className="grid grid-cols-1 lg:grid-cols-1 gap-4 mb-4">
                    <div className="col-span-1">
                        <label className="text-gray-400">Seleccionar</label>
                        <select
                            name="transferencia"
                            value={formData.transferencia}
                            onChange={handleInputChange}
                            className="p-2 bg-gray-700 text-white border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 w-full"
                        >
                            <option value="A nombre de">A nombre de</option>
                            <option value="Otro">Otro</option>
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
                    <div className="col-span-1">
                        <label className="text-gray-400">Nombre</label>
                        <input
                            type="text"
                            name="nombreTransferencia"
                            value={formData.nombreTransferencia}
                            onChange={handleInputChange}
                            className="p-2 bg-gray-700 text-white border border-gray-600 rounded-md focus:outline-none w-full"
                        />
                    </div>

                    <div className="col-span-1">
                        <label className="text-gray-400">Número</label>
                        <input
                            type="text"
                            name="numeroTransferencia"
                            value={formData.numeroTransferencia}
                            onChange={handleInputChange}
                            className="p-2 bg-gray-700 text-white border border-gray-600 rounded-md focus:outline-none w-full"
                        />
                    </div>

                    <div className="col-span-1">
                        <label className="text-gray-400">Banco</label>
                        <input
                            type="text"
                            name="bancoTransferencia"
                            value={formData.bancoTransferencia}
                            onChange={handleInputChange}
                            className="p-2 bg-gray-700 text-white border border-gray-600 rounded-md focus:outline-none w-full"
                        />
                    </div>
                </div>

                {/* Observación */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
                    <div className="col-span-2">
                        <label className="text-gray-400">Observación</label>
                        <textarea
                            name="observacion"
                            value={formData.observacion}
                            onChange={handleInputChange}
                            className="p-2 bg-gray-700 text-white border border-gray-600 rounded-md focus:outline-none w-full"
                        ></textarea>
                    </div>
                    <div className="col-span-1">
                        <label className="text-gray-400">Fecha de pago</label>
                        <input
                            type="date"
                            name="fechaPago"
                            value={formData.fechaPago}
                            onChange={handleInputChange}
                            className="p-2 bg-gray-700 text-white border border-gray-600 rounded-md focus:outline-none w-full"
                        />
                    </div>
                </div>
            </div>

            {/* Detalles del desembolso pagado */}
            <div className="bg-[#1F1F2E] p-4 rounded-lg shadow-lg w-full mb-4">
                <h2 className="text-lg font-bold text-white mb-4">Detalles del desembolso pagado</h2>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
                    <div className="col-span-1">
                        <label className="text-gray-400">Fecha de pago</label>
                        <input
                            type="date"
                            name="fechaPago"
                            value={formData.fechaPago}
                            onChange={handleInputChange}
                            className="p-2 bg-gray-700 text-white border border-gray-600 rounded-md focus:outline-none w-full"
                        />
                    </div>

                    <div className="col-span-1">
                        <label className="text-gray-400">Número de transacción</label>
                        <input
                            type="text"
                            name="numeroTransaccion"
                            value={formData.numeroTransaccion}
                            onChange={handleInputChange}
                            className="p-2 bg-gray-700 text-white border border-gray-600 rounded-md focus:outline-none w-full"
                        />
                    </div>

                    <div className="col-span-1">
                        <label className="text-gray-400">Adjuntar recibo</label>
                        <input
                            type="file"
                            name="archivoRecibo"
                            className="p-2 bg-gray-700 text-white border border-gray-600 rounded-md focus:outline-none w-full"
                        />
                    </div>
                </div>
            </div>

            {/* Botones */}
            <div className="flex justify-between mt-4">
                <button className="bg-gray-600 text-white px-4 py-2 rounded-md">Volver</button>
                <button type="submit" className="bg-pink-600 text-white px-4 py-2 rounded-md">Guardar</button>
            </div>
        </form>
    );
};

export default RequestDisbursement;
