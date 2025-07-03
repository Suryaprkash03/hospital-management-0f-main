// lib/firebase.ts
import { initializeApp, getApps, type FirebaseApp } from "firebase/app"
import { getAuth } from "firebase/auth"
import { getFirestore } from "firebase/firestore"

/* -------------------------------------------------------------------------- */
/*                       🔧  YOUR PROJECT CONFIGURATION                       */
/*  Any typo here (especially storageBucket) prevents Auth from loading.      */
/* -------------------------------------------------------------------------- */
const firebaseConfig = {
  apiKey: "AIzaSyB6xBlWIHhrpemK5CDCyIU2oFu4-vbvGxI",
  authDomain: "hospital-management-e9d01.firebaseapp.com",
  projectId: "hospital-management-e9d01",
  /* ✅ Correct: must end with .appspot.com */
  storageBucket: "hospital-management-e9d01.appspot.com",
  messagingSenderId: "373374030911",
  appId: "1:373374030911:web:b7cbe13cc21f0f75cd148a",
}

/* -------------------------------------------------------------------------- */
/*                Initialise Firebase once (prevents HMR warnings)            */
/* -------------------------------------------------------------------------- */
const app: FirebaseApp = getApps().length > 0 ? getApps()[0] : initializeApp(firebaseConfig)

/* -------------------------------------------------------------------------- */
/*                       Export the services you need                         */
/* -------------------------------------------------------------------------- */
export { app }
export const auth = getAuth(app)
export const db = getFirestore(app)
