'use client';

import React, { useState, useContext } from 'react';
import AppStateContext from '@/src/app/context/context';
import SociedadContext from '@context/sociedadesContext';
import AppStateContextFundacion from '@context/fundacionContext';
import MenoresContext from '@context/menoresContext';
import ConsultaContext from '@context/consultaContext';
import PaymentContext from '@context/paymentContext';
import { Loader2 } from 'lucide-react';
import Swal from 'sweetalert2';
import axios from 'axios';
import xml2js from 'xml2js';

interface SaleComponentProps {
  saleAmount: number;
}

const SaleComponent: React.FC<SaleComponentProps> = ({ saleAmount }) => {
  const pensionContext = useContext(AppStateContext);
  const sociedadContext = useContext(SociedadContext);
  const fundacionContext = useContext(AppStateContextFundacion);
  const menoresContext = useContext(MenoresContext);
  const consultaContext = useContext(ConsultaContext);
  const pagoContext = useContext(PaymentContext);

  // Determine which context is active
  const context =
    pensionContext?.store.solicitudId
      ? pensionContext
      : fundacionContext?.store.solicitudId
      ? fundacionContext
      : sociedadContext?.store.solicitudId
      ? sociedadContext
      : menoresContext?.store.solicitudId
      ? menoresContext
      : consultaContext?.store.solicitudId
      ? consultaContext
      : pagoContext;

  // Debug logging
  console.log("🚀 ~ SaleComponent ~ Debug Info:");
  console.log("🚀 ~ pensionContext solicitudId:", pensionContext?.store.solicitudId);
  console.log("🚀 ~ fundacionContext solicitudId:", fundacionContext?.store.solicitudId);
  console.log("🚀 ~ sociedadContext solicitudId:", sociedadContext?.store.solicitudId);
  console.log("🚀 ~ menoresContext solicitudId:", menoresContext?.store.solicitudId);
  console.log("🚀 ~ consultaContext solicitudId:", consultaContext?.store.solicitudId);
  console.log("🚀 ~ Selected context:", context?.constructor.name || 'Unknown');
  console.log("🚀 ~ context.store.token:", context?.store.token);
  console.log("🚀 ~ context.store:", context?.store);

  const [cvv, setCvv] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCvv(e.target.value);
  };

  const handleProcessSale = async () => {
    console.log("🚀 ~ handleProcessSale ~ Starting sale process");
    console.log("🚀 ~ handleProcessSale ~ context.store.token:", context?.store.token);
    
    let precioTotal = 0;
    const solicitudId = context?.store.solicitudId;

    try {
      if (!solicitudId) throw new Error('Solicitud ID is missing.');
      
      const response = await axios.get('/api/get-request-id', {
        params: { solicitudId },
      });

      precioTotal = response.data.canasta.total;
      console.log("🚀 ~ handleProcessSale ~ precioTotal:", precioTotal);
    } catch (error) {
      console.error('Error fetching solicitud:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Unable to fetch solicitud details. Please try again.',
      });
      return;
    }

    console.log("🚀 ~ handleProcessSale ~ Token check - context?.store.token:", context?.store.token);
    
    if (!context?.store.token) {
      console.log("🚀 ~ handleProcessSale ~ Token is missing or falsy");
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Token is required to process the sale.',
      });
      return;
    }

    if (!cvv) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'CVV is required.',
      });
      return;
    }

    setLoading(true);

    const xmlData = `<?xml version="1.0" encoding="utf-8"?>
      <soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" 
                     xmlns:xsd="http://www.w3.org/2001/XMLSchema" 
                     xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
        <soap:Body>
          <Sale xmlns="http://tempuri.org/">
            <APIKey>${process.env.NEXT_PUBLIC_PAYMENT_API_KEY}</APIKey>
            <accountToken>${context.store.token}</accountToken>
            <accessCode>${process.env.NEXT_PUBLIC_PAYMENT_ACCESS_CODE}</accessCode>
            <merchantAccountNumber>${process.env.NEXT_PUBLIC_PAYMENT_MERCHANT_ACCOUNT}</merchantAccountNumber>
            <terminalName>${process.env.NEXT_PUBLIC_PAYMENT_TERMINAL_NAME}</terminalName>
            <clientTracking>SALE-TRACKING-01</clientTracking>
            <amount>${precioTotal}</amount>
            <currencyCode>840</currencyCode>
            <emailAddress>example@test.com</emailAddress>
            <shippingName>Panama</shippingName>
            <shippingDate>2024-12-31</shippingDate>
            <shippingAddress>Panama Address</shippingAddress>
            <shippingCity>Panama City</shippingCity>
            <shippingState>Panama</shippingState>
            <shippingCountry>PA</shippingCountry>
            <shippingZipCode>12345</shippingZipCode>
            <shippingPhoneNumber>+5071234567</shippingPhoneNumber>
            <billingAddress>Billing Address</billingAddress>
            <billingCity>Billing City</billingCity>
            <billingState>Billing State</billingState>
            <billingCountry>US</billingCountry>
            <billingZipCode>67890</billingZipCode>
            <billingPhoneNumber>+1123456789</billingPhoneNumber>
            <itemDetails>
              <ItemDetails>
                <ExtensionData/>
                <Code>65</Code>
                <Name>Test Product</Name>
                <Description>Test Description</Description>
                <Quantity>1</Quantity>
                <UnitPrice>${precioTotal}</UnitPrice>
              </ItemDetails>
            </itemDetails>
            <systemTracking>TEST</systemTracking>
            <cvv>${cvv}</cvv>
          </Sale>
        </soap:Body>
      </soap:Envelope>`;

    try {
      const response = await axios.post('/api/sale', xmlData, {
        headers: {
          'Content-Type': 'text/xml; charset=utf-8',
        },
      });

      const xmlResponse = response.data;
      xml2js.parseString(xmlResponse, { explicitArray: false }, (err, result) => {
        if (err) {
          throw new Error('Error parsing XML response.');
        }

        const transactionId = result['soap:Envelope']['soap:Body']['SaleResponse']['SaleResult']['TransactionId'];
        setTransactionId(transactionId);
      });

      await Swal.fire({
        icon: 'success',
        title: 'Sale Successful',
        html: `<p>The sale was processed successfully!</p>`,
        confirmButtonText: 'OK',
      });

      setCvv('');
    } catch (error) {
      console.error('Error processing the sale:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message || 'Error processing the sale. Please try again.',
      });
    } finally {
      try {
        await axios.patch('/api/update-request', {
          solicitudId,
          status: 10,
        });
      } catch (updateError) {
        console.error('Error updating the request:', updateError);
      } finally {
        setLoading(false);
      }
    }
  };

  // Debug button state
  console.log("🚀 ~ SaleComponent Render ~ Button disabled conditions:");
  console.log("🚀 ~ !context?.store.token:", !context?.store.token);

  return (
    <div className="p-6 bg-[#13131A] text-white rounded-lg shadow-lg">
      <h2 className="text-xl font-semibold mb-6">Process Sale</h2>

      <div className="mb-4">
        <label htmlFor="cvv" className="block text-gray-300 mb-2">
          CVV
        </label>
        <input
          type="text"
          id="cvv"
          name="cvv"
          value={cvv}
          onChange={handleCvvChange}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleProcessSale();
            }
          }}
          maxLength={4}
          className="w-full p-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
          placeholder="Enter CVV"
          aria-label="CVV input"
        />
      </div>

      <button
        type="button"
        onClick={handleProcessSale}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        disabled={!context?.store.token || !cvv || loading}
        aria-label={loading ? 'Processing sale...' : 'Process sale'}
      >
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        {loading ? 'Processing...' : 'Process Sale'}
      </button>

      {!context?.store.token && (
        <p className="mt-4 text-yellow-500" role="alert">
          Token is not available. Please load the payment widget first.
        </p>
      )}
    </div>
  );
};

export default SaleComponent;
