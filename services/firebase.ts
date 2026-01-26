
import { initializeApp, getApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider, Auth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "SUA_API_KEY_AQUI", 
  authDomain: "seu-projeto.firebaseapp.com",
  projectId: "seu-projeto",
  storageBucket: "seu-projeto.appspot.com",
  messagingSenderId: "000000000000",
  appId: "1:000000000000:web:000000000000"
};

// Verifica se a configuração é o placeholder padrão
const isConfigValid = firebaseConfig.apiKey !== "SUA_API_KEY_AQUI" && firebaseConfig.apiKey.length > 10;

let firebaseApp;
let firebaseAuth: Auth;

if (isConfigValid) {
  try {
    firebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    firebaseAuth = getAuth(firebaseApp);
  } catch (e) {
    console.error("Erro ao inicializar Firebase Real:", e);
    // Fallback para mock se falhar mesmo com config aparentemente válida
    firebaseAuth = { 
      onAuthStateChanged: (cb: any) => { cb(null); return () => {}; },
      signOut: async () => {} 
    } as any;
  }
} else {
  console.warn("Firebase operando em modo MOCK. Configure services/firebase.ts para usar login do Google.");
  // Mock seguro que não quebra o contrato do Firebase Auth usado no App.tsx
  firebaseAuth = {
    onAuthStateChanged: (callback: any) => {
      // No modo mock, simplesmente dizemos que não há usuário logado
      // ou poderíamos simular um login persistente se desejado.
      const unsubscribe = () => {};
      callback(null);
      return unsubscribe;
    },
    signOut: async () => {
      console.log("Mock SignOut executado");
    }
  } as any;
}

export const auth = firebaseAuth;
export const googleProvider = new GoogleAuthProvider();
export const isFirebaseConfigured = isConfigValid;
