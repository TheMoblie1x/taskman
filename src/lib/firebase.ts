import { initializeApp } from 'firebase/app';
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from 'firebase/firestore';
import { getAuth, signInAnonymously, onAuthStateChanged, type User as FirebaseUser } from 'firebase/auth';

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

/**
 * Every client authenticates anonymously so Firestore Security Rules can require
 * `request.auth != null` — this is NOT the app's own user/persona system (that's still the
 * seeded `currentUser` switcher in AppContext) and does not give per-user row-level ACLs.
 * It's the minimum viable thing that lets the rules block totally unauthenticated access
 * without pulling in a full Google Sign-In flow. See PROGRESS.md for the tradeoff.
 */
export function ensureFirebaseAuth(): Promise<FirebaseUser | null> {
  if (!auth) return Promise.resolve(null);
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      if (user) {
        resolve(user);
      } else {
        signInAnonymously(auth)
          .then((cred) => resolve(cred.user))
          .catch((err) => {
            console.error('Firebase anonymous sign-in failed:', err);
            resolve(null);
          });
      }
    });
  });
}
