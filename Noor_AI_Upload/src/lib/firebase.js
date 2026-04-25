import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCXg5TIWNag45gW_n_C0X-6mbX7uxqip8s",
  authDomain: "noor-ai-6bc00.firebaseapp.com",
  projectId: "noor-ai-6bc00",
  storageBucket: "noor-ai-6bc00.firebasestorage.app",
  messagingSenderId: "998930826206",
  appId: "1:998930826206:web:a181e48406954cd073d34f",
  measurementId: "G-5BZMRCS52B"
};

let app, auth, db, provider;

try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    provider = new GoogleAuthProvider();
} catch (error) {
    console.error("Firebase is not configured correctly yet:", error);
}

export { auth, db, provider };
