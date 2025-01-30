import React from 'react';

const InformacionDelDemandante: React.FC = () => {
  return (
    <div className="text-white mt-4">
      <h2 className="text-3xl font-bold">Información del Demandante</h2>
      <p className="mt-4">
        El demandante se refiere a la persona que ejerce o presenta el reclamo legal, en este apartado debes completar todos los datos solicitados, 
        y tener a la mano la siguiente lista de pruebas que serán presentadas al momento de la audiencia.
      </p>

      <p className="mt-4">
        <strong className='text-red-500'>Nota:</strong> En los casos de pensión de menores de edad o personas con discapacidad, sería el padre, tutor, o quien tenga la patria potestad del menor y es quien otorga el poder. 
        En los casos de Revisión de Pensión por Disminución o Suspensión, sería quien solicita la revisión y está pagando la pensión alimenticia actualmente.
      </p>
    </div>
  );
};

export default InformacionDelDemandante;
