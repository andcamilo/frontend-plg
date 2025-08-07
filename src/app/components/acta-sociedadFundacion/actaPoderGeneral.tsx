"use client";
import React, { useState } from "react";

type Apoderado = {
  nombre: string;
  direccion: string;
  telefono: string;
  email: string;
  identificacion: string;
  archivo: File | null;
};

const ActaPoderGeneral: React.FC = () => {
  const [apoderados, setApoderados] = useState<Apoderado[]>([
    {
      nombre: "",
      direccion: "",
      telefono: "",
      email: "",
      identificacion: "",
      archivo: null,
    },
  ]);

  const [facultades, setFacultades] = useState("");

  const handleChange = (
    index: number,
    key: keyof Apoderado,
    value: string | File | null
  ) => {
    const updated = [...apoderados];
    /* updated[index][key] = value; */
    setApoderados(updated);
  };

  const agregarApoderado = () => {
    setApoderados([
      ...apoderados,
      {
        nombre: "",
        direccion: "",
        telefono: "",
        email: "",
        identificacion: "",
        archivo: null,
      },
    ]);
  };

  const eliminarApoderado = (index: number) => {
    if (apoderados.length > 1) {
      const updated = [...apoderados];
      updated.splice(index, 1);
      setApoderados(updated);
    }
  };

  return (
    <div className="mt-6 space-y-6">
      <h3 className="text-white text-lg font-bold mb-4">
        Poder General / Amplio y Suficiente
      </h3>

      {apoderados.map((apoderado, index) => (
        <div
          key={index}
          className="space-y-2 mb-6 border border-gray-600 p-4 rounded relative"
        >
          <p className="text-white font-semibold mb-2">
            Apoderado #{index + 1}
          </p>

          {apoderados.length > 1 && (
            <button
              onClick={() => eliminarApoderado(index)}
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
            value={apoderado.nombre}
            onChange={(e) =>
              handleChange(index, "nombre", e.target.value)
            }
          />
          <input
            type="text"
            placeholder="Dirección"
            className="w-full p-2 bg-gray-800 text-white rounded"
            value={apoderado.direccion}
            onChange={(e) =>
              handleChange(index, "direccion", e.target.value)
            }
          />
          <input
            type="text"
            placeholder="Teléfono"
            className="w-full p-2 bg-gray-800 text-white rounded"
            value={apoderado.telefono}
            onChange={(e) =>
              handleChange(index, "telefono", e.target.value)
            }
          />
          <input
            type="email"
            placeholder="Email"
            className="w-full p-2 bg-gray-800 text-white rounded"
            value={apoderado.email}
            onChange={(e) =>
              handleChange(index, "email", e.target.value)
            }
          />
          <input
            type="text"
            placeholder="Número de cédula o pasaporte"
            className="w-full p-2 bg-gray-800 text-white rounded"
            value={apoderado.identificacion}
            onChange={(e) =>
              handleChange(index, "identificacion", e.target.value)
            }
          />
          <input
            type="file"
            className="text-white"
            onChange={(e) =>
              handleChange(index, "archivo", e.target.files?.[0] || null)
            }
          />
        </div>
      ))}

      <button
        onClick={agregarApoderado}
        className="py-2 px-4 bg-profile text-white rounded"
      >
        + Agregar Apoderado
      </button>

      <div className="mt-6">
        <label className="text-white font-semibold block mb-2">
          Indique las facultades que desea posea el apoderado:
        </label>
        <textarea
          value={facultades}
          onChange={(e) => setFacultades(e.target.value)}
          placeholder="Detalle aquí las facultades del apoderado..."
          className="w-full p-3 bg-gray-800 text-white rounded"
          rows={10}
          maxLength={2000}
        />

      </div>

      <div className="mt-8">
        <button className="bg-profile text-white py-3 px-6 rounded-lg w-full">
          Guardar y continuar
        </button>
      </div>
    </div>
  );
};

export default ActaPoderGeneral;
