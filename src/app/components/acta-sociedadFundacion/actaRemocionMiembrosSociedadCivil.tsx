"use client";
import React, { useState } from "react";

type Miembro = {
  nombre: string;
  genero: string;
  nacionalidad: string;
  documentoId: string;
  direccion: string;
  numeroIdoneidad: string;
  archivoId: File | null;
  archivoIdoneidad: File | null;
};

const RemocionMiembrosSociedadCivil: React.FC = () => {
  const [miembros, setMiembros] = useState<Miembro[]>([
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

  const [quiereAgregarCambioExtra, setQuiereAgregarCambioExtra] = useState<null | boolean>(null);

  const handleChange = (index: number, key: keyof Miembro, value: any) => {
    const updated = [...miembros];
    updated[index][key] = value;
    setMiembros(updated);
  };

  const agregarMiembro = () => {
    setMiembros([
      ...miembros,
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

  const eliminarMiembro = (index: number) => {
    if (miembros.length > 1) {
      const updated = [...miembros];
      updated.splice(index, 1);
      setMiembros(updated);
    }
  };

  return (
    <div className="space-y-6 mt-6">
      <h3 className="text-white text-lg font-bold">Remoción de Miembros - Sociedad Civil</h3>

      {miembros.map((miembro, index) => (
        <div key={index} className="border border-gray-600 p-4 rounded relative space-y-3">
          <p className="text-white font-semibold">Miembro a remover #{index + 1}</p>

          {miembros.length > 1 && (
            <button
              onClick={() => eliminarMiembro(index)}
              className="absolute top-2 right-2 text-red-500 hover:text-red-700 text-sm"
              title="Eliminar miembro"
            >
              ✖
            </button>
          )}

          <input
            type="text"
            placeholder="Nombre completo"
            className="w-full p-2 bg-gray-800 text-white rounded"
            value={miembro.nombre}
            onChange={(e) => handleChange(index, "nombre", e.target.value)}
          />

          <select
            value={miembro.genero}
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
            value={miembro.nacionalidad}
            onChange={(e) => handleChange(index, "nacionalidad", e.target.value)}
          />

          <input
            type="text"
            placeholder="Pasaporte o ID"
            className="w-full p-2 bg-gray-800 text-white rounded"
            value={miembro.documentoId}
            onChange={(e) => handleChange(index, "documentoId", e.target.value)}
          />

          <input
            type="text"
            placeholder="Dirección completa"
            className="w-full p-2 bg-gray-800 text-white rounded"
            value={miembro.direccion}
            onChange={(e) => handleChange(index, "direccion", e.target.value)}
          />

          <input
            type="text"
            placeholder="Número de Idoneidad"
            className="w-full p-2 bg-gray-800 text-white rounded"
            value={miembro.numeroIdoneidad}
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
        onClick={agregarMiembro}
        className="py-2 px-4 bg-profile text-white rounded"
      >
        + Agregar otro miembro
      </button>

      {/* Sección: ¿Desea agregar un cambio extra? */}
      {/* <div className="mt-8 space-y-2">
        <h4 className="text-white font-semibold text-base">
          ¿Desea agregar un cambio extra a su sociedad?
        </h4>
        <div className="flex space-x-4">
          <button
            onClick={() => setQuiereAgregarCambioExtra(true)}
            className={`py-2 px-4 rounded ${quiereAgregarCambioExtra === true
                ? "bg-green-600 text-white"
                : "bg-gray-700 text-white hover:bg-green-700"
              }`}
          >
            Sí
          </button>
          <button
            onClick={() => setQuiereAgregarCambioExtra(false)}
            className={`py-2 px-4 rounded ${quiereAgregarCambioExtra === false
                ? "bg-red-600 text-white"
                : "bg-gray-700 text-white hover:bg-red-700"
              }`}
          >
            No
          </button>
        </div>
      </div> */}

      <div className="mt-8">
        <button className="bg-profile text-white py-3 px-6 rounded-lg w-full">
          Guardar y continuar
        </button>
      </div>
    </div>
  );
};

export default RemocionMiembrosSociedadCivil;
