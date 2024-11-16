import React, { useContext, useEffect, useState } from 'react';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { initializeApp, getApps, getApp } from 'firebase/app';
import DesembolsoContext from '@context/desembolsoContext';
import ClipLoader from 'react-spinners/ClipLoader';
import { 
  firebaseApiKey, 
  firebaseAuthDomain, 
  firebaseProjectId, 
  firebaseStorageBucket, 
  firebaseMessagingSenderId, 
  firebaseAppId 
} from '@utils/env';

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

const DisbursementPaidDisbursementDetails: React.FC = () => {
  const context = useContext(DesembolsoContext);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    console.log("Current Paid Disbursement Details:", state);
  }, [context?.state]);


  if (!context) {
    return <div>Context is not available.</div>;
  }

  const { state, setState } = context;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setState(prevState => ({
      ...prevState,
      detalleDesembolsoPagado: {
        ...prevState.detalleDesembolsoPagado,
        [name]: value,
      }
    }));
  };

  const handleFileUpload = async () => {
    if (!file) return;
    setUploading(true);
    const filePath = `paid_disbursements/${file.name}_${Date.now()}`;
    const storageRef = ref(storage, filePath);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log(`Upload is ${progress}% done`);
      },
      (error) => {
        console.error("File upload error:", error);
        setUploading(false);
      },
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        setState(prevState => ({
          ...prevState,
          detalleDesembolsoPagado: {
            ...prevState.detalleDesembolsoPagado,
            attachedFile: downloadURL,
          }
        }));
        setUploading(false);
      }
    );
  };

  return (
    <div className="p-1">
      <div className="p-1 rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold text-white mb-6">Detalles del desembolso pagado</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="mb-4">
            <label htmlFor="paymentDate" className="block text-gray-300 mb-2">
              Fecha de pago
            </label>
            <input
              type="date"
              id="paymentDate"
              name="paymentDate"
              value={state.detalleDesembolsoPagado.paymentDate}
              onChange={handleChange}
              className="w-full p-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="transactionNumber" className="block text-gray-300 mb-2">
              Número de transacción
            </label>
            <input
              type="text"
              id="transactionNumber"
              name="transactionNumber"
              value={state.detalleDesembolsoPagado.transactionNumber}
              onChange={handleChange}
              className="w-full p-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="attachedFile" className="block text-gray-300 mb-2">
              Adjuntar recibo
            </label>
            <input
              type="file"
              id="attachedFile"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="w-full p-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
            />
            {uploading ? (
              <div className="flex items-center mt-2">
                <ClipLoader size={20} color="#ffffff" />
                <span className="ml-2 text-sm text-gray-400">Subiendo archivo...</span>
              </div>
            ) : (
              <button
                onClick={handleFileUpload}
                className="mt-2 bg-profile text-white py-1 px-3 rounded-lg hover:bg-purple-800 transition-colors duration-300"
                disabled={!file}
              >
                Subir archivo
              </button>
            )}
            {state.detalleDesembolsoPagado.attachedFile && (
              <p className="mt-2 text-sm text-blue-500">
                <a
                  href={state.detalleDesembolsoPagado.attachedFile}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Ver archivo adjunto
                </a>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DisbursementPaidDisbursementDetails;
