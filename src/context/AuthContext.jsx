import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState
} from "react";

import { api } from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("natlas_forge_token");

  useEffect(() => {
    let mounted = true;

    async function restoreSession() {
      if (!token) {
        if (mounted) setLoading(false);
        return;
      }

      try {
        const currentUser = await api.me();

        if (mounted) {
          setUser(currentUser);
        }
      } catch {
        localStorage.removeItem("natlas_forge_token");

        if (mounted) {
          setUser(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    restoreSession();

    return () => {
      mounted = false;
    };
  }, [token]);

  async function login(email, password) {
    const result = await api.login({
      email,
      password
    });

    localStorage.setItem(
      "natlas_forge_token",
      result.access_token
    );

    const currentUser = await api.me();

    setUser(currentUser);

    return currentUser;
  }

  async function register(payload) {
    const result = await api.register(payload);

    if (result.access_token) {
      localStorage.setItem(
        "natlas_forge_token",
        result.access_token
      );

      const currentUser = await api.me();

      setUser(currentUser);

      return currentUser;
    }

    return result;
  }

  function logout() {
    localStorage.removeItem("natlas_forge_token");
    setUser(null);
  }

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: Boolean(user),
      login,
      register,
      logout
    }),
    [user, loading]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider."
    );
  }

  return context;
}