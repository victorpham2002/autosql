import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth" 
import { getFirestore } from "firebase/firestore"
import { getApps, getApp } from "firebase/app";
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};
// const firebaseConfig = {
//   apiKey: "AIzaSyAV4yz0ZTcDux5YwsY8QZa2cMNIiBcZXnk",
//   authDomain: "nextjs-autosql.firebaseapp.com",
//   projectId: "nextjs-autosql",
//   storageBucket: "nextjs-autosql.appspot.com",
//   messagingSenderId: "564230126798",
//   appId: "1:564230126798:web:5e0c1ea95358041e76e49f"
// };

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app)