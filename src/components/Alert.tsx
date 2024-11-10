import React from "react";

interface AlertProps {
  message: string;
  type: "success" | "error";
}

const Alert: React.FC<AlertProps> = ({ message, type }) => {
  return (
    <div className={`alert alert-${type}`} role="alert">
      {type === "success" && <span>&#10003; </span>}
      {message}
    </div>
  );
};

export default Alert;
