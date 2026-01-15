import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyApnU_2Xp_y5yesKTDPbWht4PcsKURwNbQ",
  authDomain: "bioacoustic-ai-decoder.firebaseapp.com",
  projectId: "bioacoustic-ai-decoder",
  storageBucket: "bioacoustic-ai-decoder.firebasestorage.app",
  messagingSenderId: "433076810036",
  appId: "1:433076810036:web:139d0d989cf0c1466ff561",
  measurementId: "G-MXJ415H796"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, analytics, db, storage };
