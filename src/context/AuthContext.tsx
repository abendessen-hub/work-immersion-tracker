import React, { useEffect, useState } from "react";
import { AuthContext } from "./auth-context";
import type { User } from "./auth-context";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [recentlyLoggedOut, setRecentlyLoggedOut] = useState(false);

  useEffect(() => {
    fetch("/api/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) setUser(data);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = (userData: User) => setUser(userData);

  const logout = async () => {
    await fetch("/api/logout", { method: "POST" });
    setUser(null);
    setRecentlyLoggedOut(true);
  };
  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        recentlyLoggedOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
