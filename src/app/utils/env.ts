// Firebase environment variables
const firebaseApiKey: string | undefined = process.env.NEXT_PUBLIC_FIREBASE_APP_API_KEY;
const firebaseAuthDomain: string | undefined = process.env.NEXT_PUBLIC_FIREBASE_APP_AUTH_DOMAIN;
const firebaseProjectId: string | undefined = process.env.NEXT_PUBLIC_FIREBASE_APP_PROJECT_ID;
const firebaseStorageBucket: string | undefined = process.env.NEXT_PUBLIC_FIREBASE_APP_STORAGE_BUCKET;
const firebaseMessagingSenderId: string | undefined = process.env.NEXT_PUBLIC_FIREBASE_APP_MESSAGING_SENDER_ID;
const firebaseAppId: string | undefined = process.env.NEXT_PUBLIC_FIREBASE_APP_APP_ID;

// Backend environment variable
const backendBaseUrl: string | undefined = process.env.NEXT_PUBLIC_BACKEND_BASE_URL;
const backendEnv: string | undefined = process.env.NEXT_PUBLIC_BACKEND_ENV;

export {
    firebaseApiKey,
    firebaseAuthDomain,
    firebaseProjectId,
    firebaseStorageBucket,
    firebaseMessagingSenderId,
    firebaseAppId,
    backendBaseUrl,
    backendEnv
};
