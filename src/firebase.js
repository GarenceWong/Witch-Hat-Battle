import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

// Config is read from Vite env vars (VITE_* are exposed to the client at build
// time). Values live in .env locally and in GitHub Actions repo secrets for CI.
// NOTE: a Firebase *web* API key is not a secret — it ships in the client bundle
// by design. Real protection = API key restrictions + Realtime Database rules.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
