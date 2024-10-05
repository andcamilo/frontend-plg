import { useState, useEffect } from 'react';

const Payment: React.FC = () => {
  const [apiKey, setApiKey] = useState('EhrqwakURmYS');  // Tu API Key
  const [token, setToken] = useState('');

  useEffect(() => {
    // Cargar jQuery dinámicamente en el cliente
    if (typeof window !== 'undefined') {
      const script = document.createElement('script');
      script.src = 'https://code.jquery.com/jquery-3.6.0.min.js';
      script.async = true;
      script.onload = () => {
        console.log('jQuery cargado correctamente');
      };
      document.body.appendChild(script);
    }
  }, []);

  // Función para cargar el widget cuando se hace clic en el botón
  const loadWidget = () => {
    if (typeof window !== 'undefined' && (window as any).$) {
      const $ = (window as any).$;
      $('#creditcard-container').slideUp(500);
      $.ajax({
        type: 'GET',
        url: 'https://bacapicomponentv2-test.merchantprocess.net/UIComponent/CreditCard',  // URL del Widget
        data: {
          APIKey: apiKey,  // Proporciona tu API Key
          Culture: 'es',    // Configuración del idioma
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

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Callback de éxito cuando la tokenización es exitosa
      (window as any).SaveCreditCard_SuccessCallback = function(response: any) {
        console.log('Tokenización exitosa:', response);
        // El token que necesitas para futuros pagos está en response.TokenDetails.AccountToken
        setToken(response.TokenDetails.AccountToken);
      };

      // Callback de falla en la tokenización
      (window as any).SaveCreditCard_FailureCallback = function(response: any) {
        console.log('Fallo en la tokenización:', response);
      };

      // Callback si el usuario cancela la entrada de la tarjeta
      (window as any).SaveCreditCard_CancelCallback = function() {
        $('#creditcard-container').slideUp(500);
        console.log('Tokenización cancelada.');
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
              <div className="col-lg-6 col-md-6 col-sm-12 col-xs-12">
                <div className="form-group">
                  <label className="control-label">API Key</label>
                  <input
                    className="form-control"
                    type="text"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                  />
                </div>
              </div>
            </div>
            <div className="row">
              <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12 text-center">
                <button type="button" onClick={loadWidget} className="btn btn-primary">
                  Load Payment Widget
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
