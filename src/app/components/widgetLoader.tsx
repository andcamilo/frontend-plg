import React, { useEffect, useContext, useState } from 'react';
import AppStateContext from '@context/context';
import AppStateContextFundacion from '@context/fundacionContext';
import MenoresContext from '@context/menoresContext';
import SociedadContext from '@context/sociedadesContext';
import ConsultaContext from "@context/consultaContext";
import PaymentContext from '@context/paymentContext';
import axios from "axios";
import Swal from "sweetalert2";

import { Loader2 } from 'lucide-react';

const WidgetLoader: React.FC = () => {
  const pensionContext = useContext(AppStateContext);
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

  /* const solicitudData = context?.store?.request as Record<string, any> || {}; */
  // @ts-ignore
  const solicitudData = context?.store?.request || {};

  const [isLoading, setIsLoading] = useState(false);
  console.log("CONTEX ", context)
  console.log("solicitudData :", solicitudData);

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

  const updateRequest = async () => {
    try {

      const updatePayload = {
        solicitudId: context?.store.solicitudId,
        status: 10,
      };

      await axios.post('/api/update-request-all', updatePayload);

      Swal.fire({
        title: "Espera...",
        text: "Usted no ha realizado el pago del trámite, podrá realizar el pago con tarjeta de crédito en línea, o podrá realizar una transferencia o depósito bancario, para la cual puede subir el comprobante. Mientras no realice el pago, su trámite quedará pendiente por un periodo de 72 horas, o será archivado. Puede realizar el pago posteriormente a través de su perfil en www.legix.net, entrando con la clave enviada a su correo, y posteriormente escoger la opción 'Pagar'.",
        width: "600px",
        showDenyButton: false,
        showCancelButton: false,
        confirmButtonText: "Continuar",
        confirmButtonColor: "#8B1C62",
        allowOutsideClick: true,
        background: "#2c2c3e",
        color: "#fff",
        customClass: {
          popup: "custom-swal-popup",
          title: "custom-swal-title",
          icon: "custom-swal-icon",
          timerProgressBar: "custom-swal-timer-bar"
        }
      }).then((result) => {
        if (result.isConfirmed) {
          window.location.href = "/dashboard/requests";
        }
      });

    } catch (error) {
      console.error("Error creating request:", error);
    }
  };

  return (
    <div>
      {solicitudData !== undefined && solicitudData?.status <= 10 && (
      <button
        className={`bg-profile text-white w-full py-3 rounded-lg flex items-center justify-center mb-4 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''
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
          'Pagar en Línea'
        )}
      </button>
      )}
      {solicitudData !== undefined && solicitudData?.status < 10 && ( 
      <button
        className={`bg-profile text-white w-full py-3 rounded-lg flex items-center justify-center ${isLoading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        onClick={updateRequest}
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Cargando...
          </>
        ) : (
          'Enviar y pagar más tarde'
        )}
      </button>
      )} 

      <div id="creditcard-container" style={{ marginTop: '20px' }}></div>
    </div>
  );
};

export default WidgetLoader;

