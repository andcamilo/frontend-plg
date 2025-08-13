"use client";
import React, { useState } from "react";
import Swal from "sweetalert2";

const ActaDisolucion: React.FC = () => {
  const [poseeAviso, setPoseeAviso] = useState("");
  const [servicioCeseAviso, setServicioCeseAviso] = useState("");
  const [mantienePlanilla, setMantienePlanilla] = useState("");
  const [servicioCeseCSS, setServicioCeseCSS] = useState("");
  const [tramite, setTramite] = useState({ correo: "", clave: "" });

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTramite(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="space-y-6 mt-6">
      <h3 className="text-white text-lg font-bold">Disolución de Sociedad o Fundación</h3>

      <label className="text-white font-semibold">¿Posee aviso de operación?</label>
      <div className="flex gap-4">
        <button onClick={() => setPoseeAviso("si")} className={`py-2 px-4 rounded ${poseeAviso === "si" ? "bg-profile" : "bg-gray-700"}`}>Sí</button>
        <button onClick={() => setPoseeAviso("no")} className={`py-2 px-4 rounded ${poseeAviso === "no" ? "bg-profile" : "bg-gray-700"}`}>No</button>
      </div>

      {poseeAviso === "si" && (
        <div className="space-y-4">
          <p className="text-white">Debemos presentar el cese de aviso de operación. Estos documentos deben ser originales y se deben presentar ante el municipio. Le contactaremos para gestionar la entrega.</p>

          <label className="text-white">Adjunte aviso de operación original firmado:</label>
          <input type="file" className="w-full p-2 bg-gray-800 text-white rounded" />

          <label className="text-white">Adjunte el cese de operación:</label>
          <input type="file" className="w-full p-2 bg-gray-800 text-white rounded" />

          <label className="text-white">¿Desea que le prestemos el servicio para solicitar el cese de operaciones?</label>
          <div className="flex gap-4">
            <button onClick={() => setServicioCeseAviso("si")} className={`py-2 px-4 rounded ${servicioCeseAviso === "si" ? "bg-profile" : "bg-gray-700"}`}>Sí</button>
            <button onClick={() => setServicioCeseAviso("no")} className={`py-2 px-4 rounded ${servicioCeseAviso === "no" ? "bg-profile" : "bg-gray-700"}`}>No</button>
          </div>

          {servicioCeseAviso === "si" && (
            <div className="space-y-2">
              <input type="text" name="correo" placeholder="Correo del tramitador" className="w-full p-2 bg-gray-800 text-white rounded" onChange={handleInput} />
              <input type="password" name="clave" placeholder="Contraseña" className="w-full p-2 bg-gray-800 text-white rounded" onChange={handleInput} />
            </div>
          )}

          {servicioCeseAviso === "no" && (
            <p className="text-white">Es necesario tener el cese de operación para realizar el cierre. Estaremos a la espera de este documento para continuar.</p>
          )}
        </div>
      )}

      {poseeAviso === "no" && (
        <p className="text-white">Le estaremos enviando una autorización para que podamos solicitar la certificación de persona no obligada en la CSS para presentar ante DGI.</p>
      )}

      <label className="text-white font-semibold">¿Mantuvo planilla en la sociedad?</label>
      <div className="flex gap-4">
        <button onClick={() => setMantienePlanilla("si")} className={`py-2 px-4 rounded ${mantienePlanilla === "si" ? "bg-profile" : "bg-gray-700"}`}>Sí</button>
        <button onClick={() => setMantienePlanilla("no")} className={`py-2 px-4 rounded ${mantienePlanilla === "no" ? "bg-profile" : "bg-gray-700"}`}>No</button>
      </div>

      {mantienePlanilla === "si" && (
        <div className="space-y-4">
          <p className="text-white">Debemos presentar el cese de operaciones emitido por la Caja de Seguro Social. En caso de no poseerlo, podemos ayudarle con este trámite adicional.</p>

          <label className="text-white">¿Desea que le prestemos el servicio?</label>
          <div className="flex gap-4">
            <button onClick={() => setServicioCeseCSS("si")} className={`py-2 px-4 rounded ${servicioCeseCSS === "si" ? "bg-profile" : "bg-gray-700"}`}>Sí</button>
            <button onClick={() => setServicioCeseCSS("no")} className={`py-2 px-4 rounded ${servicioCeseCSS === "no" ? "bg-profile" : "bg-gray-700"}`}>No</button>
          </div>

          {servicioCeseCSS === "si" && (
            <p className="text-white">Le estaremos enviando el poder y autorización para su firma y así podamos proceder ante la CSS.</p>
          )}

          {servicioCeseCSS === "no" && (
            <div className="space-y-2">
              <p className="text-white">Es necesario obtener el cese de operaciones de la CSS para proceder. Adjunte el comprobante o estaremos atentos a su entrega.</p>
              <input type="file" className="w-full p-2 bg-gray-800 text-white rounded" />
            </div>
          )}
        </div>
      )}

      <div className="mt-8">
        <button className="bg-profile text-white py-3 px-6 rounded-lg w-full">
          Guardar y continuar
        </button>
      </div>
    </div>
  );
};

export default ActaDisolucion;