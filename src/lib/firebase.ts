
import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
// import { getFirestore } from 'firebase/firestore'; // Example if you use Firestore
// import { getStorage } from 'firebase/storage'; // Example if you use Storage

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

let app: FirebaseApp;

// Check if all required Firebase config keys are present
const requiredKeys: (keyof typeof firebaseConfig)[] = ['apiKey', 'authDomain', 'projectId'];
const missingKeys = requiredKeys.filter(key => !firebaseConfig[key]);

if (missingKeys.length > 0) {
  console.error(`Firebase configuration is missing: ${missingKeys.join(', ')}. Please set these in your .env.local file or environment variables.`);
  // Depending on your error handling strategy, you might throw an error here
  // or allow the app to continue, knowing auth will fail.
  // For now, we let it proceed so Firebase can throw its specific error.
}

if (!getApps().length) {
  if (firebaseConfig.apiKey && firebaseConfig.authDomain && firebaseConfig.projectId) {
    try {
      app = initializeApp(firebaseConfig);
    } catch (error) {
      console.error("Error initializing Firebase app:", error);
      // Handle initialization error, perhaps by setting `app` to a state that indicates failure
      // or re-throwing for a global error boundary to catch.
      // For now, we'll let subsequent `getAuth` fail if `app` isn't initialized.
    }
  } else {
    console.error("Firebase app not initialized due to missing critical configuration (apiKey, authDomain, projectId).");
  }
} else {
  app = getApps()[0];
}

// Initialize Firebase services only if the app was successfully initialized
// @ts-ignore
const auth = app ? getAuth(app) : null;
// @ts-ignore
const googleProvider = app ? new GoogleAuthProvider() : null;
// const db = app ? getFirestore(app) : null; // Example
// const storage = app ? getStorage(app) : null; // Example

// @ts-ignore
export { app, auth, googleProvider };
