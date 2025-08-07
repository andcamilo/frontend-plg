"use client";
import React from "react";

export type Dignatario = {
  nombre: string;
  cargo: string;
  direccion: string;
  nacionalidad: string;
  email: string;
  telefono: string;
  tipoId: string;
  archivo: File | null;
};

interface Props {
  dignatarios: Dignatario[];
  setDignatarios: React.Dispatch<React.SetStateAction<Dignatario[]>>;
}

const cargosDisponibles = [
  "Presidente",
  "Secretario",
  "Tesorero",
  "Vicepresidente",
  "Apoderado",
  "Otro"
];

const FormularioDignatarios: React.FC<Props> = ({ dignatarios, setDignatarios }) => {
  const handleChange = (index: number, key: keyof Dignatario, value: any) => {
    const updated = [...dignatarios];
    updated[index][key] = value;
    setDignatarios(updated);
  };

  const agregarDignatario = () => {
    setDignatarios([
      ...dignatarios,
      { nombre: "", cargo: "", direccion: "", nacionalidad: "", email: "", telefono: "", tipoId: "", archivo: null }
    ]);
  };

  const eliminarDignatario = (index: number) => {
    if (dignatarios.length > 1) {
      const updated = [...dignatarios];
      updated.splice(index, 1);
      setDignatarios(updated);
    }
  };

  return (
    <div className="mt-6">
      {dignatarios.map((item, index) => (
        <div key={index} className="space-y-2 mb-6 border border-gray-600 p-4 rounded relative">
          <p className="text-white font-semibold mb-2">Dignatario #{index + 1}</p>

          {dignatarios.length > 1 && (
            <button
              onClick={() => eliminarDignatario(index)}
              className="absolute top-2 right-2 text-red-500 hover:text-red-700 text-sm"
              title="Eliminar"
            >
              ✖
            </button>
          )}

          <input
            type="text"
            placeholder="Nombre completo"
            className="w-full p-2 bg-gray-800 text-white rounded"
            value={item.nombre}
            onChange={(e) => handleChange(index, "nombre", e.target.value)}
          />
          <select
            className="w-full p-2 bg-gray-800 text-white rounded"
            value={item.cargo}
            onChange={(e) => handleChange(index, "cargo", e.target.value)}
          >
            <option value="">Seleccionar cargo</option>
            {cargosDisponibles.map((cargo) => (
              <option key={cargo} value={cargo}>{cargo}</option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Dirección"
            className="w-full p-2 bg-gray-800 text-white rounded"
            value={item.direccion}
            onChange={(e) => handleChange(index, "direccion", e.target.value)}
          />
          <input
            type="text"
            placeholder="Nacionalidad"
            className="w-full p-2 bg-gray-800 text-white rounded"
            value={item.nacionalidad}
            onChange={(e) => handleChange(index, "nacionalidad", e.target.value)}
          />
          <input
            type="email"
            placeholder="Email"
            className="w-full p-2 bg-gray-800 text-white rounded"
            value={item.email}
            onChange={(e) => handleChange(index, "email", e.target.value)}
          />
          <input
            type="text"
            placeholder="Teléfono"
            className="w-full p-2 bg-gray-800 text-white rounded"
            value={item.telefono}
            onChange={(e) => handleChange(index, "telefono", e.target.value)}
          />
          <input
            type="text"
            placeholder="Número de cédula o pasaporte"
            className="w-full p-2 bg-gray-800 text-white rounded"
            value={item.tipoId}
            onChange={(e) => handleChange(index, "tipoId", e.target.value)}
          />
          <input
            type="file"
            className="w-full bg-gray-800 text-white rounded p-2"
            onChange={(e) => handleChange(index, "archivo", e.target.files?.[0] || null)}
          />
        </div>
      ))}

      <button
        onClick={agregarDignatario}
        className="py-2 px-4 bg-profile text-white rounded"
      >
        + Agregar Dignatario
      </button>
    </div>
  );
};

export default FormularioDignatarios;
