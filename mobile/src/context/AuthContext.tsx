import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Role } from '../types';
import mobileApi, { setAuthToken } from '../services/api';

interface AuthContextType {
  user: User | null;
  role: Role;
  token: string | null;
  loading: boolean;
  login: (email: string, role: string, password?: string) => Promise<User>;
  register: (userData: any) => Promise<User>;
  logout: () => void;
  demoLogin: (role: Role) => Promise<void>;
  updateUser: (data: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>({
    id: 'usr_1',
    name: 'Vinay Kumar',
    email: 'vinay@gmail.com',
    role: 'PATIENT',
    phone: '9876543210',
    gender: 'Male',
    age: 24,
    dateOfBirth: '2000-05-14',
    city: 'Chennai',
    bloodGroup: 'O+',
    allergies: 'None'
  });
  const [token, setToken] = useState<string | null>('demo_jwt_token_mobile');
  const [loading, setLoading] = useState(false);

  const login = async (email: string, selectedRole: string, password = 'Password@123') => {
    setLoading(true);
    try {
      const data = await mobileApi.auth.login(email, selectedRole, password);
      const userObj: User = data.user || data;
      setUser(userObj);
      if (data.token) {
        setToken(data.token);
        setAuthToken(data.token);
      }
      return userObj;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: any) => {
    setLoading(true);
    try {
      const data = await mobileApi.auth.register(userData);
      const userObj: User = data.user || data;
      setUser(userObj);
      if (data.token) {
        setToken(data.token);
        setAuthToken(data.token);
      }
      return userObj;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setAuthToken(null);
  };

  const demoLogin = async (targetRole: Role) => {
    if (targetRole === 'PATIENT') {
      await login('vinay@gmail.com', 'patient');
    } else if (targetRole === 'DOCTOR') {
      await login('amit.verma@saveethamedicalcollege.com', 'doctor');
    } else if (targetRole === 'RECEPTIONIST') {
      await login('reception@saveethahospital.com', 'receptionist');
    } else if (targetRole === 'ADMIN') {
      await login('admin@gmail.com', 'admin');
    }
  };

  const updateUser = (data: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...data });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || 'PATIENT',
        token,
        loading,
        login,
        register,
        logout,
        demoLogin,
        updateUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
};

export default AuthContext;
