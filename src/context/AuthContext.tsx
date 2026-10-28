import React, { createContext, useContext, useEffect, useState } from "react";

interface User {
  userId: number;
  username: string;
  accessId: number;
  sectionId: number;
  companyId: number;
  changedPassword: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  recentlyLoggedOut: boolean;
  login: (userData: User) => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

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

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
