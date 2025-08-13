"use client";
import React, { useState } from "react";
import Swal from "sweetalert2";
import FormularioDirectores from "../acta-sociedadFundacion/formDirectores";
import FormularioDignatarios from "../acta-sociedadFundacion/formDignatarios";
import FormularioBeneficiarios from "../acta-sociedadFundacion/formBeneficiarios";
import Select from "react-select";
import { darkSelectStyles } from "@utils/selectStyles";

const ActaAgenteResidente = () => {
  const [agenteResidentePLG, setAgenteResidentePLG] = useState("");

  const [directores, setDirectores] = useState([
    { nombre: "", direccion: "", nacionalidad: "", email: "", telefono: "", tipoId: "", archivo: null },
    { nombre: "", direccion: "", nacionalidad: "", email: "", telefono: "", tipoId: "", archivo: null },
    { nombre: "", direccion: "", nacionalidad: "", email: "", telefono: "", tipoId: "", archivo: null },
  ]);

  const [dignatarios, setDignatarios] = useState([
    { nombre: "", cargo: "", direccion: "", nacionalidad: "", email: "", telefono: "", tipoId: "", archivo: null },
  ]);

  const mostrarPopup = (mensaje: string) => {
    Swal.fire({
      icon: "info",
      title: mensaje,
      confirmButtonColor: "#3085d6",
    });
  };

  // Estados para actividades y fuentes de ingresos
  const [actividades, setActividades] = useState<string[]>([]);
  const [otraActividad, setOtraActividad] = useState("");

  const handleActividadesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    if (checked) {
      setActividades(prev => [...prev, value]);
    } else {
      setActividades(prev => prev.filter(item => item !== value));
    }
  };

  // Fuentes de ingresos
  const [fuentesIngresos, setFuentesIngresos] = useState<string[]>([]);

  const handleFuenteIngresosChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    if (checked) {
      setFuentesIngresos(prev => [...prev, value]);
    } else {
      setFuentesIngresos(prev => prev.filter(item => item !== value));
    }
  };

  // Otros estados generales
  const [formData, setFormData] = useState({
    valorActivos: "",
    descripcionActivos: "",
    paisesActividad: "",
    resumenGestiones: "",
    nuevoAgenteNombre: "",
    cip: "",
    direccion: "",
    folioRegistro: "",
  });

  // Tipo de agente residente
  const [tipoAgente, setTipoAgente] = useState("");

  // Radio de beneficiario final
  const [esBeneficiarioRelacionado, setEsBeneficiarioRelacionado] = useState<"si" | "no" | "">("");

  // Lista simulada de personas existentes (puedes reemplazarla luego con datos reales)
  const [nombresRegistrados, setNombresRegistrados] = useState<{ id: string; nombre: string }[]>([
    { id: "1", nombre: "Juan Pérez" },
    { id: "2", nombre: "Ana García" },
  ]);

  const handleBeneficiariosSeleccionados = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    if (checked) {
      setBeneficiariosSeleccionados(prev => [...prev, value]);
    } else {
      setBeneficiariosSeleccionados(prev => prev.filter(id => id !== value));
    }
  };

  const [beneficiariosSeleccionados, setBeneficiariosSeleccionados] = useState<string[]>([]);

  // Lista dinámica de beneficiarios (si no están entre los registrados)
  const [beneficiarios, setBeneficiarios] = useState([
    { nombre: "", direccion: "", nacionalidad: "", email: "", telefono: "", identificacion: "", archivo: null },
  ]);

  const agregarBeneficiarioVacio = () => {
    setBeneficiarios(prev => [
      ...prev,
      { nombre: "", direccion: "", nacionalidad: "", email: "", telefono: "", identificacion: "", archivo: null },
    ]);
  };

  const updateBeneficiario = (index: number, campo: string, valor: any) => {
    const nuevos = [...beneficiarios];
    nuevos[index][campo] = valor;
    setBeneficiarios(nuevos);
  };

  const handleArchivoBeneficiario = (index: number, archivo: File) => {
    const nuevos = [...beneficiarios];
    /* nuevos[index].archivo = archivo; */
    setBeneficiarios(nuevos);
  };

  // Archivos generales
  const handleRentaFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    // Guardar archivo en estado o subirlo según necesites
  };

  const handleReferenciaBancaria = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
  };

  const handleReferenciaComercial = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
  };

  const handleLibroAcciones = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
  };

  // Manejo general de inputs
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleTipoAgenteChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setTipoAgente(e.target.value);
  };

  const agregarOtroBeneficiario = () => {
    // lógica si decides permitir selección adicional
  };

  const opciones = nombresRegistrados.map(persona => ({
    value: persona.id,
    label: persona.nombre
  }));

  return (
    <div className="space-y-6 mt-6">
      <label className="block mb-2">¿Desea que Panama Legal Group sea su Agente Residente?</label>
      <div className="flex gap-4">
        <button
          onClick={() => {
            setAgenteResidentePLG("si");
            mostrarPopup("Este servicio se renueva anualmente y requiere compartir el cierre contable y beneficiarios finales.");
          }}
          className={`py-2 px-4 rounded ${agenteResidentePLG === "si" ? "bg-profile" : "bg-gray-700"}`}
        >
          Sí
        </button>
        <button
          onClick={() => setAgenteResidentePLG("no")}
          className={`py-2 px-4 rounded ${agenteResidentePLG === "no" ? "bg-profile" : "bg-gray-700"}`}
        >
          No
        </button>
      </div>

      {agenteResidentePLG === "no" && (
        <div className="mt-6 space-y-4">
          <label className="block text-white font-semibold">
            ¿Quién será el nuevo Agente Residente?
          </label>
          <input
            type="text"
            name="nuevoAgenteNombre"
            onChange={handleChange}
            className="w-full p-2 bg-gray-800 rounded text-white"
          />

          <label className="block text-white font-semibold">
            Tipo de persona:
          </label>
          <select
            onChange={handleTipoAgenteChange}
            className="w-full p-2 bg-gray-800 rounded text-white"
          >
            <option value="">Seleccione</option>
            <option value="natural">Persona Natural</option>
            <option value="juridica">Persona Jurídica</option>
          </select>

          {tipoAgente === "natural" && (
            <>
              <input
                type="text"
                className="w-full p-2 bg-gray-800 rounded text-white"
                placeholder="Número de C.I.P"
                name="cip"
                onChange={handleChange}
              />
              <input
                type="text"
                className="w-full p-2 bg-gray-800 rounded text-white"
                placeholder="Dirección"
                name="direccion"
                onChange={handleChange}
              />
            </>
          )}

          {tipoAgente === "juridica" && (
            <>
              <input
                type="text"
                className="w-full p-2 bg-gray-800 rounded text-white"
                placeholder="Número de folio de registro público"
                name="folioRegistro"
                onChange={handleChange}
              />
              <input
                type="text"
                className="w-full p-2 bg-gray-800 rounded text-white"
                placeholder="Dirección"
                name="direccion"
                onChange={handleChange}
              />
            </>
          )}
        </div>
      )}

      <div className="mb-4">
        <label className="text-white font-semibold mb-2 block">Favor confirme las actividades de la sociedad:</label>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 mt-2">
          {[
            "Vehículo de inversión",
            "Dueño de nave o aeronave",
            "Portafolio Bienes y Raíces",
            "Consultoría",
            "Tenedora de activos",
            "Comercio",
            "Parte de una estructura",
            "Otra",
          ].map((actividad, idx) => {
            const isSelected = actividades.includes(actividad);
            return (
              <button
                type="button"
                key={idx}
                className={`w-full text-left px-4 py-2 rounded border ${isSelected ? "bg-profile text-white border-profile" : "bg-gray-800 text-white border-gray-600"
                  }`}
                onClick={() => {
                  if (isSelected) {
                    setActividades(prev => prev.filter(item => item !== actividad));
                  } else {
                    setActividades(prev => [...prev, actividad]);
                  }
                }}
              >
                {actividad}
              </button>
            );
          })}

          {actividades.includes("Otra") && (
            <input
              type="text"
              placeholder="Indique la otra opción"
              value={otraActividad}
              onChange={(e) => setOtraActividad(e.target.value)}
              className="w-full p-2 bg-gray-800 text-white rounded col-span-2"
            />
          )}
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-white font-semibold mb-2">Valor de los activos de la sociedad:</label>
        <input
          type="text"
          name="valorActivos"
          onChange={handleChange}
          className="w-full p-2 bg-gray-800 text-white rounded"
        />
      </div>

      <div className="mb-4">
        <label className="block text-white font-semibold mb-2">Describa los activos de la sociedad:</label>
        <textarea
          name="descripcionActivos"
          onChange={handleChange}
          className="w-full p-2 bg-gray-800 text-white rounded"
        />
      </div>

      <div className="mb-4">
        <label className="text-white font-semibold mb-2 block">Indique las fuentes de ingresos:</label>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 mt-2">
          {[
            "Ingresos de negocios",
            "Herencia",
            "Ahorros personales",
            "Venta de activos",
            "Ingreso por alquiler inmueble",
          ].map((fuente, idx) => {
            const isSelected = fuentesIngresos.includes(fuente);
            return (
              <button
                type="button"
                key={idx}
                className={`w-full text-left px-4 py-2 rounded border ${isSelected ? "bg-profile text-white border-profile" : "bg-gray-800 text-white border-gray-600"
                  }`}
                onClick={() => {
                  if (isSelected) {
                    setFuentesIngresos(prev => prev.filter(item => item !== fuente));
                  } else {
                    setFuentesIngresos(prev => [...prev, fuente]);
                  }
                }}
              >
                {fuente}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-white font-semibold mb-2">Países en los que lleva a cabo las actividades:</label>
        <input
          type="text"
          name="paisesActividad"
          onChange={handleChange}
          className="w-full p-2 bg-gray-800 text-white rounded"
        />
      </div>

      <h3 className="text-white text-lg font-bold mb-2">Directores</h3>    
      {/* Sección Directores */}
      <FormularioDirectores directores={directores} setDirectores={setDirectores} />
      
      <h3 className="text-white text-lg font-bold mb-2">Dignatarios</h3>
      {/* Sección Dignatarios */}
      <FormularioDignatarios dignatarios={dignatarios} setDignatarios={setDignatarios} />

      <div className="mb-4">
        <label className="text-white font-semibold">¿Es el beneficiario final uno de los accionistas, directores o dignatarios?</label>
        <div className="flex gap-4">
          <button
            onClick={() => {
              setEsBeneficiarioRelacionado("si");
              mostrarPopup("Este servicio se renueva anualmente y requiere compartir el cierre contable y beneficiarios finales.");
            }}
            className={`py-2 px-4 rounded ${esBeneficiarioRelacionado === "si" ? "bg-profile" : "bg-gray-700"}`}
          >
            Sí
          </button>
          <button
            onClick={() => setEsBeneficiarioRelacionado("no")}
            className={`py-2 px-4 rounded ${esBeneficiarioRelacionado === "no" ? "bg-profile" : "bg-gray-700"}`}
          >
            No
          </button>
        </div>
      </div>

      {esBeneficiarioRelacionado === "si" && (
        <div className="mb-4">
          <label className="text-white font-semibold">Elija los beneficiarios:</label>
          <Select
            isMulti
            options={nombresRegistrados.map(p => ({ value: p.id, label: p.nombre }))}
            styles={darkSelectStyles}
          />
        </div>
      )}

      {esBeneficiarioRelacionado === "no" && (
        <>
          {/* Sección Beneficiarios */}
          <FormularioBeneficiarios
            beneficiarios={beneficiarios}
            setBeneficiarios={setBeneficiarios}
            handleRentaFile={handleRentaFile}
            handleReferenciaBancaria={handleReferenciaBancaria}
            handleReferenciaComercial={handleReferenciaComercial}
            handleLibroAcciones={handleLibroAcciones}
            handleResumenChange={handleChange}
          />
        </>
      )}

      <div className="mt-8">
        <button
          /* onClick={guardarInformacion} */
          className="bg-profile text-white py-3 px-6 rounded-lg w-full"
        >
          Guardar y continuar
        </button>
      </div>
    </div>
  );
};

export default ActaAgenteResidente;
