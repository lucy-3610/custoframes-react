// Add Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-storage.js";

const firebaseConfig = {
    apiKey: "AIzaSyBweVKxbsMtFT8-W70bGTuOE5iuubxWQJ0",
    authDomain: "custoframes.firebaseapp.com",
    projectId: "custoframes",
    storageBucket: "custoframes.firebasestorage.app",
    messagingSenderId: "423904022122",
    appId: "1:423904022122:web:f0f852ed04e92144260413",
    measurementId: "G-0XCCB0KEL2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, db, storage };
