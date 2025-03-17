import React from "react";
import { Navigate } from "react-router-dom";

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/user/login" />;
  }

  return <>{children}</>;
};

export default PrivateRoute;
