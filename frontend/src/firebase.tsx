import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCzzmhEopuipZZaRQMV1aLkJAR1ujOpnlA",
  authDomain: "kdd-lab.firebaseapp.com",
  projectId: "kdd-lab",
  storageBucket: "kdd-lab.firebasestorage.app",
  messagingSenderId: "378801248373",
  appId: "1:378801248373:web:2e1e406a18598001dd003c",
  measurementId: "G-Q6TG538T80",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
