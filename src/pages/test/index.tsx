'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import xml2js from 'xml2js';
import Swal from 'sweetalert2';
import dynamic from 'next/dynamic';
import { uploadFile } from '@utils/firebase-upload';

// File Upload Component
const FileUploadComponent = ({ onFileUploaded }: { onFileUploaded: (fileUrl: string) => void }) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      // Upload to Firebase
      const downloadURL = await uploadFile(file);
      
      onFileUploaded(downloadURL);
      setUploadProgress(100);
      
      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'File uploaded successfully!',
      });
    } catch (error) {
      console.error('Upload error:', error);
      Swal.fire({
        icon: 'error',
        title: 'Upload Failed',
        text: 'Failed to upload file. Please try again.',
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="mb-4">
      <label className="block text-gray-200 mb-2">
        Upload Documents
      </label>
      <div className="relative">
        <input
          type="file"
          onChange={handleFileChange}
          disabled={uploading}
          className="block w-full text-sm text-gray-400
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-lg file:border-0
                    file:text-sm file:font-semibold
                    file:bg-blue-600 file:text-white
                    hover:file:bg-blue-700
                    disabled:opacity-50 disabled:cursor-not-allowed"
        />
        {uploading && (
          <div className="mt-2">
            <div className="w-full bg-gray-700 rounded-full h-2.5">
              <div
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-400 mt-1">
              Uploading: {uploadProgress}%
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// Ensure jQuery is loaded only once globally
const loadJQuery = async (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if ((window as any).jQuery) {
      console.log('jQuery already available');
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://code.jquery.com/jquery-3.6.0.min.js';
    script.async = true;
    script.onload = () => {
      console.log('jQuery loaded successfully');
      resolve();
    };
    script.onerror = () => reject(new Error('Failed to load jQuery'));
    document.head.appendChild(script);
  });
};

// Client-side only components
const PaymentTestWidget = dynamic(
  () => Promise.resolve(({ onTokenSuccess }: { onTokenSuccess: (token: string) => void }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [jQueryReady, setJQueryReady] = useState(false);
    const [attachedFiles, setAttachedFiles] = useState<string[]>([]);

    useEffect(() => {
      loadJQuery()
        .then(() => setJQueryReady(true))
        .catch(error => {
          console.error('Error loading jQuery:', error);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Failed to load payment dependencies.',
          });
        });

      return () => {
        const container = document.getElementById('creditcard-container');
        if (container) {
          container.innerHTML = '';
        }
        document.querySelectorAll('.ui-dialog, .ui-widget-overlay').forEach(el => el.remove());
      };
    }, []);

    useEffect(() => {
      if (!jQueryReady) return;

      (window as any).SaveCreditCard_SuccessCallback = (response: any) => {
        console.log('Token generated:', response.TokenDetails.AccountToken);
        onTokenSuccess(response.TokenDetails.AccountToken);
        setIsLoading(false);
      };

      (window as any).SaveCreditCard_FailureCallback = (response: any) => {
        console.error('Token generation failed:', response);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Payment tokenization failed. Please try again.',
        });
        setIsLoading(false);
      };

      (window as any).SaveCreditCard_CancelCallback = () => {
        console.log('Token generation cancelled');
        setIsLoading(false);
      };
    }, [jQueryReady, onTokenSuccess]);

    const loadWidget = async () => {
      if (isLoading || !jQueryReady) return;
      setIsLoading(true);

      const $ = (window as any).jQuery;
      const container = $('#creditcard-container');
      container.slideUp(500);

      try {
        const response = await $.ajax({
          type: 'GET',
          url: process.env.NEXT_PUBLIC_PAYMENT_WIDGET_URL,
          data: {
            APIKey: process.env.NEXT_PUBLIC_PAYMENT_API_KEY,
            Culture: 'es',
          },
        });

        container.html(response);
        container.slideDown(500);
      } catch (error) {
        console.error('Widget loading error:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Unable to load the payment widget. Please try again.',
        });
      } finally {
        setIsLoading(false);
      }
    };

    return (
      <div className="max-w-md mx-auto">
        <FileUploadComponent 
          onFileUploaded={(fileUrl) => {
            setAttachedFiles(prev => [...prev, fileUrl]);
            console.log('File uploaded:', fileUrl);
          }}
        />

        {attachedFiles.length > 0 && (
          <div className="mt-4 p-4 bg-gray-800 rounded-lg">
            <h3 className="text-sm font-semibold text-gray-200 mb-2">
              Attached Files:
            </h3>
            <ul className="space-y-1">
              {attachedFiles.map((url, index) => (
                <li key={index} className="text-sm text-gray-400 flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  {decodeURIComponent(url.split('/').pop() || '')}
                </li>
              ))}
            </ul>
          </div>
        )}

        <button
          onClick={loadWidget}
          disabled={isLoading || !jQueryReady}
          className={`bg-blue-600 text-white w-full py-3 rounded-lg flex items-center justify-center mb-4
                    ${(isLoading || !jQueryReady) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'}`}
        >
          {isLoading ? 'Cargando...' : !jQueryReady ? 'Inicializando...' : 'Pagar en Línea'}
        </button>

        <div 
          id="creditcard-container"
          className="bg-white rounded-lg shadow-lg p-4"
          style={{ display: 'none' }}
        />
      </div>
    );
  }),
  { ssr: false }
);

const PaymentTestSale = dynamic(
  () => Promise.resolve(({ token }: { token: string }) => {
    const [cvv, setCvv] = useState('');
    const [loading, setLoading] = useState(false);

    const handleProcessSale = async () => {
      if (!cvv) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Please enter the CVV to proceed.',
        });
        return;
      }

      setLoading(true);

      try {
        const saleAmount = 1;
        const xmlData = `<?xml version="1.0" encoding="utf-8"?>
          <soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" 
                        xmlns:xsd="http://www.w3.org/2001/XMLSchema" 
                        xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
            <soap:Body>
              <Sale xmlns="http://tempuri.org/">
                <APIKey>${process.env.NEXT_PUBLIC_PAYMENT_API_KEY}</APIKey>
                <accountToken>${token}</accountToken>
                <accessCode>${process.env.NEXT_PUBLIC_PAYMENT_ACCESS_CODE}</accessCode>
                <merchantAccountNumber>${process.env.NEXT_PUBLIC_PAYMENT_MERCHANT_ACCOUNT}</merchantAccountNumber>
                <terminalName>${process.env.NEXT_PUBLIC_PAYMENT_TERMINAL_NAME}</terminalName>
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

        const response = await axios.post('/api/sale', xmlData, {
          headers: { 'Content-Type': 'text/xml; charset=utf-8' },
        });

        xml2js.parseString(response.data, { explicitArray: false }, (err, result) => {
          if (err) throw new Error('Failed to parse sale response');
          
          const saleResult = result['soap:Envelope']['soap:Body']['SaleResponse']['SaleResult'];
          const transactionId = saleResult?.TransactionId;

          Swal.fire({
            icon: 'success',
            title: 'Payment Successful',
            text: `Transaction ID: ${transactionId || 'N/A'}`,
          });
        });
        
        setCvv('');
      } catch (error: any) {
        console.error('Sale processing error:', error);
        Swal.fire({
          icon: 'error',
          title: 'Payment Failed',
          text: error.message || 'Failed to process payment. Please try again.',
        });
      } finally {
        setLoading(false);
      }
    };

    return (
      <div className="max-w-md mx-auto p-6 bg-gray-800 rounded-lg shadow-xl">
        <h2 className="text-xl font-semibold mb-4 text-white">Process Test Payment (1 USD)</h2>

        <div className="mb-4">
          <label htmlFor="cvv" className="block text-gray-200 mb-2">
            CVV
          </label>
          <input
            type="text"
            id="cvv"
            value={cvv}
            onChange={(e) => setCvv(e.target.value)}
            maxLength={4}
            className="w-full p-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            placeholder="Enter CVV"
          />
        </div>

        <button
          onClick={handleProcessSale}
          disabled={!cvv || loading}
          className={`w-full bg-blue-600 text-white py-3 rounded-lg flex items-center justify-center
                     ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'}`}
        >
          {loading ? 'Processing...' : 'Process Payment'}
        </button>
      </div>
    );
  }),
  { ssr: false }
);

// Main page component with no server-side rendering
const PaymentTestPage = dynamic(
  () => Promise.resolve(() => {
    const [token, setToken] = useState<string>('');

    return (
      <div className="min-h-screen bg-[#13131A] text-white p-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8 text-center">Payment Test Page</h1>

          {token ? (
            <PaymentTestSale token={token} />
          ) : (
            <div className="space-y-4">
              <PaymentTestWidget
                onTokenSuccess={(newToken) => {
                  console.log('Payment token generated:', newToken);
                  setToken(newToken);
                }}
              />
              <div className="text-center">
                <p className="text-gray-400">
                  Please complete the payment widget to proceed with the test payment.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }),
  { ssr: false }
);

export default PaymentTestPage;
