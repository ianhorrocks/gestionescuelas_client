import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";

interface PrivateRouteProps {
  children: React.ReactNode;
  roles?: string[]; // Solo para rutas que requieren roles globales (ej: Super Admin)
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children, roles }) => {
  const { loggedIn, user, loading } = useAuth();

  if (loading) return <>{children}</>;
  if (!loggedIn || !user) return <Navigate to="/login" replace />;

  // Si la ruta requiere roles globales (ej: Super Admin)
  if (roles && roles.length > 0) {
    if (!user || !user.roles || !Array.isArray(user.roles) || !roles.some((r) => user.roles?.includes(r))) {
      return <Navigate to="/login" replace />;
    }
  }

  return <>{children}</>;
};

export default PrivateRoute;
