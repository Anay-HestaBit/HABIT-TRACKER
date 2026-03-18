import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import api from '../api/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkLoggedIn = async () => {
      try {
        const { data } = await api.get('/auth/me');
        setUser(data);
      } catch (err) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    checkLoggedIn();
  }, []);

  const login = useCallback(async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    if (!data.status || data.status !== 'otp_required') {
      setUser(data.user);
    }
    return data;
  }, []);

  const verifyOtp = useCallback(async (email, otp) => {
    const { data } = await api.post('/auth/verify-otp', { email, otp });
    setUser(data.user);
    return data;
  }, []);

  const signup = useCallback(async (userData) => {
    const { data } = await api.post('/auth/signup', userData);
    return data;
  }, []);

  // FIX: useCallback gives verifyEmail a stable reference.
  // Without this, AuthProvider re-renders (e.g. after checkLoggedIn sets user)
  // create a NEW verifyEmail function reference each time → the useEffect in
  // VerifyEmail.jsx sees a changed dependency → fires AGAIN → token already
  // consumed → "Invalid or expired verification token" even on a fresh token.
  const verifyEmail = useCallback(async (token) => {
    const { data } = await api.post('/auth/verify-email', { token });
    return data;
  }, []);

  const logout = useCallback(async () => {
    await api.post('/auth/logout');
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, setUser, verifyOtp, verifyEmail }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);