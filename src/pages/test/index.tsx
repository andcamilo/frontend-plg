'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import xml2js from 'xml2js';
import Swal from 'sweetalert2';

const PaymentTestWidget: React.FC<{
  onTokenSuccess: (token: string) => void;
}> = ({ onTokenSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const script = document.createElement('script');
      script.src = 'https://code.jquery.com/jquery-3.6.0.min.js';
      script.async = true;
      script.onload = () => console.log('jQuery loaded');
      document.body.appendChild(script);
    }

    if (typeof window !== 'undefined') {
      (window as any).SaveCreditCard_SuccessCallback = function (response: any) {
        console.log('Tokenization successful:', response.TokenDetails.AccountToken);
        onTokenSuccess(response.TokenDetails.AccountToken);
        setIsLoading(false);
      };

      (window as any).SaveCreditCard_FailureCallback = function (response: any) {
        console.error('Tokenization failed:', response);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Tokenization failed. Please try again.',
        });
        setIsLoading(false);
      };

      (window as any).SaveCreditCard_CancelCallback = function () {
        console.log('Tokenization canceled.');
        setIsLoading(false);
      };
    }
  }, [onTokenSuccess]);

  const loadWidget = () => {
    if (isLoading) return;
    setIsLoading(true);

    if (typeof window !== 'undefined' && (window as any).$) {
      const $ = (window as any).$;
      $('#creditcard-container').slideUp(500);

      $.ajax({
        type: 'GET',
        url: 'https://bacgateway.merchantprocess.net/SecureComponent/v2/UIComponent/CreditCard', 
        data: {
          APIKey: 'AgR2KqHC7mPl', 
          Culture: 'es',
        },
        success: function (jsonResponse: any) {
          $('#creditcard-container').html(jsonResponse);
          $('#creditcard-container').slideDown(500);
          setIsLoading(false);
        },
        error: function (err: any) {
          console.error('Error loading widget:', err);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Unable to load the payment widget. Please try again later.',
          });
          setIsLoading(false);
        },
      });
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'jQuery not loaded yet or browser environment not available.',
      });
      setIsLoading(false);
    }
  };

  return (
    <div>
      <button
        onClick={loadWidget}
        disabled={isLoading}
        className={`bg-blue-600 text-white w-full py-3 rounded-lg flex items-center justify-center mb-4 ${
          isLoading ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        {isLoading ? 'Cargando...' : 'Pagar en Línea'}
      </button>

      <div id="creditcard-container" style={{ marginTop: '20px' }} />
    </div>
  );
};

const PaymentTestSale: React.FC<{
  token: string;
}> = ({ token }) => {
  const [cvv, setCvv] = useState('');
  const [loading, setLoading] = useState(false);

  const handleProcessSale = async () => {
    if (!token) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No token found. Please load the payment widget first.',
      });
      return;
    }

    if (!cvv) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'CVV is required to proceed.',
      });
      return;
    }

    setLoading(true);

    const saleAmount = 1;
    const xmlData = `<?xml version="1.0" encoding="utf-8"?>
      <soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" 
                     xmlns:xsd="http://www.w3.org/2001/XMLSchema" 
                     xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
        <soap:Body>
          <Sale xmlns="http://tempuri.org/">
            <APIKey>AgR2KqHC7mPl</APIKey>
            <accountToken>${token}</accountToken>
            
            <!-- Ajustar el 'accessCode' real de producción (si difiere) -->
            <accessCode>123123</accessCode>
            
            <!-- PRODUCCIÓN: MID y TID -->
            <merchantAccountNumber>103333</merchantAccountNumber>
            <terminalName>103333001</terminalName>
            
            <clientTracking>SALE-TRACKING-01</clientTracking>
            <amount>${saleAmount}</amount>
            <currencyCode>840</currencyCode>
            <emailAddress>example@test.com</emailAddress>
            <shippingName>Testing</shippingName>
            <shippingDate>2025-12-31</shippingDate>
            <shippingAddress>Some Street</shippingAddress>
            <shippingCity>Some City</shippingCity>
            <shippingState>Some State</shippingState>
            <shippingCountry>US</shippingCountry>
            <shippingZipCode>12345</shippingZipCode>
            <shippingPhoneNumber>+10123456789</shippingPhoneNumber>
            <billingAddress>Billing Address</billingAddress>
            <billingCity>Billing City</billingCity>
            <billingState>Billing State</billingState>
            <billingCountry>US</billingCountry>
            <billingZipCode>67890</billingZipCode>
            <billingPhoneNumber>+10123456789</billingPhoneNumber>
            <itemDetails>
              <ItemDetails>
                <ExtensionData/>
                <Code>65</Code>
                <Name>Test Product</Name>
                <Description>Paying 1 USD</Description>
                <Quantity>1</Quantity>
                <UnitPrice>${saleAmount}</UnitPrice>
              </ItemDetails>
            </itemDetails>
            <systemTracking>TEST</systemTracking>
            <cvv>${cvv}</cvv>
          </Sale>
        </soap:Body>
      </soap:Envelope>`;

    try {
      // Endpoint SOAP de producción
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
        const body = result['soap:Envelope']['soap:Body'];
        const saleResult = body['SaleResponse']['SaleResult'];
        const transactionId = saleResult?.TransactionId;

        Swal.fire({
          icon: 'success',
          title: 'Sale Successful',
          text: `Transaction ID: ${transactionId || 'N/A'}`,
        });
      });
      setCvv('');
    } catch (error: any) {
      console.error('Error processing the sale:', error);
      Swal.fire({
        icon: 'error',
        title: 'Sale Error',
        text: error.message || 'Something went wrong while processing the sale.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-gray-800 rounded">
      <h2 className="text-xl font-semibold mb-4">Process Test Sale (1 USD)</h2>

      <div className="mb-4">
        <label htmlFor="cvv" className="block text-gray-200 mb-2">
          CVV
        </label>
        <input
          type="text"
          id="cvv"
          name="cvv"
          value={cvv}
          onChange={(e) => setCvv(e.target.value)}
          maxLength={4}
          className="w-full p-2 bg-gray-700 text-white rounded"
          placeholder="Enter CVV"
        />
      </div>

      <button
        onClick={handleProcessSale}
        disabled={!token || !cvv || loading}
        className="w-full bg-blue-600 text-white py-2 rounded flex items-center justify-center"
      >
        {loading ? 'Processing...' : 'Process Sale'}
      </button>
      {!token && (
        <p className="mt-2 text-yellow-500">
          Please load the payment widget and obtain a token first.
        </p>
      )}
    </div>
  );
};

// 3) PAGE CONTAINER
const PaymentTestPage: React.FC = () => {
  const [token, setToken] = useState<string>('');

  return (
    <div className="min-h-screen bg-[#13131A] text-white p-6">
      <h1 className="text-2xl font-semibold mb-6">Payment Test Page</h1>

      {/* Payment Widget Loader */}
      <PaymentTestWidget onTokenSuccess={(newToken) => setToken(newToken)} />

      {/* If we have a token, show the sale component */}
      {token ? (
        <div className="mt-6">
          <PaymentTestSale token={token} />
        </div>
      ) : (
        <p className="mt-4 text-gray-400">
          Please complete the payment widget to proceed with the sale.
        </p>
      )}
    </div>
  );
};

export default PaymentTestPage;