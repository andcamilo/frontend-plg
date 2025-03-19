import { useEffect } from 'react';

const TokenizationWidget: React.FC = () => {
  const apiKey = process.env.NEXT_PUBLIC__PAYMENT_API_KEY

  useEffect(() => {
    // Cargar jQuery dinámicamente
    if (typeof window !== 'undefined') {
      const script = document.createElement('script');
      script.src = 'https://code.jquery.com/jquery-3.6.0.min.js';
      script.async = true;
      script.onload = () => {
        console.log('jQuery cargado correctamente');
        loadWidget(); // Cargar el widget inmediatamente cuando se carga el script
      };
      document.body.appendChild(script);
    }
  }, []);

  // Función para cargar el widget
  const loadWidget = () => {
    if (typeof window !== 'undefined' && (window as any).$) {
      const $ = (window as any).$;
      $('#creditcard-container').slideUp(500);
      $.ajax({
        type: 'GET',
        url: process.env.NEXT_PUBLIC__PAYMENT_WIDGET_URL,
        data: {
          APIKey: apiKey, 
          Culture: 'es',
        },
        success: function (jsonResponse: any) {
          $('#creditcard-container').html(jsonResponse);
          $('#creditcard-container').slideDown(500);
        },
        error: function (err: any) {
          console.error('Error al cargar el widget:', err);
        },
      });
    }
  };

  return (
    <div id="creditcard-container" style={{ marginTop: '20px' }}></div>
  );
};

export default TokenizationWidget;
