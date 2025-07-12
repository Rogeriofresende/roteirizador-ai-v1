/**
 * Firebase Mock for Tests
 * Isola os testes da configuração real do Firebase
 */

// Mock do Firebase Auth
export const auth = {
  currentUser: null,
  onAuthStateChanged: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
  updateProfile: jest.fn(),
};

// Mock do Firestore
export const firestore = {
  collection: jest.fn(),
  doc: jest.fn(),
  getDoc: jest.fn(),
  setDoc: jest.fn(),
  updateDoc: jest.fn(),
  deleteDoc: jest.fn(),
};

// Mock do Firebase Storage
export const storage = {
  ref: jest.fn(),
  uploadBytes: jest.fn(),
  getDownloadURL: jest.fn(),
};

// Export default do config mockado
export default {
  auth,
  firestore,
  storage,
};

// Mock das funções do Firebase Auth
export const onAuthStateChanged = jest.fn();
export const signInWithEmailAndPassword = jest.fn();
export const createUserWithEmailAndPassword = jest.fn();
export const signOut = jest.fn();
export const updateProfile = jest.fn();

// Mock dos tipos do Firebase
export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  emailVerified: boolean;
  photoURL: string | null;
} 