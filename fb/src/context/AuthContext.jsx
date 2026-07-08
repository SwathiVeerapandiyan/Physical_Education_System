import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load user session from local storage on mount
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('pe_user');
      if (savedUser) {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        setIsAuthenticated(true);
      }
    } catch (e) {
      console.error('Failed to load user session', e);
      localStorage.removeItem('pe_user');
    } finally {
      setLoading(false);
    }
  }, []);

  const login = async (username, password) => {
    setLoading(true);
    try {
      const response = await authService.login(username, password);
      if (response.success && response.userDetails) {
        setUser(response.userDetails);
        setIsAuthenticated(true);
        localStorage.setItem('pe_user', JSON.stringify(response.userDetails));
        return { success: true, message: response.message };
      } else {
        return { success: false, message: response.message || 'Login failed' };
      }
    } catch (error) {
      return { 
        success: false, 
        message: error.message || 'Invalid credentials or server connection failed' 
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('pe_user');
  };

  return (
    <AuthContext.Provider value={{ user, setUser, isAuthenticated, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
