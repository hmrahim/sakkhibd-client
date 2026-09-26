import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  auth,
  googleProvider,
  githubProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged
} from '../firebase/firebase';
import { syncUserToBackend, fetchUserProfile } from '../api/userApi';

import PageLoader from '../components/PageLoader';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [dbUser, setDbUser]           = useState(null);
  const [loading, setLoading]         = useState(true);  // true = auth + role fetch চলছে

  // ─── Backend sync helper ────────────────────────────────────────────────────
  const syncAndFetchRole = useCallback(async (firebaseUser) => {
    if (!firebaseUser) {
      setDbUser(null);
      return null;
    }

    const provider = firebaseUser.providerData?.[0]?.providerId || 'password';
    console.log('[AuthContext] Starting sync for user:', firebaseUser.email, firebaseUser.uid);

    try {
      const result = await syncUserToBackend({
        uid:         firebaseUser.uid,
        displayName: firebaseUser.displayName || 'Anonymous',
        email:       firebaseUser.email,
        photoURL:    firebaseUser.photoURL || '',
        provider,
      });
      console.log('[AuthContext] syncUserToBackend result:', result);
      if (result?.success && result?.data) {
        setDbUser(result.data);
        return result.data;
      }
    } catch (syncErr) {
      console.warn('[AuthContext] sync failed, falling back to profile fetch:', syncErr.message);
    }

    // Fallback: sync fail করলে শুধু profile fetch করো
    try {
      const profile = await fetchUserProfile(firebaseUser.uid);
      console.log('[AuthContext] fetchUserProfile result:', profile);
      if (profile?.success && profile?.data) {
        setDbUser(profile.data);
        return profile.data;
      }
    } catch (fetchErr) {
      console.error('[AuthContext] profile fetch also failed:', fetchErr.message);
    }

    setDbUser(null);
    return null;
  }, []);

  // ─── Auth state listener — এটাই একমাত্র জায়গা যেখানে sync হবে ─────────────
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      // Auth state বদলানোর সাথে সাথে loading = true করো
      // এতে children unmount হবে, race condition নেই
      setLoading(true);
      setCurrentUser(user);

      if (user) {
        await syncAndFetchRole(user);
      } else {
        setDbUser(null);
      }

      setLoading(false);  // sync সম্পূর্ণ হলেই children render হবে
    });

    return () => unsubscribe();
  }, [syncAndFetchRole]);

  // ─── Auth methods — শুধু Firebase call, sync onAuthStateChanged করবে ────────

  const registerWithEmail = async (email, password, displayName) => {
    const res = await createUserWithEmailAndPassword(auth, email, password);
    if (displayName && res.user) {
      await updateProfile(res.user, { displayName });
    }
    // onAuthStateChanged এ automatically sync হবে
    return res;
  };

  const loginWithEmail = (email, password) =>
    signInWithEmailAndPassword(auth, email, password);
  // onAuthStateChanged এ automatically sync হবে

  const loginWithGoogle = () =>
    signInWithPopup(auth, googleProvider);

  const loginWithGithub = () =>
    signInWithPopup(auth, githubProvider);

  const logout = () => signOut(auth);
  // onAuthStateChanged null দিলে dbUser ও clear হবে

  const resetPassword = (email) => sendPasswordResetEmail(auth, email);

  // ─── Role helpers (case-insensitive for safety) ─────────────────────────
  const normalizedRole = (dbUser?.role || '').toLowerCase().trim();
  const isAdmin  = normalizedRole === 'admin';
  const isUser   = normalizedRole === 'user';
  const userRole = normalizedRole || null;

  const value = {
    currentUser,
    dbUser,
    loading,
    isAdmin,
    isUser,
    userRole,
    syncAndFetchRole,
    registerWithEmail,
    loginWithEmail,
    loginWithGoogle,
    loginWithGithub,
    logout,
    resetPassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {loading ? <PageLoader message="সিস্টেম ও সিকিউরিটি ভেরিফিকেশন চলছে..." /> : children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);