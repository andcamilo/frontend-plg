'use client'

import React, { useState, useContext, useEffect } from 'react'
import AppStateContext from '@/src/app/context/context'
import SociedadContext from '@context/sociedadesContext';
import AppStateContextFundacion from '@context/fundacionContext';
import MenoresContext from '@context/menoresContext';
import ConsultaContext from "@context/consultaContext";
import { Loader2 } from 'lucide-react'
import Swal from 'sweetalert2'
import axios from 'axios'
import xml2js from 'xml2js';

interface SaleComponentProps {
  saleAmount: number
}

const SaleComponent: React.FC<SaleComponentProps> = ({ saleAmount }) => {
  const pensionContext = useContext(AppStateContext)
  const sociedadContext = useContext(SociedadContext);
  const fundacionContext = useContext(AppStateContextFundacion);
  const menoresContext = useContext(MenoresContext);
  const consultaContext = useContext(ConsultaContext);

  // Verificar con que solicitud estamos trabajando 
  const context = pensionContext
  // const context = pensionContext?.store.solicitudId
  //   ? pensionContext
  //   : fundacionContext?.store.solicitudId
  //   ? fundacionContext
  //   : sociedadContext?.store.solicitudId
  //   ? sociedadContext
  //   : menoresContext?.store.solicitudId
  //   ? menoresContext
  //   : consultaContext?.store.solicitudId
  //   ? consultaContext
  //   : pensionContext || fundacionContext || sociedadContext || menoresContext || consultaContext;

  const [cvv, setCvv] = useState('')
  const [transactionId, setTransactionId] = useState('')
  const [loading, setLoading] = useState(false)

  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCvv(e.target.value)
  }

  const handleProcessSale = async () => {
    let precioTotal = 0;
    try {
      const solicitudId = context?.store.solicitudId;
      const response = await axios.get('/api/get-request-id', {
        params: { solicitudId },
      })

      precioTotal = response.data.canasta.total;

    } catch (error) {
      console.error('Error fetching solicitud:', error);
    }
    
    if (!context?.store.token) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Token is required to process the sale.'
      })
      return
    }

    if (!cvv) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'CVV is required.'
      })
      return
    }

    setLoading(true)

    const xmlData = `<?xml version="1.0" encoding="utf-8"?>
      <soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" 
                    xmlns:xsd="http://www.w3.org/2001/XMLSchema" 
                    xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
        <soap:Body>
          <Sale xmlns="http://tempuri.org/">
            <APIKey>EhrqwakURmYS</APIKey>
            <accountToken>${context.store.token}</accountToken>
            <accessCode>123123</accessCode>
            <merchantAccountNumber>112549</merchantAccountNumber>
            <terminalName>112549001</terminalName>
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
                <UnitPrice>${saleAmount}</UnitPrice>
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
          'Content-Type': 'text/xml; charset=utf-8'
        }
      })
      console.log("🚀 ~ handleProcessSale ~ response:", response.data)

      const xmlResponse = response.data;
      xml2js.parseString(xmlResponse, { explicitArray: false }, (err, result) => {
        if (err) {
          console.error("Error parsing XML:", err);
          return;
        }
        

        const transactionId = result['soap:Envelope']['soap:Body']['SaleResponse']['SaleResult']['TransactionId'];
        console.log("🚀 ~ xml2js.parseString ~ transactionId:", transactionId)
        setTransactionId(transactionId)
        

      });

  

      await Swal.fire({
        icon: 'success',
        title: 'Sale Successful',
        html: `<p>The sale was processed successfully!</p>`,
        confirmButtonText: 'OK'
      })
      // window.location.href = "/dashboard/requests";
      // Reset form
      setCvv('')
    } catch (error) {
      console.error('Error processing the sale:', error)
      if (error.response?.status === 429) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Too many requests. Please try again later.'
        })
      } else if (error.message.includes('Network Error')) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Network error. Please check your internet connection or try again later.'
        })
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Error processing the sale. Please try again.'
        })
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const validateSale = async () => {
      if (transactionId) {
        try {
          const validateResponse = await axios.post('/api/getTransactionResult', {
            transactionId,
            amount: saleAmount,
          });

          console.log("🚀 ~ validateSale ~ validateResponse:", validateResponse.data);

          if (validateResponse.data?.data.includes('<Result>Success</Result>')) {
            await Swal.fire({
              icon: 'success',
              title: 'Sale Successful',
              html: `<p>The sale was processed and validated successfully!</p>Transaction ID: ${transactionId}`,
              confirmButtonText: 'OK',
            });

            window.location.href = "/dashboard/requests";
            setCvv('');
          } else {
            throw new Error('Validation failed');
          }
        } catch (error) {
          console.error("Error validating the sale:", error);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Failed to validate the sale. Please try again.',
          });
        }
      }
    };

    validateSale();
  }, [transactionId, saleAmount]); // Depend on transactionId and saleAmount


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
          maxLength={4}
          className="w-full p-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
          placeholder="Enter CVV"
          aria-label="CVV input"
        />
      </div>

      <button
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
  )
}

export default SaleComponent
