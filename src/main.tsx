import React from "react";
import ReactDOM from "react-dom/client";
import "bootstrap/dist/css/bootstrap.min.css";
import "./styles/styles.css";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";

// DEBUG: Verificar si Doppler está inyectando bien las variables
console.log("VITE_API_ENV:", import.meta.env.VITE_API_ENV);
console.log("VITE_API_URL_LOCAL:", import.meta.env.VITE_API_URL_LOCAL);
console.log("VITE_API_URL_PROD:", import.meta.env.VITE_API_URL_PROD);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);
