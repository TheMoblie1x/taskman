import { initializeApp } from 'firebase/app';
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from 'firebase/firestore';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  type User as FirebaseUser,
} from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

export const isFirebaseConfigured = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);

const app = isFirebaseConfigured ? initializeApp(firebaseConfig) : null;

// Firestore's own offline cache (IndexedDB, shared across tabs) is the app's offline-first
// layer — see PROGRESS.md Phase 6 for why we lean on this instead of hand-rolling a mutation
// queue: it already gives optimistic local writes, automatic reconnect sync, and multi-tab
// consistency, which is exactly what "take advantage of Firestore's offline capabilities"
// (requirements.txt) is asking for.
export const db = app
  ? initializeFirestore(app, {
      localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
    })
  : null;

export const auth = app ? getAuth(app) : null;

export type { FirebaseUser };

/**
 * Real identity — every person using the app signs in with their own Google account. This
 * replaces the old anonymous-auth-only setup: Firestore Security Rules can now check
 * `request.auth.token.email` for actual per-user/per-workspace-membership authorization
 * (see firestore.rules), not just "some client is signed in."
 */
export function signInWithGoogle(): Promise<FirebaseUser | null> {
  if (!auth) return Promise.resolve(null);
  const provider = new GoogleAuthProvider();
  return signInWithPopup(auth, provider)
    .then((cred) => cred.user)
    .catch((err) => {
      console.error('Google sign-in failed:', err);
      throw err;
    });
}

export function signOutOfApp(): Promise<void> {
  if (!auth) return Promise.resolve();
  return signOut(auth);
}

/**
 * Subscribes to auth state for the lifetime of the app (unlike the old ensureFirebaseAuth,
 * which resolved once). Fires immediately with the current user (or null) and again on every
 * sign-in/out.
 */
export function onAuthChange(callback: (user: FirebaseUser | null) => void): () => void {
  if (!auth) {
    callback(null);
    return () => {};
  }
  return onAuthStateChanged(auth, callback);
}
