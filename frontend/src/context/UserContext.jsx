import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import api from '../utils/api';
import { supabase } from '../utils/supabaseClient';

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => localStorage.getItem('token') || null);

  // Sync Supabase OAuth session on mount or redirect
  useEffect(() => {
    const handleOAuthSession = async (session) => {
      if (!session?.user) return;
      try {
        const email = session.user.email;
        const name = session.user.user_metadata?.full_name ||
                     session.user.user_metadata?.name ||
                     session.user.user_metadata?.user_name ||
                     email?.split('@')[0];
        const profileImageUrl = session.user.user_metadata?.avatar_url ||
                                session.user.user_metadata?.picture ||
                                '';

        const { data } = await api.post('/auth/supabase-oauth', {
          email,
          name,
          profileImageUrl,
          supabaseId: session.user.id
        });

        if (data.success && data.user) {
          setUser(data.user);
          setToken(data.accessToken);
          localStorage.setItem('user', JSON.stringify(data.user));
          localStorage.setItem('token', data.accessToken);
        }
      } catch (err) {
        console.error('Failed to sync Supabase OAuth user:', err);
      }
    };

    // 1. Check existing Supabase session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        handleOAuthSession(session);
      }
    });

    // 2. Listen for auth changes (e.g. on redirect after Google or GitHub login)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        await handleOAuthSession(session);
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // Sync latest user profile from server if token exists
  useEffect(() => {
    const fetchLatestProfile = async () => {
      if (!token) return;
      try {
        const { data } = await api.get('/auth/profile');
        if (data.success && data.user) {
          setUser(data.user);
          localStorage.setItem('user', JSON.stringify(data.user));
        }
      } catch (err) {
        // If token expired or invalid, keep current local state or let auth interceptor handle
        console.warn('Could not refresh profile from server:', err?.response?.data?.message || err.message);
      }
    };

    fetchLatestProfile();
  }, [token]);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    setUser(data.user);
    setToken(data.accessToken);
    localStorage.setItem('user', JSON.stringify(data.user));
    localStorage.setItem('token', data.accessToken);
    return data;
  };

  const register = async (name, email, password) => {
    const { data } = await api.post('/auth/register', { name, email, password });
    setUser(data.user);
    setToken(data.accessToken);
    localStorage.setItem('user', JSON.stringify(data.user));
    localStorage.setItem('token', data.accessToken);
    return data;
  };

  const signInWithGoogle = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    });
    if (error) {
      toast.error(error.message);
      throw error;
    }
    return data;
  };

  const signInWithGithub = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: window.location.origin
      }
    });
    if (error) {
      toast.error(error.message);
      throw error;
    }
    return data;
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch {
      // ignore
    }
    setUser(null);
    setToken(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    toast.success('Logged out');
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  return (
    <UserContext.Provider value={{
      user,
      token,
      login,
      register,
      signInWithGoogle,
      signInWithGithub,
      logout,
      updateUser
    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
