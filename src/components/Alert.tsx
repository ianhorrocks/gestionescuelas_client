import React from "react";

interface AlertProps {
  message: string;
  type: "success" | "error" | "warning"; // Agregamos "warning"
}

const Alert: React.FC<AlertProps> = ({ message, type }) => {
  const alertClass =
    type === "success"
      ? "alert-success"
      : type === "error"
      ? "alert-error"
      : "alert-warning"; // Clase para advertencias

  return (
    <div className={`alert ${alertClass}`} role="alert">
      {message}
    </div>
  );
};

export default Alert;
