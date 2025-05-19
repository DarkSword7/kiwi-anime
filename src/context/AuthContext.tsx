
"use client";

import type { ReactNode } from 'react';
import React, { createContext, useEffect, useState } from 'react';
import { 
  onAuthStateChanged, 
  User, 
  signInWithPopup, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  AuthError
} from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<User | null>;
  signUpWithEmail: (email: string, password: string) => Promise<User | null>;
  signInWithEmail: (email: string, password: string) => Promise<User | null>;
  signOutUser: () => Promise<void>;
  sendPasswordReset: (email: string) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async (): Promise<User | null> => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      return result.user;
    } catch (error) {
      console.error("Error signing in with Google:", error);
      // You might want to throw the error or handle it by returning null
      // and showing a toast message in the component calling this.
      if (error instanceof Error) {
        throw error; // Rethrow to be caught by the calling component
      }
      return null;
    }
  };

  const signUpWithEmail = async (email: string, password: string): Promise<User | null> => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      // Optionally set display name here if needed
      // await updateProfile(userCredential.user, { displayName: "New User" });
      return userCredential.user;
    } catch (error) {
      console.error("Error signing up with email:", error);
      if (error instanceof Error) {
        throw error;
      }
      return null;
    }
  };

  const signInWithEmail = async (email: string, password: string): Promise<User | null> => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error) {
      console.error("Error signing in with email:", error);
       if (error instanceof Error) {
        throw error;
      }
      return null;
    }
  };

  const signOutUser = async (): Promise<void> => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out:", error);
      if (error instanceof Error) {
        throw error;
      }
    }
  };

  const sendPasswordReset = async (email: string): Promise<void> => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      console.error("Error sending password reset email:", error);
      if (error instanceof Error) {
        throw error;
      }
    }
  };


  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, signUpWithEmail, signInWithEmail, signOutUser, sendPasswordReset }}>
      {children}
    </AuthContext.Provider>
  );
};
