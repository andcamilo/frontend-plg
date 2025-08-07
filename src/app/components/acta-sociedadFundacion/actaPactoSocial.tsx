"use client";
import React, { useState } from "react";

type ClausulaCambio = {
  clausula: string;
  motivo: string;
  cambio: string;
};

const ActaPactoSocial = () => {
  const [clausulas, setClausulas] = useState<ClausulaCambio[]>([
    { clausula: "", motivo: "", cambio: "" },
  ]);

  const handleChange = (
    index: number,
    field: keyof ClausulaCambio,
    value: string
  ) => {
    const actualizadas = [...clausulas];
    actualizadas[index][field] = value;
    setClausulas(actualizadas);
  };

  const agregarClausula = () => {
    setClausulas([...clausulas, { clausula: "", motivo: "", cambio: "" }]);
  };

  const eliminarClausula = (index: number) => {
    if (clausulas.length > 1) {
      const actualizadas = [...clausulas];
      actualizadas.splice(index, 1);
      setClausulas(actualizadas);
    }
  };

  return (
    <div className="space-y-6 mt-6">
      <h3 className="text-white text-lg font-bold">
        Cambio de cláusula del Pacto Social
      </h3>

      {clausulas.map((clausula, index) => (
        <div
          key={index}
          className="border border-gray-600 p-4 rounded space-y-4 relative"
        >
          {clausulas.length > 1 && (
            <button
              onClick={() => eliminarClausula(index)}
              className="absolute top-2 right-2 text-red-500 hover:text-red-700 text-sm"
              title="Eliminar"
            >
              ✖
            </button>
          )}

          <div>
            <label className="block text-white font-semibold mb-1">
              Cláusula a modificar:
            </label>
            <input
              type="text"
              className="w-full p-2 bg-gray-800 text-white rounded"
              placeholder="Indique las cláusulas que desea modificar"
              value={clausula.clausula}
              onChange={(e) =>
                handleChange(index, "clausula", e.target.value)
              }
            />
          </div>

          <div>
            <label className="block text-white font-semibold mb-1">
              Motivo del cambio:
            </label>
            <textarea
              className="w-full p-2 bg-gray-800 text-white rounded"
              placeholder="Indique el motivo por el cual desea modificar la cláusula"
              value={clausula.motivo}
              onChange={(e) =>
                handleChange(index, "motivo", e.target.value)
              }
            />
          </div>

          <div>
            <label className="block text-white font-semibold mb-1">
              Descripción del cambio:
            </label>
            <textarea
              className="w-full p-2 bg-gray-800 text-white rounded"
              placeholder="Indique el cambio que desea realizar"
              value={clausula.cambio}
              onChange={(e) =>
                handleChange(index, "cambio", e.target.value)
              }
            />
          </div>
        </div>
      ))}

      <button
        onClick={agregarClausula}
        className="py-2 px-4 bg-profile text-white rounded"
      >
        + Agregar otra cláusula
      </button>
    </div>
  );
};

export default ActaPactoSocial;
