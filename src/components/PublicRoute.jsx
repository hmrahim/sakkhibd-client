import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

import PageLoader from './PageLoader';

/**
 * PublicRoute — শুধুমাত্র লগআউট অবস্থায় accessible।
 * যদি user ইতিমধ্যে লগইন থাকে, তাহলে রোল অনুযায়ী রিডাইরেক্ট হবে।
 */
export default function PublicRoute({ children }) {
  const { currentUser, userRole, loading } = useAuth();

  if (loading) {
    return <PageLoader message="তথ্য যাচাই হচ্ছে..." theme="dark" />;
  }

  // লগইন থাকলে রোল অনুযায়ী রিডাইরেক্ট
  if (currentUser) {
    const role = (userRole || '').toLowerCase().trim();
    if (role === 'admin') {
      return <Navigate to="/dashboard" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return children;
}
