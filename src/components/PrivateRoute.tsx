import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { loggedIn } = useAuth();

  if (!loggedIn) {
    const token = localStorage.getItem("token");
    if (!token) {
      return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
};

export default PrivateRoute;
