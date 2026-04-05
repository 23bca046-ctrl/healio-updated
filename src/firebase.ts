import { initializeApp } from 'firebase/app';
import {
  getAuth,
  onAuthStateChanged as fbOnAuthStateChanged,
  signOut as fbSignOut,
  updateProfile as fbUpdateProfile,
  User,
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Validate Firebase configuration
const validateFirebaseConfig = (): boolean => {
  const requiredFields = [
    'apiKey',
    'authDomain',
    'projectId',
    'storageBucket',
    'messagingSenderId',
    'appId',
  ];

  const missingFields = requiredFields.filter(
    (field) => !firebaseConfig[field as keyof typeof firebaseConfig]
  );

  if (missingFields.length > 0) {
    console.warn(
      `Firebase configuration incomplete. Missing: ${missingFields.join(', ')}`
    );
    return false;
  }

  return true;
};

// Initialize Firebase
let app;
let auth;
let db;

try {
  if (validateFirebaseConfig()) {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    console.log('Firebase initialized successfully');
  } else {
    console.warn('Firebase not initialized due to missing configuration');
  }
} catch (error) {
  console.error('Firebase initialization error:', error);
}

// Export types
export type FirebaseUser = User | null;

// Wrapped auth functions with error handling
export const onAuthStateChanged = (callback: (user: FirebaseUser) => void) => {
  if (!auth) {
    console.error('Auth not initialized');
    callback(null);
    return () => {};
  }

  try {
    return fbOnAuthStateChanged(auth, (user) => {
      try {
        callback(user);
      } catch (error) {
        console.error('Error in auth state callback:', error);
      }
    });
  } catch (error) {
    console.error('Error setting up auth listener:', error);
    return () => {};
  }
};

export const signOut = async (): Promise<void> => {
  if (!auth) {
    throw new Error('Auth not initialized');
  }

  try {
    await fbSignOut(auth);
    console.log('User signed out successfully');
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

export const updateProfile = async (
  user: FirebaseUser,
  updates: { displayName?: string; photoURL?: string }
): Promise<void> => {
  if (!user) {
    throw new Error('No user logged in');
  }

  try {
    await fbUpdateProfile(user, updates);
    console.log('Profile updated successfully');
  } catch (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
};

// Export instances
export { auth, db, app };

// Export Firebase modules for use in components
export * from 'firebase/auth';
export * from 'firebase/firestore';
