import React from 'react';

const DemandadoInfo: React.FC = () => {
  return (
    <div className="bg-black text-white p-6 rounded-lg">
      <h2 className="text-3xl font-bold">Información del Demandado</h2>
      <p className="mt-4">
        Representa a la persona a la cual se le está solicitando la demanda, en este caso la persona que debe aportar la otra parte correspondiente a la Pensión Alimenticia.
      </p>
      <p className="mt-4 font-bold">
        Debe completar la mayor cantidad de información del demandado.
      </p>
      <p className="mt-4">
        Persona demandada a quien se le solicita la pensión. Por favor incluir la mayor cantidad de información que posea. En los casos de Revisión de Pensión por Disminución o Suspensión de Pensión solamente, serían los datos de la persona que está recibiendo pensión actualmente o el tutor o representante de un menor de edad o persona con discapacidad:
      </p>
    </div>
  );
};

export default DemandadoInfo;
