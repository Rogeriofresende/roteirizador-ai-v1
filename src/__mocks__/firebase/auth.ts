/**
 * Firebase Auth Mock for Tests
 * Mock específico para Firebase Auth functions
 */

export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  emailVerified: boolean;
  photoURL: string | null;
}

export const onAuthStateChanged = jest.fn();
export const signInWithEmailAndPassword = jest.fn();
export const createUserWithEmailAndPassword = jest.fn();
export const signOut = jest.fn();
export const updateProfile = jest.fn();

// Função para resetar todos os mocks
export const resetFirebaseAuthMocks = () => {
  onAuthStateChanged.mockClear();
  signInWithEmailAndPassword.mockClear();
  createUserWithEmailAndPassword.mockClear();
  signOut.mockClear();
  updateProfile.mockClear();
}; 