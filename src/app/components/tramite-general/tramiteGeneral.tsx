import React, { useState, useEffect } from "react";
import ClipLoader from "react-spinners/ClipLoader";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { initializeApp, getApps, getApp } from "firebase/app";
import axios from "axios";
import Swal from "sweetalert2";
import { checkAuthToken } from "@utils/checkAuthToken";
import {
  firebaseApiKey,
  firebaseAuthDomain,
  firebaseProjectId,
  firebaseStorageBucket,
  firebaseMessagingSenderId,
  firebaseAppId
} from "@utils/env";
import { useRouter } from 'next/router';

// Configuración de Firebase
const firebaseConfig = {
  apiKey: firebaseApiKey,
  authDomain: firebaseAuthDomain,
  projectId: firebaseProjectId,
  storageBucket: firebaseStorageBucket,
  messagingSenderId: firebaseMessagingSenderId,
  appId: firebaseAppId,
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const storage = getStorage(app);

const SolicitudForm: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;

  const [formData, setFormData] = useState<{
    email: string;
    tipoServicio: string;
    nivelUrgencia: string;
    descripcion: string;
    descripcionExtra: string;
    documentos: (File | null)[]; // Array que admite archivos o `null`
    archivoURLs: string[];
    cuenta: string;
  }>({
    email: "",
    tipoServicio: "",
    nivelUrgencia: "",
    descripcion: "",
    descripcionExtra: "",
    documentos: [null, null, null], // Manejo de 3 documentos
    archivoURLs: ["", "", ""], // URLs de los documentos subidos
    cuenta: "",
  });

  const [isEmergentFieldVisible, setIsEmergentFieldVisible] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [solicitudData, setSolicitudData] = useState<any>(null);

  useEffect(() => {
    const userData = checkAuthToken();
    console.log("userData ", userData)
    if (userData) {
      setFormData((prevData) => ({
        ...prevData,
        email: userData?.email,
        cuenta: userData?.user_id,
      }));
      setIsLoggedIn(true);
    }
  }, []);

  useEffect(() => {
    if (id) {
      const fetchSolicitud = async () => {
        try {
          const response = await axios.get('/api/get-request-id', {
            params: { solicitudId: id },
          });
          setSolicitudData(response.data); // Establece solicitudData una vez obtenida
        } catch (error) {
          console.error('Error fetching solicitud:', error);
        }
      };
      fetchSolicitud();
      console.log('ID del registro:', id);
    }
  }, [id]);

  // Actualiza formData cuando solicitudData cambia
  useEffect(() => {
    if (solicitudData) {
      setFormData((prevData) => ({
        ...prevData,
        tipoServicio: solicitudData.tipoServicio || solicitudData.solicitudBase.detalle || "",
        nivelUrgencia: solicitudData.nivelUrgencia || solicitudData.solicitudBase.urgencia || "",
        descripcion: solicitudData.descripcion || solicitudData.solicitudBase.descripcion || "",
        descripcionExtra: solicitudData.descripcionExtra || "",
    }));

}
  }, [solicitudData]);

const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const { name, files } = e.target;
  const index = parseInt(name.split("-")[1], 10); // Extraer el índice del nombre del input

  if (files && files[0]) {
    const file = files[0];
    setFormData((prevData) => {
      const newDocumentos = [...prevData.documentos]; // Copia del array actual
      newDocumentos[index] = file; // Actualizar el índice correspondiente
      return { ...prevData, documentos: newDocumentos }; // Actualizar el estado
    });
  }
};

const uploadFileToFirebase = (file: File, path: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const storageRef = ref(storage, path);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log(`Upload is ${progress}% done`);
      },
      (error) => {
        reject(error);
      },
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        resolve(downloadURL);
      }
    );
  });
};

const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
  const { name, value } = e.target;

  setFormData((prevData) => ({
    ...prevData,
    [name]: value,
  }));

  // Mostrar/ocultar campo emergente según la opción seleccionada
  if (name === "nivelUrgencia") {
    setIsEmergentFieldVisible(value === "Atención Extraordinaria");
  }
};

const [isDescripcionInvalid, setIsDescripcionInvalid] = useState(false);
const [isDescripcionExtraInvalid, setIsDescripcionExtraInvalid] = useState(false);

const validateFields = () => {
  let isValid = true;

  if (formData.descripcion.trim().length < 3) {
    setIsDescripcionInvalid(true);
    Swal.fire({
      position: "top-end",
      icon: "warning",
      title: "Por favor, especifique los detalles de la descripción.",
      showConfirmButton: false,
      timer: 2500,
      timerProgressBar: true,
      toast: true,
      background: "#2c2c3e",
      color: "#fff",
    });
    isValid = false;
  } else {
    setIsDescripcionInvalid(false);
  }

  if (formData.nivelUrgencia === "Atención Extraordinaria" && formData.descripcionExtra.trim().length < 3) {
    setIsDescripcionExtraInvalid(true);
    Swal.fire({
      position: "top-end",
      icon: "warning",
      title: "Por favor, especifique los detalles de la descripción.",
      showConfirmButton: false,
      timer: 2500,
      timerProgressBar: true,
      toast: true,
      background: "#2c2c3e",
      color: "#fff",
    });
    isValid = false;
  } else {
    setIsDescripcionExtraInvalid(false);
  }

  return isValid;
};

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!validateFields()) {
    return; // Detener si hay errores de validación
  }

  setIsLoading(true);
  console.log("Email ssss ", formData.email)
  try {
    const emailResult = await axios.get("/api/validate-email", {
      params: {
        email: formData.email,
        isLogged: isLoggedIn.toString(),
      },
    });

    const { cuenta, isLogged } = emailResult.data;

    if (isLogged && cuenta) {
      await sendCreateRequest(cuenta);
    } else if (!isLogged && cuenta) {
      Swal.fire({
        position: "top-end",
        icon: "error",
        title: "Este correo ya está en uso. Por favor, inicia sesión para continuar.",
        showConfirmButton: false,
        timer: 1500,
      });
    } else if (!cuenta) {
      await sendCreateRequest("");
    }
  } catch (error) {
    Swal.fire({
      position: "top-end",
      icon: "error",
      title: "Hubo un problema verificando el correo. Por favor, inténtalo de nuevo más tarde.",
      showConfirmButton: false,
      timer: 1500,
    });
    console.error("API Error:", error);
  } finally {
    setIsLoading(false);
  }

  setTimeout(() => {
    setIsLoading(false);
  }, 2000); // Simulación de espera
};

const sendCreateRequest = async (cuenta: string) => {
  try {
    const requestData = {
      emailSolicita: formData.email,
      tipoServicio: formData.tipoServicio,
      nivelUrgencia: formData.nivelUrgencia,
      descripcion: formData.descripcion,
      ...(formData.nivelUrgencia === "Atención Extraordinaria" && {
        descripcionExtra: formData.descripcionExtra || "",
      }),
      cuenta: cuenta,
      precio: 0,
      subtotal: 0,
      total: 0,
      accion: "Creación de solicitud",
      tipo: "tramite-general",
      item: "Tramite General",
    };

    // Crear la solicitud inicial
    const response = await axios.post("/api/create-request-tramite", requestData, {
      headers: { "Content-Type": "application/json" },
    });

    const { solicitudId } = response.data;

    // Subir archivos y actualizar URLs
    const updatedURLs = [...formData.archivoURLs];
    for (let i = 0; i < formData.documentos.length; i++) {
      const file = formData.documentos[i];
      if (file) {
        const path = `uploads/${solicitudId}/documento-${i}`;
        const downloadURL = await uploadFileToFirebase(file, path);
        updatedURLs[i] = downloadURL;
      }
    }

    // Actualizar la solicitud con las URLs de los archivos
    const updatePayload = {
      solicitudId,
      archivoURLs: updatedURLs,
    };

    const updateResponse = await axios.post("/api/update-request-all", updatePayload);

    if (updateResponse.status === 200) {
      Swal.fire({
        icon: "success",
        title: "Solicitud enviada correctamente",
        timer: 2500,
        showConfirmButton: false,
      }).then(() => {
        window.location.href = "/dashboard/requests";
      });
    }
  } catch (error) {
    Swal.fire({
      icon: "error",
      title: "Error al enviar la solicitud",
      text: "Por favor, inténtalo nuevamente.",
    });
    console.error("Error:", error);
  } finally {
    setIsLoading(false);
  }
};

const descripcionClass = `w-full p-4 bg-gray-800 text-white rounded-lg h-20 ${isDescripcionInvalid ? "border-2 border-red-500" : ""
  }`;
const descripcionExtraClass = `w-full p-4 bg-gray-800 text-white rounded-lg h-20 ${isDescripcionExtraInvalid ? 'border-2 border-red-500' : ""
  }`;

return (
  <div className="w-full h-full p-8 bg-[#070707]">
    <h1 className="text-white text-3xl font-bold mb-6">Solicitud</h1>
    <form onSubmit={handleSubmit}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Tipo de Servicio */}
        <div className="flex flex-col">
          <label className="text-white mb-2">Detalle el tipo de servicio que requiere</label>
          <select
            name="tipoServicio"
            value={formData.tipoServicio}
            onChange={handleChange}
            className="p-4 bg-gray-800 text-white rounded-lg"
            required
          >
            <option value="Revisión o Elaboración de Contrato">Revisión o Elaboración de Contrato</option>
            <option value="Laboral">Laboral</option>
            <option value="Consulta o Investigación Legal">Consulta o Investigación Legal</option>
            <option value="DGI">DGI</option>
            <option value="Caja de Seguro Social">Caja de Seguro Social</option>
            <option value="Municipio">Municipio</option>
            <option value="Migración">Migración</option>
            <option value="Temas Bancarios">Temas Bancarios</option>
            <option value="Varios">Varios</option>
            <option value="Otros">Otros</option>
          </select>
        </div>

        {/* Nivel de Urgencia */}
        <div className="flex flex-col">
          <label className="text-white mb-2">Nivel de urgencia</label>
          <select
            name="nivelUrgencia"
            value={formData.nivelUrgencia}
            onChange={handleChange}
            className="p-4 bg-gray-800 text-white rounded-lg"
          >
            <option value="Bajo">Bajo: No excede 15 días hábiles</option>
            <option value="Medio">Medio:  No excede 7 días hábiles</option>
            <option value="Alto">Alto:  No excede 72 horas</option>
            <option value="Atención Extraordinaria"> Atención Extraordinaria: No excede 24 horas</option>
          </select>
          <small className="text-gray-400 mt-1">
            * Por favor tomar nota de que los tiempos aquí establecidos son respecto al proceso de la firma, sin embargo, los trámites también dependerán de la institución pública en los casos que aplique, para la cual daremos seguimiento, pero no podemos garantizar tiempos de ejecución de ellas.
          </small>
        </div>

        {/* Campo emergente */}
        {(isEmergentFieldVisible || formData.nivelUrgencia === "Atención Extraordinaria") && (
          <>
            <div className="flex flex-col mt-4">

            </div>
            <div className="flex flex-col mt-4">
              <label className="text-white mb-2">Descripción de la situación</label>
              <textarea
                name="descripcionExtra"
                value={formData.descripcionExtra}
                onChange={handleChange}
                className={descripcionExtraClass}
              />
              <small className="text-gray-400 mt-1">
                * En caso de que requiera este nivel de urgencia, por favor incluya la descripción de la situación y por qué el tiempo establecido.
              </small>
            </div>
          </>
        )}

        {/* Descripción del Requerimiento */}
        <div className="col-span-2 flex flex-col">
          <label className="text-white mb-2">
            Descripción del requerimiento o situación, si son varios, puede detallarlos en puntos separados en la
            siguiente casilla. <span className="text-red-500">*</span>
          </label>
          <textarea
            name="descripcion"
            value={formData.descripcion}
            onChange={handleChange}
            className={descripcionClass}
          />
        </div>

        {/* Subir Documentos */}
        <div className="col-span-2">
          <label className="text-white mb-2">Subir documentos</label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {formData.archivoURLs.map((archivoURL, index) => (
              <div key={index} className="mb-4">
                <input
                  type="file"
                  name={`documento-${index}`}
                  onChange={handleFileChange}
                  className="w-full p-2 bg-gray-800 text-white rounded-lg"
                />
                {archivoURL && (
                  <p className="text-sm text-blue-500">
                    <a href={archivoURL} target="_blank" rel="noopener noreferrer">
                      Ver documento {index + 1}
                    </a>
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Botones */}
      <div className="flex mt-6 gap-x-4">
        <button
          type="button"
          className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600"
          onClick={() => console.log("Volver")}
        >
          Volver
        </button>
        <button
          type="submit"
          className="bg-pink-600 text-white px-6 py-3 rounded-lg hover:bg-pink-700"
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <ClipLoader size={20} color="#ffffff" />
              <span className="ml-2">Enviando...</span>
            </div>
          ) : (
            "Enviar"
          )}
        </button>
      </div>
    </form>
  </div>
);
};

export default SolicitudForm;
