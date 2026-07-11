import { initializeApp, getApps } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
const firebaseConfig = {
  apiKey: "AIzaSyBI1bnHIr-wgQ_2AhgWgVkgwFWzk9insAM",
  authDomain: "designathon-7f2c6.firebaseapp.com",
  projectId: "designathon-7f2c6",
  storageBucket: "designathon-7f2c6.firebasestorage.app",
  messagingSenderId: "388683140630",
  appId: "1:388683140630:web:8e53a68169f7bd02632f37",
  measurementId: "G-S2ERDL7ZQ4"
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });
