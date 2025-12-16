// ✅ D:\AlMustafaApp\frontend\src\firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// ⚙️ Firebase configuration (Production Ready)
const firebaseConfig = {
  apiKey: "AIzaSyBei72WtjR9wkeZzbA5umv9tmIog2YBJ1g",
  authDomain: "al-mustafa-quran-academy.firebaseapp.com",
  projectId: "al-mustafa-quran-academy",
  storageBucket: "al-mustafa-quran-academy.appspot.com", // ✅ ".app" غلط تھا، درست کیا گیا
  messagingSenderId: "134882906429",
  appId: "1:134882906429:web:1f0653f7cba402fe0b3554",
};

// 🚀 Initialize Firebase app
const app = initializeApp(firebaseConfig);

// 🔐 Auth + Google Provider
export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();
provider.setCustomParameters({ prompt: "select_account" });

// 🗄️ Firestore Database
export const db = getFirestore(app);

// ☁️ Storage (images, videos, etc.)
export const storage = getStorage(app);

// ✅ Default export
export default app;
