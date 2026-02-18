import { createContext, useContext, useEffect, useState } from "react";
import { apiRequest, storeAccessToken, clearAuthStorage, API_BASE_URL } from "../api/client";

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

    const handleSessionExpired = () => {
      clearAuthStorage();
      setUser(null);
      localStorage.removeItem("user");
      alert("Session expired. Please login again.");
    };

    window.addEventListener("auth:session-expired", handleSessionExpired);
    return () => window.removeEventListener("auth:session-expired", handleSessionExpired);
  }, []);

  const login = async (email, password, mfaCode = null) => {
    const response = await apiRequest(
      "/auth/login",
      {
        method: "POST",
        body: JSON.stringify({ email, password, ...(mfaCode && { mfaCode }) }),
      },
      { skipAuth: true }
    );

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      // If MFA is required, return the mfaRequired flag instead of throwing error
      if (response.status === 403 && data.mfaRequired) {
        return { mfaRequired: true, userId: data.userId };
      }
      // If invalid MFA code, throw error but include a flag to keep MFA form visible
      if (response.status === 401 && data.error && data.error.toLowerCase().includes('mfa')) {
        const error = new Error(data.error || "Invalid MFA code");
        error.mfaError = true;
        throw error;
      }
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
