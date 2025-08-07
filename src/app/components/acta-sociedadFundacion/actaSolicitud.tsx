"use client";
import React, { useState, useContext } from "react";
import Swal from "sweetalert2";
import axios from "axios";
import AppStateContext from "@context/actaSociedadFundacionContext";

/* type Director = {
  nombre: string;
  direccion: string;
  identificacion: File | null;
};

type JuntaDirectiva = {
  nombre: string;
  identificacion: File | null;
  cargo: string;
};

type ReemplazoDirector = {
  actual: string;
  nuevo: string;
  direccion: string;
  telefono: string;
  email: string;
};

type ReemplazoDignatario = {
  actual: string;
  cargoActual: string;
  nuevo: string;
  nuevoCargo: string;
  direccion: string;
  telefono: string;
  email: string;
}; */

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
  const context = useContext(AppStateContext);
  /* const [directores, setDirectores] = useState<Director[]>([{ nombre: "", direccion: "", identificacion: null }]);
  const [juntaDirectiva, setJuntaDirectiva] = useState<JuntaDirectiva[]>([{ nombre: "", identificacion: null, cargo: "" }]);
  const [reemplazoDirectores, setReemplazoDirectores] = useState<ReemplazoDirector[]>([{ actual: "", nuevo: "", direccion: "", telefono: "", email: "" }]);
  const [reemplazoDignatarios, setReemplazoDignatarios] = useState<ReemplazoDignatario[]>([{ actual: "", cargoActual: "", nuevo: "", nuevoCargo: "", direccion: "", telefono: "", email: "" }]); */

  if (!context) {
    throw new Error("AppStateContext must be used within an AppStateProvider");
  }

  const { store, setStore } = context;

  const cambiosSociedadAnonima = [
    "Cambio de Agente Residente",
    "Cambio de Junta Directiva y/o Dignatarios",
    "Cambio de nombre de la Sociedad/Fundación",
    "Disolución",
    "Asignación de Poder General",
    "Renuncia de Directores y/o Dignatarios",
    "Cambio de objeto de la sociedad",
    "Cambio de cláusulas del pacto social"
  ];

  const cambiosFundacion = [
    "Cambio de Agente Residente",
    "Cambio de Consejo Fundacional y/o Dignatarios",
    "Cambio de nombre de la Sociedad/Fundación",
    "Asignación de Poder General",
    "Renuncia de Miembros de la Fundación y/o Dignatarios",
    "Cambio de cláusulas del Acta Fundacional",
    "Aumento y disminución del Patrimonio Fundacional",
    "Poder general / Poder amplio y suficiente",
    "Emisión o Cambio de Reglamento",
    "Disolución"
  ];

  const cambiosSociedadCivil = [
    "Cambio de nombre de la Sociedad/Fundación",
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
            className={`py-2 px-4 border rounded-lg ${cambiosSeleccionados.includes(cambio) ? "bg-profile text-white" : "bg-gray-700 text-white"
              }`}
            onClick={() => handleSeleccionCambio(cambio)}
          >
            {cambio}
          </button>
        ))}
      </div>
    );
  };

  const guardarInformacion = async () => {
    try {
      let solicitudId = store.solicitudId;
      console.log("SOLICIRUD ID ", solicitudId)
      const payload = {
        solicitudId,
        tipoPersona,
        nombreEntidad,
        folioFicha,
        poseeRUC,
        ruc: poseeRUC === "si" ? ruc : "",
        tasaUnica: poseeRUC === "si" ? tasaUnica : "",
        deseaRUC: poseeRUC === "no" ? deseaRUC : "",
        requiereAdHoc,
        cambiosSeleccionados,
        agenteResidentePLG: cambiosSeleccionados.includes("Cambio de Agente Residente") ? agenteResidentePLG : "",
      };

      const response = await axios.post("/api/update-request-all", payload);

      if (response.status === 200) {
        Swal.fire({
          icon: "success",
          title: "Información guardada correctamente",
          timer: 2000,
          showConfirmButton: false,
          background: '#2c2c3e',
          color: '#fff',
          customClass: {
            popup: 'custom-swal-popup',
            title: 'custom-swal-title-main',
            icon: 'custom-swal-icon',
            timerProgressBar: 'custom-swal-timer-bar'
          }
        });
      }
    } catch (error) {
      console.error("Error al guardar la información:", error);
      Swal.fire({
        icon: "error",
        title: "Hubo un error al guardar",
        text: "Intenta nuevamente más tarde",
      });
    }
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

      {cambiosSeleccionados.includes("Cambio de Junta Directiva y/o Dignatarios") && (
        <div className="mt-6 space-y-6">

          {/* Directores */}
          {/* <div>
            <h3 className="text-white text-lg font-bold mb-2">Directores Nuevos</h3>
            {directores.map((director, index) => (
              <div key={index} className="space-y-2 mb-6 border border-gray-600 p-4 rounded relative">
                <p className="text-white font-semibold mb-2">Director #{index + 1}</p>

                {directores.length > 1 && (
                  <button
                    onClick={() => {
                      const updated = [...directores];
                      updated.splice(index, 1);
                      setDirectores(updated);
                    }}
                    className="absolute top-2 right-2 text-red-500 hover:text-red-700 text-sm"
                    title="Eliminar"
                  >
                    ✖
                  </button>
                )}

                <input
                  type="text"
                  placeholder="Nombre del Director"
                  className="w-full p-2 bg-gray-800 text-white rounded"
                  value={director.nombre}
                  onChange={(e) => {
                    const newList = [...directores];
                    newList[index].nombre = e.target.value;
                    setDirectores(newList);
                  }}
                />
                <input
                  type="text"
                  placeholder="Dirección del Director"
                  className="w-full p-2 bg-gray-800 text-white rounded"
                  value={director.direccion}
                  onChange={(e) => {
                    const newList = [...directores];
                    newList[index].direccion = e.target.value;
                    setDirectores(newList);
                  }}
                />
                <input
                  type="file"
                  className="text-white"
                  onChange={(e) => {
                    const newList = [...directores];
                    newList[index].identificacion = e.target.files?.[0] || null;
                    setDirectores(newList);
                  }}
                />
              </div>
            ))}
            <button
              onClick={() => setDirectores([...directores, { nombre: "", direccion: "", identificacion: null }])}
              className="py-2 px-4 bg-profile text-white rounded"
            >
              + Agregar Director
            </button>
          </div> */}

          {/* Junta Directiva */}
          {/* <div>
            <h3 className="text-white text-lg font-bold mb-2">Miembros de la Junta Directiva</h3>
            {juntaDirectiva.map((persona, index) => (
              <div key={index} className="space-y-2 mb-6 border border-gray-600 p-4 rounded relative">
                <p className="text-white font-semibold mb-2">Miembro #{index + 1}</p>

                {juntaDirectiva.length > 1 && (
                  <button
                    onClick={() => {
                      const updated = [...juntaDirectiva];
                      updated.splice(index, 1);
                      setJuntaDirectiva(updated);
                    }}
                    className="absolute top-2 right-2 text-red-500 hover:text-red-700 text-sm"
                    title="Eliminar"
                  >
                    ✖
                  </button>
                )}

                <input
                  type="text"
                  placeholder="Nombre Completo"
                  className="w-full p-2 bg-gray-800 text-white rounded"
                  value={persona.nombre}
                  onChange={(e) => {
                    const list = [...juntaDirectiva];
                    list[index].nombre = e.target.value;
                    setJuntaDirectiva(list);
                  }}
                />
                <input
                  type="file"
                  className="text-white"
                  onChange={(e) => {
                    const list = [...juntaDirectiva];
                    list[index].identificacion = e.target.files?.[0] || null;
                    setJuntaDirectiva(list);
                  }}
                />
                <select
                  className="w-full p-2 bg-gray-800 text-white rounded"
                  value={persona.cargo}
                  onChange={(e) => {
                    const list = [...juntaDirectiva];
                    list[index].cargo = e.target.value;
                    setJuntaDirectiva(list);
                  }}
                >
                  <option value="">Seleccionar cargo</option>
                  <option value="Presidente">Presidente</option>
                  <option value="Secretario">Secretario</option>
                  <option value="Tesorero">Tesorero</option>
                  <option value="Vicepresidente">Vicepresidente</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>
            ))}
            <button
              onClick={() => setJuntaDirectiva([...juntaDirectiva, { nombre: "", identificacion: null, cargo: "" }])}
              className="py-2 px-4 bg-profile text-white rounded"
            >
              + Agregar miembro
            </button>
          </div> */}

          {/* Reemplazo de Directores */}
          {/* <div>
            <h3 className="text-white text-lg font-bold mb-2">Reemplazo de Directores</h3>

            {reemplazoDirectores.map((item, index) => (
              <div key={index} className="space-y-2 mb-6 border border-gray-600 p-4 rounded relative">
                <p className="text-white font-semibold mb-2">Director #{index + 1}</p>

                {reemplazoDirectores.length > 1 && (
                  <button
                    onClick={() => {
                      const updated = [...reemplazoDirectores];
                      updated.splice(index, 1);
                      setReemplazoDirectores(updated);
                    }}
                    className="absolute top-2 right-2 text-red-500 hover:text-red-700 text-sm"
                    title="Eliminar"
                  >
                    ✖
                  </button>
                )}

                <input
                  className="w-full p-2 bg-gray-800 text-white rounded"
                  placeholder="Nombre del director actual"
                  value={item.actual}
                  onChange={(e) => {
                    const list = [...reemplazoDirectores];
                    list[index].actual = e.target.value;
                    setReemplazoDirectores(list);
                  }}
                />
                <input
                  className="w-full p-2 bg-gray-800 text-white rounded"
                  placeholder="Nombre del nuevo director"
                  value={item.nuevo}
                  onChange={(e) => {
                    const list = [...reemplazoDirectores];
                    list[index].nuevo = e.target.value;
                    setReemplazoDirectores(list);
                  }}
                />
                <input
                  className="w-full p-2 bg-gray-800 text-white rounded"
                  placeholder="Dirección"
                  value={item.direccion}
                  onChange={(e) => {
                    const list = [...reemplazoDirectores];
                    list[index].direccion = e.target.value;
                    setReemplazoDirectores(list);
                  }}
                />
                <input
                  className="w-full p-2 bg-gray-800 text-white rounded"
                  placeholder="Teléfono"
                  value={item.telefono}
                  onChange={(e) => {
                    const list = [...reemplazoDirectores];
                    list[index].telefono = e.target.value;
                    setReemplazoDirectores(list);
                  }}
                />
                <input
                  className="w-full p-2 bg-gray-800 text-white rounded"
                  placeholder="Email"
                  value={item.email}
                  onChange={(e) => {
                    const list = [...reemplazoDirectores];
                    list[index].email = e.target.value;
                    setReemplazoDirectores(list);
                  }}
                />
              </div>
            ))}

            <button
              onClick={() =>
                setReemplazoDirectores([
                  ...reemplazoDirectores,
                  { actual: "", nuevo: "", direccion: "", telefono: "", email: "" },
                ])
              }
              className="py-2 px-4 bg-fuchsia-700 hover:bg-fuchsia-800 text-white rounded"
            >
              + Agregar reemplazo
            </button>
          </div> */}

          {/* Reemplazo de Dignatarios */}
          {/* <div>
            <h3 className="text-white text-lg font-bold mb-2">Reemplazo de Dignatarios</h3>

            {reemplazoDignatarios.map((item, index) => (
              <div key={index} className="space-y-2 mb-6 border border-gray-600 p-4 rounded relative">
                <p className="text-white font-semibold mb-2">Dignatario #{index + 1}</p>

                {reemplazoDignatarios.length > 1 && (
                  <button
                    onClick={() => {
                      const updated = [...reemplazoDignatarios];
                      updated.splice(index, 1);
                      setReemplazoDignatarios(updated);
                    }}
                    className="absolute top-2 right-2 text-red-500 hover:text-red-700 text-sm"
                    title="Eliminar"
                  >
                    ✖
                  </button>
                )}

                <input
                  className="w-full p-2 bg-gray-800 text-white rounded"
                  placeholder="Nombre del dignatario actual"
                  value={item.actual}
                  onChange={(e) => {
                    const list = [...reemplazoDignatarios];
                    list[index].actual = e.target.value;
                    setReemplazoDignatarios(list);
                  }}
                />
                <input
                  className="w-full p-2 bg-gray-800 text-white rounded"
                  placeholder="Cargo actual"
                  value={item.cargoActual}
                  onChange={(e) => {
                    const list = [...reemplazoDignatarios];
                    list[index].cargoActual = e.target.value;
                    setReemplazoDignatarios(list);
                  }}
                />
                <input
                  className="w-full p-2 bg-gray-800 text-white rounded"
                  placeholder="Nombre del nuevo dignatario"
                  value={item.nuevo}
                  onChange={(e) => {
                    const list = [...reemplazoDignatarios];
                    list[index].nuevo = e.target.value;
                    setReemplazoDignatarios(list);
                  }}
                />
                <select
                  className="w-full p-2 bg-gray-800 text-white rounded"
                  value={item.nuevoCargo}
                  onChange={(e) => {
                    const list = [...reemplazoDignatarios];
                    list[index].nuevoCargo = e.target.value;
                    setReemplazoDignatarios(list);
                  }}
                >
                  <option value="">Seleccionar nuevo cargo</option>
                  <option value="Presidente">Presidente</option>
                  <option value="Secretario">Secretario</option>
                  <option value="Tesorero">Tesorero</option>
                  <option value="Vicepresidente">Vicepresidente</option>
                  <option value="Otro">Otro</option>
                </select>
                <input
                  className="w-full p-2 bg-gray-800 text-white rounded"
                  placeholder="Dirección"
                  value={item.direccion}
                  onChange={(e) => {
                    const list = [...reemplazoDignatarios];
                    list[index].direccion = e.target.value;
                    setReemplazoDignatarios(list);
                  }}
                />
                <input
                  className="w-full p-2 bg-gray-800 text-white rounded"
                  placeholder="Teléfono"
                  value={item.telefono}
                  onChange={(e) => {
                    const list = [...reemplazoDignatarios];
                    list[index].telefono = e.target.value;
                    setReemplazoDignatarios(list);
                  }}
                />
                <input
                  className="w-full p-2 bg-gray-800 text-white rounded"
                  placeholder="Email"
                  value={item.email}
                  onChange={(e) => {
                    const list = [...reemplazoDignatarios];
                    list[index].email = e.target.value;
                    setReemplazoDignatarios(list);
                  }}
                />
              </div>
            ))}

            <button
              onClick={() =>
                setReemplazoDignatarios([
                  ...reemplazoDignatarios,
                  {
                    actual: "",
                    cargoActual: "",
                    nuevo: "",
                    nuevoCargo: "",
                    direccion: "",
                    telefono: "",
                    email: "",
                  },
                ])
              }
              className="py-2 px-4 bg-profile text-white rounded"
            >
              + Agregar reemplazo de dignatario
            </button>
          </div> */}

        </div>
      )}

      {/* {cambiosSeleccionados.includes("Cambio de Agente Residente") && (
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
      )} */}

      <div className="mt-8">
        <button
          onClick={guardarInformacion}
          className="bg-profile text-white py-3 px-6 rounded-lg w-full"
        >
          Guardar y continuar
        </button>
      </div>
    </div>
  );
};

export default ActaSolicitud;
