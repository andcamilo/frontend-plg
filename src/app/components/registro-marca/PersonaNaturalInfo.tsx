import React, { useState } from 'react';

const PersonaNaturalInfo: React.FC = () => {
  const [showModal, setShowModal] = useState(false); // Estado para manejar el modal

  const toggleModal = () => {
    setShowModal(!showModal); // Alterna el estado del modal
  };

  return (
    <div className="text-white mt-4">
      <h1 className="text-white text-3xl font-bold flex items-center">
        Información para el Tipo de Solicitud con Persona Natural
        <div className="flex flex-col items-center">
        </div>
      </h1>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-gray-800 rounded-lg w-11/12 md:w-3/4 lg:w-1/2">
            <div className="p-4 border-b border-gray-600 flex justify-between items-center">
              <h2 className="text-white text-xl">Formulario para Persona Natural</h2>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PersonaNaturalInfo;
