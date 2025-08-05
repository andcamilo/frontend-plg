'use client';

import React, { useEffect, useContext, useState, useCallback } from 'react';
import AppStateContext from '@context/context';
import AppStateContextFundacion from '@context/fundacionContext';
import MenoresContext from '@context/menoresContext';
import SociedadContext from '@context/sociedadesContext';
import ConsultaContext from "@context/consultaContext";
import PaymentContext from '@context/paymentContext';
import { Loader2 } from 'lucide-react';

// We'll still get the context but won't require solicitudId
function usePaymentContext() {
  const pension    = useContext(AppStateContext);
  const fundacion  = useContext(AppStateContextFundacion);
  const sociedad   = useContext(SociedadContext);
  const menores    = useContext(MenoresContext);
  const consulta   = useContext(ConsultaContext);
  const payment    = useContext(PaymentContext);

  // Use the same logic as saleComponent.tsx - select context with solicitudId
  const selectedContext = pension?.store.solicitudId
    ? pension
    : fundacion?.store.solicitudId
    ? fundacion
    : sociedad?.store.solicitudId
    ? sociedad
    : menores?.store.solicitudId
    ? menores
    : consulta?.store.solicitudId
    ? consulta
    : payment;

  console.log("🚀 ~ widgetLoader ~ Context selection:");
  console.log("🚀 ~ pension solicitudId:", pension?.store.solicitudId);
  console.log("🚀 ~ fundacion solicitudId:", fundacion?.store.solicitudId);
  console.log("🚀 ~ sociedad solicitudId:", sociedad?.store.solicitudId);
  console.log("🚀 ~ menores solicitudId:", menores?.store.solicitudId);
  console.log("🚀 ~ consulta solicitudId:", consulta?.store.solicitudId);
  console.log("🚀 ~ Selected context for token:", selectedContext?.constructor.name || 'payment');

  return selectedContext;
}

const WidgetLoader: React.FC = () => {
  const ctx = usePaymentContext();
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [widgetReady, setWidgetReady] = useState(false);
  const [jQueryLoaded, setJQueryLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mount check
  useEffect(() => {
    setMounted(true);
    return () => {
      // Cleanup jQuery elements on unmount
      const container = document.getElementById('creditcard-container');
      if (container) {
        container.innerHTML = '';
      }
    };
  }, []);

  // Load jQuery
  useEffect(() => {
    if (!mounted) return;

    const existingScript = document.querySelector('script[src*="jquery"]');
    if (existingScript) {
      setJQueryLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://code.jquery.com/jquery-3.6.0.min.js';
    script.async = true;
    script.onload = () => setJQueryLoaded(true);
    script.onerror = () => setError('Failed to load jQuery');
    document.body.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [mounted]);

  // Load widget
  const loadWidget = useCallback(() => {
    if (!mounted || !jQueryLoaded) return;

    const $ = (window as any).$;
    if (!$) {
      setError('jQuery not available');
      return;
    }

    const container = $('#creditcard-container');
    if (!container.length) {
      setError('Widget container not found');
      return;
    }

    $.ajax({
      type: 'GET',
      url: process.env.NEXT_PUBLIC__PAYMENT_WIDGET_URL,
      data: {
        APIKey: process.env.NEXT_PUBLIC__PAYMENT_API_KEY,
        Culture: 'es',
      },
      success(html: string) {
        if (!mounted) return;
        container.html(html);
        setWidgetReady(true);
        setIsLoading(false);
        setError(null);
      },
      error(err: any) {
        if (!mounted) return;
        console.error('Error loading payment widget:', err);
        setError('Failed to load payment widget');
        setIsLoading(false);
      }
    });
  }, [mounted, jQueryLoaded]);

  // Auto-load widget when ready
  useEffect(() => {
    if (jQueryLoaded && mounted) {
      loadWidget();
    }
  }, [jQueryLoaded, mounted, loadWidget]);

  // Set up widget callbacks
  useEffect(() => {
    if (!jQueryLoaded || !mounted) return;

    (window as any).SaveCreditCard_SuccessCallback = (resp: any) => {
      if (!mounted) return;
      console.log('🚀 ~ Token OK:', resp.TokenDetails.AccountToken);
      console.log('🚀 ~ Setting token in context:', ctx?.constructor.name || 'Unknown');
      console.log('🚀 ~ Current context store before token set:', ctx?.store);
      
      // Only update token if we have a context
      if (ctx?.setStore) {
        ctx.setStore(prev => {
          console.log('🚀 ~ Previous store state:', prev);
          const newState = { ...prev, token: resp.TokenDetails.AccountToken };
          console.log('🚀 ~ New store state with token:', newState);
          return newState;
        });
      } else {
        console.log('🚀 ~ ERROR: No setStore function available');
      }
      setIsLoading(false);
    };

    (window as any).SaveCreditCard_FailureCallback = (resp: any) => {
      if (!mounted) return;
      console.error('Token FAIL:', resp);
      setError('Payment token generation failed');
      setIsLoading(false);
    };

    (window as any).SaveCreditCard_CancelCallback = () => {
      if (!mounted) return;
      console.log('Token CANCEL');
      setIsLoading(false);
    };
  }, [jQueryLoaded, ctx, mounted]);

  if (!mounted) {
    return null;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="w-full">
      <div className="relative">
        <div
          id="creditcard-container"
          className={`transition-opacity duration-300 ${widgetReady ? 'opacity-100' : 'opacity-0'}`}
          style={{ minHeight: widgetReady ? 'auto' : '200px' }}
        />
      </div>
    </div>
  );
};

export default WidgetLoader;
