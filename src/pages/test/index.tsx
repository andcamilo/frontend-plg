import { useState, useEffect } from 'react';

const Payment: React.FC = () => {
  const apiKey = 'EhrqwakURmYS'; // Hardcoded API Key
  const merchantAccountNumber = '112549'; // Hardcoded MID
  const terminalName = '112549001'; // Hardcoded TID
  const accessCode = '123123'; // Access code provided by the bank
  const [token, setToken] = useState('');

  useEffect(() => {
    // Load jQuery dynamically
    if (typeof window !== 'undefined') {
      const script = document.createElement('script');
      script.src = 'https://code.jquery.com/jquery-3.6.0.min.js';
      script.async = true;
      script.onload = () => console.log('jQuery loaded');
      document.body.appendChild(script);
    }
  }, []);

  // Function to load the payment widget when button is clicked
  const loadWidget = () => {
    if (typeof window !== 'undefined' && (window as any).$) {
      const $ = (window as any).$;
      $('#creditcard-container').slideUp(500);
      $.ajax({
        type: 'GET',
        url: 'https://bacapicomponentv2-test.merchantprocess.net/UIComponent/CreditCard',
        data: {
          APIKey: apiKey,  // Using the hardcoded API Key
          Culture: 'es',   // Language setting
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

  // Function to process a sale for 1 USD after tokenization
  const processSale = (accountToken: string) => {
    if (!accountToken) {
      console.error('Token is required to process the sale.');
      return;
    }

    const clientTracking = 'TX-' + new Date().getTime(); // Unique transaction tracking ID

    $.ajax({
      type: 'POST',
      url: 'https://apicomponentv2-test.merchantprocess.net/UIComponent/CreditCard',  // Non-SSL Sandbox Sale URL
      data: {
        APIKey: apiKey,  // Hardcoded API Key
        accountToken: accountToken,  // Token received after tokenization
        accessCode: accessCode,  // Access code provided by your bank
        merchantAccountNumber: merchantAccountNumber,  // Hardcoded MID
        terminalName: terminalName,  // Hardcoded TID
        clientTracking: clientTracking,  // Your unique tracking ID
        amount: '1.00',  // Charging 1 USD as a test
        currencyCode: '840',  // Currency code (840 = USD)
        emailAddress: 'customer@example.com'  // Customer's email (optional)
      },
      success: function(response: any) {
        console.log('Sale successful:', response);
        // Handle successful sale (e.g., show confirmation to the user)
      },
      error: function(err: any) {
        console.error('Error processing the sale:', err);
      }
    });
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Callback for successful tokenization
      (window as any).SaveCreditCard_SuccessCallback = function(response: any) {
        console.log('Tokenization successful:', response);
        setToken(response.TokenDetails.AccountToken);  // Store the token
        console.log('Token:', response.TokenDetails.AccountToken);  // Print the token
        
        processSale(response.TokenDetails.AccountToken);  // Proceed to charge the card for $1
      };

      // Callback for tokenization failure
      (window as any).SaveCreditCard_FailureCallback = function(response: any) {
        console.error('Tokenization failed:', response);
      };

      // Callback if the user cancels the credit card input
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
