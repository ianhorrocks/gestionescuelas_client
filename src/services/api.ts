// client/src/services/api.ts
import axios from "axios";

// Detectar entorno automáticamente
const isLocalhost = window.location.hostname === "localhost";
const apiEnv = import.meta.env.VITE_API_ENV;

const baseURL =
  apiEnv === "local" || (apiEnv === undefined && isLocalhost)
    ? import.meta.env.VITE_API_URL_LOCAL
    : import.meta.env.VITE_API_URL_PROD;

const api = axios.create({
  baseURL,
  withCredentials: true,
});

// Interceptor de request: agrega el token al header
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor de respuesta: detecta si el token expiró o no es válido
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const errorMsg = error.response.data?.error;

      if (errorMsg === "ERROR_ID_TOKEN") {
        localStorage.setItem("sessionMessage", "Sesión expirada");
      }

      localStorage.removeItem("token");
      localStorage.removeItem("profile");
      localStorage.removeItem("selectedSchoolId");

      window.location.href = "/user/login";
    }

    return Promise.reject(error);
  }
);

export default api;
