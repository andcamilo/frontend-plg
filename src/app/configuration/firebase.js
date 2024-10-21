import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
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
  appId: firebaseAppId
};

// Check if Firebase apps are already initialized to prevent duplicate app initialization
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);

export { auth, signInWithEmailAndPassword };
