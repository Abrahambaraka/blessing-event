import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getAuth, type Auth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY ?? 'AIzaSyBO9AUH1-pJdl_xEKUYxkSVR9ugnOKQUpc',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ?? 'blessing-event.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ?? 'blessing-event',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ?? 'blessing-event.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? '869956365199',
  appId: import.meta.env.VITE_FIREBASE_APP_ID ?? '1:869956365199:web:e1e11667e346b9f8d3b9fa',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID ?? 'G-4KE943EWDH',
};

const app = initializeApp(firebaseConfig);

let analytics;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}

/** Active Firestore si VITE_USE_FIRESTORE=true dans .env */
export const isFirestoreEnabled = import.meta.env.VITE_USE_FIRESTORE === 'true';

let db: Firestore | null = null;
let auth: Auth | null = null;

if (isFirestoreEnabled) {
  db = getFirestore(app);
  auth = getAuth(app);
}

export { app, analytics, db, auth };
