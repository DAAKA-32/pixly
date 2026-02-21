import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
  updateProfile,
  sendPasswordResetEmail,
  deleteUser,
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
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

  // Create user document in Firestore (terms accepted via modal + API, not here)
  await createUserDocument(result.user, displayName);

  // Send welcome email (non-blocking)
  triggerWelcomeEmail().catch(() => {});

  return result.user;
}

export interface GoogleSignInResult {
  user: FirebaseUser;
  isNewUser: boolean;
}

export async function signInWithGoogle(): Promise<GoogleSignInResult> {
  const result = await signInWithPopup(auth, googleProvider);

  // Check if user document exists
  const userDoc = await getDoc(doc(db, 'users', result.user.uid));
  const isNewUser = !userDoc.exists();

  if (isNewUser) {
    // Create user document WITHOUT termsAcceptedAt — terms accepted via modal + API
    await createUserDocument(result.user);
    // Send welcome email for new users (non-blocking)
    triggerWelcomeEmail().catch(() => {});
  }

  return { user: result.user, isNewUser };
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

// ============ PROFILE MANAGEMENT ============

export async function updateUserProfile(
  displayName: string
): Promise<void> {
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error('Non authentifié');

  // Update Firebase Auth profile
  await updateProfile(currentUser, { displayName });

  // Update Firestore user doc
  await updateDoc(doc(db, 'users', currentUser.uid), {
    displayName,
    updatedAt: serverTimestamp(),
  });
}

export async function resetPassword(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email);
}

export async function deleteCurrentUser(): Promise<void> {
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error('Non authentifié');

  // Delete Firestore user document
  await deleteDoc(doc(db, 'users', currentUser.uid));

  // Delete Firebase Auth account
  await deleteUser(currentUser);
}

async function triggerWelcomeEmail() {
  try {
    await fetch('/api/auth/welcome-email', { method: 'POST' });
  } catch {
    // Silently ignore — email is best-effort
  }
}

export { auth };
