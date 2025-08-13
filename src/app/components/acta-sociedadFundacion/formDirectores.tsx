"use client";
import React from "react";

export type Director = {
  nombre: string;
  direccion: string;
  nacionalidad: string;
  email: string;
  telefono: string;
  tipoId: string;
  archivo: File | null;
};

interface Props {
  directores: Director[];
  setDirectores: React.Dispatch<React.SetStateAction<Director[]>>;
}

const FormularioDirectores: React.FC<Props> = ({ directores, setDirectores }) => {
  const handleChange = (index: number, key: keyof Director, value: any) => {
    const updated = [...directores];
    updated[index][key] = value;
    setDirectores(updated);
  };

  const agregarDirector = () => {
    setDirectores([
      ...directores,
      { nombre: "", direccion: "", nacionalidad: "", email: "", telefono: "", tipoId: "", archivo: null },
    ]);
  };

  const eliminarDirector = (index: number) => {
    if (directores.length > 1) {
      const updated = [...directores];
      updated.splice(index, 1);
      setDirectores(updated);
    }
  };

  return (
    <div className="mt-6">
      {directores.map((director, index) => (
        <div key={index} className="space-y-2 mb-6 border border-gray-600 p-4 rounded relative">
          <p className="text-white font-semibold mb-2">Director #{index + 1}</p>

          {directores.length > 1 && (
            <button
              onClick={() => eliminarDirector(index)}
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
            value={director.nombre}
            onChange={(e) => handleChange(index, "nombre", e.target.value)}
          />
          <input
            type="text"
            placeholder="Dirección"
            className="w-full p-2 bg-gray-800 text-white rounded"
            value={director.direccion}
            onChange={(e) => handleChange(index, "direccion", e.target.value)}
          />
          <input
            type="text"
            placeholder="Nacionalidad"
            className="w-full p-2 bg-gray-800 text-white rounded"
            value={director.nacionalidad}
            onChange={(e) => handleChange(index, "nacionalidad", e.target.value)}
          />
          <input
            type="email"
            placeholder="Email"
            className="w-full p-2 bg-gray-800 text-white rounded"
            value={director.email}
            onChange={(e) => handleChange(index, "email", e.target.value)}
          />
          <input
            type="text"
            placeholder="Teléfono"
            className="w-full p-2 bg-gray-800 text-white rounded"
            value={director.telefono}
            onChange={(e) => handleChange(index, "telefono", e.target.value)}
          />
          <input
            type="text"
            placeholder="Número de cédula o pasaporte"
            className="w-full p-2 bg-gray-800 text-white rounded"
            value={director.tipoId}
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
        onClick={agregarDirector}
        className="py-2 px-4 bg-profile text-white rounded"
      >
        + Agregar Director
      </button>
    </div>
  );
};

export default FormularioDirectores;
