import { createContext } from "react";

export interface User {
  userId: number;
  username: string;
  accessId: number;
  sectionId: number | null;
  companyId: number | null;
  changedPassword: boolean;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  recentlyLoggedOut: boolean;
  login: (userData: User) => void;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
