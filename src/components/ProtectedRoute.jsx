import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

import PageLoader from './PageLoader';

export default function ProtectedRoute({ children }) {
  const { currentUser, loading, isAdmin } = useAuth();
  const location = useLocation();

  if (loading) {
    return <PageLoader message="অ্যাডমিন অ্যাক্সেস ও সিকিউরিটি যাচাই হচ্ছে..." theme="dark" />;
  }

  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/unauthorized" state={{ from: location }} replace />;
  }

  return children;
}