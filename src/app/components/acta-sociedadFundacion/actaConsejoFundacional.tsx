"use client";
import React, { useState } from "react";
import FormularioFundadores from "../acta-sociedadFundacion/formFundadores";
import FormularioDignatarios from "../acta-sociedadFundacion/formDignatarios";

const ActaFundadoresDignatarios = () => {
  const [fundadores, setFundadores] = useState([
    { nombre: "", direccion: "", nacionalidad: "", email: "", telefono: "", tipoId: "", archivo: null },
  ]);

  const [dignatarios, setDignatarios] = useState([
    { nombre: "", cargo: "", direccion: "", nacionalidad: "", email: "", telefono: "", tipoId: "", archivo: null },
  ]);

  const [fundadoresReemplazo, setFundadoresReemplazo] = useState([
    { actual: "", nuevo: { nombre: "", direccion: "", telefono: "", email: "" } },
  ]);

  const [dignatariosReemplazo, setDignatariosReemplazo] = useState([
    { actual: "", cargoActual: "", nuevo: { nombre: "", cargo: "", direccion: "", telefono: "", email: "" } },
  ]);

  const handleDignatariosReemplazoChange = (index: number, field: string, value: string) => {
    const updated = [...dignatariosReemplazo];
    if (field.startsWith("nuevo.")) {
      const key = field.split(".")[1];
      updated[index].nuevo[key] = value;
    } else {
      updated[index][field] = value;
    }
    setDignatariosReemplazo(updated);
  };

  const handleFundadoresReemplazoChange = (index: number, field: string, value: string) => {
    const updated = [...fundadoresReemplazo];
    if (field.startsWith("nuevo.")) {
      const key = field.split(".")[1];
      updated[index].nuevo[key] = value;
    } else {
      updated[index][field] = value;
    }
    setFundadoresReemplazo(updated);
  };

  return (
    <div className="space-y-8 mt-6">
      <h3 className="text-white text-lg font-bold mb-2">Nuevos Fundadores</h3>
      <FormularioFundadores fundadores={fundadores} setFundadores={setFundadores} />

      <h3 className="text-white text-lg font-bold mb-2">Nuevos Dignatarios</h3>
      <FormularioDignatarios dignatarios={dignatarios} setDignatarios={setDignatarios} />

      {/* Reemplazo de Dignatarios */}
      <div>
        <h3 className="text-white text-lg font-bold mb-4">Reemplazo de Junta Directiva</h3>
        <div>
          <h3 className="text-white text-lg font-bold mb-4">Reemplazo de Fundadores</h3>
          {fundadoresReemplazo.map((item, index) => (
            <div key={index} className="space-y-2 mb-6 border border-gray-600 p-4 rounded">
              <input
                type="text"
                placeholder="Nombre del fundador actual"
                className="w-full p-2 bg-gray-800 text-white rounded"
                value={item.actual}
                onChange={(e) => handleFundadoresReemplazoChange(index, "actual", e.target.value)}
              />
              <input
                type="text"
                placeholder="Nombre del nuevo fundador"
                className="w-full p-2 bg-gray-800 text-white rounded"
                value={item.nuevo.nombre}
                onChange={(e) => handleFundadoresReemplazoChange(index, "nuevo.nombre", e.target.value)}
              />
              <input
                type="text"
                placeholder="Dirección"
                className="w-full p-2 bg-gray-800 text-white rounded"
                value={item.nuevo.direccion}
                onChange={(e) => handleFundadoresReemplazoChange(index, "nuevo.direccion", e.target.value)}
              />
              <input
                type="text"
                placeholder="Teléfono"
                className="w-full p-2 bg-gray-800 text-white rounded"
                value={item.nuevo.telefono}
                onChange={(e) => handleFundadoresReemplazoChange(index, "nuevo.telefono", e.target.value)}
              />
              <input
                type="email"
                placeholder="Email"
                className="w-full p-2 bg-gray-800 text-white rounded"
                value={item.nuevo.email}
                onChange={(e) => handleFundadoresReemplazoChange(index, "nuevo.email", e.target.value)}
              />
            </div>
          ))}
        </div>

        {dignatariosReemplazo.map((item, index) => (
          <div key={index} className="space-y-2 mb-6 border border-gray-600 p-4 rounded">
            <input
              type="text"
              placeholder="Nombre del dignatario actual"
              className="w-full p-2 bg-gray-800 text-white rounded"
              value={item.actual}
              onChange={(e) => handleDignatariosReemplazoChange(index, "actual", e.target.value)}
            />
            <input
              type="text"
              placeholder="Cargo actual"
              className="w-full p-2 bg-gray-800 text-white rounded"
              value={item.cargoActual}
              onChange={(e) => handleDignatariosReemplazoChange(index, "cargoActual", e.target.value)}
            />
            <input
              type="text"
              placeholder="Nombre del nuevo dignatario"
              className="w-full p-2 bg-gray-800 text-white rounded"
              value={item.nuevo.nombre}
              onChange={(e) => handleDignatariosReemplazoChange(index, "nuevo.nombre", e.target.value)}
            />
            <select
              className="w-full p-2 bg-gray-800 text-white rounded"
              value={item.nuevo.cargo}
              onChange={(e) => handleDignatariosReemplazoChange(index, "nuevo.cargo", e.target.value)}
            >
              <option value="">Seleccione cargo</option>
              <option value="Presidente">Presidente</option>
              <option value="Secretario">Secretario</option>
              <option value="Tesorero">Tesorero</option>
              <option value="Vicepresidente">Vicepresidente</option>
              <option value="Otro">Otro</option>
            </select>
            <input
              type="text"
              placeholder="Dirección"
              className="w-full p-2 bg-gray-800 text-white rounded"
              value={item.nuevo.direccion}
              onChange={(e) => handleDignatariosReemplazoChange(index, "nuevo.direccion", e.target.value)}
            />
            <input
              type="text"
              placeholder="Teléfono"
              className="w-full p-2 bg-gray-800 text-white rounded"
              value={item.nuevo.telefono}
              onChange={(e) => handleDignatariosReemplazoChange(index, "nuevo.telefono", e.target.value)}
            />
            <input
              type="email"
              placeholder="Email"
              className="w-full p-2 bg-gray-800 text-white rounded"
              value={item.nuevo.email}
              onChange={(e) => handleDignatariosReemplazoChange(index, "nuevo.email", e.target.value)}
            />
          </div>
        ))}
      </div>

      {/* Botón Guardar */}
      <div className="mt-8">
        <button className="bg-profile text-white py-3 px-6 rounded-lg w-full">
          Guardar y continuar
        </button>
      </div>
    </div>
  );
};

export default ActaFundadoresDignatarios;
