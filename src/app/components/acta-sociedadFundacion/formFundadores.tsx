"use client";
import React from "react";

export type Fundador = {
  nombre: string;
  direccion: string;
  nacionalidad: string;
  email: string;
  telefono: string;
  tipoId: string;
  archivo: File | null;
};

interface Props {
  fundadores: Fundador[];
  setFundadores: React.Dispatch<React.SetStateAction<Fundador[]>>;
}

const FormularioFundadores: React.FC<Props> = ({ fundadores, setFundadores }) => {
  const handleChange = (index: number, key: keyof Fundador, value: any) => {
    const updated = [...fundadores];
    updated[index][key] = value;
    setFundadores(updated);
  };

  const agregarFundador = () => {
    setFundadores([
      ...fundadores,
      { nombre: "", direccion: "", nacionalidad: "", email: "", telefono: "", tipoId: "", archivo: null },
    ]);
  };

  const eliminarFundador = (index: number) => {
    if (fundadores.length > 1) {
      const updated = [...fundadores];
      updated.splice(index, 1);
      setFundadores(updated);
    }
  };

  return (
    <div className="mt-6">
      {fundadores.map((fundador, index) => (
        <div key={index} className="space-y-2 mb-6 border border-gray-600 p-4 rounded relative">
          <p className="text-white font-semibold mb-2">Fundador #{index + 1}</p>

          {fundadores.length > 1 && (
            <button
              onClick={() => eliminarFundador(index)}
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
            value={fundador.nombre}
            onChange={(e) => handleChange(index, "nombre", e.target.value)}
          />
          <input
            type="text"
            placeholder="Dirección"
            className="w-full p-2 bg-gray-800 text-white rounded"
            value={fundador.direccion}
            onChange={(e) => handleChange(index, "direccion", e.target.value)}
          />
          <input
            type="text"
            placeholder="Nacionalidad"
            className="w-full p-2 bg-gray-800 text-white rounded"
            value={fundador.nacionalidad}
            onChange={(e) => handleChange(index, "nacionalidad", e.target.value)}
          />
          <input
            type="email"
            placeholder="Email"
            className="w-full p-2 bg-gray-800 text-white rounded"
            value={fundador.email}
            onChange={(e) => handleChange(index, "email", e.target.value)}
          />
          <input
            type="text"
            placeholder="Teléfono"
            className="w-full p-2 bg-gray-800 text-white rounded"
            value={fundador.telefono}
            onChange={(e) => handleChange(index, "telefono", e.target.value)}
          />
          <input
            type="text"
            placeholder="Número de cédula o pasaporte"
            className="w-full p-2 bg-gray-800 text-white rounded"
            value={fundador.tipoId}
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
        onClick={agregarFundador}
        className="py-2 px-4 bg-profile text-white rounded"
      >
        + Agregar Fundador
      </button>
    </div>
  );
};

export default FormularioFundadores;
