import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import Swal from 'sweetalert2';
import { getFirestore, collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { initializeApp, getApps, getApp } from 'firebase/app';
import AppStateContext from '@context/context';
import AppStateContextFundacion from '@context/fundacionContext';
import SociedadContext from '@context/sociedadesContext';
import MenoresContext from '@context/menoresContext';
import ConsultaContext from '@context/consultaContext';
import PaymentContext from '@context/paymentContext';

interface RegisterPaymentFormProps {
  onClose: () => void;
}

const firebaseConfig = {
  // ...your config here
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

const RegisterPaymentForm: React.FC<RegisterPaymentFormProps> = ({ onClose }) => {
  const [customerId, setCustomerId] = useState<string>('');
  const [maxAmount, setMaxAmount] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [solicitudId, setSolicitudId] = useState<string | null>(null);
  const [registerPaymentForm, setRegisterPaymentForm] = useState({
    factura: '',
    monto: '',
    fecha: '',
    correo: '',
    customer_id: '',
    payment_mode: '',
    amount: '',
    invoice_id: '',
    amount_applied: '',
  });

  // Get all contexts
  const pension    = useContext(AppStateContext);
  const fundacion  = useContext(AppStateContextFundacion);
  const sociedad   = useContext(SociedadContext);
  const menores    = useContext(MenoresContext);
  const consulta   = useContext(ConsultaContext);
  const payment    = useContext(PaymentContext);

  useEffect(() => {
    // Print the first context with a non-null solicitudId
    const contexts = [pension, fundacion, sociedad, menores, consulta, payment];
    let foundSolicitudId: string | null = null;
    for (const ctx of contexts) {
      if (ctx && ctx.store && ctx.store.solicitudId) {
        foundSolicitudId = ctx.store.solicitudId;
        setSolicitudId(foundSolicitudId);
        console.log('solicitudId:', foundSolicitudId);
        break;
      }
    }

    const fetchCustomerIdAndInvoiceId = async () => {
      try {
        const authToken = Cookies.get('AuthToken');
        if (!authToken) {
          console.error('No auth token found');
          return;
        }
        const tokenPayload = JSON.parse(atob(authToken.split('.')[1]));
        const userEmail = tokenPayload.email;
        if (!userEmail) {
          console.error('No email found in auth token');
          return;
        }

        // Query Firestore directly for customer/contact id
        const usersRef = collection(db, 'usuarios');
        const q = query(usersRef, where('email', '==', userEmail));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const userDoc = querySnapshot.docs[0];
          const contactId = userDoc.get('contact_id');
          setCustomerId(contactId);
          setRegisterPaymentForm((prev) => ({ ...prev, customer_id: contactId }));
        }

        // Fetch invoice_id and total from solicitudes if solicitudId is found
        if (foundSolicitudId) {
          const solicitudesRef = collection(db, 'solicitudes');
          const solicitudDoc = await getDocs(query(solicitudesRef, where('__name__', '==', foundSolicitudId)));
          if (!solicitudDoc.empty) {
            const doc = solicitudDoc.docs[0];
            const invoiceId = doc.get('invoice_id');
            const total = doc.get('canasta.total');
            if (invoiceId) {
              setRegisterPaymentForm((prev) => ({ ...prev, invoice_id: invoiceId }));
            }
            if (typeof total === 'number') {
              setMaxAmount(total);
            }
          }
        }

        // Set email from AuthToken if not already set
        if (userEmail) {
          setRegisterPaymentForm((prev) => ({ ...prev, correo: userEmail }));
        }
      } catch (error) {
        console.error('Error fetching customer_id or invoice_id:', error);
      }
    };

    fetchCustomerIdAndInvoiceId();
  }, []);

  const handleRegisterPaymentChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    // Enforce max for amount
    if (name === 'amount' && maxAmount !== null) {
      const numericValue = parseFloat(value);
      if (numericValue > maxAmount) {
        return;
      }
    }
    setRegisterPaymentForm((prev) => ({ ...prev, [name]: value }));
  };

  const updateSolicitudPayment = async (amount: number) => {
    if (!solicitudId) {
      console.error('No solicitudId found to update');
      return;
    }

    try {
      const solicitudRef = doc(db, 'solicitudes', solicitudId);
      
      // First, get the current document to check existing payment
      const solicitudDoc = await getDocs(query(collection(db, 'solicitudes'), where('__name__', '==', solicitudId)));
      let currentPayment = 0;
      
      if (!solicitudDoc.empty) {
        const docData = solicitudDoc.docs[0].data();
        const existingPayment = docData.canasta?.pago;
        if (typeof existingPayment === 'number') {
          currentPayment = existingPayment;
        }
      }
      
      // Sum the existing payment with the new amount
      const totalPayment = currentPayment + amount;
      
      await updateDoc(solicitudRef, {
        'canasta.pago': totalPayment
      });
      console.log('Solicitud updated with payment amount:', totalPayment, '(previous:', currentPayment, '+ new:', amount, ')');
    } catch (error) {
      console.error('Error updating solicitud with payment:', error);
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (loading) return;
    if (maxAmount !== null && parseFloat(registerPaymentForm.amount) > maxAmount) {
      Swal.fire({
        icon: 'error',
        title: 'Monto inválido',
        text: `El monto no puede ser mayor que el total permitido (${maxAmount})`,
        background: '#2c2c3e',
        color: '#fff',
      });
      return;
    }
    setLoading(true);
    try {
      const payload = {
        customer_id: registerPaymentForm.customer_id,
        payment_mode: registerPaymentForm.payment_mode,
        amount: parseFloat(registerPaymentForm.amount),
        email: registerPaymentForm.correo,
        invoices: [
          {
            invoice_id: registerPaymentForm.invoice_id,
            amount_applied: parseFloat(registerPaymentForm.amount)
          }
        ]
      };
      const response = await axios.post('/api/create-payment', payload);
      if (response.status === 200) {
        // Update the solicitud document with the payment amount
        await updateSolicitudPayment(parseFloat(registerPaymentForm.amount));
        
        Swal.fire({
          icon: 'success',
          title: 'Pago registrado',
          text: 'El pago se ha registrado correctamente.',
          background: '#2c2c3e',
          color: '#fff',
          timer: 2500,
          showConfirmButton: false,
        });
        onClose();
      }
    } catch (error) {
      console.error('Error creating payment:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Hubo un problema al registrar el pago.',
        background: '#2c2c3e',
        color: '#fff',
      });
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <input
        type="text"
        name="customer_id"
        value={customerId}
        className="p-3 rounded bg-gray-800 text-white cursor-not-allowed"
        placeholder="Contact ID"
        readOnly
        disabled
      />
      <select
        name="payment_mode"
        value={registerPaymentForm.payment_mode}
        onChange={handleRegisterPaymentChange}
        className="p-3 rounded bg-gray-800 text-white"
        required
        disabled={loading}
      >
        <option value="">Seleccionar modo de pago</option>
        <option value="check">Cheque</option>
        <option value="cash">Efectivo</option>
        <option value="creditcard">Tarjeta de Crédito</option>
        <option value="banktransfer">Transferencia Bancaria</option>
        <option value="bankremittance">Remesa Bancaria</option>
        <option value="autotransaction">Transacción Automática</option>
        <option value="other">Otro</option>
      </select>
      <input
        type="number"
        name="amount"
        value={registerPaymentForm.amount}
        onChange={handleRegisterPaymentChange}
        className="p-3 rounded bg-gray-800 text-white"
        placeholder="Monto"
        required
        min={0}
        max={maxAmount ?? undefined}
        disabled={loading}
      />
      {maxAmount !== null && (
        <span className="text-xs text-gray-400">Máximo permitido: {maxAmount}</span>
      )}
      <input
        type="text"
        name="invoice_id"
        value={registerPaymentForm.invoice_id}
        onChange={handleRegisterPaymentChange}
        className="p-3 rounded bg-gray-800 text-white"
        placeholder="Invoice ID"
        required
        readOnly
        disabled
      />
      <input
        type="date"
        name="fecha"
        value={registerPaymentForm.fecha}
        onChange={handleRegisterPaymentChange}
        className="p-3 rounded bg-gray-800 text-white"
        placeholder="Fecha de Pago"
        required
        disabled={loading}
      />
      <input
        type="email"
        name="correo"
        value={registerPaymentForm.correo}
        onChange={handleRegisterPaymentChange}
        className="p-3 rounded bg-gray-800 text-white"
        placeholder="Correo Usuario"
        required
        disabled={loading}
      />
      <button
        type="submit"
        className="bg-profile text-white py-3 rounded-lg font-semibold mt-2 hover:bg-profile/90 transition-colors"
        disabled={loading}
      >
        {loading ? 'Registrando...' : 'Registrar'}
      </button>
    </form>
  );
};

export default RegisterPaymentForm; 