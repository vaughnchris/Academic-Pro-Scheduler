
import { initializeApp, FirebaseApp, getApps } from "firebase/app";
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  onSnapshot, 
  writeBatch,
  enableIndexedDbPersistence,
  Firestore
} from "firebase/firestore";

// --- Configuration Management ---

// Hardcoded configuration for deployment
const FIREBASE_CONFIG = {
  apiKey: "AIzaSyC3HZx_hkeJooeLvvMY9S9NL-bven8sZFc",
  authDomain: "gen-lang-client-0471079858.firebaseapp.com",
  projectId: "gen-lang-client-0471079858",
  storageBucket: "gen-lang-client-0471079858.firebasestorage.app",
  messagingSenderId: "406839785882",
  appId: "1:406839785882:web:be2522ef69f0d59a69a223"
};

// --- Initialization ---

let app: FirebaseApp | undefined;
let db: Firestore | undefined;

try {
  if (!getApps().length) {
    app = initializeApp(FIREBASE_CONFIG);
  } else {
    app = getApps()[0];
  }
  db = getFirestore(app);
  
  // Enable offline persistence
  enableIndexedDbPersistence(db).catch((err) => {
      if (err.code == 'failed-precondition') {
          console.warn('Persistence failed: Multiple tabs open');
      } else if (err.code == 'unimplemented') {
          console.warn('Persistence not supported by browser');
      }
  });

} catch (error) {
  console.error("Firebase Initialization Error:", error);
}

// --- Database Operations ---

// Collection Listener
export const subscribeToCollection = (collectionName: string, callback: (data: any[]) => void) => {
  if (!db) return () => {};
  return onSnapshot(collection(db, collectionName), (snapshot) => {
    const data = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
    callback(data);
  });
};

// Single Document Listener
export const subscribeToDoc = (collectionName: string, docId: string, callback: (data: any) => void) => {
  if (!db) return () => {};
  return onSnapshot(doc(db, collectionName, docId), (docSnap) => {
    if (docSnap.exists()) {
      callback({ ...docSnap.data(), id: docSnap.id });
    } else {
      callback(null);
    }
  });
};

// CRUD
export const addDocument = async (collectionName: string, data: any) => {
  if (!db) throw new Error("Database not initialized");
  if (data.id) {
    await setDoc(doc(db, collectionName, data.id), data);
  } else {
    // Fallback if no ID provided
    const newRef = doc(collection(db, collectionName));
    await setDoc(newRef, { ...data, id: newRef.id });
  }
};

export const updateDocument = async (collectionName: string, id: string, updates: any) => {
  if (!db) throw new Error("Database not initialized");
  await setDoc(doc(db, collectionName, id), updates, { merge: true });
};

export const deleteDocument = async (collectionName: string, id: string) => {
  if (!db) throw new Error("Database not initialized");
  await deleteDoc(doc(db, collectionName, id));
};

// Batch Operations
export const batchAddDocuments = async (collectionName: string, items: any[]) => {
  if (!db) throw new Error("Database not initialized");
  const batch = writeBatch(db);
  
  items.forEach(item => {
    const ref = doc(db!, collectionName, item.id);
    batch.set(ref, item);
  });

  await batch.commit();
};

export const batchDeleteDocuments = async (collectionName: string, ids: string[]) => {
  if (!db) throw new Error("Database not initialized");
  const batch = writeBatch(db);
  
  ids.forEach(id => {
    const ref = doc(db!, collectionName, id);
    batch.delete(ref);
  });

  await batch.commit();
};
