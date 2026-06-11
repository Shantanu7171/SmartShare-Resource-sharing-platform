import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

const ProtectedRoute = ({ children, role }) => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (role && user?.role !== role && !user?.is_staff) {
    return <Navigate to="/" replace />;
  }

  if (role === 'faculty' && user?.role === 'faculty' && !user?.is_approved_faculty) {
    return <Navigate to="/profile" replace />;
  }

  return children;
};

export default ProtectedRoute;
