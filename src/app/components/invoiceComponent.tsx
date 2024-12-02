import React, { useState } from 'react';

const InvoiceComponent: React.FC = () => {
  const [invoiceData, setInvoiceData] = useState({
    customer_id: '',
    item_id: '',
    item_name: '',
    item_description: '',
    rate: 0,
    quantity: 1,
    status: 'draft',
    notes: '',
    terms: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setInvoiceData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Invoice Data:', invoiceData);
  };

  return (
    <div className="w-full p-6 bg-gray-800 text-white rounded-md">
      <h2 className="text-xl font-bold mb-4">Crear Factura</h2>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 gap-4">

          <div>
            <label className="block text-sm font-medium mb-2">Customer ID</label>
            <input
              type="text"
              name="customer_id"
              value={invoiceData.customer_id}
              onChange={handleInputChange}
              className="w-full px-4 py-2 rounded-md bg-gray-700 text-white"
              required
            />
          </div>

          {/* Item ID */}
          <div>
            <label className="block text-sm font-medium mb-2">Item ID</label>
            <input
              type="text"
              name="item_id"
              value={invoiceData.item_id}
              onChange={handleInputChange}
              className="w-full px-4 py-2 rounded-md bg-gray-700 text-white"
              required
            />
          </div>

          {/* Item Name */}
          <div>
            <label className="block text-sm font-medium mb-2">Item Name</label>
            <input
              type="text"
              name="item_name"
              value={invoiceData.item_name}
              onChange={handleInputChange}
              className="w-full px-4 py-2 rounded-md bg-gray-700 text-white"
            />
          </div>

          {/* Item Description */}
          <div>
            <label className="block text-sm font-medium mb-2">Item Description</label>
            <textarea
              name="item_description"
              value={invoiceData.item_description}
              onChange={handleInputChange}
              className="w-full px-4 py-2 rounded-md bg-gray-700 text-white"
              rows={3}
            />
          </div>

          {/* Rate */}
          <div>
            <label className="block text-sm font-medium mb-2">Rate</label>
            <input
              type="number"
              name="rate"
              value={invoiceData.rate}
              onChange={handleInputChange}
              className="w-full px-4 py-2 rounded-md bg-gray-700 text-white"
              required
            />
          </div>

          {/* Quantity */}
          <div>
            <label className="block text-sm font-medium mb-2">Quantity</label>
            <input
              type="number"
              name="quantity"
              value={invoiceData.quantity}
              onChange={handleInputChange}
              className="w-full px-4 py-2 rounded-md bg-gray-700 text-white"
              required
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium mb-2">Status</label>
            <select
              name="status"
              value={invoiceData.status}
              onChange={handleInputChange}
              className="w-full px-4 py-2 rounded-md bg-gray-700 text-white"
            >
              <option value="draft">Draft</option>
              <option value="sent">Sent</option>
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium mb-2">Notes</label>
            <textarea
              name="notes"
              value={invoiceData.notes}
              onChange={handleInputChange}
              className="w-full px-4 py-2 rounded-md bg-gray-700 text-white"
              rows={3}
            />
          </div>

          {/* Terms */}
          <div>
            <label className="block text-sm font-medium mb-2">Terms</label>
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
          className="mt-4 px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
        >
          Crear Factura
        </button>
      </form>
    </div>
  );
};

export default InvoiceComponent;
