
import { createContext } from "react";
import { Session } from "@supabase/supabase-js";

// Define the shape of our context without circular references
export type AuthContextType = {
  session: Session | null;
  isLoading: boolean;
};

// Create context with undefined as default value
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// This prevents double rendering in React.StrictMode
export const sessionCache = {
  session: null as Session | null,
  initialized: false,
};
