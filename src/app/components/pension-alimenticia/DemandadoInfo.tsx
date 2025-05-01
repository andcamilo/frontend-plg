import React, { useState } from 'react';

const DemandadoInfo: React.FC = () => {
  const [showModal, setShowModal] = useState(false); // Estado para manejar el modal

  const toggleModal = () => {
    setShowModal(!showModal); // Alterna el estado del modal
  };

  return (
    <div className="text-white mt-4">
      <h1 className="text-white text-3xl font-bold flex items-center">
        Información del Demandado
        <div className="flex flex-col items-center">
          <button
            className="w-10 h-10 bg-white text-black rounded-md border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition-colors"
            type="button"
            onClick={toggleModal}
          >
            <FaPlay className="text-sm" />
          </button>
          <span className="hidden md:inline text-white text-xs mt-1">Ver video</span>
        </div>
      </h1>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-gray-800 rounded-lg w-11/12 md:w-3/4 lg:w-1/2">
            <div className="p-4 border-b border-gray-600 flex justify-between items-center">
              <h2 className="text-white text-xl">Información del Demandado</h2>
              <button
                className="text-white"
                onClick={toggleModal} // Cierra el modal
              >
                <i className="fa-solid fa-times"></i>
              </button>
            </div>
            <div className="p-4 text-white">
              <h5 className="text-lg">Información</h5>
              <p className="mt-2 texto_justificado">
                Descubre en este Clip cada detalle que te ayudará a entender el tipo de información que debes anexar en esta sección.
                <br />
                <br />
                ¡No dudes en explorar nuestros videos!
              </p>
              <h5 className="text-lg mt-4">Video</h5>
              <iframe
                width="100%"
                height="315"
                src="https://www.youtube.com/embed/tTWofrkhvN4"
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              ></iframe>
            </div>
            <div className="p-4 border-t border-gray-600 text-right">
              <button
                className="bg-red-600 text-white px-4 py-2 rounded-md"
                onClick={toggleModal} // Cierra el modal
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

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
