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
import { getFirestore } from 'firebase/firestore';

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
export const db = getFirestore(app);
export { app };

export const uploadFile = async (file: File): Promise<string> => {
  try {
    const storageRef = ref(storage, `uploads/${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    return new Promise((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log(`Upload is ${progress}% done`);
        },
        (error) => {
          console.error("File upload error:", error);
          reject(error);
        },
        async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            resolve(downloadURL);
          } catch (urlError) {
            console.error("Error fetching download URL:", urlError);
            reject(urlError);
          }
        }
      );
    });
  } catch (initError) {
    console.error("Firebase initialization error:", initError);
    throw new Error("Failed to initialize Firebase");
  }
};
