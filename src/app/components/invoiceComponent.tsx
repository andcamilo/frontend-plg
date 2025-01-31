import React, { useState, useEffect } from 'react';
import axios from 'axios';
import get from 'lodash/get';


const InvoiceComponent: React.FC = () => {
  const clients = [
    { id: '1', name: 'Client A' },
    { id: '2', name: 'Client B' },
    { id: '3', name: 'Client C' },
  ];

  const [items, setItems] = useState([]);
  const [loadingItems, setLoadingItems] = useState(false);
  const [errorItems, setErrorItems] = useState('');

  const [invoiceData, setInvoiceData] = useState({
    customer_id: '',
    item_id: '',
    quantity: 1,
    status: 'draft',
    notes: '',
    terms: '',
  });

  useEffect(() => {
    const fetchItems = async () => {
      setLoadingItems(true);
      setErrorItems('');
      try {
        const response = await axios.get('/api/listItems'); // Adjust the API path as needed
        const apiItems = response.data?.data?.items || [];
        setItems(apiItems);
      } catch (error) {
        setErrorItems('Failed to load items');
        console.error('Error fetching items:', error);
      } finally {
        setLoadingItems(false);
      }
    };

    fetchItems();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setInvoiceData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
  
    const selectedClient = clients.find((client) => client.id === invoiceData.customer_id);
    const selectedItem = items.find((item) => get(item, 'item_id', '') === invoiceData.item_id);
  
    console.log('Invoice Data:', {
      ...invoiceData,
      clientName: get(selectedClient, 'name', 'N/A'), // Default to 'N/A' if name is missing
      itemName: get(selectedItem, 'name', 'Unknown Item'),
      itemRate: get(selectedItem, 'rate', 0),
      total: get(selectedItem, 'rate', 0) * invoiceData.quantity,
    });
  };
  

  return (
    <div className="w-full p-6 bg-gray-800 text-white rounded-md">
      <h2 className="text-xl font-bold mb-4">Crear Factura</h2>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 gap-4">
          {/* Customer Dropdown */}
          <div>
            <label className="block text-sm font-medium mb-2">Cliente</label>
            <select
              name="customer_id"
              value={invoiceData.customer_id}
              onChange={handleInputChange}
              className="w-full px-4 py-2 rounded-md bg-gray-700 text-white"
              required
            >
              <option value="">Seleccione un cliente</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </select>
          </div>

          {/* Item Dropdown */}
          <div>
            <label className="block text-sm font-medium mb-2">Artículo</label>
            {loadingItems ? (
              <p>Cargando artículos...</p>
            ) : errorItems ? (
              <p className="text-red-500">{errorItems}</p>
            ) : (
              <select
                name="item_id"
                value={invoiceData.item_id}
                onChange={handleInputChange}
                className="w-full px-4 py-2 rounded-md bg-gray-700 text-white"
                required
              >
                <option value="">Seleccione un artículo</option>
                {items.map((item: any) => (
                  <option key={item.item_id} value={item.item_id}>
                    {item.name} - ${item.rate}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Cantidad</label>
            <input
              type="number"
              name="quantity"
              value={invoiceData.quantity}
              onChange={handleInputChange}
              className="w-full px-4 py-2 rounded-md bg-gray-700 text-white"
              min="1"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Estado</label>
            <select
              name="status"
              value={invoiceData.status}
              onChange={handleInputChange}
              className="w-full px-4 py-2 rounded-md bg-gray-700 text-white"
            >
              <option value="draft">Borrador</option>
              <option value="sent">Enviado</option>
            </select>
          </div>

          {/* Notes */}
          <div className="col-span-2">
            <label className="block text-sm font-medium mb-2">Notas</label>
            <textarea
              name="notes"
              value={invoiceData.notes}
              onChange={handleInputChange}
              className="w-full px-4 py-2 rounded-md bg-gray-700 text-white"
              rows={3}
            />
          </div>

          {/* Terms */}
          <div className="col-span-2">
            <label className="block text-sm font-medium mb-2">Términos</label>
            <textarea
              name="terms"
              value={invoiceData.terms}
              onChange={handleInputChange}
              className="w-full px-4 py-2 rounded-md bg-gray-700 text-white"
              rows={3}
            />
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="mt-4 px-6 py-2 bg-profile text-white rounded-md hover:bg-profile"
        >
          Crear Factura
        </button>
      </form>
    </div>
  );
};

export default InvoiceComponent;
