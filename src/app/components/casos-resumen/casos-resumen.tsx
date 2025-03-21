"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";

const CasoResumen: React.FC = () => {
  // Always call hooks first
  const params = useParams();
  const router = useRouter();

  // Extract id if available (it might be undefined on the first render)
  const id = params?.id as string | undefined;

  const [emailEditado, setEmailEditado] = useState("");
  const [resumenEditado, setResumenEditado] = useState("");
  const [comentario, setComentario] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      const fetchCaso = async () => {
        setIsLoading(true);
        setError(null);
        try {
          const response = await axios.get("/api/get-caso-id", {
            params: { casoId: id },
          });
          const casoData = response.data;
          setEmailEditado(casoData?.summaryEmail || "");
          setResumenEditado(casoData?.resumenCaso || "");
          setComentario(casoData?.comentario || "");
        } catch (err: any) {
          console.error("Error al obtener caso:", err);
          setError(
            err.message ||
              "Hubo un error al obtener la información del caso."
          );
        } finally {
          setIsLoading(false);
        }
      };

      fetchCaso();
    }
  }, [id]);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmailEditado(e.target.value);
  };

  const handleResumenChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setResumenEditado(e.target.value);
  };

  const handleComentarioChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setComentario(e.target.value);
  };

  const handleEnviar = async () => {
    if (!emailEditado.trim() || !resumenEditado.trim()) {
      Swal.fire({
        icon: "warning",
        title: "Campos vacíos",
        text: "El email y el resumen del caso no pueden estar vacíos.",
        background: "#2c2c3e",
        color: "#fff",
      });
      return;
    }

    try {
      await axios.post("/api/update-caso", {
        casoId: id,
        summaryEmail: emailEditado,
        resumenCaso: resumenEditado,
        comentario,
        status: 70,
      });

      Swal.fire({
        icon: "success",
        title: "Datos guardados",
        text: "Los cambios se han guardado correctamente.",
        background: "#2c2c3e",
        color: "#fff",
        timer: 2000,
        showConfirmButton: false,
      }).then(() => {
        window.location.href = "/dashboard/requestsCasos";
      });

      setComentario("");
    } catch (error) {
      console.error("Error al actualizar caso:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No se pudieron guardar los cambios.",
        background: "#2c2c3e",
        color: "#fff",
      });
    }
  };

  // Now, conditionally render the UI based on the presence of id
  if (!id) {
    return <div>Loading...</div>;
  }

  return (
    <div className="w-full h-full p-8 bg-[#070707]">
      <h1 className="text-white text-3xl font-bold mb-6">Resumen del Caso</h1>
      {isLoading ? (
        <p className="text-white">Cargando información del caso...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <div className="bg-gray-900 p-6 rounded-lg shadow-lg text-white">
          <div className="mb-4">
            <label className="text-lg font-semibold">Email:</label>
            <input
              type="email"
              className="w-full p-3 mt-2 bg-gray-800 text-white rounded-lg"
              placeholder="Editar email..."
              value={emailEditado}
              onChange={handleEmailChange}
            />
          </div>

          <div className="mb-4">
            <label className="text-lg font-semibold">
              Resumen del Caso:
            </label>
            <textarea
              className="w-full p-3 mt-2 bg-gray-800 text-white rounded-lg"
              rows={4}
              placeholder="Editar resumen del caso..."
              value={resumenEditado}
              onChange={handleResumenChange}
            ></textarea>
          </div>

          <div className="mt-6">
            <label className="text-lg font-semibold">
              Comentario de respuesta:
            </label>
            <textarea
              className="w-full p-3 mt-2 bg-gray-800 text-white rounded-lg"
              rows={4}
              placeholder="Escribe tu comentario aquí..."
              value={comentario}
              onChange={handleComentarioChange}
            ></textarea>
          </div>

          <button
            className="mt-4 px-6 py-3 bg-profile hover:bg-profile text-white rounded-lg w-full"
            onClick={handleEnviar}
          >
            Enviar
          </button>
        </div>
      )}
    </div>
  );
};

export default CasoResumen;
