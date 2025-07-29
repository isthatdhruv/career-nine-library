// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBjQyJkX9K0IATW7hnIJ-CXiWhMUsQWOLM",
  authDomain: "career-library.firebaseapp.com",
  projectId: "career-library",
  storageBucket: "career-library.firebasestorage.app",
  messagingSenderId: "461868870638",
  appId: "1:461868870638:web:64a6d561f1a264db22bcff"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const db = getFirestore(app);

const db = getFirestore(app);
// if (process.env.NODE_ENV === "development") {
//   connectFirestoreEmulator(db, "127.0.0.1", 8080);
// }

export { app, db };