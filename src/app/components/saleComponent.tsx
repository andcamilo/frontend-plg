'use client'

import React, { useState, useContext } from 'react'
import AppStateContext from '@/src/app/context/context'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import axios from 'axios'

const SaleComponent: React.FC = () => {
  const context = useContext(AppStateContext)

  const [cvv, setCvv] = useState('')
  const [saleAmount, setSaleAmount] = useState<number | string>('')
  const [loading, setLoading] = useState(false)

  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCvv(e.target.value)
  }

  const handleSaleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSaleAmount(e.target.value)
  }

  const handleProcessSale = async () => {
    if (!context?.store.token) {
      toast.error('Token is required to process the sale.')
      return
    }

    if (!cvv || !saleAmount) {
      toast.error('CVV and Sale Amount are required.')
      return
    }

    setLoading(true)

    const xmlData = `
      <?xml version="1.0" encoding="utf-8"?>
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
            <amount>${saleAmount}</amount>
            <currencyCode>840</currencyCode>
            <emailAddress>example@test.com</emailAddress>
            <shippingName>panama</shippingName>
            <shippingDate>0229</shippingDate>
            <shippingAddress>panama</shippingAddress>
            <shippingCity></shippingCity>
            <shippingState></shippingState>
            <shippingCountry></shippingCountry>
            <shippingZipCode></shippingZipCode>
            <shippingPhoneNumber></shippingPhoneNumber>
            <billingAddress></billingAddress>
            <billingCity></billingCity>
            <billingState></billingState>
            <billingCountry></billingCountry>
            <billingZipCode></billingZipCode>
            <billingPhoneNumber>995-2369</billingPhoneNumber>
            <itemDetails>
              <ItemDetails>
                <ExtensionData/>
                <Code>65</Code>
                <Name>prueba</Name>
                <Description>prueba</Description>
                <Quantity>1</Quantity>
                <UnitPrice>${saleAmount}</UnitPrice>
              </ItemDetails>
            </itemDetails>
            <systemTracking>TEST</systemTracking>
            <cvv>${cvv}</cvv>
          </Sale>
        </soap:Body>
      </soap:Envelope>
    `

    try {
      const response = await axios.post('/api/sale', xmlData, {
        headers: {
          'Content-Type': 'text/xml; charset=utf-8'
        }
      })
      
      console.log('Sale successful:', response.data)
      toast.success('Sale processed successfully!')
      // Reset form
      setCvv('')
      setSaleAmount('')
    } catch (error) {
      console.error('Error processing the sale:', error)
      if (error.response?.status === 429) {
        toast.error('Too many requests. Please try again later.')
      } else if (error.message.includes('Network Error')) {
        toast.error('Network error. Please check your internet connection or try again later.')
      } else {
        toast.error('Error processing the sale. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

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

      <div className="mb-4">
        <label htmlFor="saleAmount" className="block text-gray-300 mb-2">
          Sale Amount
        </label>
        <input
          type="number"
          id="saleAmount"
          name="saleAmount"
          value={saleAmount}
          onChange={handleSaleAmountChange}
          min="0"
          step="0.01"
          className="w-full p-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
          placeholder="Enter Sale Amount"
          aria-label="Sale amount input"
        />
      </div>

      <button
        onClick={handleProcessSale}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        disabled={!context?.store.token || !cvv || !saleAmount || loading}
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

