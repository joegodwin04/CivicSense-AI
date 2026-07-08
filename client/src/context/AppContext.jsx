// src/context/AppContext.jsx
import { createContext, useContext, useState, useCallback } from 'react';
import api from '../utils/api';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const [theme] = useState('dark');
  
  // Restore auth state from localStorage on initialization
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('user');
    try {
      return storedUser ? JSON.parse(storedUser) : null;
    } catch {
      return null;
    }
  });

  const addNotification = useCallback((notification) => {
    const id = Date.now();
    setNotifications((prev) => [...prev, { id, ...notification }]);
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, notification.duration || 4000);
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const loginAction = useCallback(async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token: jwtToken, ...userData } = response.data.data;
      
      localStorage.setItem('token', jwtToken);
      localStorage.setItem('user', JSON.stringify(userData));
      
      setToken(jwtToken);
      setUser(userData);
      
      addNotification({ 
        type: 'success', 
        title: 'Login Successful', 
        message: `Welcome back, ${userData.name}!` 
      });
      return userData;
    } catch (error) {
      const msg = error.response?.data?.error || 'Authentication failed';
      addNotification({ type: 'error', title: 'Login Failed', message: msg });
      throw new Error(msg);
    }
  }, [addNotification]);

  const registerAction = useCallback(async (userDataInput) => {
    try {
      const response = await api.post('/auth/register', userDataInput);
      const { token: jwtToken, ...userData } = response.data.data;
      
      if (userData.isPending) {
        addNotification({ 
          type: 'info', 
          title: 'Registration Pending Approval', 
          message: 'Your MP account registration is pending admin approval. You will be able to log in once verified.' 
        });
        return userData;
      }

      localStorage.setItem('token', jwtToken);
      localStorage.setItem('user', JSON.stringify(userData));
      
      setToken(jwtToken);
      setUser(userData);
      
      addNotification({ 
        type: 'success', 
        title: 'Registration Successful', 
        message: `Welcome, ${userData.name}!` 
      });
      return userData;
    } catch (error) {
      const msg = error.response?.data?.error || 'Registration failed';
      addNotification({ type: 'error', title: 'Registration Failed', message: msg });
      throw new Error(msg);
    }
  }, [addNotification]);

  const logoutAction = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    addNotification({ type: 'info', title: 'Logged Out', message: 'You have been logged out.' });
  }, [addNotification]);

  return (
    <AppContext.Provider
      value={{
        notifications,
        addNotification,
        removeNotification,
        theme,
        user,
        token,
        login: loginAction,
        register: registerAction,
        logout: logoutAction,
        isAuthenticated: !!token
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
