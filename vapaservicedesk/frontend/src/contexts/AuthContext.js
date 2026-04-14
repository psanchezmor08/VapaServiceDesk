import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { checkAuth(); }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('sd_token');
    if (token) {
      try {
        const userData = await authAPI.getMe();
        setUser(userData);
      } catch {
        localStorage.removeItem('sd_token');
        setUser(null);
      }
    }
    setLoading(false);
  };

  const login = async (email, password) => {
    const data = await authAPI.login(email, password);
    localStorage.setItem('sd_token', data.access_token);
    setUser(data.user);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('sd_token');
    setUser(null);
  };

  const isAdmin = () => user?.role === 'admin' || user?.role === 'superadmin';
  const isManager = () => ['admin', 'superadmin', 'manager'].includes(user?.role);

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, isAdmin, isManager }}>
      {children}
    </AuthContext.Provider>
  );
};
