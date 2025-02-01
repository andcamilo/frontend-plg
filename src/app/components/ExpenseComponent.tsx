import React, { useState } from 'react';

const ExpenseComponent: React.FC = () => {
  const expenseAccounts = [
    { id: '1', name: 'Cost of Goods Sold' },
    { id: '2', name: 'Advertising and Marketing' },
    { id: '3', name: 'Automobile Expense' },
  ];

  const paymentMethods = [
    { id: 'cash', name: 'Cash' },
    { id: 'petty_cash', name: 'Petty Cash' },
    { id: 'undeposited_funds', name: 'Undeposited Funds' },
  ];

  const vendors = [
    { id: '1', name: 'Academia', email: 'aca@de.mia' },
    { id: '2', name: 'Supplier B', email: 'supplier@b.com' },
    { id: '3', name: 'Vendor C', email: 'vendor@c.com' },
  ];

  const [expenseData, setExpenseData] = useState({
    date: new Date().toISOString().split('T')[0],
    expense_account: '',
    amount: '',
    tax: '',
    paid_through: '',
    vendor: '',
    reference: '',
    notes: '',
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setExpenseData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedAccount = expenseAccounts.find((account) => account.id === expenseData.expense_account);
    const selectedVendor = vendors.find((vendor) => vendor.id === expenseData.vendor);
    const selectedPaymentMethod = paymentMethods.find((method) => method.id === expenseData.paid_through);

    console.log('Expense Data:', {
      ...expenseData,
      expenseAccountName: selectedAccount?.name,
      vendorName: selectedVendor?.name,
      paymentMethod: selectedPaymentMethod?.name,
    });
  };

  return (
    <div className="w-full p-6 bg-gray-800 text-white rounded-md">
      <h2 className="text-xl font-bold mb-4">Crear Gasto</h2>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 gap-4">
          {/* Date */}
          <div>
            <label className="block text-sm font-medium mb-2">Fecha</label>
            <input
              type="date"
              name="date"
              value={expenseData.date}
              onChange={handleInputChange}
              className="w-full px-4 py-2 rounded-md bg-gray-700 text-white"
              required
            />
          </div>

          {/* Expense Account */}
          <div>
            <label className="block text-sm font-medium mb-2">Cuenta de Gasto</label>
            <select
              name="expense_account"
              value={expenseData.expense_account}
              onChange={handleInputChange}
              className="w-full px-4 py-2 rounded-md bg-gray-700 text-white"
              required
            >
              <option value="">Seleccione una cuenta</option>
              {expenseAccounts.map((account) => (
                <option key={account.id} value={account.id}>
                  {account.name}
                </option>
              ))}
            </select>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium mb-2">Monto</label>
            <input
              type="number"
              name="amount"
              value={expenseData.amount}
              onChange={handleInputChange}
              className="w-full px-4 py-2 rounded-md bg-gray-700 text-white"
              required
            />
          </div>

          {/* Tax */}
          <div>
            <label className="block text-sm font-medium mb-2">Impuesto</label>
            <input
              type="text"
              name="tax"
              value={expenseData.tax}
              onChange={handleInputChange}
              className="w-full px-4 py-2 rounded-md bg-gray-700 text-white"
            />
          </div>

          {/* Paid Through */}
          <div>
            <label className="block text-sm font-medium mb-2">Pagado Con</label>
            <select
              name="paid_through"
              value={expenseData.paid_through}
              onChange={handleInputChange}
              className="w-full px-4 py-2 rounded-md bg-gray-700 text-white"
              required
            >
              <option value="">Seleccione un método</option>
              {paymentMethods.map((method) => (
                <option key={method.id} value={method.id}>
                  {method.name}
                </option>
              ))}
            </select>
          </div>

          {/* Vendor */}
          <div>
            <label className="block text-sm font-medium mb-2">Proveedor</label>
            <select
              name="vendor"
              value={expenseData.vendor}
              onChange={handleInputChange}
              className="w-full px-4 py-2 rounded-md bg-gray-700 text-white"
              required
            >
              <option value="">Seleccione un proveedor</option>
              {vendors.map((vendor) => (
                <option key={vendor.id} value={vendor.id}>
                  {vendor.name} ({vendor.email})
                </option>
              ))}
            </select>
          </div>

          {/* Reference */}
          <div>
            <label className="block text-sm font-medium mb-2">Referencia</label>
            <input
              type="text"
              name="reference"
              value={expenseData.reference}
              onChange={handleInputChange}
              className="w-full px-4 py-2 rounded-md bg-gray-700 text-white"
            />
          </div>

          {/* Notes */}
          <div className="col-span-2">
            <label className="block text-sm font-medium mb-2">Notas</label>
            <textarea
              name="notes"
              value={expenseData.notes}
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
          Crear Gasto
        </button>
      </form>
    </div>
  );
};

export default ExpenseComponent;
