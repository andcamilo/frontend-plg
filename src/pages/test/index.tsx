import { useState, useEffect } from 'react';

const Payment: React.FC = () => {
  const apiKey = 'EhrqwakURmYS';
  const merchantAccountNumber = '112549';
  const terminalName = '112549001';
  const accessCode = '123123';
  const [token, setToken] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const script = document.createElement('script');
      script.src = 'https://code.jquery.com/jquery-3.6.0.min.js';
      script.async = true;
      script.onload = () => console.log('jQuery loaded');
      document.body.appendChild(script);
    }
  }, []);

  const loadWidget = () => {
    if (typeof window !== 'undefined' && (window as any).$) {
      const $ = (window as any).$;
      $('#creditcard-container').slideUp(500);
      $.ajax({
        type: 'GET',
        url: 'https://apicomponentv2-test.merchantprocess.net/UIComponent/CreditCard',
        data: {
          APIKey: apiKey,
          Culture: 'es',
        },
        success: function (jsonResponse: any) {
          $('#creditcard-container').html(jsonResponse);
          $('#creditcard-container').slideDown(500);
        },
        error: function (err: any) {
          console.error('Error loading widget:', err);
        },
      });
    }
  };

  const processSale = (accountToken: string) => {
    if (!accountToken) {
      console.error('Token is required to process the sale.');
      return;
    }

    const xmlData = `
      <?xml version="1.0" encoding="utf-8"?>
      <soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" 
                     xmlns:xsd="http://www.w3.org/2001/XMLSchema" 
                     xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
        <soap:Body>
          <Sale xmlns="http://tempuri.org/">
            <APIKey>${apiKey}</APIKey>
            <accountToken>${accountToken}</accountToken>
            <accessCode>${accessCode}</accessCode>
            <merchantAccountNumber>${merchantAccountNumber}</merchantAccountNumber>
            <terminalName>${terminalName}</terminalName>
            <clientTracking>TEST-01</clientTracking>
            <amount>1.0</amount>
            <currencyCode>840</currencyCode>
            <emailAddress>panama@TEST.COM</emailAddress>
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
                <ExtensionData />
                <Code>65</Code>
                <Name>prueba</Name>
                <Description>prueba</Description>
                <Quantity>1</Quantity>
                <UnitPrice>38</UnitPrice>
              </ItemDetails>
            </itemDetails>
            <systemTracking>TEST</systemTracking>
            <additionalData>
              <AdditionDataDetail>
                <ExtensionData />
                <Name>TEST</Name>
                <Value></Value>
              </AdditionDataDetail>
            </additionalData>
            <cvv>123</cvv>
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
      success: function(response: any) {
        console.log('Sale successful:', response);
      },
      error: function(err: any) {
        console.error('Error processing the sale:', err);
      }
    });
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).SaveCreditCard_SuccessCallback = function(response: any) {
        console.log('Tokenization successful:', response);
        setToken(response.TokenDetails.AccountToken);
        processSale(response.TokenDetails.AccountToken);
      };

      (window as any).SaveCreditCard_FailureCallback = function(response: any) {
        console.error('Tokenization failed:', response);
      };

      (window as any).SaveCreditCard_CancelCallback = function() {
        $('#creditcard-container').slideUp(500);
        console.log('Tokenization canceled.');
      };
    }
  }, []);

  return (
    <div className="container">
      <div className="col-sm-6" style={{ margin: '0 auto', paddingTop: '10px' }}>
        <div className="panel panel-primary">
          <div className="panel-heading">Credit Card (UI Component)</div>
          <div className="panel-body">
            <div className="row">
              <div className="col-lg-12 text-center">
                <button
                  type="button"
                  onClick={() => { loadWidget(); }}
                  className="btn btn-primary"
                >
                  Mostrar Widget de Pago
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div id="creditcard-container" style={{ marginTop: '20px' }}></div>
    </div>
  );
};

export default Payment;
