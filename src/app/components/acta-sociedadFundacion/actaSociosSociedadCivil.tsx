"use client";
import React, { useState } from "react";

type Socio = {
  nombre: string;
  genero: string;
  nacionalidad: string;
  documentoId: string;
  direccion: string;
  numeroIdoneidad: string;
  archivoId: File | null;
  archivoIdoneidad: File | null;
};

const AdicionSociosSociedadCivil: React.FC = () => {
  const [socios, setSocios] = useState<Socio[]>([
    {
      nombre: "",
      genero: "",
      nacionalidad: "",
      documentoId: "",
      direccion: "",
      numeroIdoneidad: "",
      archivoId: null,
      archivoIdoneidad: null,
    },
  ]);

  const handleChange = (index: number, key: keyof Socio, value: any) => {
    const updated = [...socios];
    updated[index][key] = value;
    setSocios(updated);
  };

  const agregarSocio = () => {
    setSocios([
      ...socios,
      {
        nombre: "",
        genero: "",
        nacionalidad: "",
        documentoId: "",
        direccion: "",
        numeroIdoneidad: "",
        archivoId: null,
        archivoIdoneidad: null,
      },
    ]);
  };

  const eliminarSocio = (index: number) => {
    if (socios.length > 1) {
      const updated = [...socios];
      updated.splice(index, 1);
      setSocios(updated);
    }
  };

  return (
    <div className="space-y-6 mt-6">
      <h3 className="text-white text-lg font-bold">Adición de Socios - Sociedad Civil</h3>

      {socios.map((socio, index) => (
        <div key={index} className="border border-gray-600 p-4 rounded relative space-y-3">
          <p className="text-white font-semibold">Nuevo Socio #{index + 1}</p>

          {socios.length > 1 && (
            <button
              onClick={() => eliminarSocio(index)}
              className="absolute top-2 right-2 text-red-500 hover:text-red-700 text-sm"
              title="Eliminar socio"
            >
              ✖
            </button>
          )}

          <input
            type="text"
            placeholder="Nombre completo del socio"
            className="w-full p-2 bg-gray-800 text-white rounded"
            value={socio.nombre}
            onChange={(e) => handleChange(index, "nombre", e.target.value)}
          />

          <select
            value={socio.genero}
            onChange={(e) => handleChange(index, "genero", e.target.value)}
            className="w-full p-2 bg-gray-800 text-white rounded"
          >
            <option value="">Seleccione género</option>
            <option value="Masculino">Masculino</option>
            <option value="Femenino">Femenino</option>
          </select>

          <input
            type="text"
            placeholder="Nacionalidad"
            className="w-full p-2 bg-gray-800 text-white rounded"
            value={socio.nacionalidad}
            onChange={(e) => handleChange(index, "nacionalidad", e.target.value)}
          />

          <input
            type="text"
            placeholder="Pasaporte o ID"
            className="w-full p-2 bg-gray-800 text-white rounded"
            value={socio.documentoId}
            onChange={(e) => handleChange(index, "documentoId", e.target.value)}
          />

          <input
            type="text"
            placeholder="Dirección completa"
            className="w-full p-2 bg-gray-800 text-white rounded"
            value={socio.direccion}
            onChange={(e) => handleChange(index, "direccion", e.target.value)}
          />

          <input
            type="text"
            placeholder="Número de Idoneidad"
            className="w-full p-2 bg-gray-800 text-white rounded"
            value={socio.numeroIdoneidad}
            onChange={(e) => handleChange(index, "numeroIdoneidad", e.target.value)}
          />

          <div>
            <label className="text-white text-sm">Adjunte ID o pasaporte:</label>
            <input
              type="file"
              className="w-full bg-gray-800 text-white rounded p-2"
              onChange={(e) => handleChange(index, "archivoId", e.target.files?.[0] || null)}
            />
          </div>

          <div>
            <label className="text-white text-sm">Adjunte Idoneidad:</label>
            <input
              type="file"
              className="w-full bg-gray-800 text-white rounded p-2"
              onChange={(e) => handleChange(index, "archivoIdoneidad", e.target.files?.[0] || null)}
            />
          </div>
        </div>
      ))}

      <button
        onClick={agregarSocio}
        className="py-2 px-4 bg-profile text-white rounded"
      >
        + Agregar otro socio
      </button>

      <div className="mt-8">
        <button className="bg-profile text-white py-3 px-6 rounded-lg w-full">
          Guardar y continuar
        </button>
      </div>
    </div>
  );
};

export default AdicionSociosSociedadCivil;
