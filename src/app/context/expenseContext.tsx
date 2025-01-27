import React, { createContext, useState, ReactNode } from 'react';

// Define the Expense type with only the important fields
export type Expense = {
    expenseId: string;
    transactionType: string;
    accountName: string;
    vendorName: string;
    date: string;
    total: number;
    currencyCode: string;
    referenceNumber: string;
    paymentMode: string;
    lineItems: {
        lineItemId: string;
        accountName: string;
        itemTotal: number;
        amount: number;
    }[];
};

// Initial state for the Expense
const initialExpense: Expense = {
    expenseId: '',
    transactionType: '',
    accountName: '',
    vendorName: '',
    date: '',
    total: 0,
    currencyCode: '',
    referenceNumber: '',
    paymentMode: '',
    lineItems: []
};

// Create context for Expense
const ExpenseContext = createContext<{
    expense: Expense;
    setExpense: React.Dispatch<React.SetStateAction<Expense>>;
} | undefined>(undefined);

export const ExpenseProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [expense, setExpense] = useState<Expense>(initialExpense);

    return (
        <ExpenseContext.Provider value={{ expense, setExpense }}>
            {children}
        </ExpenseContext.Provider>
    );
};

export default ExpenseContext;

// Function to map the API response to the Expense type
export const mapApiResponseToExpense = (data: any): Expense => {
    const { expense } = data;
    return {
        expenseId: expense.expense_id,
        transactionType: expense.transaction_type_formatted,
        accountName: expense.account_name,
        vendorName: expense.vendor_name,
        date: expense.date,
        total: expense.total,
        currencyCode: expense.currency_code,
        referenceNumber: expense.reference_number,
        paymentMode: expense.payment_mode,
        lineItems: expense.line_items.map((item: any) => ({
            lineItemId: item.line_item_id,
            accountName: item.account_name,
            itemTotal: item.item_total,
            amount: item.amount,
        })),
    };
};