"use client";
import React, { useState } from "react";
import FormularioDirectores from "../acta-sociedadFundacion/formDirectores";
import FormularioDignatarios from "../acta-sociedadFundacion/formDignatarios";

const ActaJuntaDirectiva = () => {
  const [directores, setDirectores] = useState([
    { nombre: "", direccion: "", nacionalidad: "", email: "", telefono: "", tipoId: "", archivo: null },
  ]);

  const [dignatarios, setDignatarios] = useState([
    { nombre: "", cargo: "", direccion: "", nacionalidad: "", email: "", telefono: "", tipoId: "", archivo: null },
  ]);

  const [directoresReemplazo, setDirectoresReemplazo] = useState([
    { actual: "", nuevo: { nombre: "", direccion: "", telefono: "", email: "" } },
  ]);

  const [dignatariosReemplazo, setDignatariosReemplazo] = useState([
    { actual: "", cargoActual: "", nuevo: { nombre: "", cargo: "", direccion: "", telefono: "", email: "" } },
  ]);

  const handleDirectoresReemplazoChange = (index: number, field: string, value: string) => {
    const updated = [...directoresReemplazo];
    if (field.startsWith("nuevo.")) {
      const key = field.split(".")[1];
      updated[index].nuevo[key] = value;
    } else {
      updated[index][field] = value;
    }
    setDirectoresReemplazo(updated);
  };

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

  return (
    <div className="space-y-8 mt-6">
      <h3 className="text-white text-lg font-bold mb-2">Nuevos Directores</h3>
      {/* Nuevos Directores */}
      <FormularioDirectores directores={directores} setDirectores={setDirectores} />

      <h3 className="text-white text-lg font-bold mb-2">Nuevos Dignatarios</h3>
      {/* Nueva Junta Directiva */}
      <FormularioDignatarios dignatarios={dignatarios} setDignatarios={setDignatarios} />

      {/* Reemplazo de Directores */}
      <div>
        <h3 className="text-white text-lg font-bold mb-4">Reemplazo de Directores</h3>
        {directoresReemplazo.map((item, index) => (
          <div key={index} className="space-y-2 mb-6 border border-gray-600 p-4 rounded">
            <input
              type="text"
              placeholder="Nombre del director actual"
              className="w-full p-2 bg-gray-800 text-white rounded"
              value={item.actual}
              onChange={(e) => handleDirectoresReemplazoChange(index, "actual", e.target.value)}
            />
            <input
              type="text"
              placeholder="Nombre del nuevo director"
              className="w-full p-2 bg-gray-800 text-white rounded"
              value={item.nuevo.nombre}
              onChange={(e) => handleDirectoresReemplazoChange(index, "nuevo.nombre", e.target.value)}
            />
            <input
              type="text"
              placeholder="Dirección"
              className="w-full p-2 bg-gray-800 text-white rounded"
              value={item.nuevo.direccion}
              onChange={(e) => handleDirectoresReemplazoChange(index, "nuevo.direccion", e.target.value)}
            />
            <input
              type="text"
              placeholder="Teléfono"
              className="w-full p-2 bg-gray-800 text-white rounded"
              value={item.nuevo.telefono}
              onChange={(e) => handleDirectoresReemplazoChange(index, "nuevo.telefono", e.target.value)}
            />
            <input
              type="email"
              placeholder="Email"
              className="w-full p-2 bg-gray-800 text-white rounded"
              value={item.nuevo.email}
              onChange={(e) => handleDirectoresReemplazoChange(index, "nuevo.email", e.target.value)}
            />
          </div>
        ))}
      </div>

      {/* Reemplazo de Dignatarios */}
      <div>
        <h3 className="text-white text-lg font-bold mb-4">Reemplazo de Junta Directiva</h3>
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

export default ActaJuntaDirectiva;