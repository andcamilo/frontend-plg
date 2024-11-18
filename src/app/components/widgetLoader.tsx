import React, { useEffect, useContext } from 'react';
import AppStateContext from '@context/context';

const WidgetLoader: React.FC = () => {
  const context = useContext(AppStateContext);

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
        console.log('Tokenization successful:', response);
        if (context) {
          context.setStore((prevState) => ({
            ...prevState,
            token: response.TokenDetails.AccountToken,
          }));
        }
      };

      (window as any).SaveCreditCard_FailureCallback = function (response: any) {
        console.error('Tokenization failed:', response);
      };

      (window as any).SaveCreditCard_CancelCallback = function () {
        console.log('Tokenization canceled.');
      };
    }
  }, [context]);

  const loadWidget = () => {
    if (typeof window !== 'undefined' && (window as any).$) {
      const $ = (window as any).$;
      $('#creditcard-container').slideUp(500);
      $.ajax({
        type: 'GET',
        url: 'https://apicomponentv2-test.merchantprocess.net/UIComponent/CreditCard',
        data: {
          APIKey: 'EhrqwakURmYS',
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

  return (
    <div>
      <button
        type="button"
        onClick={loadWidget}
        className="btn btn-primary"
      >
        Mostrar Widget de Pago
      </button>
      <div id="creditcard-container" style={{ marginTop: '20px' }}></div>
    </div>
  );
};

export default WidgetLoader;
