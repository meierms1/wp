import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const AuthContext = createContext();

// sessionStorage helpers — cache auth state within the tab session so the
// /api/auth/me round-trip is skipped on every in-session page refresh.
const AUTH_KEY = 'auth_user_v1';
const getStoredAuth = () => {
  try {
    const raw = sessionStorage.getItem(AUTH_KEY);
    if (raw === null) return undefined;   // never checked this session
    if (raw === 'null') return null;       // checked — not authenticated
    return JSON.parse(raw);               // checked — authenticated
  } catch { return undefined; }
};
const setStoredAuth = (user) => {
  try { sessionStorage.setItem(AUTH_KEY, user === null ? 'null' : JSON.stringify(user)); } catch {}
};
const clearStoredAuth = () => {
  try { sessionStorage.removeItem(AUTH_KEY); } catch {}
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const stored = getStoredAuth();
  const [user, setUser]       = useState(stored === undefined ? null : stored);
  const [loading, setLoading] = useState(stored === undefined); // only block if unchecked

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    if (getStoredAuth() !== undefined) {
      setLoading(false);
      return; // already have a cached answer — skip the network call
    }
    try {
      const response = await axios.get('/api/auth/me');
      if (response.data.user) {
        setUser(response.data.user);
        setStoredAuth(response.data.user);
      } else {
        setStoredAuth(null);
      }
    } catch (error) {
      setStoredAuth(null);
      console.log('Not authenticated');
    } finally {
      setLoading(false);
    }
  };

  const login = async (username, password) => {
    try {
      const response = await axios.post('/api/auth/login', {
        username,
        password,
      });
      
      if (response.data.success) {
        setUser(response.data.user);
        setStoredAuth(response.data.user);
        toast.success('Welcome back!');
        return { success: true };
      } else {
        toast.error(response.data.message || 'Login failed');
        return { success: false, message: response.data.message };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      toast.error(message);
      return { success: false, message };
    }
  };

  const register = async (username, password) => {
    try {
      const response = await axios.post('/api/auth/register', {
        username,
        password,
      });
      
      if (response.data.success) {
        setUser(response.data.user);
        setStoredAuth(response.data.user);
        toast.success('Account created successfully!');
        return { success: true };
      } else {
        toast.error(response.data.message || 'Registration failed');
        return { success: false, message: response.data.message };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      toast.error(message);
      return { success: false, message };
    }
  };

  const logout = async () => {
    try {
      await axios.post('/api/auth/logout');
      setUser(null);
      clearStoredAuth();
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      setUser(null);
      clearStoredAuth();
    }
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export { AuthContext };
