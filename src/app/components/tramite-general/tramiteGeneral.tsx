import React, { useState } from "react";
import ClipLoader from "react-spinners/ClipLoader";

const SolicitudForm: React.FC = () => {
  const [formData, setFormData] = useState({
    tipoServicio: "",
    nivelUrgencia: "",
    descripcion: "",
    documentos: [null, null, null], // Manejo de 3 documentos
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type, /* files */ } = e.target;

    if (type === "file") {
      const index = parseInt(name.split("-")[1], 10); // Extract index from "documento-{index}"
      const newDocumentos = [...formData.documentos];
      /* newDocumentos[index] = files ? files[0] : null; */
      setFormData((prevData) => ({
        ...prevData,
        documentos: newDocumentos,
      }));
    } else {
      setFormData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Aquí puedes manejar el envío del formulario
    console.log("Formulario enviado:", formData);

    setTimeout(() => {
      setIsLoading(false);
    }, 2000); // Simulación de espera
  };

  return (
    <div className="w-full h-full p-8 bg-[#070707]">
      <h1 className="text-white text-3xl font-bold mb-6">Solicitud</h1>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Tipo de Servicio */}
          <div className="flex flex-col">
            <label className="text-white mb-2">Detalle el tipo de servicio que requiere</label>
            <select
              name="tipoServicio"
              value={formData.tipoServicio}
              onChange={handleChange}
              className="p-4 bg-gray-800 text-white rounded-lg"
              required
            >
              <option value="" disabled>
                Seleccione una opción
              </option>
              <option value="contrato">Revisión o Elaboración de Contrato</option>
              <option value="asesoria">Asesoría Legal</option>
              <option value="otro">Otro</option>
            </select>
          </div>

          {/* Nivel de Urgencia */}
          <div className="flex flex-col">
            <label className="text-white mb-2">Nivel de urgencia</label>
            <select
              name="nivelUrgencia"
              value={formData.nivelUrgencia}
              onChange={handleChange}
              className="p-4 bg-gray-800 text-white rounded-lg"
              required
            >
              <option value="" disabled>
                Seleccione una opción
              </option>
              <option value="bajo">Bajo: No excede de 15 días hábiles</option>
              <option value="medio">Medio: Entre 5 y 10 días hábiles</option>
              <option value="alto">Alto: Máximo 3 días hábiles</option>
            </select>
            <small className="text-gray-400 mt-1">
              * Por favor tomar nota de que los tiempos establecidos son aproximados.
            </small>
          </div>

          {/* Descripción del Requerimiento */}
          <div className="col-span-2 flex flex-col">
            <label className="text-white mb-2">
              Descripción del requerimiento o situación, si son varios, puede detallarlos en puntos separados en la
              siguiente casilla. <span className="text-red-500">*</span>
            </label>
            <textarea
              name="descripcion"
              value={formData.descripcion}
              onChange={handleChange}
              className="w-full p-4 bg-gray-800 text-white rounded-lg h-32"
              required
            />
          </div>

          {/* Subir Documentos */}
          <div className="col-span-2">
            <label className="text-white mb-2">Subir documentos</label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* {[0, 1, 2].map((index) => (
                <div key={index}>
                  <input
                    type="file"
                    name={`documento-${index}`}
                    onChange={handleChange}
                    className="p-4 bg-gray-800 text-white rounded-lg w-full"
                  />
                  <p className="text-gray-400 mt-2">
                    {formData.documentos[index]
                      ? formData.documentos[index]?.name
                      : "Sin archivos seleccionados"}
                  </p>
                </div>
              ))} */}
            </div>
            <small className="text-gray-400 mt-1">
              * Puede incluir los documentos necesarios para la gestión del trámite.
            </small>
          </div>
        </div>

        {/* Botones */}
        <div className="flex justify-center mt-6 gap-x-4">
          <button
            type="button"
            className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600"
            onClick={() => console.log("Volver")}
          >
            Volver
          </button>
          <button
            type="submit"
            className="bg-pink-600 text-white px-6 py-3 rounded-lg hover:bg-pink-700"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <ClipLoader size={20} color="#ffffff" />
                <span className="ml-2">Enviando...</span>
              </div>
            ) : (
              "Enviar"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SolicitudForm;
