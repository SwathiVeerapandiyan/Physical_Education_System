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

  const login = async (username, password, explicitAdmin = false) => {
    setLoading(true);
    const cleanUsername = (username || '').trim();
    const cleanPassword = password || '';

    // Built-in Admin check (instant fallback or direct login)
    const isBuiltinAdmin =
      (cleanUsername.toLowerCase() === 'admin' ||
        cleanUsername.toLowerCase() === 'admin@pe.com' ||
        cleanUsername.toLowerCase() === 'admin@mcc.edu') &&
      (cleanPassword === 'admin' || cleanPassword === 'admin123');

    // Strict Enforcement: Admin credentials must NEVER work in User / Candidate login
    if (!explicitAdmin && isBuiltinAdmin) {
      setLoading(false);
      return {
        success: false,
        message: 'Administrator credentials cannot be used in Candidate Sign In. Please use Administrator Sign In tab.',
      };
    }

    if (isBuiltinAdmin) {
      const adminObj = {
        userId: 9999,
        name: 'Dr. S. Kumar',
        dept: 'Department of Physical Education',
        registerNo: 'PE-ADMIN-01',
        email: 'admin@pe.com',
        mobileNo: 9876543210,
        role: 'ADMIN',
      };
      setUser(adminObj);
      setIsAuthenticated(true);
      localStorage.setItem('pe_user', JSON.stringify(adminObj));
      setLoading(false);
      return { success: true, message: 'Welcome to Central Sports Admin Console!' };
    }

    // Built-in Candidate Demo check for quick evaluation and testing
    const isBuiltinCandidate =
      !explicitAdmin &&
      (cleanUsername.toLowerCase() === 'candidate' ||
        cleanUsername.toLowerCase() === 'candidate@pe.com' ||
        cleanUsername.toLowerCase() === 'femi@mail.com' ||
        cleanUsername.toLowerCase() === 'student@pe.com') &&
      (cleanPassword === 'candidate123' || cleanPassword === '123456' || cleanPassword === 'candidate' || cleanPassword === 'student123');

    if (isBuiltinCandidate) {
      const candidateObj = {
        userId: 25,
        name: 'Femina',
        dept: 'Master of Computer Applications',
        registerNo: '213134',
        email: 'femi@mail.com',
        mobileNo: 5645435555,
        role: 'STUDENT',
      };
      setUser(candidateObj);
      setIsAuthenticated(true);
      localStorage.setItem('pe_user', JSON.stringify(candidateObj));
      setLoading(false);
      return { success: true, message: 'Welcome to Candidate Athlete Portal!' };
    }

    try {
      const response = await authService.login(cleanUsername, cleanPassword);
      const userObj = response?.user || response?.userDetails;

      if (response && response.success && userObj) {
        const isAccountAdmin =
          userObj.email?.toLowerCase().includes('admin') ||
          userObj.registerNo?.toUpperCase().includes('ADMIN') ||
          (userObj.dept && userObj.dept.toLowerCase().includes('admin'));

        // If trying to login on Candidate tab with an Admin account
        if (!explicitAdmin && isAccountAdmin) {
          return {
            success: false,
            message: 'Administrative accounts cannot sign in through Candidate Sign In. Please use the Administrator Sign In tab.',
          };
        }

        // If trying to login on Admin tab with a regular Candidate account
        if (explicitAdmin && !isAccountAdmin) {
          return {
            success: false,
            message: 'Candidate accounts cannot access the Executive Admin Portal. Please use the Candidate Sign In tab.',
          };
        }

        const enhancedUser = {
          ...userObj,
          role: explicitAdmin || isAccountAdmin ? 'ADMIN' : 'STUDENT',
        };

        setUser(enhancedUser);
        setIsAuthenticated(true);
        localStorage.setItem('pe_user', JSON.stringify(enhancedUser));
        return { success: true, message: response.message || 'Login successful' };
      } else {
        return { success: false, message: response?.message || 'Login failed' };
      }
    } catch (error) {
      // If server error, but explicit admin mode with demo password:
      if (explicitAdmin && cleanPassword === 'admin123') {
        const adminObj = {
          userId: 9999,
          name: 'Dr. S. Kumar',
          dept: 'Department of Physical Education',
          registerNo: 'PE-ADMIN-01',
          email: cleanUsername.includes('@') ? cleanUsername : 'admin@pe.com',
          mobileNo: 9876543210,
          role: 'ADMIN',
        };
        setUser(adminObj);
        setIsAuthenticated(true);
        localStorage.setItem('pe_user', JSON.stringify(adminObj));
        return { success: true, message: 'Welcome, Administrator!' };
      }

      return {
        success: false,
        message: error.message || 'Invalid credentials or server connection failed',
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

  const isAdmin =
    user?.role === 'ADMIN' ||
    user?.email?.toLowerCase().includes('admin') ||
    user?.registerNo?.toUpperCase().includes('ADMIN');

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        isAuthenticated,
        isAdmin,
        loading,
        login,
        logout,
      }}
    >
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
