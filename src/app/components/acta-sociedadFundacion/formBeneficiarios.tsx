"use client";
import React from "react";

interface Props {
  beneficiarios: Beneficiario[];
  setBeneficiarios: React.Dispatch<React.SetStateAction<Beneficiario[]>>;
  handleRentaFile: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleReferenciaBancaria: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleReferenciaComercial: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleLibroAcciones: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleResumenChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

export type Beneficiario = {
  nombre: string;
  direccion: string;
  nacionalidad: string;
  email: string;
  telefono: string;
  identificacion: string;
  archivo: File | null;
};

interface Props {
  beneficiarios: Beneficiario[];
  setBeneficiarios: React.Dispatch<React.SetStateAction<Beneficiario[]>>;
}

const FormularioBeneficiarios: React.FC<Props> = ({ beneficiarios, setBeneficiarios }) => {
  const handleChange = (index: number, key: keyof Beneficiario, value: any) => {
    const updated = [...beneficiarios];
    updated[index][key] = value;
    setBeneficiarios(updated);
  };

  const agregarBeneficiario = () => {
    setBeneficiarios([
      ...beneficiarios,
      {
        nombre: "",
        direccion: "",
        nacionalidad: "",
        email: "",
        telefono: "",
        identificacion: "",
        archivo: null
      },
    ]);
  };

  const eliminarBeneficiario = (index: number) => {
    if (beneficiarios.length > 1) {
      const updated = [...beneficiarios];
      updated.splice(index, 1);
      setBeneficiarios(updated);
    }
  };

  const handleRentaFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    console.log("Archivo de renta:", file);
    // Aquí puedes manejarlo como necesites (por ejemplo, setearlo en un estado externo)
  };

  const handleReferenciaBancaria = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    console.log("Referencia bancaria:", file);
  };

  const handleReferenciaComercial = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    console.log("Referencia comercial:", file);
  };

  const handleLibroAcciones = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    console.log("Libro de acciones:", file);
  };

  const handleResumenChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    console.log("Resumen:", e.target.value);
  };

  return (
    <div className="mt-6">
      <h3 className="text-white text-lg font-bold mb-2">Beneficiarios</h3>

      {beneficiarios.map((item, index) => (
        <div key={index} className="space-y-2 mb-6 border border-gray-600 p-4 rounded relative">
          <p className="text-white font-semibold mb-2">Beneficiario #{index + 1}</p>

          {beneficiarios.length > 1 && (
            <button
              onClick={() => eliminarBeneficiario(index)}
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
            value={item.identificacion}
            onChange={(e) => handleChange(index, "identificacion", e.target.value)}
          />
          <input
            type="file"
            className="w-full bg-gray-800 text-white rounded p-2"
            onChange={(e) => handleChange(index, "archivo", e.target.files?.[0] || null)}
          />
        </div>
      ))}

      <button
        onClick={agregarBeneficiario}
        className="py-2 px-4 bg-profile text-white rounded"
      >
        + Agregar Beneficiario
      </button>

      <div className="space-y-4 mt-6">
        <div>
          <label className="block text-white">Adjunte la última declaración de renta anual:</label>
          <input type="file" className="w-full bg-gray-800 text-white rounded p-2" onChange={handleRentaFile} />
        </div>
        <div>
          <label className="block text-white">Adjunte referencias bancarias:</label>
          <input type="file" className="w-full bg-gray-800 text-white rounded p-2" onChange={handleReferenciaBancaria} />
        </div>
        <div>
          <label className="block text-white">Adjunte referencias comerciales:</label>
          <input type="file" className="w-full bg-gray-800 text-white rounded p-2" onChange={handleReferenciaComercial} />
        </div>
        <div>
          <label className="block text-white">Resumen de gestiones realizadas durante el año:</label>
          <textarea
            className="w-full bg-gray-800 text-white rounded p-2"
            name="resumenGestiones"
            onChange={handleResumenChange}
          />
        </div>
        <div>
          <label className="block text-white">Adjunte libro de acciones o certificados:</label>
          <input type="file" className="w-full bg-gray-800 text-white rounded p-2" onChange={handleLibroAcciones} />
        </div>
      </div>
    </div>
  );
};

export default FormularioBeneficiarios;
