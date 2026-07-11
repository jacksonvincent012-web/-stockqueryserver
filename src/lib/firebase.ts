import { initializeApp, getApps } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  sendEmailVerification,
  signInWithPhoneNumber,
  RecaptchaVerifier,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs, serverTimestamp } from 'firebase/firestore';

const firebaseConfig = {
  projectId: "subtle-handbook-z5jvd",
  appId: "1:559904619758:web:c011fd96e08364eee5c7ff",
  apiKey: "AIzaSyBmJhm4xh61cCqJN9DxoiCsgv93MIlV4No",
  authDomain: "subtle-handbook-z5jvd.firebaseapp.com",
  firestoreDatabaseId: "ai-studio-stockexchange-23e71bbf-2283-4dbb-a0f9-907fd4eff3fc",
  storageBucket: "subtle-handbook-z5jvd.firebasestorage.app",
  messagingSenderId: "559904619758",
  measurementId: ""
};

// Initialize Firebase safely
const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
const googleProvider = new GoogleAuthProvider();

googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export {
  app,
  auth,
  db,
  googleProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  sendEmailVerification,
  signInWithPhoneNumber,
  RecaptchaVerifier,
  signOut,
  onAuthStateChanged,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  serverTimestamp
};
export type { FirebaseUser };
