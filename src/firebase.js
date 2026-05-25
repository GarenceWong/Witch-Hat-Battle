import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyB77Zkhi8JA_ZmwLt87-sOI-pgeKmWOQuU",
  authDomain: "witch-hat-battle-dc45e.firebaseapp.com",
  databaseURL: "https://witch-hat-battle-dc45e-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "witch-hat-battle-dc45e",
  storageBucket: "witch-hat-battle-dc45e.firebasestorage.app",
  messagingSenderId: "225884310489",
  appId: "1:225884310489:web:0510e02db7035ee43627c8",
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
