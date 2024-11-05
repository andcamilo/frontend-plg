import React, { useState, useContext, useRef, useEffect, FormEvent } from 'react';
import ClipLoader from 'react-spinners/ClipLoader';
import AppStateContext from '@context/fundacionContext';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useFetchSolicitud } from '@utils/fetchCurrentRequest';
import get from 'lodash/get';
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

  return (
    <div className="w-full h-full p-8 overflow-y-scroll scrollbar-thin bg-[#070707]">
      <h1 className="text-white text-4xl font-bold">Solicitud Adicional</h1>
      <p className="text-gray-300 mt-4">
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

        <button
          className="bg-gray-600 text-white w-full py-3 rounded-lg mt-6 hover:bg-pink-500"
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
      </form>
    </div>
  );
};

export default SolicitudAdicional;