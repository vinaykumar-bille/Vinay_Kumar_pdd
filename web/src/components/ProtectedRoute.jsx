import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const userRole = (user.role || '').toUpperCase();
    const allowed = allowedRoles.map(r => r.toUpperCase());
    if (!allowed.includes(userRole)) {
      console.warn(`Access denied. Role '${userRole}' is not authorized for this route.`);
      if (userRole === 'PATIENT') return <Navigate to="/patient-dashboard" replace />;
      if (userRole === 'DOCTOR') return <Navigate to="/doctor-dashboard" replace />;
      if (userRole === 'RECEPTIONIST') return <Navigate to="/receptionist-dashboard" replace />;
      if (userRole === 'ADMIN') return <Navigate to="/admin-dashboard" replace />;
      return <Navigate to="/" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
