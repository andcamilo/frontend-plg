import React, { useEffect, useContext, useState } from 'react';
import AppStateContext from '@context/context';
import AppStateContextFundacion from '@context/fundacionContext';
import MenoresContext from '@context/menoresContext';
import SociedadContext from '@context/sociedadesContext';
import ConsultaContext from "@context/consultaContext";
import PaymentContext from '@context/paymentContext';

import { Loader2 } from 'lucide-react';

const WidgetLoader: React.FC = () => {
  const pensionContext = useContext(AppStateContext)
  const sociedadContext = useContext(SociedadContext);
  const fundacionContext = useContext(AppStateContextFundacion);
  const menoresContext = useContext(MenoresContext);
  const consultaContext = useContext(ConsultaContext);
  const pagoContext = useContext(PaymentContext);

 const context = pensionContext?.store.solicitudId
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
        if (context) {
          context.setStore((prevState) => ({
            ...prevState,
            token: response.TokenDetails.AccountToken,
          }));
        }
        setIsLoading(false);
      };

      
      

      (window as any).SaveCreditCard_FailureCallback = function (response: any) {
        console.error('Tokenization failed:', response);
        setIsLoading(false);
      };

      (window as any).SaveCreditCard_CancelCallback = function () {
        console.log('Tokenization canceled.');
        setIsLoading(false);
      };
    }
  }, [context]);
  useEffect(() => {
    console.log("Updated token:", context?.store.token);
  }, [context?.store.token]);

  const loadWidget = () => {
    if (isLoading) return;

    setIsLoading(true);
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
          setIsLoading(false);
        },
        error: function (err: any) {
          console.error('Error loading widget:', err);
          setIsLoading(false);
        },
      });
    } else {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <button
        className={`bg-green-500 text-white w-full py-3 rounded-lg flex items-center justify-center ${
          isLoading ? 'opacity-50 cursor-not-allowed' : ''
        }`}
        onClick={loadWidget}
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Cargando...
          </>
        ) : (
          'Pagar'
        )}
      </button>
      <div id="creditcard-container" style={{ marginTop: '20px' }}></div>
    </div>
  );
};

export default WidgetLoader;

