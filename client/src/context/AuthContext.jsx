import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    if (!localStorage.getItem('token')) {
      setReady(true);
      return undefined;
    }
    api.me()
      .then((data) => {
        if (active) setUser(data.user);
      })
      .catch(() => localStorage.removeItem('token'))
      .finally(() => {
        if (active) setReady(true);
      });
    return () => {
      active = false;
    };
  }, []);

  const value = useMemo(
    () => ({
      user,
      ready,
      async login(email, password) {
        const data = await api.login(email, password);
        localStorage.setItem('token', data.token);
        setUser(data.user);
      },
      async register(payload) {
        const data = await api.register(payload);
        localStorage.setItem('token', data.token);
        setUser(data.user);
      },
      logout() {
        localStorage.removeItem('token');
        setUser(null);
      },
    }),
    [user, ready]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
