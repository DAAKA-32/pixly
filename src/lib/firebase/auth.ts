import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
  updateProfile,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './config';
import type { User } from '@/types';

// ===========================================
// PIXLY - Authentication Service
// ===========================================

const googleProvider = new GoogleAuthProvider();

export async function signInWithEmail(email: string, password: string) {
  const result = await signInWithEmailAndPassword(auth, email, password);
  return result.user;
}

export async function signUpWithEmail(
  email: string,
  password: string,
  displayName: string
) {
  const result = await createUserWithEmailAndPassword(auth, email, password);

  // Update profile with display name
  await updateProfile(result.user, { displayName });

  // Create user document in Firestore
  await createUserDocument(result.user, displayName);

  return result.user;
}

export async function signInWithGoogle() {
  const result = await signInWithPopup(auth, googleProvider);

  // Check if user document exists, create if not
  const userDoc = await getDoc(doc(db, 'users', result.user.uid));
  if (!userDoc.exists()) {
    await createUserDocument(result.user);
  }

  return result.user;
}

export async function signOut() {
  await firebaseSignOut(auth);
}

export function onAuthChange(callback: (user: FirebaseUser | null) => void) {
  return onAuthStateChanged(auth, callback);
}

async function createUserDocument(
  firebaseUser: FirebaseUser,
  displayName?: string
) {
  const userDoc: Omit<User, 'id'> = {
    email: firebaseUser.email!,
    displayName: displayName || firebaseUser.displayName,
    photoURL: firebaseUser.photoURL,
    createdAt: new Date(),
    updatedAt: new Date(),
    plan: 'free',
    workspaceIds: [],
  };

  await setDoc(doc(db, 'users', firebaseUser.uid), {
    ...userDoc,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

export async function getUserData(userId: string): Promise<User | null> {
  const userDoc = await getDoc(doc(db, 'users', userId));

  if (!userDoc.exists()) {
    return null;
  }

  const data = userDoc.data();
  return {
    id: userDoc.id,
    ...data,
    createdAt: data.createdAt?.toDate(),
    updatedAt: data.updatedAt?.toDate(),
  } as User;
}

export { auth };
