"use client";
import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";

const ActaCapitalSocial: React.FC = () => {
  const [cambio, setCambio] = useState(""); // "aumento" o "disminucion"
  const [monto, setMonto] = useState("");

  useEffect(() => {
    Swal.fire({
      icon: "info",
      title: "Aumento o disminución del Capital/Patrimonio",
      html: "Indique si desea realizar un aumento o disminución del Capital/Patrimonio. Si selecciona aumento, aparecerá una advertencia sobre el coste adicional.",
      confirmButtonText: "Entendido",
      confirmButtonColor: "#3085d6",
    });
  }, []);

  return (
    <div className="space-y-4 mt-6">
      <h3 className="text-white text-lg font-bold">Aumento y disminución de Capital/Patrimonio</h3>

      <div className="space-y-2">
        <label className="text-white font-medium block">Indique el cambio a realizar:</label>
        <select
          value={cambio}
          onChange={(e) => setCambio(e.target.value)}
          className="w-full p-2 bg-gray-800 text-white rounded"
        >
          <option value="">Seleccione una opción</option>
          <option value="aumento">Aumento de Capital/Patrimonio</option>
          <option value="disminucion">Disminución de Capital/Patrimonio</option>
        </select>
      </div>

      <div className="space-y-2">
        <label className="text-white font-medium block">Indique el nuevo monto:</label>
        <input
          type="number"
          placeholder="Ingrese el nuevo monto de Capital/Patrimonio"
          value={monto}
          onChange={(e) => setMonto(e.target.value)}
          className="w-full p-2 bg-gray-800 text-white rounded"
        />
      </div>

      {cambio === "aumento" && (
        <div className="bg-yellow-100 text-yellow-800 border-l-4 border-yellow-500 p-4 rounded">
          <p className="text-sm">
            De acuerdo al monto a actualizar se genera un gasto adicional para la inscripción de la presente acta. Es importante tener en cuenta que este monto está sujeto a valor en base al monto del nuevo Capital/Patrimonio, lo que generará un coste adicional.
          </p>
        </div>
      )}
    </div>
  );
};

export default ActaCapitalSocial;
