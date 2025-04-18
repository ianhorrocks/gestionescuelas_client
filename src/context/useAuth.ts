import { useContext } from "react";
import { AuthContext } from "./AuthContext"; // lo exportás desde ahí

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return context;
};
