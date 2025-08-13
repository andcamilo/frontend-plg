"use client";
import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";

const ActaCambioDeNombre: React.FC = () => {
  const [nombres, setNombres] = useState({
    nombre1: "",
    nombre2: "",
    nombre3: ""
  });

  useEffect(() => {
    Swal.fire({
      icon: "info",
      title: "Indique tres opciones de posibles nombres",
      html: "Es necesario que coloque en orden de prioridad el nombre que le gustaría para su Sociedad o Fundación de Interés Privado. Verificaremos la disponibilidad en Registro Público según el orden agregado.",
      confirmButtonText: "Entendido",
      confirmButtonColor: "#3085d6"
    });
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNombres(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="space-y-4 mt-6">
      <h3 className="text-white text-lg font-bold">Posibles nombres para su Sociedad o Fundación</h3>

      <input
        type="text"
        name="nombre1"
        placeholder="Nombre 1 (Prioridad alta)"
        value={nombres.nombre1}
        onChange={handleChange}
        className="w-full p-2 bg-gray-800 text-white rounded"
      />

      <input
        type="text"
        name="nombre2"
        placeholder="Nombre 2"
        value={nombres.nombre2}
        onChange={handleChange}
        className="w-full p-2 bg-gray-800 text-white rounded"
      />

      <input
        type="text"
        name="nombre3"
        placeholder="Nombre 3"
        value={nombres.nombre3}
        onChange={handleChange}
        className="w-full p-2 bg-gray-800 text-white rounded"
      />
    </div>
  );
};

export default ActaCambioDeNombre;
