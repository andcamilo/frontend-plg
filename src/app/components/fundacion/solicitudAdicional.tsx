import React, { useState, useContext, useRef, useEffect, FormEvent } from 'react';
import ClipLoader from 'react-spinners/ClipLoader';
import AppStateContext from '@context/fundacionContext';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useFetchSolicitud } from '@utils/fetchCurrentRequest';
import get from 'lodash/get';
import '@fortawesome/fontawesome-free/css/all.css';
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

const SolicitudAdicional: React.FC = () => {
  const context = useContext(AppStateContext);

  if (!context) {
    throw new Error('AppStateContext debe ser utilizado dentro de un AppStateProvider');
  }

  const { store, setStore } = context;

  const [formData, setFormData] = useState({
    solicitudAdicional: '',
    archivoURL: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [inputError, setInputError] = useState(false);
  const [archivoFile, setArchivoFile] = useState<File | null>(null);

  const solicitudAdicionalRef = useRef<HTMLTextAreaElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));

    if (value.length >= 3) {
      setInputError(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setArchivoFile(file);
  };

  const { fetchSolicitud } = useFetchSolicitud(store.solicitudId);
  useEffect(() => {
    if (store.solicitudId) {
      fetchSolicitud();
    }
  }, [store.solicitudId]);

  useEffect(() => {
    if (store.request) {
      const solicitudAdicional = get(store.request, 'solicitudAdicional.solicitudAdicional', '');
      const archivoURL = get(store.request, 'solicitudAdicional.archivoURL', '');

      setFormData((prevFormData) => ({
        ...prevFormData,
        solicitudAdicional,
        archivoURL,
      }));
    }
  }, [store.request]);

  const validateField = () => {
    if (formData.solicitudAdicional.trim().length < 3) {
      setInputError(true);
      Swal.fire({
        position: "top-end",
        icon: "warning",
        title: "Por favor, especifique su solicitud",
        showConfirmButton: false,
        timer: 2500,
        timerProgressBar: true,
        toast: true,
        background: '#2c2c3e',
        color: '#fff',
      });

      if (solicitudAdicionalRef.current) {
        solicitudAdicionalRef.current.focus();
      }

      return false;
    }

    return true;
  };

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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!validateField()) {
      setIsLoading(false);
      return;
    }

    try {
      let archivoURL = formData.archivoURL;

      if (archivoFile) {
        archivoURL = await uploadFileToFirebase(archivoFile, `uploads/${store.solicitudId}/adjuntoDocumentoAdicional`);
      }

      const updatePayload = {
        solicitudId: store.solicitudId,
        solicitudAdicional: {
          solicitudAdicional: formData.solicitudAdicional,
          archivoURL: archivoURL || '',
        },
      };

      const response = await axios.post('/api/update-request-fundacion', updatePayload);

      if (response.status === 200) {
        setStore((prevState) => ({
          ...prevState,
          resumen: true,
          currentPosition: 16,
        }));

        Swal.fire({
          icon: 'success',
          title: 'Solicitud Actualizada',
          text: 'Los datos han sido guardados correctamente.',
        });
      } else {
        throw new Error('Error al actualizar la solicitud.');
      }
    } catch (error) {
      console.error('Error al enviar la solicitud adicional:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Hubo un problema al enviar la solicitud. Por favor, inténtelo de nuevo más tarde.',
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
    <div className="w-full h-full p-8 overflow-y-scroll scrollbar-thin bg-[#070707]">
      <h1 className="text-white text-4xl font-bold flex items-center">
        Solicitud Adicional
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

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-gray-800 rounded-lg w-11/12 md:w-3/4 lg:w-1/2">
            <div className="p-4 border-b border-gray-600 flex justify-between items-center">
              <h2 className="text-white text-xl">Solicitud Adicional</h2>
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
                src="https://www.youtube.com/embed/LJTrpGteD3k"
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
      <p className="text-gray-300 mt-4 texto_justificado">
        Si requiere algún otro proceso no incluido en esta solicitud, por favor detallar y nuestro equipo se contactará contigo en no más de 48 horas laborales.
      </p>
      <hr />
      <form className="mt-4" onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="text-white block mb-2">Solicitud adicional:</label>
          <textarea
            ref={solicitudAdicionalRef}
            name="solicitudAdicional"
            value={formData.solicitudAdicional}
            onChange={handleInputChange}
            className={`w-full p-4 bg-gray-800 text-white rounded-lg ${inputError ? 'border-2 border-red-500' : ''}`}
            placeholder="Describe tu solicitud adicional"
            disabled={(store.request?.solicitudAdicional?.solicitudAdicional &&
              store.request?.solicitudAdicional?.solicitudAdicional !== "") && store.rol < 20}
          />
        </div>

        <div className="mb-4">
          <label className="text-white block mb-2">Adjuntar algún documento adicional que desee. *</label>
          <input
            type="file"
            name="adjuntoDocumentoAdicional"
            onChange={handleFileChange}
            className="w-full p-2 bg-gray-800 text-white rounded-lg"
          />
          {formData.archivoURL && (
            <p className="text-sm text-blue-500">
              <a href={formData.archivoURL} target="_blank" rel="noopener noreferrer">
                Ver documento actual
              </a>
            </p>
          )}
        </div>

        <div className="flex space-x-2 mt-4">

          {(store.request.status < 10 || (store.request.status >= 10 && store.rol > 20)) && (
            <>
              <button
                className="bg-gray-600 text-white w-full py-3 rounded-lg mt-6 hover:bg-profile"
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <ClipLoader size={24} color="#ffffff" />
                    <span className="ml-2">Cargando...</span>
                  </div>
                ) : (
                  'Guardar y Continuar'
                )}
              </button>
            </>
          )}

          <button
            className="bg-profile text-white w-full py-3 rounded-lg mt-6"
            type="button"
            onClick={() => {
              setStore((prevState) => ({
                ...prevState,
                currentPosition: 16,
              }));
            }}
          >
            Continuar
          </button>
        </div>
      </form>
    </div>
  );
};

export default SolicitudAdicional;