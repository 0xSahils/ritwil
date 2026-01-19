import { createContext, useContext, useEffect, useState } from "react";
import { apiRequest, storeAccessToken, clearAuthStorage } from "../api/client";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        setUser(null);
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const response = await apiRequest(
      "/auth/login",
      {
        method: "POST",
        body: JSON.stringify({ email, password }),
      },
      { skipAuth: true }
    );

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.error || "Login failed");
    }

    const data = await response.json();
    storeAccessToken(data.accessToken);
    setUser(data.user);
    localStorage.setItem("user", JSON.stringify(data.user));

    return data.user;
  };

  const logout = async () => {
    try {
      await apiRequest(
        "/auth/logout",
        {
          method: "POST",
        },
        { skipAuth: true }
      );
    } catch {}
    clearAuthStorage();
    setUser(null);
    localStorage.removeItem("user");
  };

  const value = {
    user,
    loading,
    login,
    logout,
    API_BASE_URL,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
