import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkLoggedIn = async () => {
      try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          // Verify token by getting profile
          const res = await api.get('/auth/profile');
          setUser({ ...res.data, token: parsedUser.token });
        }
      } catch (error) {
        console.error('Not logged in or token expired');
        localStorage.removeItem('user');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    checkLoggedIn();
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    localStorage.setItem('user', JSON.stringify(res.data));
    setUser(res.data);
  };

  const register = async (name, email, password, branch, role = 'user', extraData = {}) => {
    const res = await api.post('/auth/register', { name, email, password, branch, role, ...extraData });
    localStorage.setItem('user', JSON.stringify(res.data));
    setUser(res.data);
  };


  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };

  const updateProfile = async (profileData) => {
    const res = await api.put('/auth/profile', profileData);
    localStorage.setItem('user', JSON.stringify({ ...user, ...res.data }));
    setUser({ ...user, ...res.data });
  };

  const addToCart = async (courseId) => {
    const res = await api.post('/cart', { courseId });
    setUser(prev => ({ ...prev, cart: res.data }));
  };

  const removeFromCart = async (courseId) => {
    const res = await api.delete(`/cart/${courseId}`);
    setUser(prev => ({ ...prev, cart: res.data }));
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading, addToCart, removeFromCart, setUser, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};
