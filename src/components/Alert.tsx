import React, { useEffect, useState } from "react";

interface AlertProps {
  message: string;
  type: "success" | "error" | "warning";
}

const Alert: React.FC<AlertProps> = ({ message, type }) => {
  const [animationClass, setAnimationClass] = useState("fade-in");

  useEffect(() => {
    // Apenas montamos el alert, lo mostramos
    setAnimationClass("fade-in");

    // Después de un tiempo, aplicamos el fade-out automáticamente
    const timeout = setTimeout(() => {
      setAnimationClass("fade-out");
    }, 2500); // 2.5 segundos o el tiempo que quieras

    return () => clearTimeout(timeout); // limpiamos si se desmonta antes
  }, []);

  let alertClass = "";

  switch (type) {
    case "success":
      alertClass = "alert-success";
      break;
    case "error":
      alertClass = "alert-error";
      break;
    case "warning":
      alertClass = "alert-warning";
      break;
    default:
      alertClass = "alert-default";
  }

  return (
    <div className={`alert ${alertClass} ${animationClass}`}>{message}</div>
  );
};

export default Alert;
