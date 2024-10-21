import React from 'react';

const InformacionGeneralAdicional: React.FC = () => {
  return (
    <div className="text-white mt-8">
      <h2 className="text-3xl font-bold">Información general adicional:</h2>
      <p className="mt-4">
        Se pueden aportar en la audiencia si usted no los tiene a mano en este momento. Las pruebas aplican también para demostrar lo 
        requerido en los casos de <strong>AUMENTO, DISMINUCIÓN O SUSPENSIÓN</strong> de Pensión Alimenticia.
      </p>

      <p className="mt-4">
        Para todos los procesos deben considerarse a aportar, y de la cual entre más información, es más conveniente para el cliente al 
        momento de la audiencia y evaluación del juez. Puedes marcar en las casillas de manera <strong>OPCIONAL</strong> los documentos que mantienes 
        o que puedes aportar, para que nosotros tengamos claridad de lo que tienes disponible. Al final del trámite, podrás subir las 
        copias que tengas a mano. Si no estás seguro, de igual forma estaremos coordinando contigo toda la documentación que puedas 
        aportar para la audiencia.
      </p>

      <ul className="list-disc list-inside mt-6 space-y-4">
        <li>Carta de trabajo o talonario de las partes, si no lo mantiene, podemos solicitarlo dentro del proceso;</li>
        <li>Pruebas que acrediten ingresos o bienes de las partes, si no lo mantiene, podemos solicitarlo dentro del proceso;</li>
        <li>Recibos, facturas y lista de gastos escolares;</li>
        <li>Recibos y facturas de gastos de alimentación y víveres de aseo;</li>
        <li>Recibos y facturas de gastos médicos (compra de medicamentos, consultas, laboratorios, insumos médicos);</li>
        <li>Recibos y facturas de vestido y calzado;</li>
        <li>Recibos y facturas de gastos adicionales (tratamientos, médicos especializados o educación especial);</li>
        <li>Recibos y facturas de vivienda (alquiler o hipoteca);</li>
        <li>Recibos y facturas de servicios básicos (luz, agua, teléfono, internet, televisión por cable);</li>
        <li>Recibos y facturas para acreditar gastos de recreación;</li>
      </ul>
    </div>
  );
};

export default InformacionGeneralAdicional;
