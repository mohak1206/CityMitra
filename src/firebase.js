import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getFunctions } from "firebase/functions";
import { getAnalytics } from "firebase/analytics";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDJg8xrdU5SpxJTOWnIixkcOz4gd_BBRqE",
  authDomain: "my-project-for-smartcity.firebaseapp.com",
  projectId: "my-project-for-smartcity",
  storageBucket: "my-project-for-smartcity.firebasestorage.app",
  messagingSenderId: "555905142245",
  appId: "1:555905142245:web:37c9b146aa8beda984f30c",
  measurementId: "G-HQ1BK2VXV2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export services
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
// Use the techshit database
db._settings = { ...db._settings, databaseId: 'techshit' };
export const storage = getStorage(app);
export const functions = getFunctions(app, 'us-central1');

// Initialize Analytics only in browser environment
let analytics = null;
if (typeof window !== 'undefined') {
    try {
        analytics = getAnalytics(app);
    } catch (error) {
        console.warn('Analytics initialization failed:', error);
    }
}
export { analytics };

export default app;
