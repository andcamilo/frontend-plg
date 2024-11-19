import React, { useState, useContext } from 'react';
import AppStateContext from '@context/context';

const SaleComponent: React.FC = () => {
  const context = useContext(AppStateContext);

  const [cvv, setCvv] = useState('');
  const [saleAmount, setSaleAmount] = useState<number | string>('');

  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCvv(e.target.value);
  };

  const handleSaleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSaleAmount(e.target.value);
  };

  const processSale = () => {
    if (!context?.store.token) {
      console.error('Token is required to process the sale.');
      return;
    }

    if (!cvv || !saleAmount) {
      console.error('CVV and Sale Amount are required.');
      return;
    }

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
            <amount>1.00</amount>
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
                <UnitPrice>38</UnitPrice>
              </ItemDetails>
            </itemDetails>
            <systemTracking>TEST</systemTracking>
            <cvv>${cvv}</cvv>
          </Sale>
        </soap:Body>
      </soap:Envelope>
    `;

    $.ajax({
      type: 'POST',
      url: 'http://tokenv2.test.merchantprocess.net/TokenWebService.asmx',
      data: xmlData,
      contentType: 'text/xml; charset=utf-8',
      headers: {
        SOAPAction: '"http://tempuri.org/Sale"',
      },
      success: function (response: any) {
        console.log('Sale successful:', response);
        alert('Sale processed successfully!');
      },
      error: function (err: any) {
        console.error('Error processing the sale:', err);
        alert('Error processing the sale. Please try again.');
      },
    });
  };

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
          className="w-full p-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
          placeholder="Enter CVV"
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
          className="w-full p-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
          placeholder="Enter Sale Amount"
        />
      </div>

      <button
        onClick={processSale}
        className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-800 transition-colors duration-300"
        disabled={!context?.store.token || !cvv || !saleAmount}
      >
        Process Sale
      </button>

      {!context?.store.token && (
        <p className="mt-4 text-red-500">Token is not available. Please load the payment widget first.</p>
      )}
    </div>
  );
};

export default SaleComponent;
