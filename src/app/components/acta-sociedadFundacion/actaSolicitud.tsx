"use client";
import React, { useState } from "react";
import Swal from "sweetalert2";

const ActaSolicitud: React.FC = () => {
  const [tipoPersona, setTipoPersona] = useState("");
  const [nombreEntidad, setNombreEntidad] = useState("");
  const [folioFicha, setFolioFicha] = useState("");
  const [poseeRUC, setPoseeRUC] = useState("");
  const [ruc, setRUC] = useState("");
  const [tasaUnica, setTasaUnica] = useState("");
  const [deseaRUC, setDeseaRUC] = useState("");
  const [requiereAdHoc, setRequiereAdHoc] = useState("");
  const [cambiosSeleccionados, setCambiosSeleccionados] = useState<string[]>([]);
  const [agenteResidentePLG, setAgenteResidentePLG] = useState("");

  const cambiosSociedadAnonima = [
    "Cambio de Agente Residente",
    "Cambio de Junta Directiva y/o Dignatarios",
    "Cambio de nombre de la sociedad",
    "Disolución",
    "Asignación de Poder General",
    "Renuncia de Directores y/o Dignatarios",
    "Cambio de objeto de la sociedad",
    "Cambio de cláusulas del pacto social"
  ];

  const cambiosFundacion = [
    "Cambio de Agente Residente",
    "Cambio de Miembros del Consejo Fundacional y/o Dignatarios",
    "Cambio de nombre de la Fundación",
    "Asignación de Poder General",
    "Renuncia de Miembros de la Fundación y/o Dignatarios",
    "Cambio de cláusulas del Acta Fundacional",
    "Aumento y disminución del Patrimonio Fundacional",
    "Poder general / Poder amplio y suficiente",
    "Emisión o Cambio de Reglamento",
    "Disolución"
  ];

  const cambiosSociedadCivil = [
    "Cambio de nombre",
    "Cambio de Agente Residente",
    "Adición de socios sociedad Civil",
    "Remoción de socios Sociedad Civil"
  ];

  const handleSeleccionCambio = (cambio: string) => {
    if (cambiosSeleccionados.includes(cambio)) {
      setCambiosSeleccionados(cambiosSeleccionados.filter((c) => c !== cambio));
    } else {
      setCambiosSeleccionados([...cambiosSeleccionados, cambio]);
    }
  };

  const mostrarPopup = (mensaje: string) => {
    Swal.fire({
      icon: "info",
      title: mensaje,
      confirmButtonColor: "#3085d6"
    });
  };

  const renderOpcionesCambios = () => {
    const cambios =
      tipoPersona === "sociedad"
        ? cambiosSociedadAnonima
        : tipoPersona === "fundacion"
        ? cambiosFundacion
        : tipoPersona === "civil"
        ? cambiosSociedadCivil
        : [];

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
        {cambios.map((cambio) => (
          <button
            key={cambio}
            type="button"
            className={`py-2 px-4 border rounded-lg ${
              cambiosSeleccionados.includes(cambio) ? "bg-profile text-white" : "bg-gray-700 text-white"
            }`}
            onClick={() => handleSeleccionCambio(cambio)}
          >
            {cambio}
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="w-full h-full p-8 overflow-y-scroll scrollbar-thin bg-[#070707]">
      <h1 className="text-2xl font-bold mb-4">Solicitud</h1>

      <label className="block mb-2">Tipo de Persona Jurídica:</label>
      <select
        className="w-full p-2 bg-gray-800 rounded"
        value={tipoPersona}
        onChange={(e) => setTipoPersona(e.target.value)}
      >
        <option value="">Seleccione una opción</option>
        <option value="sociedad">Sociedad Anónima</option>
        <option value="fundacion">Fundación de Interés Privado</option>
        <option value="civil">Sociedad Civil</option>
      </select>

      <label className="block mt-4 mb-2">Nombre de la Entidad:</label>
      <input
        className="w-full p-2 bg-gray-800 rounded"
        value={nombreEntidad}
        onChange={(e) => setNombreEntidad(e.target.value)}
      />

      <label className="block mt-4 mb-2">Número de Folio o Ficha en Registro Público:</label>
      <input
        className="w-full p-2 bg-gray-800 rounded"
        value={folioFicha}
        onChange={(e) => setFolioFicha(e.target.value)}
      />

      <label className="block mt-4 mb-2">¿Posee RUC registrado en DGI?</label>
      <div className="flex gap-4">
        <button onClick={() => setPoseeRUC("si")} className={`py-2 px-4 rounded ${poseeRUC === "si" ? "bg-profile" : "bg-gray-700"}`}>Sí</button>
        <button onClick={() => setPoseeRUC("no")} className={`py-2 px-4 rounded ${poseeRUC === "no" ? "bg-profile" : "bg-gray-700"}`}>No</button>
      </div>

      {poseeRUC === "si" && (
        <>
          <label className="block mt-4 mb-2">RUC de la Organización:</label>
          <input
            className="w-full p-2 bg-gray-800 rounded"
            value={ruc}
            onChange={(e) => setRUC(e.target.value)}
          />

          <label className="block mt-4 mb-2">¿Está al día con la tasa única?</label>
          <div className="flex gap-4">
            <button onClick={() => {
              setTasaUnica("si");
              mostrarPopup("Debe adjuntar paz y salvo recibido por la DGI.");
            }} className={`py-2 px-4 rounded ${tasaUnica === "si" ? "bg-profile" : "bg-gray-700"}`}>Sí</button>

            <button onClick={() => {
              setTasaUnica("no");
              mostrarPopup("Es necesario estar al día con los pagos de tasa única. Puede continuar, pero deberá presentar el paz y salvo antes de registrar el acta.");
            }} className={`py-2 px-4 rounded ${tasaUnica === "no" ? "bg-profile" : "bg-gray-700"}`}>No</button>
          </div>
        </>
      )}

      {poseeRUC === "no" && (
        <>
          <label className="block mt-4 mb-2">¿Desea que le solicitemos el RUC?</label>
          <div className="flex gap-4">
            <button onClick={() => {
              setDeseaRUC("si");
              mostrarPopup("Se agregará un costo adicional por el trámite del RUC. Puede continuar con el formulario.");
            }} className={`py-2 px-4 rounded ${deseaRUC === "si" ? "bg-profile" : "bg-gray-700"}`}>Sí</button>

            <button onClick={() => {
              setDeseaRUC("no");
              mostrarPopup("Necesitamos que la sociedad esté solvente. Puede continuar, pero necesitaremos el paz y salvo.");
            }} className={`py-2 px-4 rounded ${deseaRUC === "no" ? "bg-profile" : "bg-gray-700"}`}>No</button>
          </div>
        </>
      )}

      <label className="block mt-4 mb-2">¿Requiere servicio Ad-hoc?</label>
      <div className="flex gap-4">
        <button onClick={() => {
          setRequiereAdHoc("si");
          mostrarPopup("Le enviaremos una autorización que deberá ser firmada por los accionistas o consejo fundacional.");
        }} className={`py-2 px-4 rounded ${requiereAdHoc === "si" ? "bg-profile" : "bg-gray-700"}`}>Sí</button>

        <button onClick={() => {
          setRequiereAdHoc("no");
          mostrarPopup("El acta deberá ser firmada por el presidente y secretario, o responsables según el acta fundacional.");
        }} className={`py-2 px-4 rounded ${requiereAdHoc === "no" ? "bg-profile" : "bg-gray-700"}`}>No</button>
      </div>

      <label className="block mt-6 mb-2">¿Qué tipo de cambio desea realizar?</label>
      {renderOpcionesCambios()}

      {cambiosSeleccionados.includes("Cambio de Agente Residente") && (
        <>
          <label className="block mt-6 mb-2">¿Desea que Panama Legal Group sea su Agente Residente?</label>
          <div className="flex gap-4">
            <button onClick={() => {
              setAgenteResidentePLG("si");
              mostrarPopup("Este servicio se renueva anualmente y requiere compartir el cierre contable y beneficiarios finales.");
            }} className={`py-2 px-4 rounded ${agenteResidentePLG === "si" ? "bg-profile" : "bg-gray-700"}`}>Sí</button>
            <button onClick={() => setAgenteResidentePLG("no")} className={`py-2 px-4 rounded ${agenteResidentePLG === "no" ? "bg-profile" : "bg-gray-700"}`}>No</button>
          </div>
        </>
      )}
    </div>
  );
};

export default ActaSolicitud;
