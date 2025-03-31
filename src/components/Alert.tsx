import React from "react";

interface AlertProps {
  message: string;
  type: "success" | "error" | "warning";
}

const Alert: React.FC<AlertProps> = ({ message, type }) => {
  const alertClass =
    type === "success"
      ? "alert-success"
      : type === "error"
      ? "alert-error"
      : "alert-warning";

  return <div className={`alert ${alertClass}`}>{message}</div>;
};

export default Alert;
