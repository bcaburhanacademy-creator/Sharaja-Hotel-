/**
 * Firebase Modular SDK Configuration for Sharjah Hotel Yaru
 * Uses Google Firebase CDN Modular SDK v11.4.0
 */
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-app.js";
import { 
  getFirestore, 
  doc, 
  getDocFromServer 
} from "https://www.gstatic.com/firebasejs/11.4.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.4.0/firebase-auth.js";

export const firebaseConfig = {
  projectId: "gen-lang-client-0894353863",
  appId: "1:148009847344:web:20db0a8955fa0c878abbf5",
  apiKey: "AIzaSyBC7p3bkVUVvgrj-tUaYiHrjSa9Q3sx2gE",
  authDomain: "gen-lang-client-0894353863.firebaseapp.com",
  firestoreDatabaseId: "ai-studio-36edd028-43ec-4963-b3c2-68b545dc51a4",
  storageBucket: "gen-lang-client-0894353863.firebasestorage.app",
  messagingSenderId: "148009847344"
};

// Initialize App
export const app = initializeApp(firebaseConfig);

// CRITICAL: Initialize Firestore with specific database ID provisioned
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

// Initialize Firebase Auth
export const auth = getAuth(app);

// Error handling interface & helper conforming to Firebase integration specification
export const OperationType = {
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete',
  LIST: 'list',
  GET: 'get',
  WRITE: 'write',
};

export function handleFirestoreError(error, operationType, path) {
  const errInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid || null,
      email: auth.currentUser?.email || null,
      emailVerified: auth.currentUser?.emailVerified || null,
      isAnonymous: auth.currentUser?.isAnonymous || null,
      tenantId: auth.currentUser?.tenantId || null,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error:', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Test connection on boot
export async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log("Connected to Sharjah Hotel Yaru Firestore database.");
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn("Client is offline or check Firebase configuration.");
    }
  }
}

testConnection();
