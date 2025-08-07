"use client";
import React, { useState } from "react";
import Swal from "sweetalert2";
import Select from "react-select";
import { darkSelectStyles } from "@utils/selectStyles";

type Cargo =
  | "Director"
  | "Presidente"
  | "Secretario"
  | "Tesorero"
  | "Vicepresidente"
  | "Otro";

type Renunciante = {
  nombre: string;
  genero: string;
  nacionalidad: string;
  identificacion: string;
  direccion: string;
  cargos: Cargo[]; // ahora es un arreglo
  otroCargo: string;
};

interface Props {
  esAdHoc?: boolean;
}

const cargosOpcionales = [
  { value: "Director", label: "Director" },
  { value: "Fundador", label: "Fundador" },
  { value: "Presidente", label: "Presidente" },
  { value: "Secretario", label: "Secretario" },
  { value: "Tesorero", label: "Tesorero" },
  { value: "Vicepresidente", label: "Vicepresidente" },
  { value: "Otro", label: "Otro" },
];

const ActaRenunciaDirectores: React.FC<Props> = ({ esAdHoc = false }) => {
  const [renunciantes, setRenunciantes] = useState<Renunciante[]>([
    {
      nombre: "",
      genero: "",
      nacionalidad: "",
      identificacion: "",
      direccion: "",
      cargos: [],
      otroCargo: "",
    },
  ]);

  const handleChange = (
    index: number,
    field: keyof Renunciante,
    value: any
  ) => {
    const updated = [...renunciantes];
    updated[index][field] = value;
    setRenunciantes(updated);
  };

  const agregarRenunciante = () => {
    setRenunciantes([
      ...renunciantes,
      {
        nombre: "",
        genero: "",
        nacionalidad: "",
        identificacion: "",
        direccion: "",
        cargos: [],
        otroCargo: "",
      },
    ]);
  };

  const eliminarRenunciante = (index: number) => {
    if (renunciantes.length > 1) {
      const updated = [...renunciantes];
      updated.splice(index, 1);
      setRenunciantes(updated);
    }
  };

  return (
    <div className="space-y-6 mt-6">
      <h3 className="text-white text-lg font-bold">Renuncia de Miembros</h3>

      {esAdHoc && (
        <div className="bg-yellow-600 p-4 rounded text-white text-sm font-medium">
          Para solicitar la renuncia de su cargo el acta será remitida a título
          personal ya que la norma así lo solicita.
        </div>
      )}

      {renunciantes.map((r, index) => (
        <div
          key={index}
          className="space-y-2 mb-6 border border-gray-600 p-4 rounded relative"
        >
          <p className="text-white font-semibold">Renunciante #{index + 1}</p>

          {renunciantes.length > 1 && (
            <button
              onClick={() => eliminarRenunciante(index)}
              className="absolute top-2 right-2 text-red-500 hover:text-red-700 text-sm"
              title="Eliminar"
            >
              ✖
            </button>
          )}

          <input
            type="text"
            className="w-full p-2 bg-gray-800 text-white rounded"
            placeholder="Nombre completo"
            value={r.nombre}
            onChange={(e) => handleChange(index, "nombre", e.target.value)}
          />

          <select
            className="w-full p-2 bg-gray-800 text-white rounded"
            value={r.genero}
            onChange={(e) => handleChange(index, "genero", e.target.value)}
          >
            <option value="">Seleccione género</option>
            <option value="Masculino">Masculino</option>
            <option value="Femenino">Femenino</option>
          </select>

          <input
            type="text"
            className="w-full p-2 bg-gray-800 text-white rounded"
            placeholder="Nacionalidad"
            value={r.nacionalidad}
            onChange={(e) => handleChange(index, "nacionalidad", e.target.value)}
          />

          <input
            type="text"
            className="w-full p-2 bg-gray-800 text-white rounded"
            placeholder="Número de cédula o pasaporte"
            value={r.identificacion}
            onChange={(e) => handleChange(index, "identificacion", e.target.value)}
          />

          <input
            type="text"
            className="w-full p-2 bg-gray-800 text-white rounded"
            placeholder="Dirección completa"
            value={r.direccion}
            onChange={(e) => handleChange(index, "direccion", e.target.value)}
          />

          <label className="text-white font-medium">Cargo(s) al que renuncia:</label>
          <Select
            isMulti
            options={cargosOpcionales}
            styles={darkSelectStyles}
            onChange={(selectedOptions) => {
              const cargos = selectedOptions.map((opt) => opt.value as Cargo);
              handleChange(index, "cargos", cargos);
            }}
            value={cargosOpcionales.filter((opt) => r.cargos.includes(opt.value as Cargo))}
          />

          {r.cargos.includes("Otro") && (
            <input
              type="text"
              className="w-full p-2 bg-gray-800 text-white rounded"
              placeholder="Indique el otro cargo"
              value={r.otroCargo}
              onChange={(e) => handleChange(index, "otroCargo", e.target.value)}
            />
          )}
        </div>
      ))}

      <button
        onClick={agregarRenunciante}
        className="py-2 px-4 bg-profile text-white rounded"
      >
        + Agregar persona
      </button>

      <div className="mt-8">
        <button className="bg-profile text-white py-3 px-6 rounded-lg w-full">
          Guardar y continuar
        </button>
      </div>
    </div>
  );
};

export default ActaRenunciaDirectores;
