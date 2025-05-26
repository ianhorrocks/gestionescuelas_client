// src/context/AuthContext.tsx
import React, { createContext, useState, useEffect } from "react";
import api from "../services/api"; // Assuming api is imported from a file
import { UserWithRoles } from "../types/types";

type AuthContextType = {
  loggedIn: boolean;
  setLoggedIn: (value: boolean) => void;
  logout: () => void;
  user: UserWithRoles | null;
  setUser: (user: UserWithRoles | null) => void;
  loading: boolean;
};

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [loggedIn, setLoggedIn] = useState(false);
  const [user, setUser] = useState<UserWithRoles | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const profile = localStorage.getItem("profile");
    if (token && profile) {
      api
        .get("/auth/me")
        .then((res) => {
          setLoggedIn(true);
          setUser(res.data.data || JSON.parse(profile));
          setLoading(false);
        })
        .catch(() => {
          localStorage.removeItem("token");
          localStorage.removeItem("profile");
          setLoggedIn(false);
          setUser(null);
          setLoading(false);
        });
    } else {
      setLoggedIn(false);
      setUser(null);
      setLoading(false);
    }
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("profile");
    localStorage.removeItem("selectedSchoolId");
    setLoggedIn(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ loggedIn, setLoggedIn, logout, user, setUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
