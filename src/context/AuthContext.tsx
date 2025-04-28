// src/context/AuthContext.tsx
import React, { createContext, useState, useEffect } from "react";
import api from "../services/api"; // Assuming api is imported from a file

type AuthContextType = {
  loggedIn: boolean;
  setLoggedIn: (value: boolean) => void;
  logout: () => void;
};

// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      // Opcional: valida el token con otro endpoint o simplemente asume que es válido
      api
        .get("/auth/me") // Cambia a un endpoint existente, como "/auth/me"
        .then(() => setLoggedIn(true))
        .catch(() => {
          localStorage.removeItem("token");
          localStorage.removeItem("profile");
          setLoggedIn(false);
        });
    } else {
      setLoggedIn(false);
    }
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("profile");
    localStorage.removeItem("selectedSchoolId");
    setLoggedIn(false);
  };

  return (
    <AuthContext.Provider value={{ loggedIn, setLoggedIn, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
