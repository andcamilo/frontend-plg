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
      facturaSupermercado: null,
      facturaAgua: null,
      facturaVestuario: null,
      facturaLuz: null,
      facturaTelefono: null,
      facturaMatricula: null,
      facturaUtiles: null,
      facturaMatriculaUniversitaria: null,
      facturaCreditosAcademicos: null,
      sentencia: null,
      additionalDocs: [],
    },
  });

  const [cedulaFile, setCedulaFile] = useState<File | null>(null);
  const [nacimientoFile, setNacimientoFile] = useState<File | null>(null);
  const [matrimonioFile, setMatrimonioFile] = useState<File | null>(null);
  const [facturaSupermercadoFile, setFacturaSupermercadoFile] = useState<File | null>(null);
  const [facturaAguaFile, setFacturaAguaFile] = useState<File | null>(null);
  const [facturaVestuarioFile, setFacturaVestuarioFile] = useState<File | null>(null);
  const [facturaLuzFile, setFacturaLuzFile] = useState<File | null>(null);
  const [facturaTelefonoFile, setFacturaTelefonoFile] = useState<File | null>(null);
  const [facturaMatriculaFile, setFacturaMatriculaFile] = useState<File | null>(null);
  const [facturaUtilesFile, setFacturaUtilesFile] = useState<File | null>(null);
  const [facturaMatriculaUniversitariaFile, setFacturaMatriculaUniversitariaFile] = useState<File | null>(null);
  const [facturaCreditosAcademicosFile, setFacturaCreditosAcademicosFile] = useState<File | null>(null);
  const [sentenciaFile, setSentenciaFile] = useState<File | null>(null);
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
        },
      }));
    }
  }, [store.request]);

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
    setFile: React.Dispatch<React.SetStateAction<File | null>>
  ) => {
    const file = e.target.files?.[0] || null;
    setFile(file);
  };

  const handleAddDocument = () => {
    setAdditionalDocs([...additionalDocs, new File([], "")]);
  };

  const handleRemoveDocument = (index: number) => {
    setAdditionalDocs(additionalDocs.filter((_, i) => i !== index));
  };

  const toggleAdditionalDocs = () => {
    setShowAdditionalDocs(!showAdditionalDocs);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {

      const generateFilePath = (fileName) => `uploads/${fileName}_${store.solicitudId}`;

      const cedulaURL = cedulaFile ? await uploadFileToFirebase(cedulaFile, generateFilePath('cedula')) : formData.archivosAdjuntos.cedula;
      const nacimientoURL = nacimientoFile ? await uploadFileToFirebase(nacimientoFile, generateFilePath('certificadoNacimiento')) : formData.archivosAdjuntos.certificadoNacimiento;
      const matrimonioURL = matrimonioFile ? await uploadFileToFirebase(matrimonioFile, generateFilePath('certificadoMatrimonio')) : formData.archivosAdjuntos.certificadoMatrimonio;
      const facturaSupermercadoURL = facturaSupermercadoFile ? await uploadFileToFirebase(facturaSupermercadoFile, generateFilePath('facturaSupermercado')) : formData.archivosAdjuntos.facturaSupermercado;
      const facturaAguaFileURL = facturaAguaFile ? await uploadFileToFirebase(facturaAguaFile, generateFilePath('facturaAgua')) : formData.archivosAdjuntos.facturaAgua;
      const facturaVestuarioURL = facturaVestuarioFile ? await uploadFileToFirebase(facturaVestuarioFile, generateFilePath('facturaVestuario')) : formData.archivosAdjuntos.facturaVestuario;
      const facturaLuzURL = facturaLuzFile ? await uploadFileToFirebase(facturaLuzFile, generateFilePath('facturaLuz')) : formData.archivosAdjuntos.facturaLuz;
      const facturaTelefonoURL = facturaTelefonoFile ? await uploadFileToFirebase(facturaTelefonoFile, generateFilePath('facturaTelefono')) : formData.archivosAdjuntos.facturaTelefono;
      const facturaMatriculaURL = facturaMatriculaFile ? await uploadFileToFirebase(facturaMatriculaFile, generateFilePath('facturaMatricula')) : formData.archivosAdjuntos.facturaMatricula;
      const facturaUtilesURL = facturaUtilesFile ? await uploadFileToFirebase(facturaUtilesFile, generateFilePath('facturaUtiles')) : formData.archivosAdjuntos.facturaUtiles;
      const facturaMatriculaUniversitariaURL = facturaMatriculaUniversitariaFile ? await uploadFileToFirebase(facturaMatriculaUniversitariaFile, generateFilePath('facturaMatriculaUniversitaria')) : formData.archivosAdjuntos.facturaMatriculaUniversitaria;
      const facturaCreditosAcademicosURL = facturaCreditosAcademicosFile ? await uploadFileToFirebase(facturaCreditosAcademicosFile, generateFilePath('facturaCreditosAcademicos')) : formData.archivosAdjuntos.facturaCreditosAcademicos;

      const sentenciaURL = sentenciaFile ? await uploadFileToFirebase(sentenciaFile, 'uploads/sentencia') : formData.archivosAdjuntos.sentencia;
      const additionalDocsURLs = await Promise.all(
        additionalDocs.map((file, index) => uploadFileToFirebase(file!, `uploads/additionalDocs_${index}`))
      );

      const updatePayload = {
        solicitudId: store.solicitudId,
        archivosAdjuntos: {
          cedula: cedulaURL,
          certificadoNacimiento: nacimientoURL,
          certificadoMatrimonio: matrimonioURL,
          facturaSupermercado: facturaSupermercadoURL,
          facturaAgua: facturaAguaFileURL,
          facturaVestuario: facturaVestuarioURL,
          facturaLuz: facturaLuzURL,
          facturaTelefono: facturaTelefonoURL,
          facturaMatricula: facturaMatriculaURL,
          facturaUtiles: facturaUtilesURL,
          facturaMatriculaUniversitaria: facturaMatriculaUniversitariaURL,
          facturaCreditosAcademicos: facturaCreditosAcademicosURL,
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
          icon: 'success',
          title: 'Archivos Adjuntos',
          text: 'Archivos adjuntados correctamente.',
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

  return (
    <div className="w-full h-full p-8 overflow-y-scroll scrollbar-thin bg-[#070707] text-white">
      <h2 className="text-3xl font-bold mb-4">Información sobre los Archivos Adjuntos</h2>
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
            onChange={(e) => handleFileChange(e, setCedulaFile)}
            className="w-full p-2 bg-gray-800 text-white rounded-lg"
            disabled={store.request.status >= 10 && store.rol < 20}
          />
        </div>

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

        <div>
          <label className="block mb-2 text-sm">Factura del supermercado.</label>
          {formData.archivosAdjuntos.facturaSupermercado && (
            <p className="text-sm text-blue-500">
              <a href={formData.archivosAdjuntos.facturaSupermercado} target="_blank" rel="noopener noreferrer">
                Ver documento actual
              </a>
            </p>
          )}
          <input
            type="file"
            onChange={(e) => handleFileChange(e, setFacturaSupermercadoFile)}
            className="w-full p-2 bg-gray-800 text-white rounded-lg"
            disabled={store.request.status >= 10 && store.rol < 20}
          />
        </div>

        <div>
          <label className="block mb-2 text-sm">Factura de vestuario y calzado.</label>
          {formData.archivosAdjuntos.facturaVestuario && (
            <p className="text-sm text-blue-500">
              <a href={formData.archivosAdjuntos.facturaVestuario} target="_blank" rel="noopener noreferrer">
                Ver documento actual
              </a>
            </p>
          )}
          <input
            type="file"
            onChange={(e) => handleFileChange(e, setFacturaVestuarioFile)}
            className="w-full p-2 bg-gray-800 text-white rounded-lg"
            disabled={store.request.status >= 10 && store.rol < 20}
          />
        </div>
        <div>
          <label className="block mb-2 text-sm">Factura del servicio del Agua.</label>
          {formData.archivosAdjuntos.facturaAgua && (
            <p className="text-sm text-blue-500">
              <a href={formData.archivosAdjuntos.facturaAgua} target="_blank" rel="noopener noreferrer">
                Ver documento actual
              </a>
            </p>
          )}
          <input
            type="file"
            onChange={(e) => handleFileChange(e, setFacturaAguaFile)}
            className="w-full p-2 bg-gray-800 text-white rounded-lg"
            disabled={store.request.status >= 10 && store.rol < 20}
          />
        </div>

        <div>
          <label className="block mb-2 text-sm">Factura del servicio de la luz.</label>
          {formData.archivosAdjuntos.facturaLuz && (
            <p className="text-sm text-blue-500">
              <a href={formData.archivosAdjuntos.facturaLuz} target="_blank" rel="noopener noreferrer">
                Ver documento actual
              </a>
            </p>
          )}
          <input
            type="file"
            onChange={(e) => handleFileChange(e, setFacturaAguaFile)}
            className="w-full p-2 bg-gray-800 text-white rounded-lg"
            disabled={store.request.status >= 10 && store.rol < 20}
          />
        </div>

        <div>
          <label className="block mb-2 text-sm">Factura del teléfono.</label>
          {formData.archivosAdjuntos.facturaTelefono && (
            <p className="text-sm text-blue-500">
              <a href={formData.archivosAdjuntos.facturaTelefono} target="_blank" rel="noopener noreferrer">
                Ver documento actual
              </a>
            </p>
          )}
          <input
            type="file"
            onChange={(e) => handleFileChange(e, setFacturaTelefonoFile)}
            className="w-full p-2 bg-gray-800 text-white rounded-lg"
            disabled={store.request.status >= 10 && store.rol < 20}
          />
        </div>

        <div>
          <label className="block mb-2 text-sm">Recibo de Matrícula.</label>
          {formData.archivosAdjuntos.facturaMatricula && (
            <p className="text-sm text-blue-500">
              <a href={formData.archivosAdjuntos.facturaMatricula} target="_blank" rel="noopener noreferrer">
                Ver documento actual
              </a>
            </p>
          )}
          <input
            type="file"
            onChange={(e) => handleFileChange(e, setFacturaMatriculaFile)}
            className="w-full p-2 bg-gray-800 text-white rounded-lg"
            disabled={store.request.status >= 10 && store.rol < 20}
          />
        </div>

        <div>
          <label className="block mb-2 text-sm">Factura de útiles escolares.</label>
          {formData.archivosAdjuntos.facturaUtiles && (
            <p className="text-sm text-blue-500">
              <a href={formData.archivosAdjuntos.facturaUtiles} target="_blank" rel="noopener noreferrer">
                Ver documento actual
              </a>
            </p>
          )}
          <input
            type="file"
            onChange={(e) => handleFileChange(e, setFacturaUtilesFile)}
            className="w-full p-2 bg-gray-800 text-white rounded-lg"
            disabled={store.request.status >= 10 && store.rol < 20}
          />
        </div>

        <div>
          <label className="block mb-2 text-sm">Créditos academicos.</label>
          {formData.archivosAdjuntos.facturaCreditosAcademicos && (
            <p className="text-sm text-blue-500">
              <a href={formData.archivosAdjuntos.facturaCreditosAcademicos} target="_blank" rel="noopener noreferrer">
                Ver documento actual
              </a>
            </p>
          )}
          <input
            type="file"
            onChange={(e) => handleFileChange(e, setFacturaCreditosAcademicosFile)}
            className="w-full p-2 bg-gray-800 text-white rounded-lg"
            disabled={store.request.status >= 10 && store.rol < 20}
          />
        </div>

        <div>
          <label className="block mb-2 text-sm">Factura de Matrícula universitaria.</label>
          {formData.archivosAdjuntos.facturaMatriculaUniversitaria && (
            <p className="text-sm text-blue-500">
              <a href={formData.archivosAdjuntos.facturaMatriculaUniversitaria} target="_blank" rel="noopener noreferrer">
                Ver documento actual
              </a>
            </p>
          )}
          <input
            type="file"
            onChange={(e) => handleFileChange(e, setFacturaMatriculaUniversitariaFile)}
            className="w-full p-2 bg-gray-800 text-white rounded-lg"
            disabled={store.request.status >= 10 && store.rol < 20}
          />
        </div>

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

        {/* Additional Documents Section */}
        {showAdditionalDocs && (
          <>
            {additionalDocs.map((doc, index) => (
              <div key={index} className="space-y-4 mt-4">
                <div>
                  <label className="block mb-2 text-sm">- Documento adicional:</label>
                  <input
                    type="file"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      setAdditionalDocs((prevDocs) => {
                        const newDocs = [...prevDocs];
                        newDocs[index] = file; // Update with File or null
                        return newDocs;
                      });
                    }}
                    className="w-full p-2 bg-gray-800 text-white rounded-lg"
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => handleRemoveDocument(index)}
                    className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}

          </>
        )}

        <div className="mt-6">
          {(!store.request.status || store.request.status < 10 || (store.request.status >= 10 && store.rol > 20)) && (
            <>
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
            </>
          )}

          {store.request.status >= 10 && (
            <>
              <button
                className="bg-profile text-white w-full py-3 rounded-lg mt-6"
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
            </>
          )}
        </div>
      </form>
    </div>
  );
};

export default PensionAlimenticiaArchivosAdjuntos;
