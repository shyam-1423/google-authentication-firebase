import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
    apiKey: "AIzaSyCsRzDBbY37ZDD7N-WNZFK2Gdmy2aRkK7Q",
    authDomain: "authentication-firebase-d504c.firebaseapp.com",
    projectId: "authentication-firebase-d504c",
    storageBucket: "authentication-firebase-d504c.firebasestorage.app",
    messagingSenderId: "923392306680",
    appId: "1:923392306680:web:fad0ca2e8c18f42033ba0d",
    measurementId: "G-PSEG1LNYL3"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
    prompt: 'select_account'
});
export default app;