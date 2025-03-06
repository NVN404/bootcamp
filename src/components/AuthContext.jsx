import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setUser({ token });
    }
  }, []);

  const signup = async (email, password) => {
    try {
      await axios.post('http://localhost:5000/auth/signup', { email, password });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response.data.error };
    }
  };

  const login = async (email, password) => {
    try {
      const response = await axios.post('http://localhost:5000/auth/login', { email, password });
      localStorage.setItem('token', response.data.token);
      setUser({ token: response.data.token });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response.data.error };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, signup, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};