// Firebase Configuration
import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';

// Configuração do Firebase
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyC-cfPPwUZ4k1JM42Enme0nydSRL3MIjL0",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "juris-acompanhamento-cliente.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "juris-acompanhamento-cliente",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "juris-acompanhamento-cliente.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "7719478506",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:7719478506:web:ea4758f2d09bcd6b372393"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Inicializar serviços
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Conectar emuladores em desenvolvimento (opcional)
if (import.meta.env.DEV && import.meta.env.VITE_USE_FIREBASE_EMULATOR === 'true') {
  try {
    // Auth Emulator
    if (!auth._delegate._config?.emulator) {
      connectAuthEmulator(auth, "http://localhost:9099");
    }
    
    // Firestore Emulator
    if (!db._delegate._settings?.host?.includes('localhost')) {
      connectFirestoreEmulator(db, 'localhost', 8080);
    }
    
    // Storage Emulator
    if (!storage._delegate._host?.includes('localhost')) {
      connectStorageEmulator(storage, 'localhost', 9199);
    }
    
    console.log('🔥 Firebase Emulators conectados');
  } catch (error) {
    console.warn('⚠️ Erro ao conectar emuladores Firebase:', error.message);
  }
}

export default app;
