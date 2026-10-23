import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Preserve authentication session across page refreshes
  useEffect(() => {
    const savedUser = localStorage.getItem('medibook_active_user');
    const token = localStorage.getItem('medibook_jwt_token');

    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        setUser(parsed);
      } catch (e) {
        console.error("Failed to parse stored session user data", e);
        localStorage.removeItem('medibook_active_user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, role, password = 'Password@123') => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.auth.login(email, role, password);
      const userObj = data.user || data;
      setUser(userObj);
      localStorage.setItem('medibook_active_user', JSON.stringify(userObj));
      if (data.token) {
        localStorage.setItem('medibook_jwt_token', data.token);
      }
      setLoading(false);
      return userObj;
    } catch (err) {
      const msg = err.response?.data?.error || err.message || "Failed to login.";
      setError(msg);
      setLoading(false);
      throw new Error(msg);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.auth.register(userData);
      const userObj = data.user || data;
      const normalizedRole = (userObj.role || '').toUpperCase();
      if (normalizedRole === 'PATIENT') {
        setUser(userObj);
        localStorage.setItem('medibook_active_user', JSON.stringify(userObj));
        if (data.token) {
          localStorage.setItem('medibook_jwt_token', data.token);
        }
      }
      setLoading(false);
      return userObj;
    } catch (err) {
      const msg = err.response?.data?.error || err.message || "Failed to register.";
      setError(msg);
      setLoading(false);
      throw new Error(msg);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('medibook_active_user');
    localStorage.removeItem('medibook_jwt_token');
  };

  const updateUser = (updatedData) => {
    const updated = { ...user, ...updatedData };
    setUser(updated);
    localStorage.setItem('medibook_active_user', JSON.stringify(updated));
  };

  const role = (user?.role || '').toUpperCase();

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    updateUser,
    isAuthenticated: !!user,
    role,
    isPatient: role === 'PATIENT',
    isDoctor: role === 'DOCTOR',
    isAdmin: role === 'ADMIN',
    isReceptionist: role === 'RECEPTIONIST'
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be called within an AuthProvider");
  }
  return context;
};

export default AuthContext;
