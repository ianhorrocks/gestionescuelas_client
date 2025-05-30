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

// Interceptor para token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para errores 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Borra sesión sí o sí
      localStorage.setItem("sessionMessage", "Sesión expirada");
      localStorage.removeItem("token");
      localStorage.removeItem("profile");

      // Redirige al login (puede ser "/login" si tu ruta es esa)
      window.location.href = "/";
    }

    return Promise.reject(error);
  }
);

export default api;
