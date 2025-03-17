import React, { useState, useContext, useEffect, FormEvent } from 'react';
import Swal from 'sweetalert2';
import AppStateContext from '@context/context';
import axios from 'axios';
import ClipLoader from 'react-spinners/ClipLoader';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  firebaseApiKey,
  firebaseAuthDomain,
  firebaseProjectId,
  firebaseStorageBucket,
  firebaseMessagingSenderId,
  firebaseAppId
} from '@utils/env';
import { useFetchSolicitud } from '@utils/fetchCurrentRequest';
import get from 'lodash/get';

// Firebase configuration and initialization
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

const PensionAlimenticiaArchivosAdjuntos: React.FC = () => {
  const [formData, setFormData] = useState({
    archivosAdjuntos: {
      cedula: null,
      certificadoNacimiento: null,
      certificadoMatrimonio: null,
      sentencia: null,
      cedulaMenor: null,
      cedulaMayor: null,
      additionalDocs: [],
    },
  });

  const [cedulaFile, setCedulaFile] = useState<File | null>(null);
  const [nacimientoFile, setNacimientoFile] = useState<File | null>(null);
  const [matrimonioFile, setMatrimonioFile] = useState<File | null>(null);
  const [sentenciaFile, setSentenciaFile] = useState<File | null>(null);
  const [cedulaMenorFile, setCedulaMenorFile] = useState<File | null>(null);
  const [cedulaMayorFile, setCedulaMayorFile] = useState<File | null>(null);
  const [additionalDocs, setAdditionalDocs] = useState<(File | null)[]>([]);
  const [showAdditionalDocs, setShowAdditionalDocs] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const context = useContext(AppStateContext);
  if (!context) throw new Error('AppStateContext must be used within an AppStateProvider');

  const { store, setStore } = context;
  const { fetchSolicitud } = useFetchSolicitud(store.solicitudId);

  useEffect(() => {
    if (store.solicitudId) fetchSolicitud();
  }, [store.solicitudId]);

  useEffect(() => {
    if (store.request) {
      const archivosAdjuntos = get(store.request, 'archivosAdjuntos', {});

      setFormData((prevFormData) => ({
        ...prevFormData,
        archivosAdjuntos: {
          ...prevFormData.archivosAdjuntos,
          ...archivosAdjuntos,
          additionalDocs: archivosAdjuntos.additionalDocs && archivosAdjuntos.additionalDocs.length > 0
            ? archivosAdjuntos.additionalDocs
            : [],
        },
      }));
    }
  }, [store.request]);
  console.log("SOLI ", store.request)
  // Helper function to upload file to Firebase and get URL
  const uploadFileToFirebase = (file: File, path: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const storageRef = ref(storage, path);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        'state_changed',
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

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setFile?: React.Dispatch<React.SetStateAction<File | null>>,
    index?: number
  ) => {
    const file = e.target.files?.[0] || null;

    if (setFile) {
      // Manejo para archivos principales
      setFile(file);
    } else if (index !== undefined) {
      // Manejo para archivos adicionales
      setAdditionalDocs((prevDocs) => {
        const newDocs = [...prevDocs];
        newDocs[index] = file;
        return newDocs;
      });
    }
  };

  const handleAddDocument = () => {
    setAdditionalDocs((prevDocs) => [...prevDocs, null]);
  };

  const handleRemoveDocument = (index: number) => {
    setAdditionalDocs((prevDocs) => prevDocs.filter((_, i) => i !== index));

    setFormData((prevFormData) => ({
      ...prevFormData,
      archivosAdjuntos: {
        ...prevFormData.archivosAdjuntos,
        additionalDocs: prevFormData.archivosAdjuntos.additionalDocs.filter((_, i) => i !== index),
      },
    }));
  };

  const toggleAdditionalDocs = () => {
    setShowAdditionalDocs(!showAdditionalDocs);
  };

  const [errors, setErrors] = useState({
    cedula: false,

  });

  const validateFields = () => {
    let isValid = true;
    const newErrors = { ...errors };

    if (!formData.archivosAdjuntos.cedula) {
      newErrors.cedula = true;
      isValid = false;

      Swal.fire({  
        title: 'Es necesario adjuntar la copia de la cédula o pasaporte.',
        position: "top-end",
        icon: "warning",
        showConfirmButton: false,
        timer: 2500,
        timerProgressBar: true,
        toast: true,
        background: '#2c2c3e',
        color: '#fff',
        customClass: {
          popup: 'custom-swal-popup',
          title: 'custom-swal-title',
          icon: 'custom-swal-icon',
          timerProgressBar: 'custom-swal-timer-bar',
        },
      });

      // Llevar el scroll al campo de archivo y hacer focus
      document.getElementsByName('cedula')[0]?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
      document.getElementsByName('cedula')[0]?.focus();
    }

    setErrors(newErrors);
    return isValid;
  };


  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!validateFields()) {
      setIsLoading(false);
      return;
    }

    try {

      const generateFilePath = (fileName) => `uploads/${fileName}_${store.solicitudId}`;

      const cedulaURL = cedulaFile ? await uploadFileToFirebase(cedulaFile, generateFilePath('cedula')) : formData.archivosAdjuntos.cedula;
      const nacimientoURL = nacimientoFile ? await uploadFileToFirebase(nacimientoFile, generateFilePath('certificadoNacimiento')) : formData.archivosAdjuntos.certificadoNacimiento;
      const matrimonioURL = matrimonioFile ? await uploadFileToFirebase(matrimonioFile, generateFilePath('certificadoMatrimonio')) : formData.archivosAdjuntos.certificadoMatrimonio;

      const cedulaMenorURL = cedulaMenorFile ? await uploadFileToFirebase(cedulaMenorFile, 'uploads/cedulaMenor') : formData.archivosAdjuntos.cedulaMenor;
      const cedulaMayorURL = cedulaMayorFile ? await uploadFileToFirebase(cedulaMayorFile, 'uploads/cedulaMayor') : formData.archivosAdjuntos.cedulaMayor;
      const sentenciaURL = sentenciaFile ? await uploadFileToFirebase(sentenciaFile, 'uploads/sentencia') : formData.archivosAdjuntos.sentencia;
      const additionalDocsURLs = await Promise.all(
        additionalDocs
          .map((file, index) => (file ? uploadFileToFirebase(file, `uploads/additionalDocs_${index}`) : null))
      );

      const updatePayload = {
        solicitudId: store.solicitudId,
        archivosAdjuntos: {
          cedula: cedulaURL,
          certificadoNacimiento: nacimientoURL,
          certificadoMatrimonio: matrimonioURL,
          cedulaMenor: cedulaMenorURL,
          cedulaMayor: cedulaMayorURL,
          sentencia: sentenciaURL,
          additionalDocs: additionalDocsURLs.length ? additionalDocsURLs : formData.archivosAdjuntos.additionalDocs,
        },
      };

      const response = await axios.patch('/api/update-request', updatePayload);

      if (response.status === 200) {
        setStore((prevState) => ({
          ...prevState,
          firmaYEntrega: true,
          currentPosition: 7,
        }));

        Swal.fire({
          position: "top-end",
          icon: "success",
          title: "Archivos adjuntados actualizados correctamente.",
          showConfirmButton: false,
          timer: 2500,
          timerProgressBar: true,
          toast: true,
          background: '#2c2c3e',
          color: '#fff',
          customClass: {
            popup: 'custom-swal-popup',
            title: 'custom-swal-title',
            icon: 'custom-swal-icon',
            timerProgressBar: 'custom-swal-timer-bar',
          },
        });
      } else {
        throw new Error('Error al actualizar la solicitud.');
      }
    } catch (error) {
      console.error('Error uploading files:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Hubo un problema al adjuntar los archivos. Por favor, inténtelo de nuevo más tarde.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const [showModal, setShowModal] = useState(false); // Estado para manejar el modal

  const toggleModal = () => {
    setShowModal(!showModal); // Alterna el estado del modal
  };

  return (
    <div className="w-full h-full p-8 overflow-y-scroll scrollbar-thin bg-[#070707] text-white">
      <h1 className="text-white text-4xl font-bold flex items-center">
        Información sobre los Archivos Adjuntos
        <button
          className="ml-2 flex items-center justify-center w-10 h-10 bg-white text-black rounded-md border border-gray-300"
          type="button"
          onClick={toggleModal}
        >
          <span className="flex items-center justify-center w-7 h-7 bg-black text-white rounded-full">
            <i className="fa-solid fa-info text-sm"></i>
          </span>
        </button>
      </h1>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-gray-800 rounded-lg w-11/12 md:w-3/4 lg:w-1/2">
            <div className="p-4 border-b border-gray-600 flex justify-between items-center">
              <h2 className="text-white text-xl">Información sobre los Archivos Adjuntos</h2>
              <button
                className="text-white"
                onClick={toggleModal} // Cierra el modal
              >
                <i className="fa-solid fa-times"></i>
              </button>
            </div>
            <div className="p-4 text-white">
              <h5 className="text-lg">Información</h5>
              <p className="mt-2 texto_justificado">
                Descubre en este Clip cada detalle que te ayudará a entender el tipo de información que debes anexar en esta sección.
                <br />
                <br />
                ¡No dudes en explorar nuestros videos!
              </p>
              <h5 className="text-lg mt-4">Video</h5>
              <iframe
                width="100%"
                height="315"
                src="https://www.youtube.com/embed/KdG8CoCPMfk"
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              ></iframe>
            </div>
            <div className="p-4 border-t border-gray-600 text-right">
              <button
                className="bg-red-600 text-white px-4 py-2 rounded-md"
                onClick={toggleModal} // Cierra el modal
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      <p className="mb-4">
        En esta sección debes adjuntar la siguiente información necesaria para tramitar tu solicitud.
      </p>

      <form className="space-y-6" onSubmit={handleSubmit}>
        <div>
          <label className="block mb-2 text-sm">Copia de cédula de quien solicita la Pensión Alimenticia.</label>
          {formData.archivosAdjuntos.cedula && (
            <p className="text-sm text-blue-500">
              <a href={formData.archivosAdjuntos.cedula} target="_blank" rel="noopener noreferrer">
                Ver documento actual
              </a>
            </p>
          )}
          <input
            type="file"
            name='cedula'
            onChange={(e) => handleFileChange(e, setCedulaFile)}
            className={`w-full p-2 border ${errors.cedula ? 'border-red-500' : 'border-gray-700'} rounded bg-gray-800 text-white`}
            disabled={store.request.status >= 10 && store.rol < 20}
          />
        </div>

        {(store.request.pensionType === "Primera vez" && store.request.pensionCategory === "Hijos menores de edad") && (
          <>
            <div>
              <label className="block mb-2 text-sm">Certificado de Nacimiento del pensionado.</label>
              {formData.archivosAdjuntos.certificadoNacimiento && (
                <p className="text-sm text-blue-500">
                  <a href={formData.archivosAdjuntos.certificadoNacimiento} target="_blank" rel="noopener noreferrer">
                    Ver documento actual
                  </a>
                </p>
              )}
              <input
                type="file"
                onChange={(e) => handleFileChange(e, setNacimientoFile)}
                className="w-full p-2 bg-gray-800 text-white rounded-lg"
                disabled={store.request.status >= 10 && store.rol < 20}
              />
            </div>

            <div>
              <label className="block mb-2 text-sm">Cédula del menor.</label>
              {formData.archivosAdjuntos.cedulaMenor && (
                <p className="text-sm text-blue-500">
                  <a href={formData.archivosAdjuntos.cedulaMenor} target="_blank" rel="noopener noreferrer">
                    Ver documento actual
                  </a>
                </p>
              )}
              <input
                type="file"
                onChange={(e) => handleFileChange(e, setCedulaMenorFile)}
                className="w-full p-2 bg-gray-800 text-white rounded-lg"
                disabled={store.request.status >= 10 && store.rol < 20}
              />
            </div>
          </>
        )}

        {(store.request.pensionType === "Primera vez" && (store.request.pensionCategory === "Mujer embarazada (ayuda prenatal)"
          || store.request.pensionCategory === "En condición de Cónyuge"
        )) && (
            <div>
              <label className="block mb-2 text-sm">Certificado de Matrimonio.</label>
              {formData.archivosAdjuntos.certificadoMatrimonio && (
                <p className="text-sm text-blue-500">
                  <a href={formData.archivosAdjuntos.certificadoMatrimonio} target="_blank" rel="noopener noreferrer">
                    Ver documento actual
                  </a>
                </p>
              )}
              <input
                type="file"
                onChange={(e) => handleFileChange(e, setMatrimonioFile)}
                className="w-full p-2 bg-gray-800 text-white rounded-lg"
                disabled={store.request.status >= 10 && store.rol < 20}
              />
            </div>
          )}

        {(store.request.pensionType !== "Primera vez" && store.request.knowsCaseLocation !== "No") && (
          <div>
            <label className="block mb-2 text-sm">Copia de la Sentencia o Mediación en caso que la hubiere.</label>
            {formData.archivosAdjuntos.sentencia && (
              <p className="text-sm text-blue-500">
                <a href={formData.archivosAdjuntos.sentencia} target="_blank" rel="noopener noreferrer">
                  Ver documento actual
                </a>
              </p>
            )}
            <input
              type="file"
              onChange={(e) => handleFileChange(e, setSentenciaFile)}
              className="w-full p-2 bg-gray-800 text-white rounded-lg"
              disabled={store.request.status >= 10 && store.rol < 20}
            />
          </div>
        )}

        {(store.request.pensionType === "Primera vez" && store.request.pensionCategory === "Mayores de edad hasta 25 años con estudios en curso") && (
          <div>
            <label className="block mb-2 text-sm">Cédula del mayor.</label>
            {formData.archivosAdjuntos.cedulaMayor && (
              <p className="text-sm text-blue-500">
                <a href={formData.archivosAdjuntos.cedulaMayor} target="_blank" rel="noopener noreferrer">
                  Ver documento actual
                </a>
              </p>
            )}
            <input
              type="file"
              onChange={(e) => handleFileChange(e, setCedulaMayorFile)}
              className="w-full p-2 bg-gray-800 text-white rounded-lg"
              disabled={store.request.status >= 10 && store.rol < 20}
            />
          </div>
        )}

        {/* Additional Documents Section */}
        {[...formData.archivosAdjuntos.additionalDocs, ...additionalDocs].map((doc, index) => (
          <div key={index} className="mt-4">
            <label className="block mb-2 text-sm">Adjunto Adicional #{index + 1}:</label>

            {/* Verificar si doc es un string antes de mostrar el enlace */}
            {doc && typeof doc === "string" && (
              <p className="text-sm text-blue-500">
                <a href={doc} target="_blank" rel="noopener noreferrer">
                  Ver documento actual
                </a>
              </p>
            )}

            {/* Input para subir un nuevo archivo */}
            <input
              type="file"
              onChange={(e) => handleFileChange(e, undefined, index)}
              className="w-full p-2 bg-gray-800 text-white rounded-lg"
            />

            {/* Botón para eliminar el adjunto */}
            <button
              type="button"
              onClick={() => handleRemoveDocument(index)}
              className="bg-red-600 hover:bg-red-700 text-white mt-2 font-semibold py-2 px-4 rounded"
            >
              Eliminar
            </button>
          </div>
        ))}

        <div className="mt-6">
          {/* Botón "Agregar Adjunto Adicional" en una línea */}
          <div className="flex justify-start">
            <button
              type="button"
              onClick={handleAddDocument}
              className="bg-profile hover:bg-profile text-white font-semibold py-2 px-4 rounded"
            >
              Agregar Adjunto Adicional
            </button>
          </div>

          {/* Botón "Guardar y Continuar" en una nueva línea */}
          <div className="mt-4">
            {(!store.request.status || store.request.status < 10 || (store.request.status >= 10 && store.rol > 20)) && (
              <button
                type="submit"
                className="w-full md:w-auto bg-profile hover:bg-profile text-white font-semibold py-2 px-4 rounded"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <ClipLoader size={24} color="#ffffff" />
                    <span className="ml-2">Cargando...</span>
                  </div>
                ) : (
                  'Guardar y continuar'
                )}
              </button>
            )}
          </div>

          {/* Botón "Continuar" si aplica */}
          {store.request.status >= 10 && (
            <div className="mt-6">
              <button
                className="bg-profile text-white w-full py-3 rounded-lg"
                type="button"
                onClick={() => {
                  setStore((prevState) => ({
                    ...prevState,
                    currentPosition: 7,
                  }));
                }}
              >
                Continuar
              </button>
            </div>
          )}
        </div>

      </form>
    </div>
  );
};

export default PensionAlimenticiaArchivosAdjuntos;
