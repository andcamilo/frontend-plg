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

// Initialize Firebase
const firebaseConfig = {
  apiKey: firebaseApiKey,
  authDomain: firebaseAuthDomain,
  projectId: firebaseProjectId,
  storageBucket: firebaseStorageBucket,
  messagingSenderId: firebaseMessagingSenderId,
  appId: firebaseAppId,
};

// Initialize Firebase app if it hasn't been initialized yet
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const storage = getStorage(app);

const DisbursementPaidDisbursementDetails: React.FC = () => {
  const context = useContext(DesembolsoContext);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
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
        try {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          setState(prevState => ({
            ...prevState,
            detalleDesembolsoPagado: {
              ...prevState.detalleDesembolsoPagado,
              attachedFile: downloadURL,
            }
          }));
        } catch (error) {
          console.error("Error getting download URL:", error);
        } finally {
          setUploading(false);
        }
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
              onChange={handleFileChange}
              className="w-full p-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:border-blue-500"
              disabled={uploading}
            />
            {uploading && (
              <div className="flex items-center mt-2">
                <ClipLoader size={20} color="#ffffff" />
                <span className="ml-2 text-sm text-gray-400">Subiendo archivo...</span>
              </div>
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